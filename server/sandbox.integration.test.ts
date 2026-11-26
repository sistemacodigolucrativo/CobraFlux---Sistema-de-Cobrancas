import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import type {AddressInfo} from 'node:net';
process.env.CF_NO_LISTEN='true';
process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY=randomBytes(32).toString('hex');
const realFetch=globalThis.fetch.bind(globalThis);
const customers=new Map<string,string>(),
  payments=new Map<string,{id:string;value:number;status:string;externalReference:string;billingType:'PIX';transactionReceiptUrl?:string}>();
const refunds=new Map<string,Array<{value:number;description:string;status:'PENDING'|'DONE'|'CANCELLED';transactionReceiptUrl?:string}>>();
let paymentPostCount=0,customerPostCount=0,lostResponse=false,refundPostCount=0,lostRefundResponse=false;
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
   payments.set(body.externalReference,{id,value:body.value,status:'PENDING',externalReference:body.externalReference,billingType:'PIX'});
   if(lostResponse){lostResponse=false;throw new Error('simulated_lost_provider_response');}
   response={id,value:body.value,status:'PENDING'};
 }else if(/^\/v3\/payments\/[^/]+\/refunds$/.test(path.pathname)&&method==='GET'){
   const providerId=path.pathname.split('/')[3];
   response={data:refunds.get(providerId)??[],hasMore:false};
 }else if(/^\/v3\/payments\/[^/]+\/refund$/.test(path.pathname)&&method==='POST'){
   refundPostCount++;
   const providerId=path.pathname.split('/')[3];
   const current=refunds.get(providerId)??[];
   current.push({value:body.value,description:body.description,status:'PENDING'});
   refunds.set(providerId,current);
   if(lostRefundResponse){lostRefundResponse=false;throw new Error('simulated_refund_timeout');}
   response={id:providerId,status:'REFUND_IN_PROGRESS'};
 }else if(/^\/v3\/payments\/[^/]+$/.test(path.pathname)&&method==='GET'){
   const providerId=path.pathname.split('/')[3];
   response=[...payments.values()].find(x=>x.id===providerId)??{};
 }else if(path.pathname.endsWith('/pixQrCode')&&method==='GET'){
   response={payload:'000201ASAAS-SANDBOX-PIX-NAO-PAGAR-'+randomUUID().slice(0,12),expirationDate:'2026-12-25'};
 }else{
   return new Response(JSON.stringify({errors:[{description:'route_not_mocked'}]}),{status:404});
 }
 return new Response(JSON.stringify(response),{status:200,headers:{'X-Forwarded-For':'198.51.100.43','Content-Type':'application/json'}});
}) as typeof fetch;
const {app}=await import('./index');
app.set('trust proxy',1); // Integration-test-only: distinguish fixtures without weakening production IP limits.
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
  const finance=await call('/reports/overview','GET',undefined,a.cookie);
  assert.equal(finance.status,200);
  assert.equal(Number(finance.body.total_paid_cents),0,'sandbox cannot inflate real revenue');
  assert.equal(finance.body.paid_charges,0);
  assert.equal(finance.body.sandbox_paid_charges,1);
  assert.equal(Number(finance.body.sandbox_paid_cents),40000);
  assert.equal((await call('/public/charges/'+draftA.public_token+'/sandbox-qr')).status,404);
  assert.equal((await call(webhookPath,'POST',event('evt_received_1','PAYMENT_RECEIVED'),undefined,undefined,webhookToken)).body.result,'duplicate');
  const late=await call(webhookPath,'POST',event('evt_late_overdue','PAYMENT_OVERDUE'),undefined,undefined,webhookToken);
  assert.equal(late.body.result,'ignored_after_receipt');
  assert.equal((await call('/public/charges/'+draftA.public_token)).body.status,'paid');
  // Refund event alone cannot change money: only DONE records reconciled from the provider can.
  payment.status='RECEIVED';
  payment.transactionReceiptUrl='https://www.asaas.com/comprovantes/9988776655?tracking=ignored';
  const refundHint=await call(webhookPath,'POST',event('evt_refund_1','PAYMENT_REFUNDED'),undefined,undefined,webhookToken);
  assert.equal(refundHint.body.result,'refund_reconciliation_required');
  let after=await pool.query('SELECT status,paid_cents,refunded_cents FROM charges WHERE id=$1',[draftA.id]);
  assert.equal(after.rows[0].status,'paid');
  assert.equal(Number(after.rows[0].paid_cents),40000);
  assert.equal(Number(after.rows[0].refunded_cents),0);
  assert.equal((await call('/sandbox/charges/'+draftA.id+'/refunds','POST',
    {amountCents:15000,reason:'Ajuste parcial de teste'},a.cookie,a.csrf)).status,409);
  const initialSync=await call('/sandbox/charges/'+draftA.id+'/reconcile-financial','POST',{},a.cookie,a.csrf);
  assert.equal(initialSync.status,200,JSON.stringify(initialSync.body));
  assert.equal(initialSync.body.refundedCents,0);
  const paidReceipt=await call('/sandbox/charges/'+draftA.id+'/payment-receipt','GET',undefined,a.cookie);
  assert.equal(paidReceipt.status,200);
  assert.equal(paidReceipt.body.receiptUrl,'https://www.asaas.com/comprovantes/9988776655');
  assert.equal((await call('/sandbox/charges/'+draftA.id+'/payment-receipt','GET',undefined,b.cookie)).status,404);


  const partial=await call('/sandbox/charges/'+draftA.id+'/refunds','POST',
    {amountCents:15000,reason:'Ajuste parcial de teste'},a.cookie,a.csrf);
  assert.equal(partial.status,202,JSON.stringify(partial.body));
  assert.equal(partial.body.state,'submitted');
  assert.equal(refundPostCount,1);
  assert.equal((await call('/sandbox/charges/'+draftA.id+'/refunds','POST',
    {amountCents:15000,reason:'Ajuste parcial duplicado'},a.cookie,a.csrf)).status,409);
  const waiting=await call('/sandbox/charges/'+draftA.id+'/reconcile-financial','POST',{},a.cookie,a.csrf);
  assert.equal(waiting.status,200);
  assert.equal(waiting.body.pendingRefundCents,15000);
  assert.equal(waiting.body.refundedCents,0);
  assert.equal((await call('/reports/overview','GET',undefined,a.cookie)).body.sandbox_paid_cents,'40000');

  refunds.get(payment.id)![0].status='DONE';
  refunds.get(payment.id)![0].transactionReceiptUrl='https://www.asaas.com/comprovantes/6677732109104548?utm=test';
  payment.status='PARTIALLY_REFUNDED';
  const {reconcileSandboxBatch,sandboxReconciliationDueCount}=await import('./sandbox-reconciliation-worker');
  assert.ok((await sandboxReconciliationDueCount())>=1);
  const scheduled=await reconcileSandboxBatch(10,a.org);
  assert.ok(scheduled.reconciled>=1,JSON.stringify(scheduled));
  assert.equal(scheduled.failed,0,JSON.stringify(scheduled));
  const autoState=await pool.query('SELECT status,refunded_cents FROM charges WHERE id=$1',[draftA.id]);
  assert.equal(autoState.rows[0].status,'partially_refunded');
  assert.equal(Number(autoState.rows[0].refunded_cents),15000);
  const autoReceipts=await call('/sandbox/charges/'+draftA.id+'/refunds','GET',undefined,a.cookie);
  assert.equal(autoReceipts.body.items[0].receipt_url,
    'https://www.asaas.com/comprovantes/6677732109104548');
  const reconciledPartial=await call('/sandbox/charges/'+draftA.id+'/reconcile-financial','POST',{},a.cookie,a.csrf);
  assert.equal(reconciledPartial.status,200,JSON.stringify(reconciledPartial.body));
  assert.equal(reconciledPartial.body.status,'partially_refunded');
  assert.equal(reconciledPartial.body.refundedCents,15000);
  assert.equal(reconciledPartial.body.paidCents,25000);
  const partialFilter=await call('/charges?status=partially_refunded','GET',undefined,a.cookie);
  assert.equal(partialFilter.status,200);
  assert.ok(partialFilter.body.items.some((x:{id:string})=>x.id===draftA.id));
  const listPartial=await call('/sandbox/charges/'+draftA.id+'/refunds','GET',undefined,a.cookie);
  assert.equal(listPartial.body.items[0].state,'completed');
  assert.equal(Number(listPartial.body.refundedCents),15000);
  assert.equal((await call('/reports/overview','GET',undefined,a.cookie)).body.sandbox_paid_cents,'25000');
  assert.equal((await call('/reports/overview','GET',undefined,a.cookie)).body.total_paid_cents,'0');
  assert.equal((await call('/sandbox/charges/'+draftA.id+'/refunds','POST',
    {amountCents:26000,reason:'Maior que saldo'},a.cookie,a.csrf)).status,409);
  assert.equal((await call('/sandbox/charges/'+draftA.id+'/refunds','POST',
    {amountCents:1000,reason:'Tenant B nao pode'},b.cookie,b.csrf)).status,404);

  // The worker must isolate a chargeback/dispute as an incident, not decrement funds or retry POST.
  payment.status='CHARGEBACK_REQUESTED';
  await pool.query("UPDATE sandbox_issuances SET reconcile_due_at=now()-interval '1 minute' WHERE charge_id=$1",
    [draftA.id]);
  const failedCycle=await reconcileSandboxBatch(1);
  assert.equal(failedCycle.examined,1);
  assert.equal(failedCycle.failed,1);
  assert.equal(failedCycle.manualReview,1);
  const afterFailure=await pool.query(
    'SELECT reconcile_attempts,last_reconcile_error,review_required,refunded_cents '+
    'FROM sandbox_issuances si JOIN charges ch ON ch.id=si.charge_id WHERE si.charge_id=$1',
    [draftA.id]);
  assert.equal(afterFailure.rows[0].last_reconcile_error,'provider_dispute_requires_manual_review');
  assert.equal(afterFailure.rows[0].review_required,true);
  assert.equal(Number(afterFailure.rows[0].reconcile_attempts),1);
  assert.equal(Number(afterFailure.rows[0].refunded_cents),15000);
  payment.status='PARTIALLY_REFUNDED';

  lostRefundResponse=true;
  const finalRequest=await call('/sandbox/charges/'+draftA.id+'/refunds','POST',
    {amountCents:25000,reason:'Estorno integral do restante'},a.cookie,a.csrf);
  assert.equal(finalRequest.status,502,JSON.stringify(finalRequest.body));
  assert.equal(refundPostCount,2);
  assert.equal((await call('/sandbox/charges/'+draftA.id+'/refunds','POST',
    {amountCents:25000,reason:'Nao repetir'},a.cookie,a.csrf)).status,409);
  assert.equal(refundPostCount,2,'no second POST after inconclusive refund');
  const beforeDone=await call('/sandbox/charges/'+draftA.id+'/reconcile-financial','POST',{},a.cookie,a.csrf);
  assert.equal(beforeDone.status,200);
  assert.equal(beforeDone.body.pendingRefundCents,25000);
  refunds.get(payment.id)![1].status='DONE';
  payment.status='REFUNDED';
  const reconciledFull=await call('/sandbox/charges/'+draftA.id+'/reconcile-financial','POST',{},a.cookie,a.csrf);
  assert.equal(reconciledFull.status,200,JSON.stringify(reconciledFull.body));
  assert.equal(reconciledFull.body.status,'refunded');
  assert.equal(reconciledFull.body.refundedCents,40000);
  assert.equal(reconciledFull.body.paidCents,0);
  const latePaid=await call(webhookPath,'POST',event('evt_late_paid','PAYMENT_RECEIVED'),undefined,undefined,webhookToken);
  assert.equal(latePaid.body.result,'ignored_after_refund');
  after=await pool.query('SELECT status,paid_cents,refunded_cents FROM charges WHERE id=$1',[draftA.id]);
  assert.equal(after.rows[0].status,'refunded');
  assert.equal(Number(after.rows[0].paid_cents),0);
  assert.equal(Number(after.rows[0].refunded_cents),40000);
  assert.equal((await call('/reports/overview','GET',undefined,a.cookie)).body.sandbox_paid_cents,'0');
  const riskEvent=await call(webhookPath,'POST',event('evt_chargeback_1','PAYMENT_CHARGEBACK_REQUESTED'),
    undefined,undefined,webhookToken);
  assert.equal(riskEvent.status,200);
  assert.equal(riskEvent.body.result,'provider_risk_manual_review');
  const riskA=await call('/sandbox/reconciliation/overview','GET',undefined,a.cookie);
  assert.equal(riskA.status,200);
  assert.ok(riskA.body.summary.flagged>=1);
  assert.ok(riskA.body.incidents.some((x:{code:string})=>x.code==='provider_chargeback_event'));
  const riskB=await call('/sandbox/reconciliation/overview','GET',undefined,b.cookie);
  assert.equal(riskB.status,200);
  assert.equal(riskB.body.incidents.length,0);
  const refundAudits=await pool.query(
    "SELECT action FROM audit_logs WHERE organization_id=$1 AND action IN('SANDBOX_REFUND_REQUESTED','SANDBOX_REFUNDS_RECONCILED')",
    [a.org]);
  assert.ok(refundAudits.rows.some((x:{action:string})=>x.action==='SANDBOX_REFUND_REQUESTED'));
  assert.ok(refundAudits.rows.some((x:{action:string})=>x.action==='SANDBOX_REFUNDS_RECONCILED'));
  const events=await pool.query('SELECT processing_result,event_payload FROM payment_events WHERE charge_id=$1',[draftA.id]);
  assert.equal(events.rowCount,7);
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
