import test from 'node:test';
import assert from 'node:assert/strict';
import {trustedAsaasReceipt,summarizeProviderRefunds} from './sandbox-reconciliation';
import {applySandboxEvent} from './asaas-events';

test('only genuine HTTPS Asaas receipt links are exposed; queries and fragments are removed',()=>{
  assert.equal(
    trustedAsaasReceipt('https://www.asaas.com/comprovantes/6677732109104548?access=test#ignored'),
    'https://www.asaas.com/comprovantes/6677732109104548'
  );
  for(const value of [
    'http://www.asaas.com/comprovantes/123',
    'javascript:alert(1)',
    'https://asaas.com.evil.example/comprovantes/123',
    'https://attacker@www.asaas.com/comprovantes/123',
    'https://www.asaas.com/other/endpoint',
    'https://example.net/comprovantes/123'
  ])assert.equal(trustedAsaasReceipt(value),null,value);
  assert.equal(trustedAsaasReceipt(null),null);
});
test('refund ledger accounts only DONE, keeps PENDING outstanding, validates cents and duplicates',()=>{
  const amounts=summarizeProviderRefunds([
    {value:125,status:'DONE',description:'refund one'},
    {value:75,status:'PENDING',description:'refund two'},
    {value:50,status:'CANCELLED',description:'refund three'}
  ],25000);
  assert.deepEqual(amounts,{doneCents:12500,pendingCents:7500});
  assert.throws(()=>summarizeProviderRefunds([
    {value:260,status:'DONE',description:'refund'}
  ],25000),/provider_refund_total_exceeds_payment/);
  assert.throws(()=>summarizeProviderRefunds([
    {value:1,status:'DONE',description:'duplicate'},
    {value:1,status:'DONE',description:'duplicate'}
  ],25000),/ambiguous_duplicate_provider_refunds/);
  assert.throws(()=>summarizeProviderRefunds([
    {value:1.005,status:'DONE',description:'precision'}
  ],25000),/provider_invalid_money_precision/);
});
test('chargebacks and denied refunds raise incident signals, never mark money received',()=>{
  const original={id:'evt_chargeback',event:'PAYMENT_CHARGEBACK_REQUESTED',
    payment:{id:'pay_test',externalReference:'d72e2b89-a1a9-4289-b63c-d664a96422c9',
      value:400,status:'CHARGEBACK_REQUESTED'}};
  assert.deepEqual(applySandboxEvent('paid',40000,40000,original),
    {status:'paid',paidCents:40000,result:'provider_risk_manual_review'});
  assert.equal(applySandboxEvent('paid',40000,40000,{
    ...original,event:'PAYMENT_REFUND_DENIED'
  }).result,'provider_risk_manual_review');
});
