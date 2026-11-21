import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import type {AddressInfo} from 'node:net';

process.env.CF_NO_LISTEN='true';
process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY=randomBytes(32).toString('hex');
const realFetch=globalThis.fetch.bind(globalThis);
const payments=new Map<string,{id:string;value:number;status:string;externalReference:string;billingType:'PIX'}>();
const customers=new Map<string,string>();
let deletes=0,lostDelete=false,leaveCollectible=false;
globalThis.fetch=(async(input:URL|string|Request,init?:RequestInit):Promise<Response>=>{
 const url=String(input);
 if(!url.startsWith('https://api-sandbox.asaas.com/v3/'))return realFetch(input,init);
 const parsed=new URL(url),method=init?.method??'GET';
 const body=typeof init?.body==='string'?JSON.parse(init.body):{};
 let result:unknown={};
 if(parsed.pathname==='/v3/customers'&&method==='GET'){
   const ref=parsed.searchParams.get('externalReference')??'';
   result={data:customers.has(ref)?[{id:customers.get(ref),externalReference:ref}]:[]};
 }else if(parsed.pathname==='/v3/customers'&&method==='POST'){
   const id='cus_'+randomUUID().slice(0,9);
   customers.set(body.externalReference,id);result={id};
 }else if(parsed.pathname==='/v3/payments'&&method==='GET'){
   const ref=parsed.searchParams.get('externalReference')??'';
   result={data:payments.has(ref)?[payments.get(ref)]:[]};
 }else if(parsed.pathname==='/v3/payments'&&method==='POST'){
   const id='pay_'+randomUUID().slice(0,9);
   const value={id,value:body.value,status:'PENDING',externalReference:body.externalReference,billingType:'PIX' as const};
   payments.set(body.externalReference,value);result=value;
 }else if(parsed.pathname.endsWith('/pixQrCode')&&method==='GET'){
   result={payload:'000201PIX-SANDBOX-TEST-ONLY-'+randomUUID()};
 }else if(parsed.pathname.endsWith('/refunds')&&method==='GET'){
   result={data:[],hasMore:false};
 }else if(/^\/v3\/payments\/[^/]+$/.test(parsed.pathname)&&method==='GET'){
   result=[...payments.values()].find(p=>p.id===parsed.pathname.split('/')[3])??{};
 }else if(/^\/v3\/payments\/[^/]+$/.test(parsed.pathname)&&method==='DELETE'){
   deletes++;
   const payment=[...payments.values()].find(p=>p.id===parsed.pathname.split('/')[3]);
   if(!payment)return new Response(JSON.stringify({errors:[]}),{status:404});
   if(['RECEIVED','REFUNDED'].includes(payment.status))
     return new Response(JSON.stringify({errors:[{description:'already received'}]}),{status:400});
   if(!leaveCollectible)payment.status='DELETED';
   if(lostDelete){lostDelete=false;throw new Error('simulated_lost_delete_result');}
   result={deleted:true};
 }else{
   return new Response(JSON.stringify({errors:[{description:'unmocked endpoint'}]}),{status:404});
 }
 return new Response(JSON.stringify(result),{status:200,headers:{'Content-Type':'application/json'}});
}) as typeof fetch;

