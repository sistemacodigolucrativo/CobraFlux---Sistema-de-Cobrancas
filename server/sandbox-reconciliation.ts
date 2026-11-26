import {randomUUID} from 'node:crypto';
import {pool,transaction} from './db';
import {AsaasSandbox,credentialsReady,decryptApiKey,type SandboxRefund} from './asaas-sandbox';
import {providerMoneyCents} from './asaas-events';

export class ReconciliationError extends Error {
  constructor(public readonly code:string,public readonly httpStatus=409){
    super(code);
  }
}
export type ReconciliationResult={
  status:string;refundedCents:number;paidCents:number;pendingRefundCents:number;
  needsReview:boolean;sandboxOnly:true;changed:boolean;
};

const disputedStates=new Set([
  'CHARGEBACK_REQUESTED','CHARGEBACK_DISPUTE','AWAITING_CHARGEBACK_REVERSAL',
  'CHARGEBACK','REFUND_REQUESTED','REFUND_IN_PROGRESS'
]);
const knownStates=new Set([
  'PENDING','CONFIRMED','RECEIVED','REFUNDED','PARTIALLY_REFUNDED','OVERDUE','DELETED'
]);

export function trustedAsaasReceipt(raw:string|null|undefined):string|null {
  if(!raw)return null;
  try {
    const url=new URL(raw);
    if(url.protocol!=='https:'||url.username||url.password||url.port)return null;
    const host=url.hostname.toLowerCase();
    if(host!=='asaas.com'&&!host.endsWith('.asaas.com'))return null;
    if(!url.pathname.startsWith('/comprovantes/'))return null;
    url.search='';url.hash='';
    return url.href;
  }catch{return null;}
}
export function summarizeProviderRefunds(refunds:SandboxRefund[],expectedCents:number){
  const seen=new Set<string>();
  let doneCents=0,pendingCents=0;
  for(const item of refunds){
    const valueCents=providerMoneyCents(item.value);
    if(valueCents<=0)throw new ReconciliationError('invalid_provider_refund_amount');
    // The refund API may omit IDs; never silently deduplicate identical receipts.
    const fingerprint=(item.description??'')+'|'+valueCents+'|'+item.status;
    if(seen.has(fingerprint))throw new ReconciliationError('ambiguous_duplicate_provider_refunds');
    seen.add(fingerprint);
    if(item.status==='DONE')doneCents+=valueCents;
    if(item.status==='PENDING')pendingCents+=valueCents;
  }
  if(!Number.isSafeInteger(doneCents)||!Number.isSafeInteger(pendingCents)||
    doneCents>expectedCents||doneCents+pendingCents>expectedCents)
    throw new ReconciliationError('provider_refund_total_exceeds_payment');
  return {doneCents,pendingCents};
}
export async function recordReconciliationIncident(orgId:string,chargeId:string,code:string){
  const safeCode=/^[a-z0-9_]{3,100}$/.test(code)?code:'reconciliation_unavailable';
  await pool.query(
    'INSERT INTO sandbox_reconciliation_incidents(id,organization_id,charge_id,code) VALUES($1,$2,$3,$4) '+
    'ON CONFLICT(organization_id,charge_id,code) DO UPDATE SET last_seen_at=now(),resolved_at=NULL',
    [randomUUID(),orgId,chargeId,safeCode]
  );
  await pool.query('UPDATE sandbox_issuances SET review_required=true,review_reason=$3 '+
    'WHERE organization_id=$1 AND charge_id=$2',[orgId,chargeId,safeCode]);
}

