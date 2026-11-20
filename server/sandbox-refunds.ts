import {randomUUID} from 'node:crypto';
import type {Express,Request,Response,RequestHandler} from 'express';
import {z} from 'zod';
import {pool,transaction} from './db';
import {AsaasSandbox,credentialsReady,decryptApiKey,type SandboxRefund} from './asaas-sandbox';
import {providerMoneyCents} from './asaas-events';

type Principal={userId:string;orgId:string;role:string};
type Dependencies={
  sessions:RequestHandler;csrf:RequestHandler;
  who:(req:Request)=>Principal;
  route:(handler:(req:Request,res:Response)=>Promise<unknown>)=>RequestHandler;
};
const idParam=z.object({id:z.uuid()});
const requestSchema=z.object({
  amountCents:z.number().int().positive().max(10000000000),
  reason:z.string().trim().min(5).max(120)
}).strict();
function owner(p:Principal,res:Response){
  if(p.role==='owner'||p.role==='super_admin')return true;
  res.status(403).json({error:'owner_role_required'});return false;
}
async function accountAndCharge(orgId:string,chargeId:string){
  const q=await pool.query('SELECT ch.id,ch.provider_charge_id,ch.status,ch.amount_cents,ch.discount_cents,'+
    'ch.refunded_cents,si.account_id,si.expected_cents,si.state,si.refund_sync_required,sp.api_key_ciphertext,sp.organization_id '+
    'FROM charges ch JOIN sandbox_issuances si ON si.charge_id=ch.id AND si.organization_id=ch.organization_id '+
    'JOIN sandbox_payment_accounts sp ON sp.id=si.account_id AND sp.organization_id=ch.organization_id '+
    "WHERE ch.organization_id=$1 AND ch.id=$2 AND ch.provider='asaas_sandbox' "+
    "AND sp.enabled=true AND si.state='ready' AND ch.provider_charge_id=si.provider_payment_id",
    [orgId,chargeId]);
  return q.rows[0]??null;
}
function apiFor(row:{api_key_ciphertext:string;organization_id:string}):AsaasSandbox{
  if(!credentialsReady())throw new Error('payment_credentials_key_not_configured');
  return new AsaasSandbox(decryptApiKey(row.api_key_ciphertext,row.organization_id));
}
function summarizeRefunds(refunds:SandboxRefund[],expectedCents:number){
  const seen=new Set<string>();
  let doneCents=0,pendingCents=0;
  for(const r of refunds){
    const cents=providerMoneyCents(r.value);
    if(cents===0)throw new Error('refund_zero_value');
    const identity=[r.description??'',r.value,r.status].join('|');
    if(seen.has(identity))throw new Error('ambiguous_duplicate_refunds_manual_review');
    seen.add(identity);
    if(r.status==='DONE')doneCents+=cents;
    if(r.status==='PENDING')pendingCents+=cents;
  }
  if(doneCents>expectedCents||doneCents+pendingCents>expectedCents)
    throw new Error('provider_refund_total_exceeds_payment');
  return {doneCents,pendingCents};
}
export function registerSandboxRefunds(app:Express,{sessions,csrf,who,route}:Dependencies){
  app.get('/api/sandbox/charges/:id/refunds',sessions,route(async(req,res)=>{
    const p=who(req);if(!owner(p,res))return;
    const {id}=idParam.parse(req.params);
    const row=await accountAndCharge(p.orgId,id);
    if(!row){res.status(404).json({error:'sandbox_charge_not_found'});return;}
    const q=await pool.query('SELECT id,requested_cents::text,state,created_at,updated_at '+
      'FROM sandbox_refund_requests WHERE organization_id=$1 AND charge_id=$2 ORDER BY created_at DESC LIMIT 100',
      [p.orgId,id]);
    res.json({items:q.rows,chargeStatus:row.status,refundedCents:String(row.refunded_cents),
      sandboxOnly:true,reconciliationRequired:row.refund_sync_required});
  }));

  app.post('/api/sandbox/charges/:id/refunds',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!owner(p,res))return;
    const {id}=idParam.parse(req.params),body=requestSchema.parse(req.body);
    const row=await accountAndCharge(p.orgId,id);
    if(!row){res.status(404).json({error:'sandbox_charge_not_found'});return;}
    if(!credentialsReady()){res.status(503).json({error:'sandbox_credentials_unavailable'});return;}
    const refundId=randomUUID();
    const description='CobraFlux sandbox refund '+refundId+' - '+body.reason;
    const claim=await transaction(async db=>{
      const current=await db.query('SELECT status,amount_cents,discount_cents,refunded_cents '+
        'FROM charges WHERE id=$1 AND organization_id=$2 FOR UPDATE',[id,p.orgId]);
      if(!current.rowCount)return 'not_found';
      const charge=current.rows[0];
      if(!['paid','partially_refunded'].includes(charge.status))return 'payment_not_received';
      const expected=Number(charge.amount_cents)-Number(charge.discount_cents);
      const available=expected-Number(charge.refunded_cents);
      if(body.amountCents>available)return 'refund_exceeds_remaining';
      const today=await db.query("SELECT count(*)::int AS total FROM sandbox_refund_requests "+
        "WHERE organization_id=$1 AND created_at>now()-interval '24 hours'",[p.orgId]);
      if(today.rows[0].total>=50)return 'refund_rate_limited';
      const active=await db.query("SELECT 1 FROM sandbox_refund_requests WHERE charge_id=$1 "+
        "AND state IN ('reserved','submitted','reconcile_required') LIMIT 1",[id]);
      if(active.rowCount)return 'refund_requires_reconciliation';
      const needsSync=await db.query('SELECT refund_sync_required FROM sandbox_issuances '+
        'WHERE charge_id=$1 AND account_id=$2',[id,row.account_id]);
      if(needsSync.rows[0]?.refund_sync_required)return 'refund_requires_reconciliation';
      await db.query("INSERT INTO sandbox_refund_requests(id,organization_id,account_id,charge_id,"+
        "provider_payment_id,requested_cents,description,state) VALUES($1,$2,$3,$4,$5,$6,$7,'reserved')",
        [refundId,p.orgId,row.account_id,id,row.provider_charge_id,body.amountCents,description]);
      await db.query("INSERT INTO charge_history(id,organization_id,charge_id,actor_id,action,details) "+
        "VALUES($1,$2,$3,$4,'SANDBOX_REFUND_REQUESTED',$5::jsonb)",
        [randomUUID(),p.orgId,id,p.userId,JSON.stringify({refundId,amountCents:body.amountCents})]);
      await db.query("INSERT INTO audit_logs(id,organization_id,actor_id,action,entity_type,entity_id,metadata) "+
        "VALUES($1,$2,$3,'SANDBOX_REFUND_REQUESTED','charge',$4,$5::jsonb)",
        [randomUUID(),p.orgId,p.userId,id,JSON.stringify({refundId,amountCents:body.amountCents})]);
      return 'claimed';
    });
    if(claim!=='claimed'){res.status(claim==='not_found'?404:claim==='refund_rate_limited'?429:409).json({error:claim});return;}
    try{
      await apiFor(row).requestRefund(row.provider_charge_id,body.amountCents,description);
      await pool.query("UPDATE sandbox_refund_requests SET state='submitted',updated_at=now() "+
        "WHERE id=$1 AND state='reserved'",[refundId]);
      res.status(202).json({id:refundId,state:'submitted',sandboxOnly:true,
        message:'Solicitação aceita pelo ambiente de testes. A devolução ainda NÃO foi confirmada.'});
    }catch(e){
      await pool.query("UPDATE sandbox_refund_requests SET state='reconcile_required',updated_at=now() "+
        "WHERE id=$1 AND state='reserved'",[refundId]);
      // A network timeout may occur after the PSP accepts the POST. No retry is safe without verifying.
      console.error('sandbox_refund_indeterminate',e instanceof Error?e.message:'provider_error');
      res.status(502).json({error:'refund_outcome_requires_reconciliation',id:refundId});
    }
  }));

  app.post('/api/sandbox/charges/:id/reconcile-financial',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!owner(p,res))return;
    const {id}=idParam.parse(req.params);
    const row=await accountAndCharge(p.orgId,id);
    if(!row){res.status(404).json({error:'sandbox_charge_not_found'});return;}
    let payment:Awaited<ReturnType<AsaasSandbox['getPayment']>>;
    let refunds:SandboxRefund[];
    try{
      const api=apiFor(row);
      [payment,refunds]=await Promise.all([api.getPayment(row.provider_charge_id),api.getRefunds(row.provider_charge_id)]);
    }catch(e){
      res.status(502).json({error:'provider_refund_ledger_unavailable'});return;
    }
    const expected=Number(row.expected_cents);
    if(payment.id!==row.provider_charge_id||payment.externalReference!==id||
       payment.billingType!=='PIX'||providerMoneyCents(payment.value)!==expected){
      res.status(409).json({error:'provider_payment_identity_mismatch'});return;
    }
    let summary:{doneCents:number;pendingCents:number};
    try{summary=summarizeRefunds(refunds,expected);}
    catch(e){res.status(409).json({error:'provider_refund_ledger_inconsistent'});return;}
    if(payment.status==='REFUNDED'&&summary.doneCents!==expected){
      res.status(409).json({error:'refund_completion_not_proven'});return;
    }
    if(payment.status==='PARTIALLY_REFUNDED'&&summary.doneCents===0){
      res.status(409).json({error:'partial_refund_completion_not_proven'});return;
    }
    const result=await transaction(async db=>{
      const current=await db.query('SELECT status,amount_cents,discount_cents,refunded_cents,paid_cents,'+
        'provider_charge_id FROM charges WHERE organization_id=$1 AND id=$2 FOR UPDATE',[p.orgId,id]);
      if(!current.rowCount||current.rows[0].provider_charge_id!==payment.id)return {error:'charge_changed'} as const;
      const ch=current.rows[0],original=Number(ch.amount_cents)-Number(ch.discount_cents);
      if(original!==expected||summary.doneCents<Number(ch.refunded_cents))
        return {error:'provider_refund_ledger_regressed'} as const;
      const receivedStatuses=new Set(['RECEIVED','REFUNDED','PARTIALLY_REFUNDED']);
      const alreadyReceived=['paid','partially_refunded','refunded'].includes(ch.status);
      const received=alreadyReceived||receivedStatuses.has(payment.status);
      let status=ch.status as string,paidCents=Number(ch.paid_cents);
      if(received){
        if(summary.doneCents===expected){status='refunded';paidCents=0;}
        else if(summary.doneCents>0){status='partially_refunded';paidCents=expected-summary.doneCents;}
        else if(status!=='refunded'){status='paid';paidCents=expected;}
      }
      for(const request of (await db.query("SELECT id,description,requested_cents,state "+
        "FROM sandbox_refund_requests WHERE charge_id=$1 AND organization_id=$2 "+
        "AND state IN('reserved','submitted','reconcile_required') FOR UPDATE",[id,p.orgId])).rows){
        const matching=refunds.filter(ref=>ref.description===request.description&&
          providerMoneyCents(ref.value)===Number(request.requested_cents));
        if(matching.length!==1)continue;
        if(matching[0].status==='DONE'||matching[0].status==='CANCELLED'){
          const next=matching[0].status==='DONE'?'completed':'denied';
          await db.query('UPDATE sandbox_refund_requests SET state=$2,updated_at=now() WHERE id=$1',[request.id,next]);
        }else if(matching[0].status==='PENDING'){
          await db.query("UPDATE sandbox_refund_requests SET state='submitted',updated_at=now() WHERE id=$1",[request.id]);
        }
      }
      await db.query('UPDATE charges SET status=$3,paid_cents=$4,refunded_cents=$5,updated_at=now() '+
        'WHERE organization_id=$1 AND id=$2',[p.orgId,id,status,paidCents,summary.doneCents]);
      const pending=await db.query("SELECT 1 FROM sandbox_refund_requests WHERE charge_id=$1 "+
        "AND state IN ('reserved','submitted','reconcile_required') LIMIT 1",[id]);
      const needsReview=summary.pendingCents>0||Boolean(pending.rowCount);
      await db.query('UPDATE sandbox_issuances SET refund_sync_required=$2,updated_at=now() WHERE charge_id=$1',
        [id,needsReview]);
      await db.query("INSERT INTO charge_history(id,organization_id,charge_id,actor_id,action,details) "+
        "VALUES($1,$2,$3,$4,'SANDBOX_FINANCIAL_RECONCILED',$5::jsonb)",
        [randomUUID(),p.orgId,id,p.userId,JSON.stringify({
          status,refundedCents:summary.doneCents,pendingRefundCents:summary.pendingCents,needsReview
        })]);
      await db.query("INSERT INTO audit_logs(id,organization_id,actor_id,action,entity_type,entity_id,metadata) "+
        "VALUES($1,$2,$3,'SANDBOX_REFUNDS_RECONCILED','charge',$4,$5::jsonb)",
        [randomUUID(),p.orgId,p.userId,id,JSON.stringify({status,refundedCents:summary.doneCents,needsReview})]);
      return {status,refundedCents:summary.doneCents,paidCents,pendingRefundCents:summary.pendingCents,
        needsReview,sandboxOnly:true};
    });
    if('error' in result){res.status(409).json(result);return;}
    res.json(result);
  }));
}
