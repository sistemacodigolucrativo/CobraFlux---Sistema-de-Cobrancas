import {pool,transaction} from './db';
import {credentialsReady} from './asaas-sandbox';
import {ReconciliationError,reconcileSandboxFinancial,recordReconciliationIncident} from './sandbox-reconciliation';

type Candidate={chargeId:string;organizationId:string;attempts:number};
export type WorkerSummary={
  examined:number;reconciled:number;failed:number;manualReview:number;sandboxOnly:true;
};
async function claimNext():Promise<Candidate|null>{
  return transaction(async db=>{
    const result=await db.query(
      'SELECT si.charge_id,si.organization_id,si.reconcile_attempts '+
      'FROM sandbox_issuances si JOIN sandbox_payment_accounts sp ON sp.id=si.account_id '+
      'WHERE si.state=$1 AND sp.enabled=true AND si.reconcile_due_at<=now() '+
      'AND (si.reconcile_lease_until IS NULL OR si.reconcile_lease_until<=now()) '+
      'ORDER BY si.reconcile_due_at,si.created_at FOR UPDATE OF si SKIP LOCKED LIMIT 1',
      ['ready']
    );
    if(!result.rowCount)return null;
    const row=result.rows[0];
    await db.query(
      "UPDATE sandbox_issuances SET reconcile_lease_until=now()+interval '2 minutes' "+
      'WHERE charge_id=$1 AND organization_id=$2',
      [row.charge_id,row.organization_id]
    );
    return {chargeId:row.charge_id,organizationId:row.organization_id,
      attempts:Number(row.reconcile_attempts)};
  });
}
async function finish(candidate:Candidate,success:boolean,resultStatus:string|null,errorCode:string|null){
  // All scheduling state is database-backed; a terminated process releases its lease after 2 minutes.
  const intervalMinutes=success
    ? resultStatus==='refunded'?1440:
      resultStatus==='partially_refunded'?120:
      resultStatus==='paid'?240:20
    :Math.min(360,5*Math.pow(2,Math.min(candidate.attempts,7)));
  await pool.query(
    "UPDATE sandbox_issuances SET reconcile_lease_until=NULL,reconcile_due_at=now()+($3 * interval '1 minute'),"+
    'last_reconciled_at=CASE WHEN $4::boolean THEN now() ELSE last_reconciled_at END,'+
    'last_reconcile_error=$5,reconcile_attempts=CASE WHEN $4::boolean THEN 0 ELSE reconcile_attempts+1 END '+
    'WHERE charge_id=$1 AND organization_id=$2',
    [candidate.chargeId,candidate.organizationId,intervalMinutes,success,errorCode]
  );
}
export async function reconcileSandboxBatch(limit=20):Promise<WorkerSummary>{
  if(!Number.isInteger(limit)||limit<1||limit>50)throw new Error('invalid_sandbox_batch_size');
  if(!credentialsReady())throw new Error('payment_credentials_key_not_configured');
  const stats:WorkerSummary={examined:0,reconciled:0,failed:0,manualReview:0,sandboxOnly:true};
  for(let i=0;i<limit;i++){
    const candidate=await claimNext();
    if(!candidate)break;
    stats.examined++;
    try{
      const result=await reconcileSandboxFinancial(candidate.organizationId,candidate.chargeId,null);
      await finish(candidate,true,result.status,null);
      stats.reconciled++;
    }catch(e){
      stats.failed++;
      const errorCode=e instanceof ReconciliationError?e.code:'reconciliation_unavailable';
      const review=e instanceof ReconciliationError&&e.httpStatus===409;
      if(review||candidate.attempts>=2){
        try{await recordReconciliationIncident(candidate.organizationId,candidate.chargeId,errorCode);}
        catch{console.error('sandbox_reconciliation_incident_persist_failed');}
        stats.manualReview++;
      }
      await finish(candidate,false,null,errorCode);
      // Never log secrets, API responses or payer details.
      console.error('sandbox_reconciliation_failed',errorCode);
    }
  }
  return stats;
}
export async function sandboxReconciliationDueCount():Promise<number>{
  const q=await pool.query('SELECT count(*)::int AS total FROM sandbox_issuances si '+
    'JOIN sandbox_payment_accounts sp ON sp.id=si.account_id WHERE si.state=$1 AND sp.enabled=true '+
    'AND si.reconcile_due_at<=now() AND (si.reconcile_lease_until IS NULL OR si.reconcile_lease_until<=now())',
    ['ready']);
  return q.rows[0].total as number;
}
