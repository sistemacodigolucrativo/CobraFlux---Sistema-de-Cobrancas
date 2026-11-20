import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {applySandboxEvent,providerEvent,providerMoneyCents} from './asaas-events';
import {AsaasSandbox,encryptApiKey,decryptApiKey} from './asaas-sandbox';

const baseEvent={id:'evt_provider_000001',event:'PAYMENT_RECEIVED',
  payment:{id:'pay_0001',externalReference:'be0c4212-ac47-4816-a8e6-e27400ae1597',
    value:45,status:'RECEIVED'}};
test('provider money is accurate to cents and status cannot be faked by creation/confirmation',()=>{
  assert.equal(providerMoneyCents(1250.50),125050);
  assert.throws(()=>providerMoneyCents(1.005),/precision/);
  const created=applySandboxEvent('pending',0,4500,{...baseEvent,event:'PAYMENT_CREATED'});
  assert.equal(created.status,'pending');
  const confirmed=applySandboxEvent('pending',0,4500,{...baseEvent,event:'PAYMENT_CONFIRMED'});
  assert.equal(confirmed.status,'pending');
  const paid=applySandboxEvent('pending',0,4500,baseEvent);
  assert.deepEqual(paid,{status:'paid',paidCents:4500,result:'received'});
  assert.equal(applySandboxEvent('paid',4500,4500,{...baseEvent,event:'PAYMENT_OVERDUE'}).status,'paid');
  const refunded=applySandboxEvent('paid',4500,4500,{...baseEvent,event:'PAYMENT_REFUNDED'});
  assert.equal(refunded.status,'paid');assert.equal(refunded.paidCents,4500);
  assert.equal(refunded.result,'refund_reconciliation_required');
  assert.equal(applySandboxEvent('partially_refunded',3500,4500,baseEvent).paidCents,3500);
  assert.equal(applySandboxEvent('pending',0,4500,{...baseEvent,event:'PAYMENT_PARTIALLY_REFUNDED'}).result,'refund_reconciliation_required');
  assert.equal(applySandboxEvent('refunded',0,4500,baseEvent).status,'refunded');
  assert.equal(applySandboxEvent('pending',0,4500,{...baseEvent,payment:{...baseEvent.payment,value:46}}).status,'pending');
  assert.equal(applySandboxEvent('cancelled',0,4500,baseEvent).status,'cancelled');
  assert.throws(()=>providerEvent.parse({...baseEvent,payment:{...baseEvent.payment,externalReference:'bad-uuid'}}));
});
test('credentials use AES-256-GCM with tenant bound authenticated data',()=>{
 process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY=randomBytes(32).toString('hex');
 const key='$aact_hmlg_123456789012345678901234567890abcdef';
 const org='9ef5cf2b-910e-4bf4-90d7-047b8f100001';
 const encrypted=encryptApiKey(key,org);
 assert.notEqual(encrypted,key);
 assert.equal(decryptApiKey(encrypted,org),key);
 assert.throws(()=>decryptApiKey(encrypted,'9ef5cf2b-910e-4bf4-90d7-047b8f100002'));
});
test('Asaas adapter uses only official sandbox host and maps payer/payment/QR endpoints',async()=>{
 const calls:Array<{url:string;method:string;body:unknown}>=[];
 const transport=async(input:URL|string|Request,init?:RequestInit)=>{
  const url=String(input);calls.push({url,method:init?.method??'GET',body:init?.body?JSON.parse(init.body as string):null});
  let payload:object={data:[]};
  if(url.endsWith('/customers')&&init?.method==='POST')payload={id:'cus_0001'};
  if(url.endsWith('/payments')&&init?.method==='POST')payload={id:'pay_0001',value:45};
  if(url.endsWith('/pixQrCode'))payload={payload:'000201PIXCOBRANCASANDBOX123456789'};
  if(url.endsWith('/payments/pay_0001')&&init?.method==='GET')
    payload={id:'pay_0001',value:45,status:'RECEIVED',externalReference:'charge-uuid',billingType:'PIX'};
  if(url.endsWith('/payments/pay_0001/refunds')&&init?.method==='GET')
    payload={data:[{value:5.5,description:'CobraFlux sandbox refund ref abc',status:'DONE'}]};
  if(url.endsWith('/payments/pay_0001/refund')&&init?.method==='POST')
    payload={id:'pay_0001',status:'REFUND_IN_PROGRESS'};

  return new Response(JSON.stringify(payload),{status:200,headers:{'Content-Type':'application/json'}});
 };
 const client=new AsaasSandbox('$aact_hmlg_123456789012345678901234567890abcdef',transport as typeof fetch);
 assert.equal(await client.customerByReference('customer-uuid'),null);
 assert.equal(await client.createCustomer({clientId:'customer-uuid',name:'João',email:null,phone:'+5511999998888'}),'cus_0001');
 assert.equal(await client.paymentByReference('charge-uuid'),null);
 assert.equal((await client.createPayment({chargeId:'charge-uuid',customerId:'cus_0001',amountCents:4500,description:'Teste',dueDate:'2026-12-20'})).id,'pay_0001');
 assert.equal((await client.getQrCode('pay_0001')).payload,'000201PIXCOBRANCASANDBOX123456789');
 assert.equal((await client.getPayment('pay_0001')).billingType,'PIX');
 assert.equal((await client.getRefunds('pay_0001'))[0].status,'DONE');
 await client.requestRefund('pay_0001',550,'CobraFlux sandbox refund ref abc');
 assert.ok(calls.some(c=>c.url.endsWith('/payments/pay_0001/refund')&&c.method==='POST' &&
   (c.body as {value:number}).value===5.5));

 assert.ok(calls.every(c=>c.url.startsWith('https://api-sandbox.asaas.com/v3/')));
 const payment=calls.find(c=>c.url.endsWith('/payments')&&c.method==='POST');
 assert.deepEqual(payment?.body,{customer:'cus_0001',billingType:'PIX',value:45,
   dueDate:'2026-12-20',description:'Teste',externalReference:'charge-uuid'});
});
