import {randomUUID} from 'node:crypto';
import type {Express,Request,Response,RequestHandler} from 'express';
import {z} from 'zod';
import {pool,transaction} from './db';
import {csvRows} from './phase7-domain';

type Principal={userId:string;orgId:string;role:string};
type Deps={sessions:RequestHandler;csrf:RequestHandler;who:(req:Request)=>Principal;
 route:(fn:(req:Request,res:Response)=>Promise<unknown>)=>RequestHandler;
 rateLimit:(key:string,max:number,minutes:number)=>Promise<boolean>};
const identifier=z.object({id:z.uuid()});
const page=z.object({limit:z.coerce.number().int().min(1).max(100).default(50),
 offset:z.coerce.number().int().min(0).max(10000).default(0)}).strict();
const reviewStatus=z.enum(['open','in_review','awaiting_evidence','closed_rejected']);
function requireOwner(p:Principal,res:Response):boolean{
 if(p.role==='owner'||p.role==='super_admin')return true;
 res.status(403).json({error:'owner_role_required'});return false;
}
function requireAdmin(p:Principal,res:Response):boolean{
 // sessions middleware independently requires MFA-verified session for super_admin role.
 if(p.role==='super_admin')return true;
 res.status(403).json({error:'admin_role_required'});return false;
}
async function audit(db:{query:Function},p:Principal,action:string,entityType:string,entityId:string,meta:object={},orgId?:string|null){
 await db.query(
  'INSERT INTO audit_logs(id,organization_id,actor_id,action,entity_type,entity_id,metadata) '+
  'VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)',
  [randomUUID(),orgId===undefined?p.orgId:orgId,p.userId,action,entityType,entityId,JSON.stringify(meta)]);
}
const isoMonth=z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
export function registerPhase7Routes(app:Express,{sessions,csrf,who,route,rateLimit}:Deps){
 // Cross-tenant platform overview: MRR is recognized only for a separately verified live SaaS payment.
 // Merchant GPV is a different financial measure, and sandbox is never a real-money component.
 app.get('/api/admin/reports/overview',sessions,route(async(req,res)=>{
  const p=who(req);if(!requireAdmin(p,res))return;
  const [entities,subscriptions,mrr,merchant,saasRevenue]=await Promise.all([
   pool.query(
    "SELECT (SELECT count(*)::int FROM organizations) AS organizations_total,"+
    "(SELECT count(*)::int FROM organizations WHERE status='active') AS organizations_active,"+
    "(SELECT count(*)::int FROM organizations WHERE status<>'active') AS organizations_restricted,"+
    "(SELECT count(*)::int FROM users) AS registered_users,"+
    "(SELECT count(*)::int FROM support_tickets WHERE status<>'closed') AS tickets_open,"+
    "(SELECT count(*)::int FROM privacy_requests WHERE state<>'closed_rejected') AS privacy_requests_open"),
   pool.query(
    "SELECT plan_code,status,count(*)::int AS total FROM saas_subscriptions GROUP BY plan_code,status "+
    "ORDER BY plan_code,status"),
   pool.query(
    "SELECT coalesce(sum(pay.total_cents),0)::text AS mrr_cents FROM saas_subscriptions s "+
    "JOIN LATERAL(SELECT i.total_cents FROM saas_invoices i "+
    "WHERE i.organization_id=s.organization_id AND i.plan_code=s.plan_code "+
    "AND i.status='paid' AND i.provider='platform_live' AND i.payment_verified_at IS NOT NULL "+
    "AND i.provider_invoice_id IS NOT NULL AND i.period_start<=current_date AND i.period_end>current_date "+
    "ORDER BY i.payment_verified_at DESC LIMIT 1) pay ON true "+
    "WHERE s.status='active' AND s.provider='platform_live' "+
    "AND s.current_period_start<=current_date AND s.current_period_end>current_date"),
   pool.query(
    "SELECT coalesce(sum(greatest(paid_cents-refunded_cents,0)) "+
    "FILTER(WHERE provider='asaas_live' AND status IN('paid','partial','partially_refunded','refunded')),0)::text AS real_gpv_cents,"+
    "coalesce(sum(greatest(paid_cents-refunded_cents,0)) "+
    "FILTER(WHERE provider='asaas_sandbox' AND status IN('paid','partial','partially_refunded','refunded')),0)::text AS sandbox_gpv_cents "+
    'FROM charges'),
   pool.query(
    "SELECT coalesce(sum(total_cents),0)::text AS verified_platform_receipts_cents "+
    "FROM saas_invoices WHERE status='paid' AND provider='platform_live' "+
    "AND provider_invoice_id IS NOT NULL AND payment_verified_at IS NOT NULL")
  ]);
  res.json({organizations:entities.rows[0],subscriptions:subscriptions.rows,
   finance:{mrrCents:mrr.rows[0].mrr_cents,merchantRealGpvCents:merchant.rows[0].real_gpv_cents,
    merchantSandboxGpvCents:merchant.rows[0].sandbox_gpv_cents,
    platformVerifiedReceiptsCents:saasRevenue.rows[0].verified_platform_receipts_cents},
   mrrDefinition:'monthly-equivalent latest verified live SaaS invoice in current active period',
   realMoneyRequiresVerifiedPSP:true,platformPspConnected:false,merchantLivePspConnected:false,
   sandboxExcludedFromReal:true});
 }));
 app.get('/api/admin/organizations',sessions,route(async(req,res)=>{
  const p=who(req);if(!requireAdmin(p,res))return;
  const q=page.extend({
   search:z.string().trim().max(100).optional(),
   status:z.enum(['active','suspended','blocked']).optional()
  }).parse(req.query);
  const predicate="($1::text IS NULL OR o.name ILIKE $1 OR o.id::text=$1) "+
   "AND ($2::text IS NULL OR o.status=$2)";
  const args=[q.search?(q.search.includes('-')?q.search:'%'+q.search+'%'):null,q.status??null];
  const [rows,count]=await Promise.all([
   pool.query(
    'SELECT o.id,o.name,o.status,o.created_at,s.plan_code,s.status AS subscription_status,'+
    "(SELECT count(*)::int FROM clients c WHERE c.organization_id=o.id AND c.status='active') AS clients_active "+
    'FROM organizations o LEFT JOIN saas_subscriptions s ON s.organization_id=o.id '+
    'WHERE '+predicate+' ORDER BY o.created_at DESC,o.id DESC LIMIT $3 OFFSET $4',
    [...args,q.limit,q.offset]),
   pool.query('SELECT count(*)::int AS count FROM organizations o WHERE '+predicate,args)
  ]);
  res.json({items:rows.rows,total:Number(count.rows[0].count)});
 }));
 app.patch('/api/admin/organizations/:id/status',sessions,csrf,route(async(req,res)=>{
  const p=who(req);if(!requireAdmin(p,res))return;
  const {id}=identifier.parse(req.params);
  const b=z.object({status:z.enum(['active','suspended','blocked']),
   reason:z.string().trim().min(12).max(500)}).strict().parse(req.body);
  if(id===p.orgId){res.status(403).json({error:'cannot_change_current_admin_organization'});return;}
  const result=await transaction(async db=>{
   const before=await db.query('SELECT status,name FROM organizations WHERE id=$1 FOR UPDATE',[id]);
   if(!before.rowCount)return null;
   const previous=before.rows[0].status as string;
   if(previous===b.status)return {error:'status_unchanged'};
   await db.query('UPDATE organizations SET status=$2 WHERE id=$1',[id,b.status]);
   if(b.status!=='active'){
    await db.query(
     'UPDATE auth_sessions SET revoked_at=now() WHERE organization_id=$1 AND revoked_at IS NULL',[id]);
    await db.query('UPDATE whatsapp_accounts SET enabled=false,updated_at=now() WHERE organization_id=$1',[id]);
    await db.query("UPDATE whatsapp_outbox SET state='blocked',last_error='organization_suspended',updated_at=now() "+
     "WHERE organization_id=$1 AND state='queued'",[id]);
   }
   await audit(db,p,'ADMIN_ORGANIZATION_STATUS_CHANGED','organization',id,
    {previous,next:b.status,reason:b.reason},id);
   return {id,previous,status:b.status,sessionsRevoked:b.status!=='active',
    whatsappDeliveryDisabled:b.status!=='active'};
  });
  if(!result){res.status(404).json({error:'organization_not_found'});return;}
  if('error' in result){res.status(409).json(result);return;}
  res.json(result);
 }));
 app.get('/api/reports/summary',sessions,route(async(req,res)=>{
  const p=who(req);
  const [groups,charges,monthly]=await Promise.all([
   pool.query(
    "SELECT (SELECT count(*)::int FROM clients WHERE organization_id=$1 AND status='active') AS clients_active,"+
    "(SELECT count(*)::int FROM services WHERE organization_id=$1 AND active=true) AS services_active,"+
    "(SELECT count(*)::int FROM recurrence_plans WHERE organization_id=$1 AND state='active') AS recurrence_plans_active",
    [p.orgId]),
   pool.query(
    "SELECT count(*)::int AS charges_total,"+
    "count(*) FILTER(WHERE status='draft')::int AS drafts,"+
    "count(*) FILTER(WHERE status IN('pending','pending_provider','overdue'))::int AS outstanding,"+
    "count(*) FILTER(WHERE provider='asaas_sandbox' AND status IN('paid','partial','partially_refunded','refunded'))::int AS sandbox_paid_count,"+
    "coalesce(sum(greatest(paid_cents-refunded_cents,0)) FILTER("+
    "WHERE provider='asaas_sandbox' AND status IN('paid','partial','partially_refunded','refunded')),0)::text AS sandbox_net_cents,"+
    "coalesce(sum(greatest(paid_cents-refunded_cents,0)) FILTER("+
    "WHERE provider='asaas_live' AND status IN('paid','partial','partially_refunded','refunded')),0)::text AS real_net_cents "+
    "FROM charges WHERE organization_id=$1",[p.orgId]),
   pool.query(
    "SELECT to_char(date_trunc('month',created_at AT TIME ZONE 'America/Sao_Paulo'),'YYYY-MM') AS month,"+
    "count(*)::int AS created_charges FROM charges WHERE organization_id=$1 "+
    "AND created_at>=now()-interval '12 months' "+
    "GROUP BY date_trunc('month',created_at AT TIME ZONE 'America/Sao_Paulo') "+
    'ORDER BY month DESC LIMIT 12',[p.orgId])
  ]);
  res.json({counts:{...groups.rows[0],...charges.rows[0]},monthlyCreatedCharges:monthly.rows,
   sandboxSeparate:true,realPaymentProviderIntegrated:false,
   realRecognizedRevenueFromVerifiedLiveProviderOnly:true,
   note:'Monthly figures count new charge records, not settled payments.'});
 }));
 // Read-only audit views never return free-form metadata (may contain customer PII).
 app.get('/api/reports/audit',sessions,route(async(req,res)=>{
  const p=who(req);if(!requireOwner(p,res))return;
  const q=page.parse(req.query);
  const rows=await pool.query(
   'SELECT a.id,a.action,a.entity_type,a.entity_id,a.created_at,u.name AS actor_name '+
   'FROM audit_logs a LEFT JOIN users u ON u.id=a.actor_id '+
   'WHERE a.organization_id=$1 ORDER BY a.created_at DESC,a.id DESC LIMIT $2 OFFSET $3',
   [p.orgId,q.limit,q.offset]);
  res.json({items:rows.rows,metadataRedacted:true});
 }));
 app.get('/api/admin/audit',sessions,route(async(req,res)=>{
  const p=who(req);if(!requireAdmin(p,res))return;
  const q=page.extend({organizationId:z.uuid().optional()}).parse(req.query);
  const rows=await pool.query(
   'SELECT a.id,a.organization_id,a.action,a.entity_type,a.entity_id,a.created_at,'+
   'u.name AS actor_name FROM audit_logs a LEFT JOIN users u ON u.id=a.actor_id '+
   'WHERE ($1::uuid IS NULL OR a.organization_id=$1) '+
   'ORDER BY a.created_at DESC,a.id DESC LIMIT $2 OFFSET $3',
   [q.organizationId??null,q.limit,q.offset]);
  res.json({items:rows.rows,metadataRedacted:true});
 }));
 app.get('/api/admin/support/tickets',sessions,route(async(req,res)=>{
  const p=who(req);if(!requireAdmin(p,res))return;
  const q=page.extend({status:z.enum(['open','in_progress','closed']).optional(),
   sla:z.enum(['overdue','without_deadline']).optional()}).parse(req.query);
  const rows=await pool.query(
   'SELECT t.id,t.organization_id,o.name AS organization_name,t.name,t.email,'+
   't.subject,t.message,t.status,t.created_at,s.due_at AS sla_due_at,'+
   "(s.due_at IS NOT NULL AND t.status<>'closed' AND s.due_at<NOW()) AS sla_overdue "+
   'FROM support_tickets t LEFT JOIN organizations o ON o.id=t.organization_id '+
   'LEFT JOIN support_ticket_sla s ON s.ticket_id=t.id '+
   'WHERE ($1::text IS NULL OR t.status=$1) '+
   "AND ($4::text IS NULL OR ($4='overdue' AND s.due_at IS NOT NULL "+
   "AND t.status<>'closed' AND s.due_at<NOW()) "+
   "OR ($4='without_deadline' AND s.due_at IS NULL)) "+
   'ORDER BY t.created_at DESC,t.id DESC LIMIT $2 OFFSET $3',
   [q.status??null,q.limit,q.offset,q.sla??null]);
  res.json({items:rows.rows,clientMessagesContainPersonalData:true});
 }));
 // Manual deadline management: absence of a deadline means "not configured", never "SLA met".
 app.patch('/api/admin/support/tickets/:id/sla',sessions,csrf,route(async(req,res)=>{
  const p=who(req);if(!requireAdmin(p,res))return;
  const {id}=identifier.parse(req.params);
  const body=z.object({dueAt:z.iso.datetime({offset:true}).nullable(),
   reason:z.string().trim().min(10).max(1000)}).strict().parse(req.body);
  const result=await transaction(async db=>{
   const ticket=await db.query('SELECT organization_id,status FROM support_tickets WHERE id=$1 FOR UPDATE',[id]);
   if(!ticket.rowCount)return {error:'ticket_not_found',code:404};
   if(ticket.rows[0].status==='closed')return {error:'ticket_closed',code:409};
   const current=await db.query('SELECT due_at FROM support_ticket_sla WHERE ticket_id=$1',[id]);
   const previous:Date|null=current.rowCount?current.rows[0].due_at:null;
   const next:Date|null=body.dueAt===null?null:new Date(body.dueAt);
   if((previous?.getTime()??null)===(next?.getTime()??null))
    return {error:'sla_unchanged',code:409};
   await db.query(
    'INSERT INTO support_ticket_sla(ticket_id,due_at,updated_by) VALUES($1,$2,$3) '+
    'ON CONFLICT(ticket_id) DO UPDATE SET due_at=EXCLUDED.due_at,'+
    'updated_by=EXCLUDED.updated_by,updated_at=now(),'+
    'revision=support_ticket_sla.revision+1',
    [id,next,p.userId]);
   await db.query(
    'INSERT INTO support_ticket_sla_events(id,ticket_id,organization_id,actor_id,'+
    'previous_due_at,new_due_at,reason) VALUES($1,$2,$3,$4,$5,$6,$7)',
    [randomUUID(),id,ticket.rows[0].organization_id,p.userId,previous,next,body.reason]);
   await audit(db,p,'ADMIN_SUPPORT_SLA_CHANGED','support_ticket',id,
    {action:next?'deadline_set':'deadline_removed'},ticket.rows[0].organization_id);
   return {ticketId:id,dueAt:next?.toISOString()??null,configured:next!==null,
    automaticSlaPolicy:false,externalNotificationSent:false};
  });
  if('error' in result){res.status(result.code??409).json({error:result.error});return;}
  res.setHeader('Cache-Control','private, no-store');
  res.json(result);
 }));
 app.get('/api/admin/support/tickets/:id/sla/events',sessions,route(async(req,res)=>{
  const p=who(req);if(!requireAdmin(p,res))return;
  const {id}=identifier.parse(req.params),q=page.parse(req.query);
  const exists=await pool.query('SELECT id FROM support_tickets WHERE id=$1',[id]);
  if(!exists.rowCount){res.status(404).json({error:'ticket_not_found'});return;}
  const events=await pool.query(
   'SELECT s.id,s.previous_due_at,s.new_due_at,s.reason,s.created_at,u.name AS actor_name '+
   'FROM support_ticket_sla_events s JOIN users u ON u.id=s.actor_id '+
   'WHERE s.ticket_id=$1 ORDER BY s.created_at DESC,s.id DESC LIMIT $2 OFFSET $3',
   [id,q.limit+1,q.offset]);
  res.setHeader('Cache-Control','private, no-store');
  res.json({items:events.rows.slice(0,q.limit),hasMore:events.rows.length>q.limit,
   auditOnly:true,externalNotificationSent:false});
 }));
 // Internal in-panel alerts are computed from PostgreSQL time, not pushed to the tenant.
 // Only current overdue *open* tickets are eligible; each acknowledgement is tied to a SLA revision.
 app.get('/api/admin/support/sla-alerts',sessions,route(async(req,res)=>{
  const p=who(req);if(!requireAdmin(p,res))return;
  const q=page.extend({state:z.enum(['open','acknowledged','all']).default('open')}).parse(req.query);
  const alerts=await pool.query(
   'SELECT t.id AS ticket_id,t.subject,t.status,o.name AS organization_name,'+
   's.due_at,s.revision AS sla_revision,a.id AS acknowledgement_id,'+
   'a.acknowledged_at,u.name AS acknowledged_by_name '+
   'FROM support_ticket_sla s JOIN support_tickets t ON t.id=s.ticket_id '+
   'LEFT JOIN organizations o ON o.id=t.organization_id '+
   'LEFT JOIN support_ticket_sla_alert_ack a ON a.ticket_id=t.id AND a.sla_revision=s.revision '+
   'LEFT JOIN users u ON u.id=a.actor_id '+
   "WHERE s.due_at IS NOT NULL AND s.due_at<NOW() AND t.status<>'closed' "+
   "AND ($1='all' OR ($1='open' AND a.id IS NULL) OR "+
   "($1='acknowledged' AND a.id IS NOT NULL)) "+
   'ORDER BY s.due_at ASC,t.id ASC LIMIT $2 OFFSET $3',
   [q.state,q.limit+1,q.offset]);
  res.setHeader('Cache-Control','private, no-store');
  res.json({items:alerts.rows.slice(0,q.limit),hasMore:alerts.rows.length>q.limit,
   internalOnly:true,externalNotificationSent:false,automaticSlaPolicy:false});
 }));
 app.post('/api/admin/support/sla-alerts/:id/acknowledge',sessions,csrf,route(async(req,res)=>{
  const p=who(req);if(!requireAdmin(p,res))return;
  const {id}=identifier.parse(req.params);
  const b=z.object({reason:z.string().trim().min(10).max(1000)}).strict().parse(req.body);
  const result=await transaction(async db=>{
   // Lock order matches the SLA update and status transition endpoints.
   const ticket=await db.query('SELECT organization_id,status FROM support_tickets WHERE id=$1 FOR UPDATE',[id]);
   if(!ticket.rowCount)return {error:'ticket_not_found',code:404};
   if(ticket.rows[0].status==='closed')return {error:'ticket_closed',code:409};
   const sla=await db.query('SELECT due_at,revision FROM support_ticket_sla WHERE ticket_id=$1',[id]);
   if(!sla.rowCount||sla.rows[0].due_at===null||
    new Date(sla.rows[0].due_at).getTime()>=Date.now())
    return {error:'no_current_overdue_alert',code:409};
   const version=sla.rows[0].revision;
   const existing=await db.query(
    'SELECT id FROM support_ticket_sla_alert_ack WHERE ticket_id=$1 AND sla_revision=$2',
    [id,version]);
   if(existing.rowCount)return {error:'alert_already_acknowledged',code:409};
   const ackId=randomUUID();
   await db.query(
    'INSERT INTO support_ticket_sla_alert_ack(id,ticket_id,sla_revision,organization_id,actor_id,reason) '+
    'VALUES($1,$2,$3,$4,$5,$6)',
    [ackId,id,version,ticket.rows[0].organization_id,p.userId,b.reason]);
   await audit(db,p,'ADMIN_SUPPORT_OVERDUE_ALERT_ACKNOWLEDGED','support_ticket',id,
    {slaRevision:String(version),internalOnly:true},ticket.rows[0].organization_id);
   return {id:ackId,ticketId:id,slaRevision:String(version),
    acknowledged:true,internalOnly:true,externalNotificationSent:false};
  });
  if('error' in result){res.status(result.code??409).json({error:result.error});return;}
  res.setHeader('Cache-Control','private, no-store');
  res.status(201).json(result);
 }));
 // Status history is administrative evidence, not a notification/delivery channel.
 app.get('/api/admin/support/tickets/:id/events',sessions,route(async(req,res)=>{
  const p=who(req);if(!requireAdmin(p,res))return;
  const {id}=identifier.parse(req.params),q=page.parse(req.query);
  const ticket=await pool.query('SELECT id FROM support_tickets WHERE id=$1',[id]);
  if(!ticket.rowCount){res.status(404).json({error:'ticket_not_found'});return;}
  const history=await pool.query(
   'SELECT e.id,e.old_status,e.new_status,e.reason,e.created_at,u.name AS actor_name '+
   'FROM support_ticket_events e JOIN users u ON u.id=e.actor_id '+
   'WHERE e.ticket_id=$1 ORDER BY e.created_at DESC,e.id DESC LIMIT $2 OFFSET $3',
   [id,q.limit+1,q.offset]);
  res.setHeader('Cache-Control','private, no-store');
  res.json({items:history.rows.slice(0,q.limit),hasMore:history.rows.length>q.limit,
   auditOnly:true,externalNotificationSent:false});
 }));
 app.patch('/api/admin/support/tickets/:id',sessions,csrf,route(async(req,res)=>{
  const p=who(req);if(!requireAdmin(p,res))return;
  const {id}=identifier.parse(req.params);
  const b=z.object({status:z.enum(['open','in_progress','closed']),
   reason:z.string().trim().min(10).max(1000)}).strict().parse(req.body);
  const result=await transaction(async db=>{
   const old=await db.query('SELECT status,organization_id FROM support_tickets WHERE id=$1 FOR UPDATE',[id]);
   if(!old.rowCount)return null;
   const previous=old.rows[0].status as string;
   if(previous===b.status)return {error:'status_unchanged'};
   await db.query('UPDATE support_tickets SET status=$2 WHERE id=$1',[id,b.status]);
   await db.query(
    'INSERT INTO support_ticket_events(id,ticket_id,organization_id,actor_id,old_status,new_status,reason) '+
    'VALUES($1,$2,$3,$4,$5,$6,$7)',
    [randomUUID(),id,old.rows[0].organization_id,p.userId,previous,b.status,b.reason]);
   await audit(db,p,'ADMIN_SUPPORT_STATUS_CHANGED','support_ticket',id,
    {previous,next:b.status,reason:b.reason},old.rows[0].organization_id);
   return {id,previous,status:b.status,replySent:false};
  });
  if(!result){res.status(404).json({error:'ticket_not_found'});return;}
  if('error' in result){res.status(409).json(result);return;}
  res.json(result);
 }));
 // Respostas ao suporte são entregues SOMENTE na área autenticada do tenant,
 // e nunca a contatos públicos sem identidade validada; não enviar e-mail implicitamente.
 app.get('/api/admin/support/tickets/:id/replies',sessions,route(async(req,res)=>{
  const p=who(req);if(!requireAdmin(p,res))return;
  const {id}=identifier.parse(req.params),q=page.parse(req.query);
  const ticket=await pool.query('SELECT id FROM support_tickets WHERE id=$1',[id]);
  if(!ticket.rowCount){res.status(404).json({error:'ticket_not_found'});return;}
  const replies=await pool.query(
   'SELECT r.id,r.ticket_id,r.message,r.delivery_state,r.created_at,u.name AS author_name '+
   'FROM support_ticket_replies r JOIN users u ON u.id=r.actor_id '+
   'WHERE r.ticket_id=$1 ORDER BY r.created_at ASC,r.id ASC LIMIT $2 OFFSET $3',
   [id,q.limit+1,q.offset]);
  res.setHeader('Cache-Control','private, no-store');
  res.json({items:replies.rows.slice(0,q.limit),hasMore:replies.rows.length>q.limit,
   delivery:'portal_only',emailSent:false});
 }));
 app.get('/api/support/tickets/:id/replies',sessions,route(async(req,res)=>{
  const p=who(req),{id}=identifier.parse(req.params),q=page.parse(req.query);
  const ticket=await pool.query('SELECT id FROM support_tickets WHERE id=$1 AND organization_id=$2',[id,p.orgId]);
  if(!ticket.rowCount){res.status(404).json({error:'ticket_not_found'});return;}
  const replies=await pool.query(
   'SELECT r.id,r.ticket_id,r.message,r.delivery_state,r.created_at,u.name AS author_name '+
   'FROM support_ticket_replies r JOIN users u ON u.id=r.actor_id '+
   'WHERE r.ticket_id=$1 AND r.organization_id=$2 ORDER BY r.created_at ASC,r.id ASC LIMIT $3 OFFSET $4',
   [id,p.orgId,q.limit+1,q.offset]);
  res.setHeader('Cache-Control','private, no-store');
  res.json({items:replies.rows.slice(0,q.limit),hasMore:replies.rows.length>q.limit,
   delivery:'portal_only',emailSent:false});
 }));
 app.post('/api/admin/support/tickets/:id/replies',sessions,csrf,route(async(req,res)=>{
  const p=who(req);if(!requireAdmin(p,res))return;
  const {id}=identifier.parse(req.params);
  const b=z.object({message:z.string().trim().min(10).max(3000),
   clientRequestId:z.uuid()}).strict().parse(req.body);
  const result=await transaction(async db=>{
   const locked=await db.query('SELECT organization_id,status FROM support_tickets WHERE id=$1 FOR UPDATE',[id]);
   if(!locked.rowCount)return {error:'ticket_not_found',code:404};
   const ticket=locked.rows[0];
   if(!ticket.organization_id)return {error:'public_contact_requires_verified_delivery_channel',code:409};
   const existing=await db.query(
    'SELECT id,message FROM support_ticket_replies WHERE ticket_id=$1 AND client_request_id=$2',
    [id,b.clientRequestId]);
   if(existing.rowCount){
    if(existing.rows[0].message!==b.message)return {error:'idempotency_key_reused',code:409};
    return {id:existing.rows[0].id,ticketId:id,deliveryState:'portal_only',
     emailSent:false,duplicate:true};
   }
   if(ticket.status==='closed')return {error:'ticket_closed',code:409};
   const replyId=randomUUID();
   await db.query(
    'INSERT INTO support_ticket_replies(id,ticket_id,organization_id,actor_id,client_request_id,message) '+
    'VALUES($1,$2,$3,$4,$5,$6)',
    [replyId,id,ticket.organization_id,p.userId,b.clientRequestId,b.message]);
   await audit(db,p,'ADMIN_SUPPORT_PORTAL_REPLY_CREATED','support_ticket',id,
    {delivery:'portal_only'},ticket.organization_id);
   return {id:replyId,ticketId:id,deliveryState:'portal_only',emailSent:false,duplicate:false};
  });
  if('error' in result){res.status(result.code??409).json({error:result.error});return;}
  res.status(result.duplicate?200:201).json(result);
 }));
 app.get('/api/privacy/requests',sessions,route(async(req,res)=>{
  const p=who(req);if(!requireOwner(p,res))return;
  const rows=await pool.query(
   'SELECT id,kind,state,reason,created_at,updated_at FROM privacy_requests '+
   'WHERE organization_id=$1 ORDER BY created_at DESC LIMIT 50',[p.orgId]);
  res.json({items:rows.rows,automaticErasure:false});
 }));
 app.post('/api/privacy/requests',sessions,csrf,route(async(req,res)=>{
  const p=who(req);if(!requireOwner(p,res))return;
  if(!(await rateLimit('privacy:'+p.orgId,10,1440))){
   res.status(429).json({error:'request_rate_limited'});return;
  }
  const b=z.object({kind:z.enum(['access','rectification','erasure','portability']),
   reason:z.string().trim().min(12).max(1500)}).strict().parse(req.body);
  const id=randomUUID();
  await transaction(async db=>{
   await db.query(
    "INSERT INTO privacy_requests(id,organization_id,requested_by,kind,reason) VALUES($1,$2,$3,$4,$5)",
    [id,p.orgId,p.userId,b.kind,b.reason]);
   await audit(db,p,'PRIVACY_REQUEST_CREATED','privacy_request',id,{kind:b.kind});
  });
  res.status(201).json({id,kind:b.kind,state:'open',automaticDeletion:false,
   legalRetentionRequiresHumanReview:true});
 }));
 app.get('/api/admin/privacy/requests',sessions,route(async(req,res)=>{
  const p=who(req);if(!requireAdmin(p,res))return;
  const q=page.extend({state:reviewStatus.optional()}).parse(req.query);
  const rows=await pool.query(
   'SELECT r.id,r.organization_id,o.name AS organization_name,r.kind,r.state,r.reason,'+
   'r.created_at,r.updated_at,r.reviewed_at FROM privacy_requests r '+
   'JOIN organizations o ON o.id=r.organization_id '+
   'WHERE ($1::text IS NULL OR r.state=$1) ORDER BY r.created_at DESC,r.id DESC LIMIT $2 OFFSET $3',
   [q.state??null,q.limit,q.offset]);
  res.json({items:rows.rows,manualLegalReviewRequired:true});
 }));
 app.patch('/api/admin/privacy/requests/:id',sessions,csrf,route(async(req,res)=>{
  const p=who(req);if(!requireAdmin(p,res))return;
  const {id}=identifier.parse(req.params);
  const b=z.object({state:z.enum(['in_review','awaiting_evidence','closed_rejected']),
   reviewerNote:z.string().trim().min(15).max(1000)}).strict().parse(req.body);
  const result=await transaction(async db=>{
   const old=await db.query('SELECT state,organization_id FROM privacy_requests WHERE id=$1 FOR UPDATE',[id]);
   if(!old.rowCount)return null;
   const previous=old.rows[0].state as string;
   if(previous==='closed_rejected')return {error:'privacy_request_closed'};
   if(previous===b.state)return {error:'status_unchanged'};
   await db.query(
    'UPDATE privacy_requests SET state=$2,reviewer_note=$3,reviewed_by=$4,reviewed_at=now(),updated_at=now() '+
    'WHERE id=$1',[id,b.state,b.reviewerNote,p.userId]);
   await audit(db,p,'ADMIN_PRIVACY_REQUEST_REVIEWED','privacy_request',id,
    {previous,next:b.state,manualReview:true},old.rows[0].organization_id);
   return {id,previous,state:b.state,automaticDeletion:false,
    noCompletionWithoutVerifiedFulfillment:true};
  });
  if(!result){res.status(404).json({error:'request_not_found'});return;}
  if('error' in result){res.status(409).json(result);return;}
  res.json(result);
 }));
 // Sensitive exports require both owner role and CSRF (not just a navigable GET URL).
 app.post('/api/reports/exports/:dataset',sessions,csrf,route(async(req,res)=>{
  const p=who(req);if(!requireOwner(p,res))return;
  if(!(await rateLimit('export:'+p.orgId+':'+p.userId,12,60))){
   res.status(429).json({error:'export_rate_limited'});return;
  }
  const {dataset}=z.object({dataset:z.enum(['clients','charges'])}).parse(req.params);
  const b=z.object({limit:z.number().int().min(1).max(1000).default(1000),
   offset:z.number().int().min(0).max(100000).default(0)}).strict().parse(req.body??{});
  let headers:string[],rows:unknown[][];
  if(dataset==='clients'){
   const q=await pool.query(
    'SELECT id,internal_code,name,phone,email,service_name,monthly_fee_cents::text,'+
    'preferred_due_day,status,created_at FROM clients WHERE organization_id=$1 '+
    'ORDER BY created_at DESC,id DESC LIMIT $2 OFFSET $3',[p.orgId,b.limit,b.offset]);
   headers=['id','codigo','nome','telefone','email','servico','mensalidade_centavos','vencimento_dia','status','criado_em'];
   rows=q.rows.map(r=>[r.id,r.internal_code,r.name,r.phone,r.email,r.service_name,
    r.monthly_fee_cents,r.preferred_due_day,r.status,r.created_at?.toISOString?.()??r.created_at]);
  }else{
   const q=await pool.query(
    'SELECT ch.id,cl.name AS client_name,ch.description,ch.amount_cents::text,ch.discount_cents::text,'+
    'ch.paid_cents::text,ch.refunded_cents::text,ch.status,ch.provider,ch.due_date::text,ch.created_at '+
    'FROM charges ch JOIN clients cl ON cl.id=ch.client_id AND cl.organization_id=ch.organization_id '+
    'WHERE ch.organization_id=$1 ORDER BY ch.created_at DESC,ch.id DESC LIMIT $2 OFFSET $3',
    [p.orgId,b.limit,b.offset]);
   headers=['id','cliente','descricao','valor_centavos','desconto_centavos','pago_centavos',
    'estornado_centavos','status','ambiente_provedor','vencimento','criado_em'];
   rows=q.rows.map(r=>[r.id,r.client_name,r.description,r.amount_cents,r.discount_cents,
    r.paid_cents,r.refunded_cents,r.status,r.provider,r.due_date,r.created_at?.toISOString?.()??r.created_at]);
  }
  const exportId=randomUUID();
  await transaction(async db=>{
   await audit(db,p,'CSV_EXPORT_GENERATED','report_export',exportId,{
    dataset,rows:rows.length,limit:b.limit,offset:b.offset,containsPersonalData:dataset==='clients'});
  });
  const date=new Date().toISOString().slice(0,10),filename='cobraflux-'+dataset+'-'+date+'.csv';
  res.setHeader('Content-Type','text/csv; charset=utf-8');
  res.setHeader('Content-Disposition','attachment; filename="'+filename+'"');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Cache-Control','private, no-store');
  res.status(200).send(csvRows(headers,rows));
 }));
}
