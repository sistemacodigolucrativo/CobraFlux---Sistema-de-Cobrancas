import {randomUUID} from 'node:crypto';
import type {Express,Request,Response,RequestHandler} from 'express';
import {z} from 'zod';
import {pool,transaction} from './db';
import {saasUsage,discountFor} from './saas-domain';
import {advanceRecurrence,localBillingDate} from './recurrence-calendar';

type Principal={orgId:string;userId:string;role:string};
type Deps={sessions:RequestHandler;csrf:RequestHandler;who:(req:Request)=>Principal;
 route:(fn:(req:Request,res:Response)=>Promise<unknown>)=>RequestHandler};
const allowedPaid=z.enum(['starter','business']);
const isoCode=z.string().regex(/^[A-Z0-9_-]{4,32}$/);
const uid=z.object({id:z.uuid()});
function owner(p:Principal,res:Response){if(['owner','super_admin'].includes(p.role))return true;res.status(403).json({error:'owner_role_required'});return false;}
function admin(p:Principal,res:Response){if(p.role==='super_admin')return true;res.status(403).json({error:'admin_role_required'});return false;}
async function audit(db:{query:Function},p:Principal,action:string,entity:string,info:Record<string,unknown>={}){
 await db.query(
  'INSERT INTO audit_logs(id,organization_id,actor_id,action,entity_type,entity_id,metadata) '+
  "VALUES($1,$2,$3,$4,'saas_billing',$5,$6::jsonb)",
  [randomUUID(),p.orgId,p.userId,action,entity,JSON.stringify(info)]);
}
async function history(db:{query:Function},p:Principal,action:string,previous:string,newPlan:string,extra:object={}){
 await db.query(
  'INSERT INTO saas_subscription_history(id,organization_id,actor_id,action,previous_plan,new_plan,metadata) '+
  'VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)',
  [randomUUID(),p.orgId,p.userId,action,previous,newPlan,JSON.stringify(extra)]);
}
type Quote={planCode:string;label:string;priceConfigured:boolean;currency:'BRL';
 baseCents:number|null;discountCents:number;totalCents:number|null;couponCode:string|null;couponId:string|null};
