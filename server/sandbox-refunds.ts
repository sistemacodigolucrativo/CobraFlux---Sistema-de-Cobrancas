import {randomUUID} from 'node:crypto';
import type {Express,Request,Response,RequestHandler} from 'express';
import {z} from 'zod';
import {pool,transaction} from './db';
import {AsaasSandbox,credentialsReady,decryptApiKey} from './asaas-sandbox';
import {ReconciliationError,reconcileSandboxFinancial,recordReconciliationIncident,trustedAsaasReceipt} from './sandbox-reconciliation';

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
    'ch.refunded_cents,si.account_id,si.expected_cents,si.state,si.refund_sync_required,si.payment_receipt_url,sp.api_key_ciphertext,sp.organization_id '+
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
export function registerSandboxRefunds(app:Express,{sessions,csrf,who,route}:Dependencies){
  app.get('/api/sandbox/charges/:id/refunds',sessions,route(async(req,res)=>{
    const p=who(req);if(!owner(p,res))return;
    const {id}=idParam.parse(req.params);
    const row=await accountAndCharge(p.orgId,id);
    if(!row){res.status(404).json({error:'sandbox_charge_not_found'});return;}
    const q=await pool.query('SELECT id,requested_cents::text,state,receipt_url,created_at,updated_at '+
      'FROM sandbox_refund_requests WHERE organization_id=$1 AND charge_id=$2 ORDER BY created_at DESC LIMIT 100',
      [p.orgId,id]);
    res.json({items:q.rows,chargeStatus:row.status,refundedCents:String(row.refunded_cents),
      sandboxOnly:true,reconciliationRequired:row.refund_sync_required});
  }));

  app.get('/api/sandbox/charges/:id/payment-receipt',sessions,route(async(req,res)=>{
    const p=who(req);if(!owner(p,res))return;
    const {id}=idParam.parse(req.params);
    const row=await accountAndCharge(p.orgId,id);
    if(!row||!['paid','partially_refunded','refunded'].includes(row.status)){
      res.status(404).json({error:'sandbox_receipt_not_available'});return;
    }
    const receiptUrl=trustedAsaasReceipt(row.payment_receipt_url);
    if(!receiptUrl){res.status(404).json({error:'sandbox_receipt_not_available'});return;}
    res.json({receiptUrl,sandboxOnly:true});
  }));

  app.get('/api/sandbox/reconciliation/overview',sessions,route(async(req,res)=>{
    const p=who(req);if(!owner(p,res))return;
    const [summary,incidents]=await Promise.all([
      pool.query(
        "SELECT count(*)::int AS total, "+
        "count(*) FILTER (WHERE reconcile_due_at<=now() AND "+
          "(reconcile_lease_until IS NULL OR reconcile_lease_until<=now()))::int AS due, "+
        "count(*) FILTER (WHERE review_required=true)::int AS flagged, "+
        "count(*) FILTER (WHERE reconcile_attempts>=3)::int AS repeated_failures "+
        "FROM sandbox_issuances WHERE organization_id=$1 AND state='ready'",[p.orgId]
      ),
      pool.query(
        'SELECT i.charge_id,i.code,i.first_seen_at,i.last_seen_at FROM sandbox_reconciliation_incidents i '+
        'WHERE i.organization_id=$1 AND i.resolved_at IS NULL '+
        'ORDER BY i.last_seen_at DESC LIMIT 30',[p.orgId]
      )
    ]);
    res.json({sandboxOnly:true,automated:false,schedulerRequired:true,
      summary:summary.rows[0],incidents:incidents.rows});
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
    try{
      const result=await reconcileSandboxFinancial(p.orgId,id,p.userId);
      res.json(result);
    }catch(e){
      if(e instanceof ReconciliationError){
        if(e.httpStatus===409){
          await recordReconciliationIncident(p.orgId,id,e.code);
        }
        res.status(e.httpStatus).json({error:e.code});
        return;
      }
      console.error('sandbox_manual_reconciliation_unavailable');
      res.status(502).json({error:'sandbox_reconciliation_unavailable'});
    }
  }));
}
