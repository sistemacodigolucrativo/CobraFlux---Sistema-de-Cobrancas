import {randomUUID} from 'node:crypto';
import type {Express,Request,Response,RequestHandler} from 'express';
import {z} from 'zod';
import {pool,transaction} from './db';
import {AsaasSandbox,credentialsReady,decryptApiKey} from './asaas-sandbox';
import {providerMoneyCents} from './asaas-events';
import {ReconciliationError,reconcileSandboxFinancial,recordReconciliationIncident} from './sandbox-reconciliation';

type Principal={userId:string;orgId:string;role:string};
type Deps={
  sessions:RequestHandler;csrf:RequestHandler;who:(req:Request)=>Principal;
  route:(fn:(req:Request,res:Response)=>Promise<unknown>)=>RequestHandler;
};
const params=z.object({id:z.uuid()});
const reasonSchema=z.object({reason:z.string().trim().min(5).max(200)}).strict();
const cancellable=new Set(['pending','overdue']);
const paidProvider=new Set(['RECEIVED','PARTIALLY_REFUNDED','REFUNDED']);
type CancellationState='reserved'|'submitted'|'reconcile_required'|'completed'|'rejected';
type Intent={id:string;organization_id:string;charge_id:string;account_id:string;provider_payment_id:string;
  expected_cents:string;api_key_ciphertext:string;state:CancellationState};
export type CancellationOutcome={id:string;state:CancellationState;chargeStatus:string;
  sandboxOnly:true;providerDeleteRetried:false};

