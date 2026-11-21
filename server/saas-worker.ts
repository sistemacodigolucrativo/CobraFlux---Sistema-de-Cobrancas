import {randomUUID} from 'node:crypto';
import {pool,transaction} from './db';
import {isoDate,localBillingDate} from './recurrence-calendar';
export type BillingMaintenance={examined:number;overdue:number;restricted:number;cancelled:number;date:string;paymentsCaptured:0};
type Changed='overdue'|'restricted'|'cancelled';
async function claimAndUpdate(asOf:string):Promise<Changed|null>{
 return transaction(async db=>{
  const q=await db.query(
   "SELECT s.organization_id,s.plan_code,s.status,s.current_period_end::text,"+
   "s.grace_until::text,s.cancel_at_period_end, "+
   "EXISTS(SELECT 1 FROM saas_invoices i WHERE i.organization_id=s.organization_id "+
   "AND i.status='pending' AND i.due_date<$1::date) AS has_overdue_invoice "+
   "FROM saas_subscriptions s WHERE s.plan_code<>'free' AND ( "+
   "(s.cancel_at_period_end=true AND s.current_period_end<=$1::date AND s.status IN('active','trialing')) OR "+
   "(s.status='past_due' AND s.grace_until<$1::date) OR "+
   "(s.status IN('active','trialing') AND (s.current_period_end<$1::date OR "+
   "EXISTS(SELECT 1 FROM saas_invoices i WHERE i.organization_id=s.organization_id "+
   "AND i.status='pending' AND i.due_date<$1::date))) "+
   ") ORDER BY s.organization_id FOR UPDATE OF s SKIP LOCKED LIMIT 1",
   [asOf]);
  if(!q.rowCount)return null;
  const row=q.rows[0],orgId=row.organization_id as string;
  if(row.cancel_at_period_end&&row.current_period_end&&row.current_period_end<=asOf){
   await db.query("UPDATE saas_subscriptions SET plan_code='free',status='free',"+
     "provider=NULL,provider_subscription_id=NULL,current_period_start=$2::date,"+
     "current_period_end=NULL,grace_until=NULL,cancel_at_period_end=false,updated_at=now() "+
     "WHERE organization_id=$1",[orgId,asOf]);
   await db.query("INSERT INTO saas_subscription_history(id,organization_id,action,previous_plan,new_plan,"+
     "previous_status,new_status) VALUES($1,$2,'SAAS_CANCELLED_AT_PERIOD_END',$3,'free',$4,'free')",
     [randomUUID(),orgId,row.plan_code,row.status]);
   return 'cancelled';
  }
  if(row.status==='past_due'){
   await db.query("UPDATE saas_subscriptions SET status='restricted',updated_at=now() "+
     "WHERE organization_id=$1",[orgId]);
   await db.query("INSERT INTO saas_subscription_history(id,organization_id,action,previous_plan,new_plan,"+
     "previous_status,new_status) VALUES($1,$2,'SAAS_GRACE_EXPIRED',$3,$3,'past_due','restricted')",
     [randomUUID(),orgId,row.plan_code]);
   return 'restricted';
  }
  if(row.has_overdue_invoice){
   // Graced access is finite and anchored to invoice due date, never on processing time.
   const qDue=await db.query("SELECT min(due_date)::text AS first_due FROM saas_invoices "+
     "WHERE organization_id=$1 AND status='pending' AND due_date<$2::date",[orgId,asOf]);
   const due=qDue.rows[0].first_due as string;
   await db.query("UPDATE saas_invoices SET status='past_due',updated_at=now() "+
     "WHERE organization_id=$1 AND status='pending' AND due_date<$2::date",[orgId,asOf]);
   await db.query("UPDATE saas_subscriptions SET status='past_due',grace_until=$2::date+7,"+
     "updated_at=now() WHERE organization_id=$1",[orgId,due]);
   await db.query("INSERT INTO saas_subscription_history(id,organization_id,action,previous_plan,new_plan,"+
     "previous_status,new_status) VALUES($1,$2,'SAAS_INVOICE_PAST_DUE',$3,$3,$4,'past_due')",
     [randomUUID(),orgId,row.plan_code,row.status]);
   return 'overdue';
  }
  // Never silently extend a paid period without a verified SaaS provider payment.
  if(row.current_period_end&&row.current_period_end<asOf){
   await db.query("UPDATE saas_subscriptions SET status='restricted',updated_at=now() "+
     "WHERE organization_id=$1",[orgId]);
   await db.query("INSERT INTO saas_subscription_history(id,organization_id,action,previous_plan,new_plan,"+
     "previous_status,new_status) VALUES($1,$2,'SAAS_PERIOD_EXPIRED_WITHOUT_VERIFIED_RENEWAL',$3,$3,$4,'restricted')",
     [randomUUID(),orgId,row.plan_code,row.status]);
   return 'restricted';
  }
  return null;
 });
}
export async function pendingBillingTransitions(asOf=localBillingDate()):Promise<number>{
 isoDate(asOf);
 const q=await pool.query(
  "SELECT count(*)::int AS total FROM saas_subscriptions s WHERE s.plan_code<>'free' AND ("+
  "(s.cancel_at_period_end=true AND s.current_period_end<=$1::date AND s.status IN('active','trialing')) OR "+
  "(s.status='past_due' AND s.grace_until<$1::date) OR "+
  "(s.status IN('active','trialing') AND (s.current_period_end<$1::date OR "+
  "EXISTS(SELECT 1 FROM saas_invoices i WHERE i.organization_id=s.organization_id "+
  "AND i.status='pending' AND i.due_date<$1::date))))",[asOf]);
 return Number(q.rows[0].total);
}
export async function reconcileSaasBilling(limit=25,asOf=localBillingDate()):Promise<BillingMaintenance>{
 if(!Number.isInteger(limit)||limit<1||limit>100)throw new Error('invalid_saas_batch_limit');
 isoDate(asOf);
 if(asOf>localBillingDate())throw new Error('cannot_run_future_billing_date');
 const result:BillingMaintenance={examined:0,overdue:0,restricted:0,cancelled:0,date:asOf,paymentsCaptured:0};
 for(let i=0;i<limit;i++){
  const changed=await claimAndUpdate(asOf);
  if(!changed)break;
  result.examined++;result[changed]++;
 }
 return result;
}
