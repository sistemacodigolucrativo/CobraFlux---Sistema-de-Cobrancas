import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { AddressInfo } from 'node:net';

process.env.CF_NO_LISTEN='true';
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
  const loginA=await call('/auth/login','POST',{email:emailA,password:'SenhaBemForte123!!'});
  const loginB=await call('/auth/login','POST',{email:emailB,password:'SenhaBemForte123!!'});
  assert.equal(loginA.status,200);
  assert.equal(loginB.status,200);
  assert.ok(loginA.cookie.startsWith('cf_session='));
  const meA=await call('/auth/me','GET',undefined,loginA.cookie);
  const meB=await call('/auth/me','GET',undefined,loginB.cookie);
  assert.equal(meA.status,200);assert.equal(meB.status,200);
  assert.notEqual(meA.body.organizationId,meB.body.organizationId);
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
  const forbiddenLogout=await call('/auth/logout','POST',{},loginA.cookie,'invalid_csrf');
  assert.equal(forbiddenLogout.status,403);
  const logout=await call('/auth/logout','POST',{},loginA.cookie,meA.body.csrfToken);
  assert.equal(logout.status,200);
  assert.equal((await call('/auth/me','GET',undefined,loginA.cookie)).status,401);
 }finally{
  await new Promise<void>((resolve,reject)=>server.close((e)=>e?reject(e):resolve()));
  await pool.end();
 }
});