function requireOwner(p:Principal,res:Response){
  if(p.role==='owner'||p.role==='super_admin')return true;
  res.status(403).json({error:'owner_role_required'});return false;
}
async function intentFor(orgId:string,chargeId:string):Promise<Intent|null>{
  const q=await pool.query(
    'SELECT ci.id,ci.organization_id,ci.charge_id,ci.account_id,ci.provider_payment_id,ci.state,'+
    'si.expected_cents,sp.api_key_ciphertext FROM sandbox_cancellation_requests ci '+
    'JOIN sandbox_issuances si ON si.charge_id=ci.charge_id AND si.account_id=ci.account_id '+
    'JOIN sandbox_payment_accounts sp ON sp.id=ci.account_id AND sp.organization_id=ci.organization_id '+
    'WHERE ci.organization_id=$1 AND ci.charge_id=$2 AND sp.enabled=true',
    [orgId,chargeId]);
  return q.rows[0]??null;
}
function apiFor(intent:Intent){
  if(!credentialsReady())throw new ReconciliationError('sandbox_credentials_unavailable',503);
  return new AsaasSandbox(decryptApiKey(intent.api_key_ciphertext,intent.organization_id));
}
async function changeIntent(intent:Intent,state:CancellationState,error:string|null=null){
  await pool.query(
    'UPDATE sandbox_cancellation_requests SET state=$2,last_error=$3,updated_at=now() WHERE id=$1',
    [intent.id,state,error]
  );
  await pool.query('UPDATE sandbox_issuances SET reconcile_due_at=now() '+
    'WHERE organization_id=$1 AND charge_id=$2',[intent.organization_id,intent.charge_id]);
}
async function verifyPayment(intent:Intent){
  let detail:Awaited<ReturnType<AsaasSandbox['getPayment']>>;
  try{detail=await apiFor(intent).getPayment(intent.provider_payment_id);}
  catch{throw new ReconciliationError('cancellation_provider_lookup_unavailable',502);}
  if(detail.id!==intent.provider_payment_id||
    detail.externalReference!==intent.charge_id||detail.billingType!=='PIX'||
    providerMoneyCents(detail.value)!==Number(intent.expected_cents))
    throw new ReconciliationError('cancellation_provider_identity_mismatch');
  return detail;
}
async function audit(db:{query:Function},p:Principal,chargeId:string,action:string,details:object={}){
  await db.query('INSERT INTO charge_history(id,organization_id,charge_id,actor_id,action,details) '+
    'VALUES($1,$2,$3,$4,$5,$6::jsonb)',
    [randomUUID(),p.orgId,chargeId,p.userId,action,JSON.stringify(details)]);
  await db.query('INSERT INTO audit_logs(id,organization_id,actor_id,action,entity_type,entity_id,metadata) '+
    'VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)',
    [randomUUID(),p.orgId,p.userId,action,'charge',chargeId,JSON.stringify(details)]);
}
export async function reconcileSandboxCancellation(orgId:string,chargeId:string,
  actorId:string|null=null):Promise<CancellationOutcome>{
  const intent=await intentFor(orgId,chargeId);
  if(!intent)throw new ReconciliationError('sandbox_cancellation_not_found',404);
  const detail=await verifyPayment(intent);
  if(detail.status==='DELETED'){
    return transaction(async db=>{
      const row=await db.query(
        'SELECT status,paid_cents,refunded_cents FROM charges WHERE organization_id=$1 AND id=$2 FOR UPDATE',
        [orgId,chargeId]);
      if(!row.rowCount)throw new ReconciliationError('sandbox_charge_not_found',404);
      if(!['cancel_pending','cancelled'].includes(row.rows[0].status)||
         Number(row.rows[0].paid_cents)!==0||Number(row.rows[0].refunded_cents)!==0)
        throw new ReconciliationError('cancellation_conflicts_with_receipt');
      const wasComplete=intent.state==='completed';
      await db.query("UPDATE charges SET status='cancelled',pix_payload=NULL,updated_at=now() "+
        'WHERE organization_id=$1 AND id=$2',[orgId,chargeId]);
      await db.query("UPDATE sandbox_cancellation_requests SET state='completed',last_error=NULL,updated_at=now() "+
        'WHERE id=$1',[intent.id]);
      if(!wasComplete){
        await db.query('INSERT INTO charge_history(id,organization_id,charge_id,actor_id,action,details) '+
          "VALUES($1,$2,$3,$4,'SANDBOX_CANCELLATION_VERIFIED',$5::jsonb)",
          [randomUUID(),orgId,chargeId,actorId,JSON.stringify({providerStatus:'DELETED'})]);
        await db.query('INSERT INTO audit_logs(id,organization_id,actor_id,action,entity_type,entity_id,metadata) '+
          "VALUES($1,$2,$3,'SANDBOX_CANCELLATION_VERIFIED','charge',$4,$5::jsonb)",
          [randomUUID(),orgId,actorId,chargeId,JSON.stringify({providerStatus:'DELETED'})]);
      }
      return {id:intent.id,state:'completed',chargeStatus:'cancelled',
        sandboxOnly:true,providerDeleteRetried:false};
    });
  }
  if(paidProvider.has(detail.status)){
    // A payment may race with the cancellation request. Never turn received money into "cancelled".
    await changeIntent(intent,'rejected','provider_payment_received');
    await recordReconciliationIncident(orgId,chargeId,'cancellation_race_received');
    // This financial routine verifies the payment/refund ledger independently and updates paid cents.
    try{
      const checked=await reconcileSandboxFinancial(orgId,chargeId,actorId);
      return {id:intent.id,state:'rejected',chargeStatus:checked.status,
        sandboxOnly:true,providerDeleteRetried:false};
    }catch{
      throw new ReconciliationError('cancellation_received_financial_review',409);
    }
  }
  if(['PENDING','OVERDUE'].includes(detail.status)){
    // No DELETE retries here even if provider remained PENDING after an accepted request.
    await changeIntent(intent,'reconcile_required','provider_still_collectible');
    return {id:intent.id,state:'reconcile_required',chargeStatus:'cancel_pending',
      sandboxOnly:true,providerDeleteRetried:false};
  }
  await changeIntent(intent,'reconcile_required','provider_status_review');
  await recordReconciliationIncident(orgId,chargeId,'cancellation_provider_status_review');
  throw new ReconciliationError('cancellation_provider_status_review');
}

