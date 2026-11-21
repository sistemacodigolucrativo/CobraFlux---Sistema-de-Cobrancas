import {randomUUID} from 'node:crypto';
import {pool,transaction} from './db';
import {enforceSaasQuota,SaasQuotaError} from './saas-domain';
import {isoDate,localBillingDate} from './recurrence-calendar';
export type EnqueueSummary={examined:number;queued:number;skipped:number;date:string;neverSent:true};
export async function eligibleDueCount(asOf:string=localBillingDate()){
  isoDate(asOf);
  const q=await pool.query(
    "SELECT count(*)::int AS total FROM charges ch JOIN organizations org ON org.id=ch.organization_id AND org.status='active' "+
    "JOIN clients c ON c.id=ch.client_id AND c.organization_id=ch.organization_id AND c.status='active' "+
    "JOIN whatsapp_accounts wa ON wa.organization_id=ch.organization_id AND wa.enabled=true "+
    "JOIN whatsapp_templates wt ON wt.id=wa.default_template_id AND wt.organization_id=wa.organization_id "+
    "JOIN whatsapp_consents cons ON cons.client_id=c.id AND cons.organization_id=c.organization_id AND cons.granted=true "+
    "LEFT JOIN whatsapp_outbox ob ON ob.charge_id=ch.id AND ob.organization_id=ch.organization_id AND ob.kind='due_reminder' "+
    "WHERE ch.status IN('pending','overdue') AND ch.due_date BETWEEN $1::date-interval '1 day' AND $1::date+interval '3 days' "+
    "AND cons.phone_snapshot=regexp_replace(c.phone,'[^0-9]','','g') "+
    "AND wt.approved=true AND wt.category='UTILITY' AND wt.parameter_count=3 AND "+
    "wt.verified_at>now()-interval '24 hours' AND ob.id IS NULL",[asOf]);
  return Number(q.rows[0].total);
}
export async function enqueueDueReminders(limit=100,asOf:string=localBillingDate()):Promise<EnqueueSummary>{
 if(!Number.isInteger(limit)||limit<1||limit>100)throw new Error('invalid_enqueue_batch_limit');
 isoDate(asOf);
 if(asOf>localBillingDate())throw new Error('cannot_enqueue_future_business_dates');
 const summary:EnqueueSummary={examined:0,queued:0,skipped:0,date:asOf,neverSent:true};
 // Candidate discovery is read-only: avoid locking charges before the per-tenant quota lock.
 const candidates=await pool.query(
   "SELECT ch.id,ch.organization_id FROM charges ch JOIN organizations org "+
   "ON org.id=ch.organization_id AND org.status='active' "+
   "JOIN whatsapp_accounts wa ON wa.organization_id=ch.organization_id AND wa.enabled=true "+
   "JOIN whatsapp_templates wt ON wt.id=wa.default_template_id AND wt.organization_id=wa.organization_id "+
   "WHERE ch.status IN('pending','overdue') AND ch.due_date BETWEEN $1::date-interval '1 day' AND $1::date+interval '3 days' "+
   "AND wt.approved=true AND wt.category='UTILITY' AND wt.parameter_count=3 "+
   "AND wt.verified_at>now()-interval '24 hours' "+
   "AND NOT EXISTS(SELECT 1 FROM whatsapp_outbox x WHERE x.organization_id=ch.organization_id "+
   "AND x.charge_id=ch.id AND x.kind='due_reminder') "+
   "ORDER BY ch.due_date,ch.id LIMIT $2",[asOf,limit]);
 for(const candidate of candidates.rows){
   summary.examined++;
   const outcome=await transaction(async db=>{
     // Every writer of quota-controlled rows takes this organization lock first.
     try{await enforceSaasQuota(db,candidate.organization_id,'messages_month');}
     catch(e){if(e instanceof SaasQuotaError)return 'quota';throw e;}
     // Revalidate tenant, consent and charge under the charge lock after the org lock.
     const q=await db.query(
       "SELECT ch.id,ch.organization_id,ch.client_id,wa.default_template_id,cons.version,c.phone "+
       "FROM charges ch JOIN organizations org ON org.id=ch.organization_id AND org.status='active' "+
       "JOIN clients c ON c.id=ch.client_id AND c.organization_id=ch.organization_id AND c.status='active' "+
       "JOIN whatsapp_accounts wa ON wa.organization_id=ch.organization_id AND wa.enabled=true "+
       "JOIN whatsapp_templates wt ON wt.id=wa.default_template_id AND wt.organization_id=wa.organization_id "+
       "JOIN whatsapp_consents cons ON cons.client_id=c.id AND cons.organization_id=c.organization_id AND cons.granted=true "+
       "WHERE ch.organization_id=$1 AND ch.id=$2 AND ch.status IN('pending','overdue') "+
       "AND ch.due_date BETWEEN $3::date-interval '1 day' AND $3::date+interval '3 days' "+
       "AND cons.phone_snapshot=regexp_replace(c.phone,'[^0-9]','','g') "+
       "AND wt.approved=true AND wt.category='UTILITY' AND wt.parameter_count=3 "+
       "AND wt.verified_at>now()-interval '24 hours' FOR UPDATE OF ch",
       [candidate.organization_id,candidate.id,asOf]);
     if(!q.rowCount)return 'skipped';
     const row=q.rows[0],jobId=randomUUID();
     const inserted=await db.query(
       "INSERT INTO whatsapp_outbox(id,organization_id,client_id,charge_id,template_id,kind,consent_version,target_phone) "+
       "VALUES($1,$2,$3,$4,$5,'due_reminder',$6,$7) "+
       "ON CONFLICT(organization_id,charge_id,kind) DO NOTHING RETURNING id",
       [jobId,row.organization_id,row.client_id,row.id,row.default_template_id,row.version,
         String(row.phone).replace(/[^0-9]/g,'')]);
     if(!inserted.rowCount)return 'skipped';
     await db.query(
       "INSERT INTO audit_logs(id,organization_id,action,entity_type,entity_id,metadata) "+
       "VALUES($1,$2,'WHATSAPP_REMINDER_AUTOMATICALLY_QUEUED','charge',$3,$4::jsonb)",
       [randomUUID(),row.organization_id,row.id,JSON.stringify({date:asOf,notificationOnly:true,sent:false})]);
     return 'queued';
   });
   if(outcome==='queued')summary.queued++;else summary.skipped++;
 }
 return summary;
}
