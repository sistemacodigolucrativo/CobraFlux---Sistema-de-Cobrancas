import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { sha256 } from './security';
import { createTotpSecret, encryptTotpSecret, totpCode } from './totp';
import type { AddressInfo } from 'node:net';

process.env.CF_NO_LISTEN='true';
process.env.MFA_ENCRYPTION_KEY=randomBytes(32).toString('hex');
const { app }=await import('./index');
const { pool }=await import('./db');
const server=app.listen(0,'127.0.0.1');
await new Promise<void>((resolve)=>server.once('listening',resolve));
const base='http://127.0.0.1:'+(server.address() as AddressInfo).port+'/api';

type ResponseData={ status:number; body:any; cookie:string };
async function call(path:string,method='GET',data?:object,cookie='',csrf=''):Promise<ResponseData>{
 const response=await fetch(base+path,{
  method,
  headers:{Origin:'http://localhost:3000',...(data?{'Content-Type':'application/json'}:{}),
    ...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CF-CSRF':csrf}:{})},
  body:data?JSON.stringify(data):undefined
 });
 const body=await response.json();
 const setCookie=response.headers.get('set-cookie')??'';
 return {status:response.status,body,cookie:setCookie.split(';')[0]};
}

test('real persistence, password validation, CSRF, cross-tenant isolation, public data minimization',async()=>{
 try {
  const id=randomUUID().slice(0,8);
  const emailA='a'+id+'@example.com';
  const emailB='b'+id+'@example.com';
  const createA=await call('/auth/register','POST',{name:'Ana Teste',businessName:'Studio Ana',email:emailA,password:'SenhaBemForte123!!'});
  const createB=await call('/auth/register','POST',{name:'Bruno Teste',businessName:'Studio Bruno',email:emailB,password:'SenhaBemForte123!!'});
  assert.equal(createA.status,201,JSON.stringify(createA.body));
  assert.equal(createB.status,201,JSON.stringify(createB.body));
  assert.equal((await call('/auth/login','POST',{email:emailA,password:'senhaerrada'})).status,401);
  assert.equal((await call('/auth/login','POST',{email:emailA,password:'SenhaBemForte123!!'})).status,403);
  const registered=await pool.query('SELECT id,email FROM users WHERE email=ANY($1::text[])',[[emailA,emailB]]);
  for(const user of registered.rows){
    const token=randomUUID()+randomUUID();
    await pool.query("INSERT INTO email_verifications(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '24 hours')",[sha256(token),user.id]);
    const verified=await call('/auth/verify-email','POST',{token});
    assert.equal(verified.status,200,JSON.stringify(verified.body));
    assert.equal((await call('/auth/verify-email','POST',{token})).status,400);
  }
  const loginA=await call('/auth/login','POST',{email:emailA,password:'SenhaBemForte123!!'});
  const loginB=await call('/auth/login','POST',{email:emailB,password:'SenhaBemForte123!!'});
  assert.equal(loginA.status,200);
  assert.equal(loginB.status,200);
  assert.ok(loginA.cookie.startsWith('cf_session='));
  const meA=await call('/auth/me','GET',undefined,loginA.cookie);
  const meB=await call('/auth/me','GET',undefined,loginB.cookie);
  assert.equal(meA.status,200);assert.equal(meB.status,200);
  assert.notEqual(meA.body.organizationId,meB.body.organizationId);
  assert.equal((await call('/admin/overview','GET',undefined,loginA.cookie)).status,403);
  assert.equal((await call('/auth/sessions','GET',undefined,loginA.cookie)).body.items.length,1);
  assert.equal((await call('/clients','POST',{name:'Sem Csrf',phone:'+5511988888888'},loginA.cookie)).status,403);
  const createClient=await call('/clients','POST',{name:'Cliente A',phone:'+5511999999999',whatsappOptIn:false},loginA.cookie,meA.body.csrfToken);
  assert.equal(createClient.status,201,JSON.stringify(createClient.body));
  assert.equal((await call('/clients','GET',undefined,loginB.cookie)).body.items.length,0);
  const forbiddenUpdate=await call('/clients/'+createClient.body.id,'PATCH',{name:'Invasor'},loginB.cookie,meB.body.csrfToken);
  assert.equal(forbiddenUpdate.status,404);
  const foreignCharge=await call('/charges','POST',{clientId:createClient.body.id,description:'Outra org',amountCents:1000,dueDate:'2026-12-15'},loginB.cookie,meB.body.csrfToken);
  assert.equal(foreignCharge.status,404);
  const draft=await call('/charges','POST',{clientId:createClient.body.id,description:'Mensalidade',amountCents:45000,dueDate:'2026-12-15'},loginA.cookie,meA.body.csrfToken);
  assert.equal(draft.status,201,JSON.stringify(draft.body));assert.equal(draft.body.status,'draft');
  const publicView=await call('/public/charges/'+draft.body.public_token);
  assert.equal(publicView.status,200);assert.equal(publicView.body.paymentEnabled,false);
  assert.equal(publicView.body.pixPayload,null);
  assert.equal('email' in publicView.body,false);assert.equal('phone' in publicView.body,false);
  const foreignRead=await call('/charges','GET',undefined,loginB.cookie);
  assert.equal(foreignRead.body.items.length,0);
  // Phase 2: complete operational cycle before any PSP integration.
  const serviceCreate=await call('/services','POST',{name:'Consulta Pilates',description:'Sessão individual',
    priceCents:12000,defaultFrequency:'mensal'},loginA.cookie,meA.body.csrfToken);
  assert.equal(serviceCreate.status,201,JSON.stringify(serviceCreate.body));
  const serviceId=serviceCreate.body.id;
  const serviceUpdate=await call('/services/'+serviceId,'PATCH',{priceCents:13500},loginA.cookie,meA.body.csrfToken);
  assert.equal(serviceUpdate.status,200,JSON.stringify(serviceUpdate.body));
  assert.equal(Number(serviceUpdate.body.price_cents),13500);
  assert.equal((await call('/services','GET',undefined,loginB.cookie)).body.items.length,0);
  assert.equal((await call('/services/'+serviceId,'PATCH',{priceCents:50},loginB.cookie,meB.body.csrfToken)).status,404);

  const updatedClient=await call('/clients/'+createClient.body.id,'PATCH',{
    serviceName:'Pilates mensal',monthlyFeeCents:45000,preferredDueDay:31,notes:'Observação operacional'
  },loginA.cookie,meA.body.csrfToken);
  assert.equal(updatedClient.status,200,JSON.stringify(updatedClient.body));
  assert.equal(Number(updatedClient.body.monthly_fee_cents),45000);
  assert.equal(updatedClient.body.preferred_due_day,31);
  assert.ok(updatedClient.body.internal_code.startsWith('CF-'));
  const csv='nome;telefone;email;serviço;mensalidade;dia vencimento\n'+
    '"Outra; Cliente";11987878787;csv@example.com;Pilates;1.250,50;31\n'+
    'Invalido;11987878787;bad-email;Pilates;-20;50';
  const preview=await call('/clients/import/preview','POST',{csv},loginA.cookie,meA.body.csrfToken);
  assert.equal(preview.status,200,JSON.stringify(preview.body));
  assert.equal(preview.body.valid,1);
  assert.equal(preview.body.invalid,1);
  const strict=await call('/clients/import','POST',{csv,mode:'strict'},loginA.cookie,meA.body.csrfToken);
  assert.equal(strict.status,422);
  const imported=await call('/clients/import','POST',{csv,mode:'valid_only'},loginA.cookie,meA.body.csrfToken);
  assert.equal(imported.status,201,JSON.stringify(imported.body));
  assert.equal(imported.body.importedCount,1);
  assert.equal(imported.body.rejectedCount,1);
  const repeated=await call('/clients/import','POST',{csv,mode:'valid_only'},loginA.cookie,meA.body.csrfToken);
  assert.equal(repeated.status,201);
  assert.equal(repeated.body.importedCount,0);
  const orgAClients=await call('/clients','GET',undefined,loginA.cookie);
  assert.equal(orgAClients.body.total,2);
  assert.equal((await call('/clients','GET',undefined,loginB.cookie)).body.items.length,0);

  const draftUpdated=await call('/charges/'+draft.body.id,'PATCH',{
    amountCents:55000,discountCents:5000,dueDate:'2026-12-20'
  },loginA.cookie,meA.body.csrfToken);
  assert.equal(draftUpdated.status,200,JSON.stringify(draftUpdated.body));
  const badDiscount=await call('/charges/'+draft.body.id,'PATCH',{discountCents:60000},loginA.cookie,meA.body.csrfToken);
  assert.equal(badDiscount.status,400);
  assert.equal((await call('/charges/'+draft.body.id,'PATCH',{amountCents:1000},loginB.cookie,meB.body.csrfToken)).status,409);
  const duplicate=await call('/charges/'+draft.body.id+'/duplicate','POST',{dueDate:'2027-01-20'},loginA.cookie,meA.body.csrfToken);
  assert.equal(duplicate.status,201,JSON.stringify(duplicate.body));
  assert.notEqual(duplicate.body.public_token,draft.body.public_token);
  const history=await call('/charges/'+draft.body.id+'/history','GET',undefined,loginA.cookie);
  assert.equal(history.status,200);
  assert.ok(history.body.items.length>=2);
  assert.equal((await call('/charges/'+draft.body.id+'/history','GET',undefined,loginB.cookie)).status,404);
  const cancelled=await call('/charges/'+draft.body.id+'/cancel','POST',{reason:'Duplicada na operação'},loginA.cookie,meA.body.csrfToken);
  assert.equal(cancelled.status,200,JSON.stringify(cancelled.body));
  assert.equal((await call('/charges/'+draft.body.id,'PATCH',{amountCents:80000},loginA.cookie,meA.body.csrfToken)).status,409);
  const publicCancelled=await call('/public/charges/'+draft.body.public_token);
  assert.equal(publicCancelled.body.status,'cancelled');
  assert.equal(publicCancelled.body.paymentEnabled,false);

  const orgPatch=await call('/organization','PATCH',{name:'Studio Ana Atualizado',category:'Pilates'},loginA.cookie,meA.body.csrfToken);
  assert.equal(orgPatch.status,200,JSON.stringify(orgPatch.body));
  const profile=await call('/profile','GET',undefined,loginA.cookie);
  assert.equal(profile.body.organization.name,'Studio Ana Atualizado');
  const support=await call('/support/tickets','POST',{subject:'Ajuste financeiro',message:'Gostaria de verificar um lançamento.'},loginA.cookie,meA.body.csrfToken);
  assert.equal(support.status,201,JSON.stringify(support.body));
  assert.equal((await call('/support/tickets','GET',undefined,loginB.cookie)).body.items.length,0);
  assert.equal((await call('/support/tickets','GET',undefined,loginA.cookie)).body.items.length,1);
  const operatorUser=await pool.query('SELECT id FROM users WHERE email=$1',[emailA]);
  await pool.query("UPDATE memberships SET role='operator' WHERE user_id=$1",[operatorUser.rows[0].id]);
  assert.equal((await call('/organization','PATCH',{name:'Sem acesso'},loginA.cookie,meA.body.csrfToken)).status,403);
  await pool.query("UPDATE memberships SET role='owner' WHERE user_id=$1",[operatorUser.rows[0].id]);

  const forbiddenLogout=await call('/auth/logout','POST',{},loginA.cookie,'invalid_csrf');
  assert.equal(forbiddenLogout.status,403);
  const logout=await call('/auth/logout','POST',{},loginA.cookie,meA.body.csrfToken);
  assert.equal(logout.status,200);
  assert.equal((await call('/auth/me','GET',undefined,loginA.cookie)).status,401);
  const adminUser=registered.rows.find((u:any)=>u.email===emailB);
  const secret=createTotpSecret();
  await pool.query('INSERT INTO admin_mfa(user_id,secret_encrypted) VALUES($1,$2)',[adminUser.id,encryptTotpSecret(secret)]);
  await pool.query("UPDATE memberships SET role='super_admin' WHERE user_id=$1",[adminUser.id]);
  assert.equal((await call('/auth/me','GET',undefined,loginB.cookie)).status,401);
  assert.equal((await call('/auth/login','POST',{email:emailB,password:'SenhaBemForte123!!'})).status,401);
  const code=totpCode(secret,Math.floor(Date.now()/30000));
  const adminLogin=await call('/auth/login','POST',{email:emailB,password:'SenhaBemForte123!!',totpCode:code});
  assert.equal(adminLogin.status,200,JSON.stringify(adminLogin.body));
  assert.equal((await call('/auth/login','POST',{email:emailB,password:'SenhaBemForte123!!',totpCode:code})).status,401);
  assert.equal((await call('/admin/overview','GET',undefined,adminLogin.cookie)).status,200);
  const adminMe=await call('/auth/me','GET',undefined,adminLogin.cookie);
  const revoke=await call('/auth/sessions/revoke-all','POST',{},adminLogin.cookie,adminMe.body.csrfToken);
  assert.equal(revoke.status,200);
  assert.equal((await call('/auth/me','GET',undefined,adminLogin.cookie)).status,401);
 }finally{
  await new Promise<void>((resolve,reject)=>server.close((e)=>e?reject(e):resolve()));
  await pool.end();
 }
});
