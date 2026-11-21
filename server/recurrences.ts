import {randomUUID} from 'node:crypto';
import type {Express,Request,Response,RequestHandler} from 'express';
import {z} from 'zod';
import {pool,transaction} from './db';
import {
  isoDate,isAlignedFirstDue,previewCycles,skipPastCycles,advanceRecurrence,localBillingDate,
  type RecurrenceFrequency
} from './recurrence-calendar';

type Principal={userId:string;orgId:string;role:string};
type Deps={sessions:RequestHandler;csrf:RequestHandler;who:(req:Request)=>Principal;
  route:(handler:(req:Request,res:Response)=>Promise<unknown>)=>RequestHandler};
const idParam=z.object({id:z.uuid()});
const money=z.number().int().min(0).max(10000000000);
const frequency=z.enum(['weekly','monthly']);
const recurrenceInput=z.object({
  clientId:z.uuid(),
  serviceId:z.uuid().nullable().optional(),
  description:z.string().trim().min(2).max(300),
  amountCents:money.refine(n=>n>0),
  discountCents:money.default(0),
  frequency,
  anchorDay:z.number().int().min(1).max(31).optional(),
  firstDueDate:z.iso.date(),
}).strict();
const patch=z.object({
  description:z.string().trim().min(2).max(300).optional(),
  amountCents:money.refine(n=>n>0).optional(),
  discountCents:money.optional(),
}).strict();
const planColumns='rp.id,rp.organization_id,rp.client_id,rp.service_id,rp.description,'+
  'rp.amount_cents::text,rp.discount_cents::text,rp.frequency,rp.anchor_day,'+
  'rp.first_due_date::text,rp.next_due_date::text,rp.state,rp.generated_count,'+
  'rp.attempts,rp.last_error,rp.created_at,rp.updated_at,cl.name AS client_name';