export function registerSandboxCancellation(app:Express,{sessions,csrf,who,route}:Deps):void{
  app.get('/api/sandbox/charges/:id/cancellation',sessions,route(async(req,res)=>{
    const p=who(req);if(!requireOwner(p,res))return;
    const {id}=params.parse(req.params);
    const result=await pool.query(
      'SELECT id,state,reason,created_at,updated_at,last_error FROM sandbox_cancellation_requests '+
      'WHERE charge_id=$1 AND organization_id=$2',[id,p.orgId]);
    if(!result.rowCount){res.status(404).json({error:'sandbox_cancellation_not_found'});return;}
    res.json({...result.rows[0],sandboxOnly:true});
  }));
  app.post('/api/sandbox/charges/:id/cancellation',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!requireOwner(p,res))return;
    const {id}=params.parse(req.params),{reason}=reasonSchema.parse(req.body);
    if(!credentialsReady()){res.status(503).json({error:'sandbox_credentials_unavailable'});return;}
    const claimed=await transaction(async db=>{
      const row=await db.query(
        'SELECT ch.status,ch.paid_cents,ch.refunded_cents,ch.provider_charge_id,ch.provider,'+
        'si.account_id,si.state AS issuance_state,sp.enabled FROM charges ch '+
        'LEFT JOIN sandbox_issuances si ON si.charge_id=ch.id AND si.organization_id=ch.organization_id '+
        'LEFT JOIN sandbox_payment_accounts sp ON sp.id=si.account_id '+
        'WHERE ch.id=$1 AND ch.organization_id=$2 FOR UPDATE OF ch',[id,p.orgId]);
      if(!row.rowCount)return {error:'sandbox_charge_not_found'} as const;
      const charge=row.rows[0];
      if(!cancellable.has(charge.status)||charge.provider!=='asaas_sandbox'||
         charge.issuance_state!=='ready'||!charge.enabled||!charge.provider_charge_id||
         Number(charge.paid_cents)!==0||Number(charge.refunded_cents)!==0)
        return {error:'cancellation_not_allowed_for_payment_state'} as const;
      const exists=await db.query('SELECT 1 FROM sandbox_cancellation_requests WHERE charge_id=$1',[id]);
      if(exists.rowCount)return {error:'cancellation_already_requested'} as const;
      const activeRefund=await db.query("SELECT 1 FROM sandbox_refund_requests WHERE charge_id=$1 "+
        "AND state IN('reserved','submitted','reconcile_required') LIMIT 1",[id]);
      if(activeRefund.rowCount)return {error:'active_refund_blocks_cancellation'} as const;
      const intentId=randomUUID();
      await db.query('INSERT INTO sandbox_cancellation_requests(id,organization_id,account_id,'+
        'charge_id,provider_payment_id,actor_id,reason,previous_status,state) '+
        "VALUES($1,$2,$3,$4,$5,$6,$7,$8,'reserved')",
        [intentId,p.orgId,charge.account_id,id,charge.provider_charge_id,p.userId,reason,charge.status]);
      // Invalidate public Pix access before external deletion, without falsifying settlement.
      await db.query("UPDATE charges SET status='cancel_pending',pix_payload=NULL,updated_at=now() "+
        'WHERE id=$1 AND organization_id=$2',[id,p.orgId]);
      await db.query("UPDATE sandbox_issuances SET reconcile_due_at=now() WHERE charge_id=$1",[id]);
      await audit(db,p,id,'SANDBOX_CANCELLATION_REQUESTED',{intentId});
      return {id:intentId} as const;
    });
    if('error' in claimed){
      res.status(claimed.error==='sandbox_charge_not_found'?404:409).json(claimed);return;
    }
    const intent=await intentFor(p.orgId,id);
    if(!intent){res.status(502).json({error:'cancellation_intent_missing'});return;}
    try{
      const detail=await verifyPayment(intent);
      if(detail.status==='DELETED'){
        res.status(200).json(await reconcileSandboxCancellation(p.orgId,id,p.userId));return;
      }
      if(!['PENDING','OVERDUE'].includes(detail.status)){
        const result=await reconcileSandboxCancellation(p.orgId,id,p.userId);
        res.status(409).json({error:'provider_payment_not_cancellable',...result});return;
      }
      // Only one DELETE is sent for each charge, and only after identity and unpaid status checks.
      await changeIntent(intent,'submitted');
      await apiFor(intent).deleteUnpaidPayment(intent.provider_payment_id);
      const reconciled=await reconcileSandboxCancellation(p.orgId,id,p.userId);
      res.status(reconciled.state==='completed'?200:202).json(reconciled);
    }catch(e){
      await changeIntent(intent,'reconcile_required',
        e instanceof ReconciliationError?e.code:'external_delete_result_uncertain');
      if(e instanceof ReconciliationError&&e.httpStatus===409)
        await recordReconciliationIncident(p.orgId,id,e.code);
      res.status(e instanceof ReconciliationError?e.httpStatus:502)
        .json({error:'cancellation_requires_reconciliation',id:intent.id,sandboxOnly:true,
          providerDeleteRetried:false});
    }
  }));
  app.post('/api/sandbox/charges/:id/cancellation/reconcile',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!requireOwner(p,res))return;
    const {id}=params.parse(req.params);
    try{
      const result=await reconcileSandboxCancellation(p.orgId,id,p.userId);
      res.status(result.state==='completed'?200:result.state==='rejected'?409:202).json(result);
    }catch(e){
      const code=e instanceof ReconciliationError?e.code:'sandbox_cancellation_reconciliation_unavailable';
      if(e instanceof ReconciliationError&&e.httpStatus===409)
        await recordReconciliationIncident(p.orgId,id,code);
      res.status(e instanceof ReconciliationError?e.httpStatus:502).json({error:code,sandboxOnly:true});
    }
  }));
}