async function quote(db:{query:Function},planCode:'starter'|'business',couponCode?:string):Promise<Quote>{
 const plan=await db.query('SELECT code,label,monthly_price_cents,published FROM saas_plans WHERE code=$1',[planCode]);
 if(!plan.rowCount)throw new Error('unknown_saas_plan');
 const p=plan.rows[0],price=p.monthly_price_cents===null?null:Number(p.monthly_price_cents);
 if(!p.published||price===null)return {planCode,label:p.label,priceConfigured:false,currency:'BRL',
   baseCents:null,discountCents:0,totalCents:null,couponCode:null,couponId:null};
 let discount=0,couponId:string|null=null;
 if(couponCode){
  const c=await db.query(
   'SELECT id,code,percent_off,fixed_off_cents FROM saas_coupons WHERE code=$1 AND active=true '+
   'AND (expires_at IS NULL OR expires_at>now()) AND '+
   '(max_redemptions IS NULL OR redeemed_count<max_redemptions)',[couponCode]);
  if(!c.rowCount)throw new Error('coupon_unavailable');
  const row=c.rows[0];couponId=row.id;
  discount=discountFor(price,row.percent_off===null?null:Number(row.percent_off),
    row.fixed_off_cents===null?null:Number(row.fixed_off_cents));
 }
 return {planCode,label:p.label,priceConfigured:true,currency:'BRL',baseCents:price,
  discountCents:discount,totalCents:price-discount,couponCode:couponCode??null,couponId};
}
export function registerSaasRoutes(app:Express,{sessions,csrf,who,route}:Deps){
 app.get('/api/saas/plans',sessions,route(async(_req,res)=>{
  const q=await pool.query('SELECT code,label,monthly_price_cents::text,currency,'+
   'clients_limit,services_limit,charges_month_limit,recurrences_limit,members_limit,'+
   'messages_month_limit,published FROM saas_plans ORDER BY CASE code '+
   "WHEN 'free' THEN 1 WHEN 'starter' THEN 2 ELSE 3 END");
  res.json({items:q.rows,billingProviderConfigured:false,realCheckoutEnabled:false});
 }));
 app.get('/api/saas/subscription',sessions,route(async(req,res)=>{
  const p=who(req),info=await saasUsage(p.orgId);
  res.json({...info,realCheckoutEnabled:false,invoicePaidNeverInferredFromMerchantPayments:true});
 }));
 app.get('/api/saas/invoices',sessions,route(async(req,res)=>{
  const p=who(req);if(!owner(p,res))return;
  const q=await pool.query('SELECT id,plan_code,base_amount_cents::text,discount_cents::text,'+
   'total_cents::text,status,period_start::text,period_end::text,due_date::text,'+
   'payment_verified_at,created_at FROM saas_invoices WHERE organization_id=$1 '+
   'ORDER BY created_at DESC LIMIT 100',[p.orgId]);
  res.json({items:q.rows,ledger:'platform_saas',excludedFromMerchantCashflow:true});
 }));
 app.get('/api/saas/change-requests',sessions,route(async(req,res)=>{
  const p=who(req);if(!owner(p,res))return;
  const q=await pool.query(
   'SELECT r.id,r.client_request_id,r.requested_plan,r.state,r.created_at,'+
   'i.id AS invoice_id,i.status AS invoice_status,i.total_cents::text '+
   'FROM saas_change_requests r JOIN saas_invoices i ON i.id=r.invoice_id '+
   'WHERE r.organization_id=$1 ORDER BY r.created_at DESC LIMIT 50',[p.orgId]);
  res.json({items:q.rows});
 }));
 app.post('/api/saas/quote',sessions,csrf,route(async(req,res)=>{
  const p=who(req);if(!owner(p,res))return;
  const b=z.object({planCode:allowedPaid,couponCode:isoCode.optional()}).strict().parse(req.body);
  try{res.json({...await quote(pool,b.planCode,b.couponCode),requiresVerifiedPlatformPayment:true});}
  catch(e){if(e instanceof Error&&e.message==='coupon_unavailable'){
    res.status(422).json({error:'coupon_unavailable'});return;}throw e;}
 }));
 app.post('/api/saas/change-requests',sessions,csrf,route(async(req,res)=>{
  const p=who(req);if(!owner(p,res))return;
  const b=z.object({planCode:allowedPaid,couponCode:isoCode.optional(),
   clientRequestId:z.uuid()}).strict().parse(req.body);
  const result=await transaction(async db=>{
   await db.query('SELECT id FROM organizations WHERE id=$1 FOR UPDATE',[p.orgId]);
   const existing=await db.query('SELECT r.id,r.state,r.invoice_id,r.requested_plan,c.code AS coupon_code '+
    'FROM saas_change_requests r JOIN saas_invoices i ON i.id=r.invoice_id '+
    'LEFT JOIN saas_coupons c ON c.id=i.coupon_id '+
    'WHERE r.organization_id=$1 AND r.client_request_id=$2',
    [p.orgId,b.clientRequestId]);
   if(existing.rowCount){
    if(existing.rows[0].requested_plan!==b.planCode||
       (existing.rows[0].coupon_code??null)!==(b.couponCode??null))
      return {error:'idempotency_key_reused_with_different_details'};
    return {...existing.rows[0],alreadyRequested:true};
   }
   const sub=await db.query('SELECT plan_code,status FROM saas_subscriptions WHERE organization_id=$1 FOR UPDATE',[p.orgId]);
   if(sub.rows[0].plan_code===b.planCode&&['active','trialing'].includes(sub.rows[0].status))
    return {error:'already_subscribed'};
   const other=await db.query("SELECT 1 FROM saas_change_requests WHERE organization_id=$1 AND state='pending'",[p.orgId]);
   if(other.rowCount)return {error:'pending_change_already_exists'};
   let q:Quote;
   try{q=await quote(db,b.planCode,b.couponCode);}catch(e){
    if(e instanceof Error&&e.message==='coupon_unavailable')return {error:'coupon_unavailable'};
    throw e;
   }
   if(!q.priceConfigured||q.baseCents===null||q.totalCents===null)return {error:'plan_pricing_not_configured'};
   const today=localBillingDate(),end=advanceRecurrence(today,'monthly',Number(today.slice(-2)));
   const invoiceId=randomUUID(),requestId=randomUUID();
   await db.query(
    "INSERT INTO saas_invoices(id,organization_id,plan_code,coupon_id,base_amount_cents,discount_cents,"+
    "period_start,period_end,due_date,status) VALUES($1,$2,$3,$4,$5,$6,$7::date,$8::date,$7::date,'draft')",
    [invoiceId,p.orgId,b.planCode,q.couponId,q.baseCents,q.discountCents,today,end]);
   await db.query(
    "INSERT INTO saas_change_requests(id,organization_id,client_request_id,requested_plan,invoice_id,requested_by) "+
    'VALUES($1,$2,$3,$4,$5,$6)',[requestId,p.orgId,b.clientRequestId,b.planCode,invoiceId,p.userId]);
   await history(db,p,'SAAS_PLAN_CHANGE_REQUESTED',sub.rows[0].plan_code,b.planCode,
     {invoiceId,requiresExternalPayment:true,couponCode:b.couponCode??null});
   await audit(db,p,'SAAS_CHECKOUT_DRAFT_CREATED',invoiceId,{requestId,priceCents:q.totalCents});
   return {id:requestId,invoice_id:invoiceId,state:'pending',alreadyRequested:false,
    amountCents:q.totalCents,realCheckoutEnabled:false};
  });
  if('error' in result){res.status(409).json(result);return;}
  res.status(result.alreadyRequested?200:201).json({
   ...result,subscriptionActivated:false,platformPaymentVerified:false,
   actionRequired:'payment_provider_not_integrated'
  });
 }));
 app.post('/api/saas/change-requests/:id/cancel',sessions,csrf,route(async(req,res)=>{
  const p=who(req);if(!owner(p,res))return;
  const {id}=uid.parse(req.params);
  const result=await transaction(async db=>{
   await db.query('SELECT id FROM organizations WHERE id=$1 FOR UPDATE',[p.orgId]);
   const q=await db.query(
    "SELECT id,invoice_id,state FROM saas_change_requests WHERE id=$1 AND organization_id=$2 FOR UPDATE",
    [id,p.orgId]);
   if(!q.rowCount)return null;
   if(q.rows[0].state==='cancelled')return {id,state:'cancelled',alreadyCancelled:true};
   if(q.rows[0].state!=='pending')return {error:'change_request_not_cancellable'};
   const invoice=await db.query('SELECT status FROM saas_invoices WHERE id=$1 AND organization_id=$2 FOR UPDATE',
     [q.rows[0].invoice_id,p.orgId]);
   if(invoice.rows[0].status!=='draft')return {error:'invoice_already_submitted'};
   await db.query("UPDATE saas_invoices SET status='void',updated_at=now() WHERE id=$1",
     [q.rows[0].invoice_id]);
   await db.query("UPDATE saas_change_requests SET state='cancelled',resolved_at=now() WHERE id=$1",[id]);
   await audit(db,p,'SAAS_CHANGE_REQUEST_CANCELLED',id);
   return {id,state:'cancelled',alreadyCancelled:false};
  });
  if(!result){res.status(404).json({error:'not_found'});return;}
  if('error' in result){res.status(409).json(result);return;}
  res.json(result);
 }));
 app.post('/api/saas/cancellation',sessions,csrf,route(async(req,res)=>{
  const p=who(req);if(!owner(p,res))return;
  const b=z.object({cancelAtPeriodEnd:z.boolean()}).strict().parse(req.body);
  const result=await transaction(async db=>{
   const row=await db.query('SELECT plan_code,status,current_period_end,cancel_at_period_end '+
    'FROM saas_subscriptions WHERE organization_id=$1 FOR UPDATE',[p.orgId]);
   if(!row.rowCount)return null;
   const current=row.rows[0];
   if(current.plan_code==='free'||!['active','trialing'].includes(current.status)||
      current.current_period_end===null)return {error:'no_cancelable_paid_subscription'};
   await db.query('UPDATE saas_subscriptions SET cancel_at_period_end=$2,updated_at=now() WHERE organization_id=$1',
    [p.orgId,b.cancelAtPeriodEnd]);
   await history(db,p,b.cancelAtPeriodEnd?'SAAS_END_OF_PERIOD_CANCELLATION_SCHEDULED':
    'SAAS_END_OF_PERIOD_CANCELLATION_REVERSED',current.plan_code,current.plan_code);
   await audit(db,p,'SAAS_CANCEL_AT_PERIOD_END_UPDATED',p.orgId,{cancelAtPeriodEnd:b.cancelAtPeriodEnd});
   return {cancelAtPeriodEnd:b.cancelAtPeriodEnd,noProrationOrRefundTriggered:true};
  });
  if(!result){res.status(404).json({error:'subscription_missing'});return;}
  if('error' in result){res.status(409).json(result);return;}
  res.json(result);
 }));
 // Global price/coupon configuration requires an MFA-verified super_admin session.
 app.patch('/api/admin/saas/plans/:code',sessions,csrf,route(async(req,res)=>{
  const p=who(req);if(!admin(p,res))return;
  const {code}=z.object({code:allowedPaid}).parse(req.params);
  const body=z.object({monthlyPriceCents:z.number().int().min(100).max(100000000),published:z.boolean(),
    limits:z.object({clients:z.number().int().min(1).max(100000),services:z.number().int().min(1).max(100000),
     chargesMonth:z.number().int().min(1).max(100000),recurrences:z.number().int().min(1).max(100000),
     members:z.number().int().min(1).max(1000),messagesMonth:z.number().int().min(1).max(100000)}).strict().optional()
  }).strict().parse(req.body);
  const q=await transaction(async db=>{
   const row=await db.query(
    'UPDATE saas_plans SET monthly_price_cents=$2,published=$3,updated_at=now() WHERE code=$1 RETURNING code,monthly_price_cents::text,published',
    [code,body.monthlyPriceCents,body.published]);
   if(body.limits)await db.query(
    'UPDATE saas_plans SET clients_limit=$2,services_limit=$3,charges_month_limit=$4,'+
    'recurrences_limit=$5,members_limit=$6,messages_month_limit=$7 WHERE code=$1',
    [code,body.limits.clients,body.limits.services,body.limits.chargesMonth,
     body.limits.recurrences,body.limits.members,body.limits.messagesMonth]);
   await audit(db,p,'SAAS_GLOBAL_PLAN_PRICE_CONFIGURED',p.orgId,{code,published:body.published});
   return row.rows[0];
  });
  res.json({...q,providerConfigured:false,realCheckoutEnabled:false});
 }));
 app.post('/api/admin/saas/coupons',sessions,csrf,route(async(req,res)=>{
  const p=who(req);if(!admin(p,res))return;
  const b=z.object({code:isoCode,percentOff:z.number().int().min(1).max(90).optional(),
    fixedOffCents:z.number().int().min(1).max(100000000).optional(),
    maxRedemptions:z.number().int().min(1).max(100000).optional(),
    expiresAt:z.iso.datetime({offset:true}).optional()}).strict().parse(req.body);
  if(Number(b.percentOff!==undefined)+Number(b.fixedOffCents!==undefined)!==1){
   res.status(422).json({error:'choose_percent_or_fixed_discount'});return;
  }
  const id=randomUUID();
  await transaction(async db=>{
   await db.query('INSERT INTO saas_coupons(id,code,percent_off,fixed_off_cents,max_redemptions,expires_at) '+
    'VALUES($1,$2,$3,$4,$5,$6)',[id,b.code,b.percentOff??null,b.fixedOffCents??null,
      b.maxRedemptions??null,b.expiresAt??null]);
   await audit(db,p,'SAAS_COUPON_CREATED',id,{code:b.code});
  });
  res.status(201).json({id,code:b.code,couponsRequireVerifiedPayment:true});
 }));
}
