import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import type {AddressInfo} from 'node:net';
process.env.CF_NO_LISTEN='true';
process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY=randomBytes(32).toString('hex');
const realFetch=globalThis.fetch.bind(globalThis);
const customers=new Map<string,string>(),payments=new Map<string,{id:string;value:number;status:string}>();
let paymentPostCount=0,customerPostCount=0,lostResponse=false;
globalThis.fetch=(async(input:URL|Request|string,init?:RequestInit):Promise<Response>=>{
 const url=String(input);
 if(!url.startsWith('https://api-sandbox.asaas.com/v3/'))return realFetch(input,init);
 const path=new URL(url),method=init?.method??'GET';
 let response:unknown={};
 const body=typeof init?.body==='string'?JSON.parse(init.body):{};
 if(path.pathname==='/v3/customers'&&method==='GET'){
   const ref=path.searchParams.get('externalReference')??'';
   response={data:customers.has(ref)?[{id:customers.get(ref),externalReference:ref}]:[]};
 }else if(path.pathname==='/v3/customers'&&method==='POST'){
   customerPostCount++;
   const id='cus_'+randomUUID().slice(0,8);customers.set(body.externalReference,id);
   response={id};
 }else if(path.pathname==='/v3/payments'&&method==='GET'){
   const ref=path.searchParams.get('externalReference')??'';
   response={data:payments.has(ref)?[{...payments.get(ref),externalReference:ref}]:[]};
 }else if(path.pathname==='/v3/payments'&&method==='POST'){
   paymentPostCount++;
   const id='pay_'+randomUUID().slice(0,8);
   payments.set(body.externalReference,{id,value:body.value,status:'PENDING'});
   if(lostResponse){lostResponse=false;throw new Error('simulated_lost_provider_response');}
   response={id,value:body.value,status:'PENDING'};
 }else if(path.pathname.endsWith('/pixQrCode')&&method==='GET'){
   response={payload:'000201ASAAS-SANDBOX-PIX-NAO-PAGAR-'+randomUUID().slice(0,12),expirationDate:'2026-12-25'};
 }else{
   return new Response(JSON.stringify({errors:[{description:'route_not_mocked'}]}),{status:404});
 }
 return new Response(JSON.stringify(response),{status:200,headers:{'Content-Type':'application/json'}});
}) as typeof fetch;
const {app}=await import('./index');
const {pool}=await import('./db');
const server=app.listen(0,'127.0.0.1');
await new Promise<void>(r=>server.once('listening',r));
const base='http://127.0.0.1:'+(server.address() as AddressInfo).port+'/api';
async function call(path:string,method='GET',data?:unknown,cookie='',csrf='',webhookToken=''){
 const result=await realFetch(base+path,{
  method,headers:{...(data?{'Content-Type':'application/json'}:{}),
   ...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CF-CSRF':csrf}:{}),
   ...(webhookToken?{'asaas-access-token':webhookToken}:{})},
  body:data?JSON.stringify(data):undefined
 });
 return {status:result.status,body:await result.json(),cookie:(result.headers.get('set-cookie')??'').split(';')[0]};
}
async function owner(){
 const suffix=randomUUID().slice(0,8),email='pix'+suffix+'@example.com';
 assert.equal((await call('/auth/register','POST',{name:'Profissional Sandbox',businessName:'Empresa '+suffix,
   email,password:'Senha#ForteSandbox123'})).status,201);
 await pool.query('UPDATE users SET email_verified_at=now() WHERE email=$1',[email]);
 const login=await call('/auth/login','POST',{email,password:'Senha#ForteSandbox123'});
 assert.equal(login.status,200);
 const me=await call('/auth/me','GET',undefined,login.cookie);
 assert.equal(me.status,200);
 return {cookie:login.cookie,csrf:me.body.csrfToken,org:me.body.organizationId};
}
async function draft(o:{cookie:string;csrf:string;org:string},phone:string){
 const cl=await call('/clients','POST',{name:'Cliente Sandbox',phone},o.cookie,o.csrf);
 assert.equal(cl.status,201,JSON.stringify(cl.body));
 const charge=await call('/charges','POST',{clientId:cl.body.id,description:'Consulta Sandbox',amountCents:45000,
   discountCents:5000,dueDate:'2026-12-20'},o.cookie,o.csrf);
 assert.equal(charge.status,201,JSON.stringify(charge.body));
 return charge.body;
}
test('Asaas sandbox: encrypted tenant config, safe issuance, webhook replay, refund and reconciliation',async()=>{
 try{
  const a=await owner(),b=await owner();
  const draftA=await draft(a,'+5511980010011');
  const draftB=await draft(b,'+5511980010022');
  const webhookToken='asaas-test-webhook-token-unique-'+randomBytes(25).toString('hex');
  assert.equal((await call('/sandbox/charges/'+draftA.id+'/issue','POST',{},a.cookie,a.csrf)).status,503);
  const configuration=await call('/sandbox/connection','PUT',{
    apiKey:'$aact_hmlg_'+randomBytes(40).toString('hex'),webhookToken
  },a.cookie,a.csrf);
  assert.equal(configuration.status,200,JSON.stringify(configuration.body));
  const webhookPath=configuration.body.webhookPath.replace(/^\/api/,'');
  assert.equal(configuration.body.sandboxOnly,true);
  assert.equal((await call('/sandbox/connection','GET',undefined,b.cookie)).body.configured,false);
  const secret=await pool.query('SELECT api_key_ciphertext,webhook_token_hash FROM sandbox_payment_accounts WHERE organization_id=$1',[a.org]);
  assert.equal(secret.rowCount,1);
  assert.ok(!secret.rows[0].api_key_ciphertext.includes('$aact_'));
  assert.notEqual(secret.rows[0].webhook_token_hash,webhookToken);
  assert.equal((await call('/sandbox/charges/'+draftB.id+'/issue','POST',{},a.cookie,a.csrf)).status,404);
  const issued=await call('/sandbox/charges/'+draftA.id+'/issue','POST',{},a.cookie,a.csrf);
  assert.equal(issued.status,201,JSON.stringify(issued.body));
  assert.equal(issued.body.sandboxOnly,true);
  const page=await call('/public/charges/'+draftA.public_token);
  assert.equal(page.body.status,'pending');
  assert.equal(page.body.sandboxOnly,true);
  assert.equal(page.body.paymentEnabled,true);
  assert.ok(page.body.pixPayload.includes('SANDBOX'));
  const publicQr=await call('/public/charges/'+draftA.public_token+'/sandbox-qr');
  assert.equal(publicQr.status,200);
  assert.equal(publicQr.body.sandboxOnly,true);
  assert.ok(publicQr.body.payload.includes('SANDBOX'));
  assert.equal((await call('/sandbox/charges/'+draftA.id+'/issue','POST',{},a.cookie,a.csrf)).status,409);
  assert.equal(paymentPostCount,1);assert.equal(customerPostCount,1);
  const payment=payments.get(draftA.id)!;
  function event(id:string,kind:string,value=400){
    return {id,event:kind,payment:{id:payment.id,externalReference:draftA.id,value,status:kind.slice(8)}};
  }
  assert.equal((await call(webhookPath,'POST',event('evt_invalid_header','PAYMENT_RECEIVED',400))).status,401);
  const amountMismatch=await call(webhookPath,'POST',event('evt_invalid_amount','PAYMENT_RECEIVED',401),undefined,undefined,webhookToken);
  assert.equal(amountMismatch.status,200);
  assert.equal(amountMismatch.body.result,'amount_mismatch_or_missing');
  assert.equal((await call('/public/charges/'+draftA.public_token)).body.status,'pending');
  const confirmed=await call(webhookPath,'POST',event('evt_confirmed_1','PAYMENT_CONFIRMED'),undefined,undefined,webhookToken);
  assert.equal(confirmed.status,200);
  assert.equal((await call('/public/charges/'+draftA.public_token)).body.status,'pending');
  const received=await call(webhookPath,'POST',event('evt_received_1','PAYMENT_RECEIVED'),undefined,undefined,webhookToken);
  assert.equal(received.status,200,JSON.stringify(received.body));
  assert.equal(received.body.result,'received');
  assert.equal((await call('/public/charges/'+draftA.public_token)).body.status,'paid');
  assert.equal((await call('/public/charges/'+draftA.public_token+'/sandbox-qr')).status,404);
  assert.equal((await call(webhookPath,'POST',event('evt_received_1','PAYMENT_RECEIVED'),undefined,undefined,webhookToken)).body.result,'duplicate');
  const late=await call(webhookPath,'POST',event('evt_late_overdue','PAYMENT_OVERDUE'),undefined,undefined,webhookToken);
  assert.equal(late.body.result,'ignored_after_receipt');
  assert.equal((await call('/public/charges/'+draftA.public_token)).body.status,'paid');
  const refund=await call(webhookPath,'POST',event('evt_refund_1','PAYMENT_REFUNDED'),undefined,undefined,webhookToken);
  assert.equal(refund.body.result,'refund_recorded');
  const after=await pool.query('SELECT status,paid_cents FROM charges WHERE id=$1',[draftA.id]);
  assert.equal(after.rows[0].status,'refunded');
  assert.equal(Number(after.rows[0].paid_cents),0);
  assert.equal((await call(webhookPath,'POST',event('evt_late_paid','PAYMENT_RECEIVED'),undefined,undefined,webhookToken)).body.result,'ignored_after_refund');
  const events=await pool.query('SELECT processing_result,event_payload FROM payment_events WHERE charge_id=$1',[draftA.id]);
  assert.equal(events.rowCount,6);
  assert.ok(events.rows.every((r:{event_payload:object})=>!('cpfCnpj' in r.event_payload)));
  // Provider accepted payment but response was lost: DO NOT repeat POST, only reconcile by externalReference.
  const another=await draft(a,'+5511980010033');
  lostResponse=true;
  const indeterminate=await call('/sandbox/charges/'+another.id+'/issue','POST',{},a.cookie,a.csrf);
  assert.equal(indeterminate.status,502);
  assert.equal(indeterminate.body.error,'sandbox_issuance_requires_reconciliation');
  assert.equal((await call('/sandbox/charges/'+another.id+'/issue','POST',{},a.cookie,a.csrf)).status,409);
  const postsBefore=paymentPostCount;
  const reconciled=await call('/sandbox/charges/'+another.id+'/reconcile','POST',{},a.cookie,a.csrf);
  assert.equal(reconciled.status,200,JSON.stringify(reconciled.body));
  assert.equal(reconciled.body.reconciled,true);
  assert.equal(paymentPostCount,postsBefore);
  assert.equal((await call('/public/charges/'+another.public_token)).body.status,'pending');
  const other=await call('/sandbox/charges/'+draftB.id+'/issue','POST',{},b.cookie,b.csrf);
  assert.equal(other.status,503);
  const ownerUser=await pool.query('SELECT u.id FROM users u JOIN memberships m ON m.user_id=u.id WHERE m.organization_id=$1 AND m.role=$2',
    [a.org,'owner']);
  await pool.query("UPDATE memberships SET role='operator' WHERE user_id=$1 AND organization_id=$2",[ownerUser.rows[0].id,a.org]);
  assert.equal((await call('/sandbox/connection','PUT',{
    apiKey:'$aact_hmlg_'+randomBytes(40).toString('hex'),
    webhookToken:'another-token-'+randomBytes(32).toString('hex')
  },a.cookie,a.csrf)).status,403);
  assert.equal((await call('/sandbox/charges/'+another.id+'/reconcile','POST',{},a.cookie,a.csrf)).status,403);
 }finally{
  globalThis.fetch=realFetch;
  await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
  await pool.end();
 }
});
