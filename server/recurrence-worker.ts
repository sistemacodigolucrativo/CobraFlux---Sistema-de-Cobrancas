import {randomBytes,randomUUID} from 'node:crypto';
import {pool,transaction} from './db';
import {enforceSaasQuota,SaasQuotaError} from './saas-domain';
import {advanceRecurrence,calendarCycleKey,isoDate,localBillingDate} from './recurrence-calendar';

type Claimed={id:string;orgId:string;token:string;attempts:number};
export type RecurrenceBatch={examined:number;generated:number;failed:number;paused:number;stale:number;throughDate:string};
async function claim(through:string):Promise<Claimed|null>{
  return transaction(async db=>{
    const q=await db.query(
      'SELECT rp.id,rp.organization_id,rp.attempts FROM recurrence_plans rp '+
      "JOIN organizations o ON o.id=rp.organization_id AND o.status='active' "+
      "WHERE rp.state='active' AND rp.next_due_date<=$1::date AND rp.next_attempt_at<=now() "+
      'AND (rp.lease_until IS NULL OR rp.lease_until<now()) '+
      'ORDER BY rp.next_due_date,rp.id FOR UPDATE OF rp SKIP LOCKED LIMIT 1',
      [through]
    );
    if(!q.rowCount)return null;
    const token=randomUUID(),row=q.rows[0];
    await db.query('UPDATE recurrence_plans SET lease_token=$2,'+
      "lease_until=now()+interval '5 minutes' WHERE id=$1",[row.id,token]);
    return {id:row.id,orgId:row.organization_id,token,attempts:Number(row.attempts)};
  });
}
async function finishOne(item:Claimed,through:string):Promise<'generated'|'paused'|'stale'>{
  return transaction(async db=>{
    const q=await db.query(
      "SELECT rp.*,rp.next_due_date::text AS due_iso,c.status AS client_status,o.status AS organization_status "+
      'FROM recurrence_plans rp JOIN clients c ON c.id=rp.client_id AND c.organization_id=rp.organization_id '+
      'JOIN organizations o ON o.id=rp.organization_id '+
      'WHERE rp.id=$1 AND rp.organization_id=$2 AND rp.lease_token=$3 AND rp.lease_until>now() '+
      'FOR UPDATE OF rp',[item.id,item.orgId,item.token]
    );
    if(!q.rowCount)return 'stale';
    const p=q.rows[0];
    if(p.state!=='active'||p.organization_status!=='active'){
      await db.query('UPDATE recurrence_plans SET lease_token=NULL,lease_until=NULL WHERE id=$1',[item.id]);
      return 'stale';
    }
    if(p.client_status!=='active'){
      await db.query("UPDATE recurrence_plans SET state='paused',lease_token=NULL,lease_until=NULL,"+
        "last_error='client_archived',updated_at=now() WHERE id=$1",[item.id]);
      await db.query(
        "INSERT INTO audit_logs(id,organization_id,action,entity_type,entity_id,metadata) "+
        "VALUES($1,$2,'RECURRENCE_PAUSED_CLIENT_ARCHIVED','recurrence',$3,'{}'::jsonb)",
        [randomUUID(),item.orgId,item.id]
      );
      return 'paused';
    }
    const due=p.due_iso as string;
    if(due>through){
      await db.query('UPDATE recurrence_plans SET lease_token=NULL,lease_until=NULL WHERE id=$1',[item.id]);
      return 'stale';
    }
    isoDate(due);
    const next=advanceRecurrence(due,p.frequency,p.anchor_day);
    const cycleKey=calendarCycleKey(due,p.frequency);
    const existing=await db.query('SELECT id FROM recurrence_cycles WHERE plan_id=$1 AND cycle_key=$2',[item.id,cycleKey]);
    if(!existing.rowCount){
      try{await enforceSaasQuota(db,item.orgId,'charges_month');}
      catch(e){
        if(!(e instanceof SaasQuotaError))throw e;
        await db.query("UPDATE recurrence_plans SET state='paused',last_error='saas_quota_exceeded',"+
          "lease_token=NULL,lease_until=NULL,updated_at=now() WHERE id=$1",[item.id]);
        await db.query("INSERT INTO audit_logs(id,organization_id,action,entity_type,entity_id,metadata) "+
          "VALUES($1,$2,'RECURRENCE_PAUSED_SAAS_LIMIT','recurrence',$3,$4::jsonb)",
          [randomUUID(),item.orgId,item.id,JSON.stringify({resource:e.resource,limit:e.limit})]);
        return 'paused';
      }
      const chargeId=randomUUID(),publicToken=randomBytes(24).toString('base64url');
      await db.query(
        "INSERT INTO charges(id,public_token,organization_id,client_id,service_id,description,"+
        "amount_cents,discount_cents,due_date,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::date,'draft')",
        [chargeId,publicToken,item.orgId,p.client_id,p.service_id,p.description,
          p.amount_cents,p.discount_cents,due]
      );
      await db.query(
        'INSERT INTO recurrence_cycles(id,organization_id,plan_id,cycle_key,due_date,charge_id) '+
        'VALUES($1,$2,$3,$4,$5::date,$6)',
        [randomUUID(),item.orgId,item.id,cycleKey,due,chargeId]
      );
      await db.query(
        'INSERT INTO charge_history(id,organization_id,charge_id,action,details) '+
        "VALUES($1,$2,$3,'RECURRENCE_DRAFT_GENERATED',$4::jsonb)",
        [randomUUID(),item.orgId,chargeId,JSON.stringify({planId:item.id,cycleKey,nonFinancial:true})]
      );
      await db.query(
        "INSERT INTO audit_logs(id,organization_id,action,entity_type,entity_id,metadata) "+
        "VALUES($1,$2,'RECURRENCE_DRAFT_GENERATED','charge',$3,$4::jsonb)",
        [randomUUID(),item.orgId,chargeId,JSON.stringify({planId:item.id,cycleKey})]
      );
    }
    await db.query(
      'UPDATE recurrence_plans SET next_due_date=$2::date,lease_token=NULL,lease_until=NULL,'+
      'next_attempt_at=now(),attempts=0,last_error=NULL,generated_count=generated_count+$3,updated_at=now() '+
      'WHERE id=$1',[item.id,next,existing.rowCount?0:1]
    );
    return existing.rowCount?'stale':'generated';
  });
}
async function failed(item:Claimed){
  const minutes=Math.min(360,5*Math.pow(2,Math.min(item.attempts,7)));
  await pool.query(
    'UPDATE recurrence_plans SET lease_token=NULL,lease_until=NULL,attempts=attempts+1,'+
    "next_attempt_at=now()+($3 * interval '1 minute'),last_error='draft_generation_failed',updated_at=now() "+
    'WHERE id=$1 AND organization_id=$2 AND lease_token=$4',
    [item.id,item.orgId,minutes,item.token]
  );
}
export async function recurrenceDueCount(through:string=localBillingDate()):Promise<number>{
  isoDate(through);
  const q=await pool.query('SELECT count(*)::int AS count FROM recurrence_plans rp '+
    "JOIN organizations o ON o.id=rp.organization_id AND o.status='active' "+
    "WHERE rp.state='active' AND rp.next_due_date<=$1::date",[through]);
  return q.rows[0].count;
}
export async function generateRecurrenceBatch(
  limit=20,through:string=localBillingDate()
):Promise<RecurrenceBatch>{
  if(!Number.isInteger(limit)||limit<1||limit>100)throw new Error('invalid_recurrence_batch_limit');
  isoDate(through);
  if(through>localBillingDate())throw new Error('cannot_generate_future_cycles');
  const result:RecurrenceBatch={examined:0,generated:0,failed:0,paused:0,stale:0,throughDate:through};
  for(let i=0;i<limit;i++){
    const item=await claim(through);
    if(!item)break;
    result.examined++;
    try{
      const status=await finishOne(item,through);
      if(status==='generated')result.generated++;
      if(status==='paused')result.paused++;
      if(status==='stale')result.stale++;
    }catch{
      result.failed++;
      await failed(item);
    }
  }
  return result;
}
