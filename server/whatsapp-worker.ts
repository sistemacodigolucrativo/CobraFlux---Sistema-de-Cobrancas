import {randomUUID} from 'node:crypto';
import {pool,transaction} from './db';
import {WhatsAppCloud,MetaHttpError,decryptWhatsAppToken,inBusinessHours,whatsappSecretsReady} from './whatsapp-cloud';
import {replayBufferedStatuses} from './whatsapp-delivery';

type Claimed={id:string;orgId:string;token:string;phone:string;
  accountId:string;ciphertext:string;templateName:string;language:string;
  clientName:string;description:string;dueDate:string;provider:string|null};
export type WhatsAppBatch={examined:number;accepted:number;blocked:number;unknown:number;failed:number;deferred:number;disabled:false};
export function scopeAllowsRecipient(phone:string,provider:string|null):boolean{
  const scope=process.env.WHATSAPP_SEND_SCOPE??'test';
  if(scope==='production'){
    return process.env.WHATSAPP_GO_LIVE_APPROVED==='true'&&provider!=='asaas_sandbox';
  }
  if(scope!=='test')return false;
  const allow=(process.env.WHATSAPP_TEST_RECIPIENT_ALLOWLIST??'').split(',').map(s=>s.replace(/[^0-9]/g,''));
  return allow.some(p=>p.length>=10&&p===phone);
}
async function markExpiredAmbiguities(){
  // A process could crash after HTTP POST, never retry a lease whose outcome is unknown.
  await pool.query("UPDATE whatsapp_outbox SET state='unknown',last_error='worker_crash_or_timeout',"+
    'lease_token=NULL,lease_until=NULL,updated_at=now() '+
    "WHERE state='sending' AND lease_until<now()");
}
async function claim():Promise<Claimed|null>{
  return transaction(async db=>{
    const q=await db.query(
      "SELECT o.id,o.organization_id,o.client_id,o.charge_id,o.target_phone,o.consent_version,"+
      "wa.phone_number_id,wa.access_token_ciphertext,wt.name AS template_name,wt.language,"+
      "wt.approved,wt.verified_at,c.name AS client_name,c.status AS client_status,c.phone,"+
      "coalesce(cons.granted,false) AS granted,cons.version,cons.phone_snapshot,"+
      "ch.status AS charge_status,ch.provider,ch.description,ch.due_date::text AS due_date "+
      "FROM whatsapp_outbox o JOIN whatsapp_accounts wa ON wa.organization_id=o.organization_id "+
      "JOIN whatsapp_templates wt ON wt.id=o.template_id AND wt.organization_id=o.organization_id "+
      "JOIN clients c ON c.id=o.client_id AND c.organization_id=o.organization_id "+
      "LEFT JOIN whatsapp_consents cons ON cons.client_id=c.id AND cons.organization_id=c.organization_id "+
      "JOIN charges ch ON ch.id=o.charge_id AND ch.organization_id=o.organization_id "+
      "JOIN organizations org ON org.id=o.organization_id AND org.status='active' "+
      "WHERE o.state='queued' AND o.due_at<=now() AND wa.enabled=true "+
      "ORDER BY o.due_at,o.created_at FOR UPDATE OF o SKIP LOCKED LIMIT 1");
    if(!q.rowCount)return null;
    const row=q.rows[0],orgId=row.organization_id as string;
    // Serialize per-organization rate-limit reservation, across multiple worker instances.
    await db.query('SELECT organization_id FROM whatsapp_accounts WHERE organization_id=$1 FOR UPDATE',[orgId]);
    const phone=String(row.phone).replace(/[^0-9]/g,'');
    const valid=Boolean(row.granted)&&Number(row.version)===Number(row.consent_version)&&
      row.phone_snapshot===phone&&row.target_phone===phone&&row.client_status==='active'&&
      ['pending','overdue'].includes(row.charge_status)&&row.approved&&
      Date.now()-new Date(row.verified_at).getTime()<=86400000;
    if(!valid){
      await db.query("UPDATE whatsapp_outbox SET state='blocked',last_error='preflight_policy_block',updated_at=now() WHERE id=$1",
        [row.id]);
      return {id:row.id,orgId,token:'blocked',phone:'',accountId:'',ciphertext:'',
        templateName:'',language:'',clientName:'',description:'',dueDate:'',provider:null};
    }
    const perOrg=await db.query(
      "SELECT count(*)::int AS used FROM whatsapp_outbox WHERE organization_id=$1 AND "+
      "sent_at>now()-interval '24 hours' AND state IN('sending','accepted','sent','delivered','read','unknown','failed')",
      [orgId]);
    const perClient=await db.query(
      "SELECT count(*)::int AS used FROM whatsapp_outbox WHERE organization_id=$1 AND client_id=$2 AND "+
      "sent_at>now()-interval '24 hours' AND state IN('sending','accepted','sent','delivered','read','unknown','failed')",
      [orgId,row.client_id]);
    if(perOrg.rows[0].used>=50||perClient.rows[0].used>=1){
      await db.query("UPDATE whatsapp_outbox SET due_at=now()+interval '24 hours',updated_at=now() WHERE id=$1",[row.id]);
      return {id:row.id,orgId,token:'deferred',phone:'',accountId:'',ciphertext:'',
        templateName:'',language:'',clientName:'',description:'',dueDate:'',provider:null};
    }
    const token=randomUUID();
    await db.query("UPDATE whatsapp_outbox SET state='sending',lease_token=$2,"+
      "lease_until=now()+interval '2 minutes',attempts=attempts+1,sent_at=now(),updated_at=now() WHERE id=$1",
      [row.id,token]);
    return {id:row.id,orgId,token,phone,accountId:row.phone_number_id,
      ciphertext:row.access_token_ciphertext,templateName:row.template_name,language:row.language,
      clientName:row.client_name,description:row.description,dueDate:row.due_date,provider:row.provider};
  });
}
async function finishSuccess(row:Claimed,providerId:string){
  await transaction(async db=>{
    const q=await db.query("UPDATE whatsapp_outbox SET state='accepted',provider_message_id=$3,"+
      "lease_token=NULL,lease_until=NULL,last_error=NULL,updated_at=now() "+
      "WHERE id=$1 AND lease_token=$2 AND state='sending' RETURNING id",
      [row.id,row.token,providerId]);
    if(!q.rowCount)return;
    await replayBufferedStatuses(db,row.orgId,providerId);
    await db.query(
      "INSERT INTO audit_logs(id,organization_id,action,entity_type,entity_id,metadata) "+
      "VALUES($1,$2,'WHATSAPP_MESSAGE_ACCEPTED','whatsapp_outbox',$3,$4::jsonb)",
      [randomUUID(),row.orgId,row.id,JSON.stringify({provider:'meta_cloud',delivered:false})]);
  });
}
async function finishFailure(row:Claimed,definite:boolean){
  await pool.query(
    "UPDATE whatsapp_outbox SET state=$3,lease_token=NULL,lease_until=NULL,last_error=$4,updated_at=now() "+
    "WHERE id=$1 AND lease_token=$2 AND state='sending'",
    [row.id,row.token,definite?'failed':'unknown',
      definite?'meta_definitive_http_rejection':'meta_outcome_unknown_no_retry']);
}
export async function whatsappQueuedCount(){
  const q=await pool.query("SELECT count(*)::int AS count FROM whatsapp_outbox WHERE state='queued'");
  return Number(q.rows[0].count);
}
export async function runWhatsAppBatch(limit=10,clock:Date=new Date()):Promise<WhatsAppBatch>{
  if(!Number.isInteger(limit)||limit<1||limit>50)throw new Error('invalid_whatsapp_batch_limit');
  if(process.env.WHATSAPP_SEND_ENABLED!=='true')throw new Error('whatsapp_send_disabled');
  if(!whatsappSecretsReady())throw new Error('whatsapp_master_key_missing');
  const stats:WhatsAppBatch={examined:0,accepted:0,blocked:0,unknown:0,failed:0,deferred:0,disabled:false};
  await markExpiredAmbiguities();
  await pool.query("DELETE FROM whatsapp_callback_buffer WHERE created_at<now()-interval '7 days'");
  // No sending at night or on Sundays. CLI returns without POST or consuming a lease.
  if(!inBusinessHours(clock))return stats;
  for(let i=0;i<limit;i++){
    const row=await claim();
    if(!row)break;
    stats.examined++;
    if(row.token==='blocked'){stats.blocked++;continue;}
    if(row.token==='deferred'){stats.deferred++;continue;}
    if(!scopeAllowsRecipient(row.phone,row.provider)){
      await pool.query("UPDATE whatsapp_outbox SET state='blocked',last_error='recipient_not_authorized_for_send_scope',"+
        "lease_token=NULL,lease_until=NULL,updated_at=now() WHERE id=$1 AND lease_token=$2",
        [row.id,row.token]);
      stats.blocked++;continue;
    }
    try{
      const api=new WhatsAppCloud(decryptWhatsAppToken(row.ciphertext,row.orgId));
      const date=row.dueDate.split('-').reverse().join('/');
      const providerId=await api.sendApprovedReminder({
        phoneNumberId:row.accountId,recipient:row.phone,
        name:row.templateName,language:row.language,
        values:[row.clientName.slice(0,120),row.description.slice(0,300),date]
      });
      await finishSuccess(row,providerId);
      stats.accepted++;
    }catch(e){
      const definite=e instanceof MetaHttpError&&e.definite;
      await finishFailure(row,definite);
      if(definite)stats.failed++;else stats.unknown++;
      // Do not print access tokens, recipients, message bodies, external response bodies.
      console.error('meta_message_delivery_unconfirmed',definite?'rejected':'unknown');
    }
  }
  return stats;
}
