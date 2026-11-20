import { z } from 'zod';

const money=z.number().finite().nonnegative().max(100000000);
export const providerEvent=z.object({
  id:z.string().min(5).max(160),
  event:z.string().min(3).max(120),
  payment:z.object({
    id:z.string().min(3).max(120),
    externalReference:z.string().uuid().nullable().optional(),
    value:money.optional(),
    status:z.string().nullable().optional(),
    transactionReceiptUrl:z.string().url().nullable().optional(),
  }).passthrough()
}).passthrough();
export type ProviderEvent=z.infer<typeof providerEvent>;
export const providerMoneyCents=(value:number):number=>{
  const result=Math.round(value*100);
  if(!Number.isSafeInteger(result)||Math.abs(value*100-result)>0.000001)throw new Error('provider_invalid_money_precision');
  return result;
};
export type ChargeStatus='pending_provider'|'pending'|'paid'|'partial'|'partially_refunded'|'overdue'|'cancelled'|'refunded'|'draft';
export type EventDecision={status:ChargeStatus;paidCents:number;result:string};
/** Confirmed in the provider is not necessarily received; never credit just from a CREATED/CONFIRMED event. */
export function applySandboxEvent(current:ChargeStatus,paidCents:number,
  expectedCents:number,event:ProviderEvent):EventDecision{
  const moneyCents=event.payment.value===undefined?null:providerMoneyCents(event.payment.value);
  if(moneyCents===null||moneyCents!==expectedCents){
    return {status:current,paidCents,result:'amount_mismatch_or_missing'};
  }
  const kind=event.event;
  if(current==='draft')return {status:current,paidCents,result:'not_issued'};
  // Chargeback/dispute/refund denial is an incident, not a financial settlement.
  if(kind.startsWith('PAYMENT_CHARGEBACK')||kind==='PAYMENT_AWAITING_CHARGEBACK_REVERSAL'||
     kind==='PAYMENT_REFUND_DENIED'||kind==='PAYMENT_RECEIVED_IN_CASH_UNDONE')
    return {status:current,paidCents,result:'provider_risk_manual_review'};
  // Refund events are only a signal to query the provider's refund ledger.
  // The event can precede settlement: NEVER deduct until a refund is verified DONE.
  if(['PAYMENT_REFUNDED','PAYMENT_PARTIALLY_REFUNDED','PAYMENT_REFUND_IN_PROGRESS','PAYMENT_REFUND_DENIED'].includes(kind))
    return {status:current,paidCents,result:'refund_reconciliation_required'};
  if(current==='refunded'||current==='partially_refunded')
    return {status:current,paidCents,result:'ignored_after_refund'};
  if(kind==='PAYMENT_RECEIVED'){
    if(current==='cancelled')return {status:current,paidCents,result:'received_after_cancellation_review'};
    return {status:'paid',paidCents:expectedCents,result:'received'};
  }
  if(current==='paid')return {status:current,paidCents,result:'ignored_after_receipt'};
  if(kind==='PAYMENT_OVERDUE'){
    if(current==='pending'||current==='pending_provider'||current==='overdue')
      return {status:'overdue',paidCents,result:'overdue'};
  }
  if(kind==='PAYMENT_DELETED'){
    if(current==='pending'||current==='pending_provider'||current==='overdue')
      return {status:'cancelled',paidCents,result:'provider_deleted'};
  }
  return {status:current,paidCents,result:'tracked_no_transition'};
}