const {app}=await import('./index');
const {pool}=await import('./db');
const server=app.listen(0,'127.0.0.1');
await new Promise<void>(resolve=>server.once('listening',resolve));
const base='http://127.0.0.1:'+(server.address() as AddressInfo).port+'/api';
async function request(path:string,method='GET',data?:object,cookie='',csrf='',webhookToken=''){
 const res=await realFetch(base+path,{
   method,headers:{...(data?{'Content-Type':'application/json'}:{}),
     ...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CF-CSRF':csrf}:{}),
     ...(webhookToken?{'asaas-access-token':webhookToken}:{})},
   body:data?JSON.stringify(data):undefined
 });
 return {status:res.status,body:await res.json(),cookie:(res.headers.get('set-cookie')??'').split(';')[0]};
}
async function owner(){
 const name=randomUUID().slice(0,8),email='cancel'+name+'@example.com';
 const r=await request('/auth/register','POST',{
   name:'Titular Teste',businessName:'Empresa Cancel '+name,email,password:'SenhaSandbox!12345'
 });
 assert.equal(r.status,201,JSON.stringify(r.body));
 await pool.query('UPDATE users SET email_verified_at=now() WHERE email=$1',[email]);
 const login=await request('/auth/login','POST',{email,password:'SenhaSandbox!12345'});
 assert.equal(login.status,200,JSON.stringify(login.body));
 const me=await request('/auth/me','GET',undefined,login.cookie);
 assert.equal(me.status,200);
 return {cookie:login.cookie,csrf:me.body.csrfToken,org:me.body.organizationId,userId:me.body.user.id};
}
async function issue(o:{cookie:string;csrf:string;org:string},phone:string){
 const cl=await request('/clients','POST',{name:'Pagador Cancelamento',phone},o.cookie,o.csrf);
 assert.equal(cl.status,201,JSON.stringify(cl.body));
 const draft=await request('/charges','POST',{clientId:cl.body.id,description:'Cobrança sandbox',
   amountCents:12000,discountCents:2000,dueDate:'2026-12-20'},o.cookie,o.csrf);
 assert.equal(draft.status,201,JSON.stringify(draft.body));
 const emitted=await request('/sandbox/charges/'+draft.body.id+'/issue','POST',{},o.cookie,o.csrf);
 assert.equal(emitted.status,201,JSON.stringify(emitted.body));
 assert.equal(payments.get(draft.body.id)?.status,'PENDING');
 return draft.body as {id:string;public_token:string};
}
test('cancelamento Pix no sandbox: segurança, validação PSP, timeout, corrida de pagamento e trabalhador',async()=>{
 try{
  const a=await owner(),b=await owner();
  const webhookToken='cancel-test-token-'+randomBytes(35).toString('hex');
  const setup=await request('/sandbox/connection','PUT',{
    apiKey:'$aact_hmlg_'+randomBytes(35).toString('hex'),webhookToken
  },a.cookie,a.csrf);
  assert.equal(setup.status,200,JSON.stringify(setup.body));
  const hook=setup.body.webhookPath.replace(/^\/api/,'');
  const normal=await issue(a,'+5511999987001');
  assert.equal((await request('/sandbox/charges/'+normal.id+'/cancellation','POST',
    {reason:'Forbidden cross tenant'},b.cookie,b.csrf)).status,404);
  const initialCount=deletes;
  const cancelled=await request('/sandbox/charges/'+normal.id+'/cancellation','POST',
    {reason:'Cancelar serviço de teste'},a.cookie,a.csrf);
  assert.equal(cancelled.status,200,JSON.stringify(cancelled.body));
  assert.equal(cancelled.body.state,'completed');
  assert.equal(cancelled.body.providerDeleteRetried,false);
  assert.equal(deletes,initialCount+1);
  const stored=await pool.query('SELECT status,pix_payload,paid_cents FROM charges WHERE id=$1',[normal.id]);
  assert.equal(stored.rows[0].status,'cancelled');
  assert.equal(stored.rows[0].pix_payload,null);
  assert.equal(Number(stored.rows[0].paid_cents),0);
  assert.equal((await request('/public/charges/'+normal.public_token)).body.paymentEnabled,false);
  assert.equal((await request('/public/charges/'+normal.public_token+'/sandbox-qr')).status,404);
  assert.equal((await request('/sandbox/charges/'+normal.id+'/cancellation','POST',
    {reason:'Tentar cancelar novamente'},a.cookie,a.csrf)).status,409);
  assert.equal(deletes,initialCount+1,'cancelled Pix must not send a second DELETE');
  const checked=await request('/sandbox/charges/'+normal.id+'/cancellation/reconcile','POST',
    {},a.cookie,a.csrf);
  assert.equal(checked.status,200);
  assert.equal(deletes,initialCount+1);

  const alreadyPaid=await issue(a,'+5511999987002');
  const paid=payments.get(alreadyPaid.id)!;
  paid.status='RECEIVED';
  const paidHook=await request(hook,'POST',{
    id:'evt_received_cancel_test_01',event:'PAYMENT_RECEIVED',payment:{
      id:paid.id,externalReference:alreadyPaid.id,value:100,status:'RECEIVED'
    }
  },'', '', webhookToken);
  assert.equal(paidHook.status,200);
  assert.equal((await request('/sandbox/charges/'+alreadyPaid.id+'/cancellation','POST',
    {reason:'Pago não cancela'},a.cookie,a.csrf)).status,409);
  assert.equal((await request('/public/charges/'+alreadyPaid.public_token)).body.status,'paid');

  const timeoutCharge=await issue(a,'+5511999987003');
  const beforeTimeout=deletes;lostDelete=true;
  const timeout=await request('/sandbox/charges/'+timeoutCharge.id+'/cancellation','POST',
    {reason:'Teste de resposta perdida'},a.cookie,a.csrf);
  assert.equal(timeout.status,502,JSON.stringify(timeout.body));
  assert.equal(deletes,beforeTimeout+1);
  assert.equal((await request('/public/charges/'+timeoutCharge.public_token)).body.paymentEnabled,false);
  assert.equal((await request('/sandbox/charges/'+timeoutCharge.id+'/cancellation','POST',
    {reason:'Tentar novamente'},a.cookie,a.csrf)).status,409);
  assert.equal(deletes,beforeTimeout+1,'timeout must not reissue DELETE');
  const recovered=await request('/sandbox/charges/'+timeoutCharge.id+'/cancellation/reconcile',
    'POST',{},a.cookie,a.csrf);
  assert.equal(recovered.status,200,JSON.stringify(recovered.body));
  assert.equal(recovered.body.chargeStatus,'cancelled');
  assert.equal(deletes,beforeTimeout+1);

  const pending=await issue(a,'+5511999987004');
  leaveCollectible=true;lostDelete=true;
  const indeterminate=await request('/sandbox/charges/'+pending.id+'/cancellation','POST',
    {reason:'Aguardar validação do provedor'},a.cookie,a.csrf);
  assert.equal(indeterminate.status,502);
  leaveCollectible=false;
  const webhook=await request(hook,'POST',{
    id:'evt_deleted_cancel_test_02',event:'PAYMENT_DELETED',payment:{
      id:payments.get(pending.id)!.id,externalReference:pending.id,value:100,status:'DELETED'
    }
  },'','',webhookToken);
  assert.equal(webhook.status,200,JSON.stringify(webhook.body));
  assert.equal(webhook.body.result,'cancellation_reconciliation_required');
  assert.equal((await request('/public/charges/'+pending.public_token)).body.paymentEnabled,false);
  const retry=await request('/sandbox/charges/'+pending.id+'/cancellation/reconcile',
    'POST',{},a.cookie,a.csrf);
  assert.equal(retry.status,202);
  assert.equal(retry.body.state,'reconcile_required');
  const countBeforeWorker=deletes;
  payments.get(pending.id)!.status='DELETED';
  const {reconcileSandboxBatch}=await import('./sandbox-reconciliation-worker');
  await pool.query("UPDATE sandbox_issuances SET reconcile_due_at=now()-interval '1 minute' WHERE charge_id=$1",
    [pending.id]);
  const worker=await reconcileSandboxBatch(10,a.org);
  assert.ok(worker.reconciled>=1,JSON.stringify(worker));
  assert.equal((await request('/public/charges/'+pending.public_token)).body.status,'cancelled');
  assert.equal(deletes,countBeforeWorker,'reconciler must not make DELETE requests');

  const race=await issue(a,'+5511999987005');
  payments.get(race.id)!.status='RECEIVED';
  const denied=await request('/sandbox/charges/'+race.id+'/cancellation','POST',
    {reason:'Corrida de pagamento recebido'},a.cookie,a.csrf);
  assert.equal(denied.status,409,JSON.stringify(denied.body));
  assert.equal(deletes,countBeforeWorker);
  const racePayment=await pool.query('SELECT status,paid_cents FROM charges WHERE id=$1',[race.id]);
  assert.equal(racePayment.rows[0].status,'paid');
  assert.equal(Number(racePayment.rows[0].paid_cents),10000);
  const risk=await request('/sandbox/reconciliation/overview','GET',undefined,a.cookie);
  assert.ok(risk.body.incidents.some((x:{code:string})=>x.code==='cancellation_race_received'));
  const foreign=await request('/sandbox/charges/'+normal.id+'/cancellation','GET',undefined,b.cookie);
  assert.equal(foreign.status,404);
  // The operator must never be allowed to request or verify issued Pix cancellation.
  await pool.query("UPDATE memberships SET role='operator' WHERE user_id=$1 AND organization_id=$2",
    [a.userId,a.org]);
  assert.equal((await request('/sandbox/charges/'+normal.id+'/cancellation/reconcile','POST',
    {},a.cookie,a.csrf)).status,403);
  assert.equal((await request('/sandbox/charges/'+normal.id+'/cancellation','GET',
    undefined,a.cookie)).status,403);
 }finally{
  globalThis.fetch=realFetch;
  await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
  await pool.end();
 }
});
