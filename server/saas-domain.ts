import type {PoolClient} from 'pg';
import {pool} from './db';
import {localBillingDate} from './recurrence-calendar';
export type SaasResource='clients'|'services'|'charges_month'|'recurrences'|'members'|'messages_month';
export type SaasStatus='free'|'trialing'|'active'|'past_due'|'restricted'|'cancelled';
export type SaasPlanCode='free'|'starter'|'business';
export const resources:SaasResource[]=['clients','services','charges_month','recurrences','members','messages_month'];
export type Limits=Record<SaasResource,number>;
export class SaasQuotaError extends Error {
 constructor(public resource:SaasResource,public current:number,public limit:number){
  super('saas_quota_exceeded');
 }
}
export function entitlementPlan(subscription:{
 plan_code:SaasPlanCode;status:SaasStatus;grace_until:string|null;
 current_period_end:string|null;cancel_at_period_end?:boolean;
},today=localBillingDate()):SaasPlanCode{
 if(subscription.plan_code==='free'||subscription.status==='free'||subscription.status==='restricted'||
    subscription.status==='cancelled')return 'free';
 if(subscription.status==='past_due'&&(!subscription.grace_until||subscription.grace_until<today))return 'free';
 if(subscription.current_period_end&&subscription.current_period_end<today&&subscription.status!=='past_due')return 'free';
 return subscription.plan_code;
}
export function discountFor(base:number,percent:number|null,fixed:number|null):number{
 if(!Number.isSafeInteger(base)||base<=0)throw new Error('invalid_saas_price');
 const d=percent!==null?Math.floor(base*percent/100):fixed??0;
 if(!Number.isSafeInteger(d)||d<0)throw new Error('invalid_saas_discount');
 return Math.min(d,base-1); // A paid plan cannot become a free entitlement through a coupon.
}
type Query={query:PoolClient['query']};
const counts:Record<SaasResource,string>={
 clients:"SELECT count(*)::int AS used FROM clients WHERE organization_id=$1 AND status='active'",
 services:"SELECT count(*)::int AS used FROM services WHERE organization_id=$1 AND active=true",
 charges_month:"SELECT count(*)::int AS used FROM charges WHERE organization_id=$1 AND "+
  "created_at >= (date_trunc('month',now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo')",
 recurrences:"SELECT count(*)::int AS used FROM recurrence_plans WHERE organization_id=$1 AND state<>'cancelled'",
 members:"SELECT count(*)::int AS used FROM memberships WHERE organization_id=$1",
 messages_month:"SELECT count(*)::int AS used FROM whatsapp_outbox WHERE organization_id=$1 AND "+
  "created_at >= (date_trunc('month',now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo')"
};
const limitNames:Record<SaasResource,string>={
 clients:'clients_limit',services:'services_limit',charges_month:'charges_month_limit',
 recurrences:'recurrences_limit',members:'members_limit',messages_month:'messages_month_limit'
};
export async function saasUsage(orgId:string){
 const state=await pool.query(
  "SELECT ss.plan_code,ss.status,ss.grace_until::text,ss.current_period_end::text,"+
  "ss.current_period_start::text,ss.cancel_at_period_end FROM saas_subscriptions ss WHERE ss.organization_id=$1",
  [orgId]
 );
 if(!state.rowCount)throw new Error('saas_subscription_missing');
 const raw=state.rows[0];
 const plan=entitlementPlan(raw);
 const p=await pool.query('SELECT code,label,monthly_price_cents,'+
   'clients_limit,services_limit,charges_month_limit,recurrences_limit,members_limit,messages_month_limit '+
   'FROM saas_plans WHERE code=$1',[plan]);
 if(!p.rowCount)throw new Error('saas_plan_missing');
 const usage=await Promise.all(resources.map(async key=>{
  const r=await pool.query(counts[key],[orgId]);return [key,Number(r.rows[0].used)] as const;
 }));
 const limits=Object.fromEntries(resources.map(key=>[key,Number(p.rows[0][limitNames[key]])])) as Limits;
 return {subscription:raw,effectivePlan:plan,limits,usage:Object.fromEntries(usage) as Limits,
  pendingPaymentDoesNotActivate:true};
}
/** Serializable organization lock across API operations/workers guarantees strict limit without races. */
export async function enforceSaasQuota(
 db:Query,orgId:string,resource:SaasResource,addition=1,
 options:{includePendingInvites?:boolean}={}
):Promise<void>{
 if(!Number.isInteger(addition)||addition<0||addition>100000)
   throw new Error('invalid_quota_addition');
 await db.query('SELECT id FROM organizations WHERE id=$1 FOR UPDATE',[orgId]);
 const q=await db.query("SELECT ss.plan_code,ss.status,ss.grace_until::text,ss.current_period_end::text "+
   'FROM saas_subscriptions ss WHERE ss.organization_id=$1',[orgId]);
 if(!q.rowCount)throw new Error('saas_subscription_missing');
 const plan=entitlementPlan(q.rows[0]);
 const limit=await db.query('SELECT '+limitNames[resource]+' AS ceiling FROM saas_plans WHERE code=$1',[plan]);
 const count=await db.query(counts[resource],[orgId]);
 let used=Number(count.rows[0].used);
 if(resource==='members'&&options.includePendingInvites){
  const pending=await db.query(
   "SELECT count(*)::int AS used FROM team_invitations WHERE organization_id=$1 "+
   'AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at>now()',[orgId]);
  used+=Number(pending.rows[0].used);
 }
 const ceiling=Number(limit.rows[0].ceiling);
 if(used+addition>ceiling)throw new SaasQuotaError(resource,used,ceiling);
}