function owner(p:Principal,res:Response){
  if(p.role==='owner'||p.role==='super_admin')return true;
  res.status(403).json({error:'owner_role_required'});return false;
}
async function audit(db:{query:Function},p:Principal,action:string,id:string,details:Record<string,unknown>={}){
  await db.query(
    'INSERT INTO audit_logs(id,organization_id,actor_id,action,entity_type,entity_id,metadata) '+
    'VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)',
    [randomUUID(),p.orgId,p.userId,action,'recurrence',id,JSON.stringify(details)]
  );
}
function validateSchedule(firstDueDate:string,cycle:RecurrenceFrequency,anchorDay:number){
  isoDate(firstDueDate);
  if(!isAlignedFirstDue(firstDueDate,cycle,anchorDay))throw new Error('first_date_not_aligned');
}
function failedDate(res:Response){res.status(422).json({error:'first_date_not_aligned'});}
export function registerRecurrences(app:Express,{sessions,csrf,who,route}:Deps):void{
  // Owner-managed schedule, visible to operators. It NEVER requests funds or sends WhatsApp.
  app.get('/api/recurrences',sessions,route(async(req,res)=>{
    const p=who(req);
    const q=z.object({
      state:z.enum(['active','paused','cancelled']).optional(),
      limit:z.coerce.number().int().min(1).max(100).default(50),
      offset:z.coerce.number().int().min(0).max(100000).default(0)
    }).strict().parse(req.query);
    const predicate='rp.organization_id=$1 AND ($2::text IS NULL OR rp.state=$2)';
    const params=[p.orgId,q.state??null,q.limit,q.offset];
    const [list,count]=await Promise.all([
      pool.query('SELECT '+planColumns+' FROM recurrence_plans rp '+
        'JOIN clients cl ON cl.id=rp.client_id AND cl.organization_id=rp.organization_id '+
        'WHERE '+predicate+' ORDER BY rp.created_at DESC,rp.id DESC LIMIT $3 OFFSET $4',params),
      pool.query('SELECT count(*)::int AS total FROM recurrence_plans rp WHERE '+predicate,params.slice(0,2))
    ]);
    res.json({items:list.rows,total:count.rows[0].total});
  }));
  app.get('/api/recurrences/overview',sessions,route(async(req,res)=>{
    const p=who(req);
    const [summary,runs]=await Promise.all([
      pool.query("SELECT count(*)::int AS total, count(*) FILTER (WHERE state='active')::int AS active,"+
        "count(*) FILTER (WHERE state='paused')::int AS paused,"+
        "count(*) FILTER (WHERE state='active' AND next_due_date<=($2::date))::int AS due,"+
        'coalesce(sum(generated_count),0)::int AS generated '+
        'FROM recurrence_plans WHERE organization_id=$1',[p.orgId,localBillingDate()]),
      pool.query('SELECT id,through_date::text,started_at,completed_at,generated,failed '+
        'FROM recurrence_worker_runs ORDER BY started_at DESC LIMIT 5')
    ]);
    res.json({summary:summary.rows[0],workerEnabled:false,
      schedulerRequired:true,financialProviderCalls:0,
      recentRuns:runs.rows});
  }));
  app.post('/api/recurrences/preview',sessions,csrf,route(async(req,res)=>{
    const b=z.object({
      firstDueDate:z.iso.date(),frequency,anchorDay:z.number().int().min(1).max(31).optional(),
      count:z.number().int().min(1).max(12).default(6)
    }).strict().parse(req.body);
    const anchor=b.anchorDay??Number(b.firstDueDate.slice(-2));
    if(!isAlignedFirstDue(b.firstDueDate,b.frequency,anchor)){failedDate(res);return;}
    res.json({dates:previewCycles(b.firstDueDate,b.frequency,anchor,b.count),sandboxOnly:false,
      draftOnly:true});
  }));
  app.post('/api/recurrences',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!owner(p,res))return;
    const b=recurrenceInput.parse(req.body);
    const anchor=b.anchorDay??Number(b.firstDueDate.slice(-2));
    if(b.discountCents>=b.amountCents){res.status(422).json({error:'invalid_discount'});return;}
    if(!isAlignedFirstDue(b.firstDueDate,b.frequency,anchor)){failedDate(res);return;}
    const today=localBillingDate();
    if(b.firstDueDate<today){res.status(422).json({error:'first_due_date_must_be_today_or_future'});return;}
    const id=randomUUID();
    const result=await transaction(async db=>{
      const client=await db.query("SELECT id FROM clients WHERE id=$1 AND organization_id=$2 AND status='active'",
        [b.clientId,p.orgId]);
      if(!client.rowCount)return null;
      if(b.serviceId){
        const service=await db.query("SELECT id FROM services WHERE id=$1 AND organization_id=$2 AND active=true",
          [b.serviceId,p.orgId]);
        if(!service.rowCount)return null;
      }
      const row=await db.query(
        'INSERT INTO recurrence_plans(id,organization_id,client_id,service_id,description,amount_cents,'+
        'discount_cents,frequency,anchor_day,first_due_date,next_due_date,created_by) '+
        'VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::date,$10::date,$11) RETURNING id,state,next_due_date::text',
        [id,p.orgId,b.clientId,b.serviceId??null,b.description,b.amountCents,b.discountCents,
          b.frequency,anchor,b.firstDueDate,p.userId]
      );
      await audit(db,p,'RECURRENCE_CREATED',id,{
        clientId:b.clientId,frequency:b.frequency,firstDueDate:b.firstDueDate,automaticPix:false
      });
      return row.rows[0];
    });
    if(!result){res.status(404).json({error:'client_or_service_not_available'});return;}
    res.status(201).json({...result,draftOnly:true,automaticPix:false});
  }));
  app.patch('/api/recurrences/:id',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!owner(p,res))return;
    const {id}=idParam.parse(req.params),b=patch.parse(req.body);
    if(!Object.keys(b).length){res.status(400).json({error:'empty_patch'});return;}
    const result=await transaction(async db=>{
      const existing=await db.query('SELECT amount_cents,discount_cents,state,lease_until '+
        'FROM recurrence_plans WHERE id=$1 AND organization_id=$2 FOR UPDATE',[id,p.orgId]);
      if(!existing.rowCount)return null;
      const old=existing.rows[0];
      if(old.state==='cancelled')return {error:'recurrence_cancelled'};
      if(old.lease_until&&new Date(old.lease_until)>new Date())return {error:'recurrence_processing'};
      const amount=b.amountCents??Number(old.amount_cents);
      const discount=b.discountCents??Number(old.discount_cents);
      if(discount>=amount)return {error:'invalid_discount'};
      const changed=await db.query(
        'UPDATE recurrence_plans SET description=coalesce($3,description),'+
        'amount_cents=$4,discount_cents=$5,updated_at=now() '+
        'WHERE id=$1 AND organization_id=$2 RETURNING id,state,amount_cents::text,discount_cents::text',
        [id,p.orgId,b.description??null,amount,discount]
      );
      await audit(db,p,'RECURRENCE_TEMPLATE_UPDATED',id,{fields:Object.keys(b),futureOnly:true});
      return changed.rows[0];
    });
    if(!result){res.status(404).json({error:'not_found'});return;}
    if('error' in result){res.status(409).json(result);return;}
    res.json(result);
  }));
  app.post('/api/recurrences/:id/pause',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!owner(p,res))return;
    const {id}=idParam.parse(req.params);
    const result=await transaction(async db=>{
      const q=await db.query('SELECT state FROM recurrence_plans '+
        'WHERE id=$1 AND organization_id=$2 FOR UPDATE',[id,p.orgId]);
      if(!q.rowCount)return null;
      if(q.rows[0].state==='cancelled')return {error:'recurrence_cancelled'};
      await db.query("UPDATE recurrence_plans SET state='paused',lease_token=NULL,lease_until=NULL,"+
        'updated_at=now() WHERE id=$1 AND organization_id=$2',[id,p.orgId]);
      if(q.rows[0].state==='active')await audit(db,p,'RECURRENCE_PAUSED',id);
      return {id,state:'paused'};
    });
    if(!result){res.status(404).json({error:'not_found'});return;}
    if('error' in result){res.status(409).json(result);return;}
    res.json(result);
  }));
  app.post('/api/recurrences/:id/resume',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!owner(p,res))return;
    const {id}=idParam.parse(req.params);
    const b=z.object({mode:z.enum(['skip_missed','catch_up']).default('skip_missed')}).strict().parse(req.body??{});
    const result=await transaction(async db=>{
      const row=await db.query('SELECT rp.state,rp.next_due_date::text,rp.frequency,rp.anchor_day,'+
        'cl.status AS client_status FROM recurrence_plans rp JOIN clients cl '+
        'ON cl.id=rp.client_id AND cl.organization_id=rp.organization_id '+
        'WHERE rp.id=$1 AND rp.organization_id=$2 FOR UPDATE OF rp',[id,p.orgId]);
      if(!row.rowCount)return null;
      const current=row.rows[0];
      if(current.state==='cancelled')return {error:'recurrence_cancelled'};
      if(current.client_status!=='active')return {error:'client_not_active'};
      if(current.state==='active')return {id,state:'active',nextDueDate:current.next_due_date,skippedCycles:0};
      const today=localBillingDate();
      let skipped=0,nextDue=current.next_due_date as string;
      if(b.mode==='skip_missed'){
        const result=skipPastCycles(nextDue,current.frequency,current.anchor_day,today);
        skipped=result.skipped;nextDue=result.nextDue;
      }else{
        // Backfill is an explicit owner action and limited to 12 cycles.
        let test=nextDue,count=0;
        while(test<today&&count<=12){
          test=advanceRecurrence(test,current.frequency,current.anchor_day);count++;
        }
        if(count>12)return {error:'catch_up_limit_exceeded'};
      }
      await db.query("UPDATE recurrence_plans SET state='active',next_due_date=$3::date,"+
        "lease_token=NULL,lease_until=NULL,next_attempt_at=now(),attempts=0,last_error=NULL,"+
        "updated_at=now() WHERE id=$1 AND organization_id=$2",[id,p.orgId,nextDue]);
      await audit(db,p,'RECURRENCE_RESUMED',id,{mode:b.mode,skippedCycles:skipped});
      return {id,state:'active',nextDueDate:nextDue,skippedCycles:skipped};
    });
    if(!result){res.status(404).json({error:'not_found'});return;}
    if('error' in result){res.status(409).json(result);return;}
    res.json(result);
  }));
  app.post('/api/recurrences/:id/cancel',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!owner(p,res))return;
    const {id}=idParam.parse(req.params);
    const result=await transaction(async db=>{
      const q=await db.query('SELECT state FROM recurrence_plans WHERE id=$1 AND organization_id=$2 FOR UPDATE',
        [id,p.orgId]);
      if(!q.rowCount)return null;
      if(q.rows[0].state!=='cancelled'){
        await db.query("UPDATE recurrence_plans SET state='cancelled',lease_token=NULL,lease_until=NULL,"+
          'updated_at=now() WHERE id=$1 AND organization_id=$2',[id,p.orgId]);
        await audit(db,p,'RECURRENCE_CANCELLED',id,{historicChargesUntouched:true});
      }
      return {id,state:'cancelled',historicChargesUntouched:true};
    });
    if(!result){res.status(404).json({error:'not_found'});return;}
    res.json(result);
  }));
  app.get('/api/recurrences/:id/cycles',sessions,route(async(req,res)=>{
    const p=who(req),{id}=idParam.parse(req.params);
    const exists=await pool.query('SELECT 1 FROM recurrence_plans WHERE id=$1 AND organization_id=$2',
      [id,p.orgId]);
    if(!exists.rowCount){res.status(404).json({error:'not_found'});return;}
    const q=await pool.query('SELECT rc.id,rc.cycle_key,rc.due_date::text,rc.charge_id,'+
      'ch.status AS charge_status,ch.amount_cents::text,ch.discount_cents::text,rc.created_at '+
      'FROM recurrence_cycles rc JOIN charges ch ON ch.id=rc.charge_id AND ch.organization_id=rc.organization_id '+
      'WHERE rc.plan_id=$1 AND rc.organization_id=$2 ORDER BY rc.due_date DESC LIMIT 100',
      [id,p.orgId]);
    res.json({items:q.rows});
  }));
}
