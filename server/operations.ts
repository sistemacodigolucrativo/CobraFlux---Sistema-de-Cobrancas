import { randomUUID, randomBytes } from 'node:crypto';
import type { Express, Request, Response, RequestHandler } from 'express';
import { z } from 'zod';
import { pool, transaction } from './db';
import {enforceSaasQuota} from './saas-domain';
import { normalizePhone, previewClientsCsv } from './csv';
import { passwordHash, passwordMatches, sha256 } from './security';

type Principal = { userId:string;orgId:string;role:string;name:string;email:string;token:string };
type Deps={
  sessions:RequestHandler;
  csrf:RequestHandler;
  who:(req:Request)=>Principal;
  route:(fn:(req:Request,res:Response)=>Promise<unknown>)=>RequestHandler;
};
const maxMoney=z.number().int().min(0).max(10000000000);
const positiveMoney=maxMoney.refine(n=>n>0);
const name=z.string().trim().min(2).max(120);
const phone=z.string().trim().transform(normalizePhone).pipe(z.string().regex(/^\+[1-9]\d{9,14}$/));
const optionalEmail=z.union([z.email(),z.literal('')]).optional();
const uuidParam=z.object({id:z.uuid()});
const dueDate=z.iso.date();
const roleOwner=(req:Request,res:Response,deps:Deps):boolean=>{
  if(['owner','super_admin'].includes(deps.who(req).role))return true;
  res.status(403).json({error:'owner_role_required'});return false;
};
const clientInput=z.object({
  name,phone,email:optionalEmail,notes:z.string().max(2000).default(''),
  whatsappOptIn:z.boolean().default(false),
  serviceName:z.string().trim().max(120).default(''),
  monthlyFeeCents:maxMoney.default(0),
  preferredDueDay:z.number().int().min(1).max(31).default(10),
}).strict();
const clientPatch=clientInput.partial().extend({status:z.enum(['active','archived']).optional()}).strict();
const serviceInput=z.object({
  name,description:z.string().max(1000).default(''),
  priceCents:maxMoney,
  defaultFrequency:z.enum(['unica','semanal','mensal','personalizada']).default('mensal')
}).strict();
const servicePatch=serviceInput.partial().extend({active:z.boolean().optional()}).strict();
const chargeBase=z.object({
  clientId:z.uuid(),serviceId:z.uuid().optional(),description:z.string().trim().min(2).max(300),
  amountCents:positiveMoney,discountCents:maxMoney.default(0),dueDate,
}).strict();
const chargeInput=chargeBase.refine(v=>v.discountCents<v.amountCents,{message:'invalid_discount'});
const chargePatch=chargeBase.omit({clientId:true,serviceId:true}).partial().strict();
async function audit(db: {query:Function}, p:Principal, action:string,type:string,id:string,details:Record<string,unknown>={}):Promise<void>{
  await db.query('INSERT INTO audit_logs(id,organization_id,actor_id,action,entity_type,entity_id,metadata) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)',
    [randomUUID(),p.orgId,p.userId,action,type,id,JSON.stringify(details)]);
}
async function history(db:{query:Function},p:Principal,chargeId:string,action:string,details:Record<string,unknown>={}):Promise<void>{
  await db.query('INSERT INTO charge_history(id,organization_id,charge_id,actor_id,action,details) VALUES($1,$2,$3,$4,$5,$6::jsonb)',
    [randomUUID(),p.orgId,chargeId,p.userId,action,JSON.stringify(details)]);
}
const clientColumns='id,internal_code,name,phone,email,notes,status,whatsapp_opt_in,service_name,monthly_fee_cents::text,preferred_due_day,created_at,updated_at';
const serviceColumns='id,name,description,price_cents::text,default_frequency,active,created_at';
const chargeColumns='ch.id,ch.public_token,ch.client_id,ch.service_id,ch.description,ch.amount_cents::text,ch.discount_cents::text,ch.paid_cents::text,ch.due_date,ch.status,ch.provider,ch.provider_charge_id,ch.refunded_cents::text,ch.created_at,ch.updated_at,cl.name AS client_name';

