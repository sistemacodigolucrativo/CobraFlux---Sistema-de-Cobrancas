import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import type {AddressInfo} from 'node:net';
import {randomSecret,sha256} from './security';

process.env.CF_NO_LISTEN='true';
const {app}=await import('./index');
app.set('trust proxy',1); // Integration-test-only: distinguish fixtures without weakening production IP limits.
const {pool}=await import('./db');
const server=app.listen(0,'127.0.0.1');
await new Promise<void>(resolve=>server.once('listening',resolve));
const base='http://127.0.0.1:'+(server.address() as AddressInfo).port+'/api';
async function call(path:string,method='GET',data?:object,cookie='',csrf=''){
 const r=await fetch(base+path,{
   method,headers:{'X-Forwarded-For':'198.51.100.42',Origin:'http://localhost:3000',...(data?{'Content-Type':'application/json'}:{}),
     ...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CF-CSRF':csrf}:{})},
   body:data?JSON.stringify(data):undefined
 });
 const body=await r.json();
 return {status:r.status,body,cookie:(r.headers.get('set-cookie')??'').split(';')[0]};
}
async function verifiedAccount(email:string,businessName:string){
 const create=await call('/auth/register','POST',{
   name:'Dono '+businessName,businessName,email,password:'MinhaSenhaSegura#123'
 });
 assert.equal(create.status,201,JSON.stringify(create.body));
 await pool.query('UPDATE users SET email_verified_at=now() WHERE email=$1',[email]);
 const login=await call('/auth/login','POST',{email,password:'MinhaSenhaSegura#123'});
 assert.equal(login.status,200,JSON.stringify(login.body));
 const me=await call('/auth/me','GET',undefined,login.cookie);
 assert.equal(me.status,200);
 return {cookie:login.cookie,csrf:me.body.csrfToken,orgId:me.body.organizationId,userId:me.body.user.id};
}
async function fakeDeliveredInvite(orgId:string,ownerId:string,email:string){
 const id=randomUUID(),token=randomSecret();
 await pool.query("INSERT INTO team_invitations(id,organization_id,invited_by,email,token_hash,expires_at) "+
   "VALUES($1,$2,$3,$4,$5,now()+interval '48 hours')",[id,orgId,ownerId,email,sha256(token)]);
 return {id,token};
}
test('invite lifecycle, membership isolation, revocation and multi-tenant login',async()=>{
 try{
   const id=randomUUID().slice(0,8),emailA='ta'+id+'@example.com',emailB='tb'+id+'@example.com';
   const ownerA=await verifiedAccount(emailA,'Cobra Equipe A');
   const ownerB=await verifiedAccount(emailB,'Cobra Equipe B');
   const employee='te'+id+'@example.com';
   const invalidInvite=await call('/team/invitations','POST',{email:employee},ownerA.cookie,ownerA.csrf);
   assert.equal(invalidInvite.status,503,'external email must not be faked without credentials');
   const invite=await fakeDeliveredInvite(ownerA.orgId,ownerA.userId,employee);
   const preview=await call('/team/invitation/'+invite.token);
   assert.equal(preview.status,200);
   assert.equal(preview.body.email,employee);
   const wrong=await call('/team/accept','POST',{token:invite.token},ownerB.cookie,ownerB.csrf);
   assert.equal(wrong.status,404,'wrong email cannot accept an invite');
   const activation=await call('/team/activate','POST',{
     token:invite.token,name:'Colaborador A',password:'SenhaEquipeSegura#123'
   });
   assert.equal(activation.status,201,JSON.stringify(activation.body));
   assert.equal(activation.body.organizationId,ownerA.orgId);
   assert.equal((await call('/team/activate','POST',{
     token:invite.token,name:'Repetido',password:'SenhaEquipeSegura#123'
   })).status,404);
   assert.equal((await call('/team/invitation/'+invite.token)).status,404);
   const operatorLogin=await call('/auth/login','POST',{email:employee,password:'SenhaEquipeSegura#123'});
   assert.equal(operatorLogin.status,200);
   const operatorCookie=operatorLogin.cookie;
   const operatorMe=await call('/auth/me','GET',undefined,operatorCookie);
   assert.equal(operatorMe.body.user.role,'operator');
   assert.equal(operatorMe.body.organizationId,ownerA.orgId);
   assert.equal((await call('/team','GET',undefined,operatorCookie)).status,403);
   assert.equal((await call('/team/invitations','POST',{email:'spoof@example.com'},operatorCookie,operatorMe.body.csrfToken)).status,403);
   assert.equal((await call('/organization','PATCH',{name:'Alteracao invalida'},operatorCookie,operatorMe.body.csrfToken)).status,403);
   const createClient=await call('/clients','POST',{name:'Cliente do colaborador',phone:'+5511984848484'},operatorCookie,operatorMe.body.csrfToken);
   assert.equal(createClient.status,201,JSON.stringify(createClient.body));
   assert.equal((await call('/clients','GET',undefined,ownerB.cookie)).body.items.length,0);
   const team=await call('/team','GET',undefined,ownerA.cookie);
   assert.equal(team.status,200);
   assert.ok(team.body.members.some((x:any)=>x.email===employee&&x.role==='operator'));
   assert.ok(team.body.invitations.some((x:any)=>x.id===invite.id&&x.accepted_at));
   assert.equal((await call('/team/members/'+ownerA.userId,'DELETE',undefined,ownerA.cookie,ownerA.csrf)).status,403);
   const remove=await call('/team/members/'+operatorMe.body.user.id,'DELETE',undefined,ownerA.cookie,ownerA.csrf);
   assert.equal(remove.status,200);
   assert.equal((await call('/auth/me','GET',undefined,operatorCookie)).status,401,'revocation must take effect immediately');
   assert.equal((await call('/team/members/'+operatorMe.body.user.id,'DELETE',undefined,ownerA.cookie,ownerA.csrf)).status,404);
   // Existing verified owner can join a second tenant, but cannot access it without accepting.
   const existingToken=await fakeDeliveredInvite(ownerA.orgId,ownerA.userId,emailB);
   const before=await call('/auth/switch-organization','POST',{organizationId:ownerA.orgId},ownerB.cookie,ownerB.csrf);
   assert.equal(before.status,403);
   const accepted=await call('/team/accept','POST',{token:existingToken.token},ownerB.cookie,ownerB.csrf);
   assert.equal(accepted.status,200,JSON.stringify(accepted.body));
   const switched=await call('/auth/switch-organization','POST',{organizationId:ownerA.orgId},ownerB.cookie,ownerB.csrf);
   assert.equal(switched.status,200);
   const meSwitched=await call('/auth/me','GET',undefined,ownerB.cookie);
   assert.equal(meSwitched.body.organizationId,ownerA.orgId);
   assert.equal(meSwitched.body.user.role,'operator');
   const clientsA=await call('/clients','GET',undefined,ownerB.cookie);
   assert.equal(clientsA.body.items.length,1);
   const list=await call('/auth/organizations','GET',undefined,ownerB.cookie);
   assert.equal(list.body.items.length,2);
   const loginWithoutOrg=await call('/auth/login','POST',{email:emailB,password:'MinhaSenhaSegura#123'});
   assert.equal(loginWithoutOrg.status,409,JSON.stringify(loginWithoutOrg.body));
   assert.equal(loginWithoutOrg.body.organizations.length,2);
   const loginAsOwner=await call('/auth/login','POST',{email:emailB,password:'MinhaSenhaSegura#123',organizationId:ownerB.orgId});
   assert.equal(loginAsOwner.status,200);
   const meOwner=await call('/auth/me','GET',undefined,loginAsOwner.cookie);
   assert.equal(meOwner.body.user.role,'owner');
   assert.equal(meOwner.body.organizationId,ownerB.orgId);
   assert.equal((await call('/clients','GET',undefined,loginAsOwner.cookie)).body.items.length,0);
   // Revoking only org A operator membership does not invalidate org B owner's sessions.
   const removedB=await call('/team/members/'+ownerB.userId,'DELETE',undefined,ownerA.cookie,ownerA.csrf);
   assert.equal(removedB.status,200);
   assert.equal((await call('/auth/me','GET',undefined,loginAsOwner.cookie)).status,200);
   assert.equal((await call('/auth/me','GET',undefined,ownerB.cookie)).status,401);
   const revokedToken=await fakeDeliveredInvite(ownerA.orgId,ownerA.userId,'to'+id+'@example.com');
   const revoke=await call('/team/invitations/'+revokedToken.id+'/revoke','POST',{},ownerA.cookie,ownerA.csrf);
   assert.equal(revoke.status,200);
   assert.equal((await call('/team/invitation/'+revokedToken.token)).status,404);
   assert.equal((await call('/team/activate','POST',{
     token:revokedToken.token,name:'Inválido',password:'SenhaEquipeSegura#123'
   })).status,404);
 }finally{
   await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
   await pool.end();
 }
});