export async function reconcileSandboxFinancial(orgId:string,chargeId:string,actorId:string|null=null):
  Promise<ReconciliationResult>{
  const q=await pool.query(
    'SELECT ch.provider_charge_id,si.account_id,si.expected_cents,si.state,sp.api_key_ciphertext,sp.organization_id '+
    'FROM charges ch JOIN sandbox_issuances si ON si.charge_id=ch.id AND si.organization_id=ch.organization_id '+
    'JOIN sandbox_payment_accounts sp ON sp.id=si.account_id AND sp.organization_id=ch.organization_id '+
    "WHERE ch.organization_id=$1 AND ch.id=$2 AND ch.provider='asaas_sandbox' "+
    "AND sp.enabled=true AND si.state='ready' AND ch.provider_charge_id=si.provider_payment_id",
    [orgId,chargeId]);
  if(!q.rowCount)throw new ReconciliationError('sandbox_charge_not_found',404);
  if(!credentialsReady())throw new ReconciliationError('sandbox_credentials_unavailable',503);
  const row=q.rows[0];
  const cancellation=await pool.query(
    "SELECT 1 FROM sandbox_cancellation_requests WHERE organization_id=$1 AND charge_id=$2 "+
    "AND state IN('reserved','submitted','reconcile_required') LIMIT 1",
    [orgId,chargeId]);
  if(cancellation.rowCount)throw new ReconciliationError('cancellation_reconciliation_required');
  const expected=Number(row.expected_cents);
  const api=new AsaasSandbox(decryptApiKey(row.api_key_ciphertext,row.organization_id));
  let payment:Awaited<ReturnType<AsaasSandbox['getPayment']>>,refunds:SandboxRefund[];
  try{
    [payment,refunds]=await Promise.all([
      api.getPayment(row.provider_charge_id),
      api.getRefunds(row.provider_charge_id)
    ]);
  }catch{throw new ReconciliationError('provider_refund_ledger_unavailable',502);}
  if(payment.id!==row.provider_charge_id||payment.externalReference!==chargeId||
    payment.billingType!=='PIX'||providerMoneyCents(payment.value)!==expected)
    throw new ReconciliationError('provider_payment_identity_mismatch');

  if(disputedStates.has(payment.status)||payment.status.startsWith('CHARGEBACK'))
    throw new ReconciliationError('provider_dispute_requires_manual_review');
  if(!knownStates.has(payment.status))
    throw new ReconciliationError('unknown_provider_payment_status');

  const summary=summarizeProviderRefunds(refunds,expected);
  if(payment.status==='REFUNDED'&&summary.doneCents!==expected)
    throw new ReconciliationError('refund_completion_not_proven');
  if(payment.status==='PARTIALLY_REFUNDED'&&
    (summary.doneCents===0||summary.doneCents===expected))
    throw new ReconciliationError('partial_refund_completion_not_proven');

  return transaction(async db=>{
    const current=await db.query(
      'SELECT status,amount_cents,discount_cents,refunded_cents,paid_cents,provider_charge_id '+
      'FROM charges WHERE organization_id=$1 AND id=$2 FOR UPDATE',
      [orgId,chargeId]
    );
    if(!current.rowCount||current.rows[0].provider_charge_id!==payment.id)
      throw new ReconciliationError('charge_changed');
    const ch=current.rows[0];
    const original=Number(ch.amount_cents)-Number(ch.discount_cents);
    if(original!==expected||summary.doneCents<Number(ch.refunded_cents))
      throw new ReconciliationError('provider_refund_ledger_regressed');
    if(['paid','partially_refunded','refunded'].includes(ch.status)&&
      ['PENDING','CONFIRMED','OVERDUE','DELETED'].includes(payment.status))
      throw new ReconciliationError('provider_payment_state_regressed');
    const receivedStatuses=new Set(['RECEIVED','REFUNDED','PARTIALLY_REFUNDED']);
    const received=['paid','partially_refunded','refunded'].includes(ch.status)||
      receivedStatuses.has(payment.status);
    const verifiedPaymentReceipt=received?trustedAsaasReceipt(payment.transactionReceiptUrl):null;
    let status=ch.status as string,paidCents=Number(ch.paid_cents);
    if(received){
      if(summary.doneCents===expected){status='refunded';paidCents=0;}
      else if(summary.doneCents>0){status='partially_refunded';paidCents=expected-summary.doneCents;}
      else if(status!=='refunded'){status='paid';paidCents=expected;}
    }else if(summary.doneCents>0){
      // Without proof of an original receipt, refund ledger alone cannot fabricate revenue.
      throw new ReconciliationError('refund_without_verified_receipt');
    }
    let changed=status!==ch.status||paidCents!==Number(ch.paid_cents)||
      summary.doneCents!==Number(ch.refunded_cents);
    if(verifiedPaymentReceipt){
      await db.query('UPDATE sandbox_issuances SET payment_receipt_url=coalesce(payment_receipt_url,$3) '+
        'WHERE organization_id=$1 AND charge_id=$2',[orgId,chargeId,verifiedPaymentReceipt]);
    }
    const pendingRequests=await db.query(
      "SELECT id,description,requested_cents,state,receipt_url FROM sandbox_refund_requests "+
      "WHERE organization_id=$1 AND charge_id=$2 AND state IN('reserved','submitted','reconcile_required') "+
      "FOR UPDATE",[orgId,chargeId]);
    for(const request of pendingRequests.rows){
      const matched=refunds.filter(ref=>ref.description===request.description&&
        providerMoneyCents(ref.value)===Number(request.requested_cents));
      if(matched.length!==1)continue;
      const ref=matched[0];
      const next=ref.status==='DONE'?'completed':
        ref.status==='CANCELLED'?'denied':'submitted';
      const url=ref.status==='DONE'?trustedAsaasReceipt(ref.transactionReceiptUrl):null;
      await db.query('UPDATE sandbox_refund_requests SET state=$2,receipt_url=$3,updated_at=now() '+
        'WHERE id=$1',[request.id,next,url]);
      changed=changed||next!==request.state||url!==request.receipt_url;
    }
    if(changed){
      await db.query('UPDATE charges SET status=$3,paid_cents=$4,refunded_cents=$5,updated_at=now() '+
        'WHERE organization_id=$1 AND id=$2',
        [orgId,chargeId,status,paidCents,summary.doneCents]);
    }
    const unresolved=await db.query(
      "SELECT 1 FROM sandbox_refund_requests WHERE charge_id=$1 AND organization_id=$2 "+
      "AND state IN('reserved','submitted','reconcile_required') LIMIT 1",
      [chargeId,orgId]);
    const needsReview=summary.pendingCents>0||Boolean(unresolved.rowCount);
    await db.query('UPDATE sandbox_issuances SET refund_sync_required=$3 WHERE organization_id=$1 AND charge_id=$2',
      [orgId,chargeId,needsReview]);
    if(changed){
      await db.query(
        'INSERT INTO charge_history(id,organization_id,charge_id,actor_id,action,details) '+
        "VALUES($1,$2,$3,$4,'SANDBOX_FINANCIAL_RECONCILED',$5::jsonb)",
        [randomUUID(),orgId,chargeId,actorId,
          JSON.stringify({status,refundedCents:summary.doneCents,pendingRefundCents:summary.pendingCents})]
      );
      await db.query(
        "INSERT INTO audit_logs(id,organization_id,actor_id,action,entity_type,entity_id,metadata) "+
        "VALUES($1,$2,$3,'SANDBOX_REFUNDS_RECONCILED','charge',$4,$5::jsonb)",
        [randomUUID(),orgId,actorId,chargeId,JSON.stringify({status,refundedCents:summary.doneCents})]
      );
    }
    return {status,paidCents,refundedCents:summary.doneCents,pendingRefundCents:summary.pendingCents,
      needsReview,sandboxOnly:true,changed};
  });
}