export function registerOperations(app:Express,deps:Deps):void{
 const {sessions,csrf,route,who}=deps;

 // Client directory and explicit operational profile (never returns another organization's records).
 app.get('/api/clients',sessions,route(async(req,res)=>{
   const q=z.object({search:z.string().trim().max(80).optional(),status:z.enum(['active','archived']).optional(),
     limit:z.coerce.number().int().min(1).max(200).default(100),
     offset:z.coerce.number().int().min(0).max(100000).default(0)}).parse(req.query);
   const params=[who(req).orgId,q.search?'%'+q.search+'%':null,q.status??null,q.limit,q.offset];
   const predicate="organization_id=$1 AND ($2::text IS NULL OR (name ILIKE $2 OR internal_code ILIKE $2 OR phone ILIKE $2 OR service_name ILIKE $2)) AND ($3::text IS NULL OR status=$3)";
   const [rows,total]=await Promise.all([
     pool.query('SELECT '+clientColumns+' FROM clients WHERE '+predicate+' ORDER BY created_at DESC,id DESC LIMIT $4 OFFSET $5',params),
     pool.query('SELECT count(*)::int AS count FROM clients WHERE '+predicate,params.slice(0,3))
   ]);
   res.json({items:rows.rows,total:total.rows[0].count});
 }));
 app.post('/api/clients',sessions,csrf,route(async(req,res)=>{
   const data=clientInput.parse(req.body);const p=who(req);const id=randomUUID();
   const value=await transaction(async db=>{
     await enforceSaasQuota(db,p.orgId,'clients');
     const code='CF-'+randomBytes(6).toString('hex').toUpperCase();
     const q=await db.query('INSERT INTO clients(id,organization_id,internal_code,name,phone,email,notes,whatsapp_opt_in,service_name,monthly_fee_cents,preferred_due_day) '+
       'VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING '+clientColumns,
       [id,p.orgId,code,data.name,data.phone,data.email||null,data.notes,data.whatsappOptIn,data.serviceName,data.monthlyFeeCents,data.preferredDueDay]);
     await audit(db,p,'CLIENT_CREATED','client',id);
     return q.rows[0];
   });
   res.status(201).json(value);
 }));
 app.patch('/api/clients/:id',sessions,csrf,route(async(req,res)=>{
   const {id}=uuidParam.parse(req.params);const b=clientPatch.parse(req.body);
   if(!Object.keys(b).length){res.status(400).json({error:'empty_patch'});return;}
   const p=who(req);const updated=await transaction(async db=>{
     if(b.status==='active'){
       const before=await db.query('SELECT status FROM clients WHERE organization_id=$1 AND id=$2',[p.orgId,id]);
       if(before.rows[0]?.status==='archived')await enforceSaasQuota(db,p.orgId,'clients');
     }
     const row=await db.query('UPDATE clients SET name=COALESCE($3,name),phone=COALESCE($4,phone),'+
       "email=CASE WHEN $5::boolean THEN NULLIF($6::text,'') ELSE email END,notes=COALESCE($7,notes),status=COALESCE($8,status),"+
       'whatsapp_opt_in=COALESCE($9,whatsapp_opt_in),service_name=COALESCE($10,service_name),'+
       'monthly_fee_cents=COALESCE($11,monthly_fee_cents),preferred_due_day=COALESCE($12,preferred_due_day),updated_at=now() '+
       'WHERE organization_id=$1 AND id=$2 RETURNING '+clientColumns,
       [p.orgId,id,b.name??null,b.phone??null,b.email!==undefined,b.email??null,b.notes??null,b.status??null,b.whatsappOptIn??null,
        b.serviceName??null,b.monthlyFeeCents??null,b.preferredDueDay??null]);
     if(!row.rowCount)return null;
     await audit(db,p,'CLIENT_UPDATED','client',id,{fields:Object.keys(b)});
     return row.rows[0];
   });
   if(!updated){res.status(404).json({error:'not_found'});return;}
   res.json(updated);
 }));
 app.get('/api/clients/:id/charges',sessions,route(async(req,res)=>{
   const {id}=uuidParam.parse(req.params);const p=who(req);
   const exists=await pool.query('SELECT 1 FROM clients WHERE id=$1 AND organization_id=$2',[id,p.orgId]);
   if(!exists.rowCount){res.status(404).json({error:'not_found'});return;}
   const rows=await pool.query('SELECT '+chargeColumns+' FROM charges ch JOIN clients cl ON cl.id=ch.client_id '+
      'WHERE ch.organization_id=$1 AND ch.client_id=$2 ORDER BY ch.created_at DESC LIMIT 100',[p.orgId,id]);
   res.json({items:rows.rows});
 }));
 app.post('/api/clients/import/preview',sessions,csrf,route(async(req,res)=>{
   const b=z.object({csv:z.string().min(1).max(180000)}).strict().parse(req.body);
   const rows=previewClientsCsv(b.csv);
   res.json({items:rows,valid:rows.filter(x=>x.valid).length,invalid:rows.filter(x=>!x.valid).length});
 }));
 app.post('/api/clients/import',sessions,csrf,route(async(req,res)=>{
   const b=z.object({csv:z.string().min(1).max(180000),mode:z.enum(['strict','valid_only']).default('strict')}).strict().parse(req.body);
   const rows=previewClientsCsv(b.csv);
   if(rows.length===0){res.status(422).json({error:'empty_csv'});return;}
   const invalid=rows.filter(x=>!x.valid);
   if(invalid.length&&b.mode==='strict'){res.status(422).json({error:'csv_invalid_rows',rows:invalid});return;}
   const p=who(req);
   const result=await transaction(async db=>{
     let added=0,rejected=invalid.length;
     for(const row of rows.filter(x=>x.valid)){
       await enforceSaasQuota(db,p.orgId,'clients');
       const id=randomUUID(), code='CF-'+randomBytes(6).toString('hex').toUpperCase();
       const q=await db.query('INSERT INTO clients(id,organization_id,internal_code,name,phone,email,service_name,monthly_fee_cents,preferred_due_day,whatsapp_opt_in) '+
         "VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,false) ON CONFLICT (organization_id,phone) WHERE status='active' DO NOTHING RETURNING id",
         [id,p.orgId,code,row.name,row.phone,row.email||null,row.serviceName,row.monthlyFeeCents,row.preferredDueDay]);
       if(q.rowCount)added++;else rejected++;
     }
     const id=randomUUID();
     await db.query('INSERT INTO client_import_batches(id,organization_id,actor_id,imported_count,rejected_count) VALUES($1,$2,$3,$4,$5)',
       [id,p.orgId,p.userId,added,rejected]);
     await audit(db,p,'CLIENT_CSV_IMPORT','import',id,{imported:added,rejected});
     return {id,importedCount:added,rejectedCount:rejected};
   });
   res.status(201).json(result);
 }));
 app.get('/api/clients/imports',sessions,route(async(req,res)=>{
   const p=who(req);
   const q=await pool.query('SELECT id,imported_count,rejected_count,created_at FROM client_import_batches WHERE organization_id=$1 ORDER BY created_at DESC LIMIT 30',[p.orgId]);
   res.json({items:q.rows});
 }));

 // Services: no hard deletion, since prior charges may refer to historical services.
 app.get('/api/services',sessions,route(async(req,res)=>{
   const q=await pool.query('SELECT '+serviceColumns+' FROM services WHERE organization_id=$1 ORDER BY created_at DESC LIMIT 200',[who(req).orgId]);
   res.json({items:q.rows});
 }));
 app.post('/api/services',sessions,csrf,route(async(req,res)=>{
   const b=serviceInput.parse(req.body);const p=who(req);const id=randomUUID();
   const val=await transaction(async db=>{
     await enforceSaasQuota(db,p.orgId,'services');
     const q=await db.query('INSERT INTO services(id,organization_id,name,description,price_cents,default_frequency) VALUES($1,$2,$3,$4,$5,$6) RETURNING '+serviceColumns,
       [id,p.orgId,b.name,b.description,b.priceCents,b.defaultFrequency]);
     await audit(db,p,'SERVICE_CREATED','service',id);
     return q.rows[0];
   });
   res.status(201).json(val);
 }));
 app.patch('/api/services/:id',sessions,csrf,route(async(req,res)=>{
   const {id}=uuidParam.parse(req.params),b=servicePatch.parse(req.body),p=who(req);
   if(!Object.keys(b).length){res.status(400).json({error:'empty_patch'});return;}
   const val=await transaction(async db=>{
     if(b.active===true){
       const before=await db.query('SELECT active FROM services WHERE organization_id=$1 AND id=$2',[p.orgId,id]);
       if(before.rows[0]?.active===false)await enforceSaasQuota(db,p.orgId,'services');
     }
     const q=await db.query('UPDATE services SET name=coalesce($3,name),description=coalesce($4,description),'+
       'price_cents=coalesce($5,price_cents),default_frequency=coalesce($6,default_frequency),active=coalesce($7,active) '+
       'WHERE id=$2 AND organization_id=$1 RETURNING '+serviceColumns,
       [p.orgId,id,b.name??null,b.description??null,b.priceCents??null,b.defaultFrequency??null,b.active??null]);
     if(!q.rowCount)return null;
     await audit(db,p,'SERVICE_UPDATED','service',id,{fields:Object.keys(b)});
     return q.rows[0];
   });
   if(!val){res.status(404).json({error:'not_found'});return;}
   res.json(val);
 }));

 // Draft-only charge operations. No provider events/settlement endpoints at this phase.
 app.get('/api/charges',sessions,route(async(req,res)=>{
   const q=z.object({search:z.string().trim().max(80).optional(),status:z.enum(['draft','pending_provider','cancel_pending','cancelled','pending','paid','partial','partially_refunded','overdue','refunded']).optional(),
       limit:z.coerce.number().int().min(1).max(200).default(100),offset:z.coerce.number().int().min(0).max(100000).default(0)}).parse(req.query);
   const p=who(req);
   const predicate="ch.organization_id=$1 AND ($2::text IS NULL OR (cl.name ILIKE $2 OR ch.description ILIKE $2 OR ch.public_token ILIKE $2)) AND ($3::text IS NULL OR ch.status=$3)";
   const params=[p.orgId,q.search?'%'+q.search+'%':null,q.status??null,q.limit,q.offset];
   const rows=await pool.query('SELECT '+chargeColumns+' FROM charges ch JOIN clients cl ON cl.id=ch.client_id WHERE '+
     predicate+' ORDER BY ch.created_at DESC,ch.id DESC LIMIT $4 OFFSET $5',params);
   const cnt=await pool.query('SELECT count(*)::int AS count FROM charges ch JOIN clients cl ON cl.id=ch.client_id WHERE '+predicate,params.slice(0,3));
   res.json({items:rows.rows,total:cnt.rows[0].count});
 }));
 app.post('/api/charges',sessions,csrf,route(async(req,res)=>{
   const b=chargeInput.parse(req.body),p=who(req),id=randomUUID(),publicToken=randomBytes(24).toString('base64url');
   const val=await transaction(async db=>{
     await enforceSaasQuota(db,p.orgId,'charges_month');
     if(b.serviceId){
       const valid=await db.query('SELECT 1 FROM services WHERE id=$1 AND organization_id=$2 AND active=true',[b.serviceId,p.orgId]);
       if(!valid.rowCount)return null;
     }
     const q=await db.query("INSERT INTO charges(id,public_token,organization_id,client_id,service_id,description,amount_cents,discount_cents,due_date,status) "+
       "SELECT $1,$2,$3,id,$9,$5,$6,$7,$8,'draft' FROM clients WHERE id=$4 AND organization_id=$3 AND status='active' RETURNING id,public_token,status",
       [id,publicToken,p.orgId,b.clientId,b.description,b.amountCents,b.discountCents,b.dueDate,b.serviceId??null]);
     if(!q.rowCount)return null;
     await history(db,p,id,'CHARGE_DRAFT_CREATED',{amountCents:b.amountCents,dueDate:b.dueDate});
     await audit(db,p,'CHARGE_DRAFT_CREATED','charge',id);
     return q.rows[0];
   });
   if(!val){res.status(404).json({error:'client_or_service_not_found'});return;}
   res.status(201).json({...val,paymentEnabled:false});
 }));
 app.patch('/api/charges/:id',sessions,csrf,route(async(req,res)=>{
   const {id}=uuidParam.parse(req.params),b=chargePatch.parse(req.body),p=who(req);
   if(!Object.keys(b).length){res.status(400).json({error:'empty_patch'});return;}
   const val=await transaction(async db=>{
     const existing=await db.query("SELECT amount_cents,discount_cents FROM charges WHERE id=$1 AND organization_id=$2 AND status='draft' FOR UPDATE",[id,p.orgId]);
     if(!existing.rowCount)return null;
     const amount=b.amountCents??Number(existing.rows[0].amount_cents);
     const discount=b.discountCents??Number(existing.rows[0].discount_cents);
     if(discount>=amount)return {error:'invalid_discount'};
     const q=await db.query("UPDATE charges SET description=coalesce($3,description),amount_cents=$4,discount_cents=$5,due_date=coalesce($6,due_date),updated_at=now() "+
       "WHERE id=$1 AND organization_id=$2 AND status='draft' RETURNING id,status,updated_at",
       [id,p.orgId,b.description??null,amount,discount,b.dueDate??null]);
     await history(db,p,id,'CHARGE_DRAFT_UPDATED',{fields:Object.keys(b)});
     await audit(db,p,'CHARGE_DRAFT_UPDATED','charge',id);
     return q.rows[0];
   });
   if(val&&'error' in val){res.status(400).json(val);return;}
   if(!val){res.status(409).json({error:'charge_not_editable'});return;}
   res.json(val);
 }));
 app.post('/api/charges/:id/duplicate',sessions,csrf,route(async(req,res)=>{
   const {id}=uuidParam.parse(req.params);
   const b=z.object({dueDate:dueDate.optional()}).strict().parse(req.body??{});
   const p=who(req),newId=randomUUID(),publicToken=randomBytes(24).toString('base64url');
   const val=await transaction(async db=>{
     const q=await db.query("INSERT INTO charges(id,public_token,organization_id,client_id,service_id,description,amount_cents,discount_cents,due_date,status) "+
       "SELECT $1,$2,ch.organization_id,ch.client_id,ch.service_id,ch.description,ch.amount_cents,ch.discount_cents,"+
       "coalesce($4::date,ch.due_date),'draft' FROM charges ch JOIN clients cl ON cl.id=ch.client_id AND cl.organization_id=ch.organization_id "+
       "WHERE ch.id=$3 AND ch.organization_id=$5 AND cl.status='active' RETURNING id,public_token,status",
       [newId,publicToken,id,b.dueDate??null,p.orgId]);
     if(!q.rowCount)return null;
     await history(db,p,newId,'CHARGE_DUPLICATED',{originalId:id});
     await audit(db,p,'CHARGE_DUPLICATED','charge',newId,{originalId:id});
     return q.rows[0];
   });
   if(!val){res.status(404).json({error:'source_or_client_not_found'});return;}
   res.status(201).json({...val,paymentEnabled:false});
 }));
 app.post('/api/charges/:id/cancel',sessions,csrf,route(async(req,res)=>{
   const {id}=uuidParam.parse(req.params),p=who(req);
   const b=z.object({reason:z.string().trim().min(3).max(250).default('Cancelada pelo profissional')}).strict().parse(req.body??{});
   const val=await transaction(async db=>{
     const q=await db.query("UPDATE charges SET status='cancelled',updated_at=now() WHERE id=$1 AND organization_id=$2 AND status='draft' RETURNING id,status",
       [id,p.orgId]);
     if(!q.rowCount)return null;
     await history(db,p,id,'CHARGE_CANCELLED',{reason:b.reason});
     await audit(db,p,'CHARGE_CANCELLED','charge',id,{reason:b.reason});
     return q.rows[0];
   });
   if(!val){res.status(409).json({error:'charge_not_cancellable'});return;}
   res.json(val);
 }));
 app.get('/api/charges/:id/history',sessions,route(async(req,res)=>{
   const {id}=uuidParam.parse(req.params),p=who(req);
   const existing=await pool.query('SELECT 1 FROM charges WHERE id=$1 AND organization_id=$2',[id,p.orgId]);
   if(!existing.rowCount){res.status(404).json({error:'not_found'});return;}
   const q=await pool.query('SELECT id,action,details,created_at FROM charge_history WHERE organization_id=$1 AND charge_id=$2 ORDER BY created_at ASC LIMIT 200',[p.orgId,id]);
   res.json({items:q.rows});
 }));

 // Profile, organization and support belong to the authenticated tenant.
 app.get('/api/profile',sessions,route(async(req,res)=>{
   const p=who(req);
   const q=await pool.query('SELECT id,name,category,contact_phone,contact_email FROM organizations WHERE id=$1',[p.orgId]);
   res.json({user:{id:p.userId,name:p.name,email:p.email,role:p.role},organization:q.rows[0]});
 }));
 app.patch('/api/profile',sessions,csrf,route(async(req,res)=>{
   const b=z.object({name}).strict().parse(req.body),p=who(req);
   const q=await transaction(async db=>{
     const updated=await db.query('UPDATE users SET name=$1 WHERE id=$2 RETURNING id,name,email',[b.name,p.userId]);
     await audit(db,p,'PROFILE_UPDATED','user',p.userId);
     return updated.rows[0];
   });
   res.json(q);
 }));
 app.post('/api/profile/change-password',sessions,csrf,route(async(req,res)=>{
   const b=z.object({currentPassword:z.string().min(8).max(128),newPassword:z.string().min(12).max(128)}).strict().parse(req.body),p=who(req);
   const q=await pool.query('SELECT password_hash FROM users WHERE id=$1',[p.userId]);
   if(!q.rowCount||!(await passwordMatches(b.currentPassword,q.rows[0].password_hash))){
     res.status(403).json({error:'current_password_invalid'});return;
   }
   const hash=await passwordHash(b.newPassword);
   await transaction(async db=>{
     await db.query('UPDATE users SET password_hash=$1 WHERE id=$2',[hash,p.userId]);
     await db.query('UPDATE auth_sessions SET revoked_at=now() WHERE user_id=$1 AND token_hash<>$2',[p.userId,sha256(p.token)]);
     await audit(db,p,'PASSWORD_CHANGED','user',p.userId);
   });
   res.json({ok:true,otherSessionsRevoked:true});
 }));
 app.patch('/api/organization',sessions,csrf,route(async(req,res)=>{
   if(!roleOwner(req,res,deps))return;
   const p=who(req);
   const b=z.object({
     name:name.optional(),category:z.string().trim().max(100).optional(),
     contactPhone:z.string().trim().max(25).optional(),
     contactEmail:z.union([z.email(),z.literal('')]).optional(),
   }).strict().parse(req.body);
   if(!Object.keys(b).length){res.status(400).json({error:'empty_patch'});return;}
   const q=await transaction(async db=>{
     const update=await db.query('UPDATE organizations SET name=coalesce($2,name),category=coalesce($3,category),'+
       'contact_phone=coalesce($4,contact_phone),contact_email=coalesce($5,contact_email) WHERE id=$1 RETURNING id,name,category,contact_phone,contact_email',
       [p.orgId,b.name??null,b.category??null,b.contactPhone??null,b.contactEmail??null]);
     await audit(db,p,'ORGANIZATION_UPDATED','organization',p.orgId,{fields:Object.keys(b)});
     return update.rows[0];
   });
   res.json(q);
 }));
 app.get('/api/support/tickets',sessions,route(async(req,res)=>{
   const q=await pool.query('SELECT id,subject,message,status,created_at FROM support_tickets WHERE organization_id=$1 ORDER BY created_at DESC LIMIT 100',[who(req).orgId]);
   res.json({items:q.rows});
 }));
 app.post('/api/support/tickets',sessions,csrf,route(async(req,res)=>{
   const p=who(req);
   const b=z.object({subject:z.string().trim().min(3).max(200),message:z.string().trim().min(10).max(4000)}).strict().parse(req.body);
   const id=randomUUID();
   const q=await transaction(async db=>{
     const item=await db.query('INSERT INTO support_tickets(id,organization_id,name,email,subject,message) VALUES($1,$2,$3,$4,$5,$6) '+
       'RETURNING id,subject,message,status,created_at',[id,p.orgId,p.name,p.email,b.subject,b.message]);
     await audit(db,p,'SUPPORT_TICKET_CREATED','support_ticket',id);
     return item.rows[0];
   });
   res.status(201).json(q);
 }));
}
