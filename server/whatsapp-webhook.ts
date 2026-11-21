import {randomUUID} from 'node:crypto';
import type {Express,Request,Response} from 'express';
import {z} from 'zod';
import {transaction} from './db';
import {secureEquals} from './security';
import {verifyMetaSignature} from './whatsapp-cloud';
import {applyDeliveryStatus,type MetaStatus} from './whatsapp-delivery';
const incomingStatus=z.object({
  id:z.string().min(5).max(300),
  status:z.enum(['sent','delivered','read','failed']),
  timestamp:z.string().regex(/^[0-9]{9,12}$/),
  errors:z.array(z.object({code:z.number().int().optional()}).passthrough()).max(10).optional()
}).passthrough();
const incomingMessage=z.object({
  id:z.string().min(5).max(300),
  from:z.string().regex(/^[0-9]{10,16}$/),
  type:z.string(),
  text:z.object({body:z.string().max(2000)}).optional()
}).passthrough();
const value=z.object({
  metadata:z.object({phone_number_id:z.string().regex(/^[0-9]{5,30}$/)}).passthrough(),
  statuses:z.array(incomingStatus).max(100).optional(),
  messages:z.array(incomingMessage).max(100).optional()
}).passthrough();
const payload=z.object({
  object:z.literal('whatsapp_business_account'),
  entry:z.array(z.object({
    changes:z.array(z.object({value}).passthrough()).max(40)
  }).passthrough()).max(40)
}).passthrough();
function stopCommand(text:string|undefined){
  return /^(PARAR|SAIR|STOP|CANCELAR|REMOVER)$/i.test((text??'').trim());
}
async function processIncoming(orgId:string,data:z.infer<typeof incomingMessage>){
  await transaction(async db=>{
    const state=await db.query(
      'INSERT INTO whatsapp_inbound_dedup(provider_message_id,organization_id,action) '+
      'VALUES($1,$2,$3) ON CONFLICT(provider_message_id) DO NOTHING RETURNING provider_message_id',
      [data.id,orgId,stopCommand(data.text?.body)&&data.type==='text'?'opt_out':'ignored']);
    if(!state.rowCount||data.type!=='text'||!stopCommand(data.text?.body))return;
    const clients=await db.query(
      'SELECT c.id,c.phone,coalesce(w.version,0) AS version FROM clients c '+
      'LEFT JOIN whatsapp_consents w ON w.client_id=c.id AND w.organization_id=c.organization_id '+
      "WHERE c.organization_id=$1 AND c.status='active' AND regexp_replace(c.phone,'[^0-9]','','g')=$2 "+
      'FOR UPDATE OF c',[orgId,data.from]);
    for(const client of clients.rows){
      const version=Number(client.version)+1;
      await db.query(
        'INSERT INTO whatsapp_consents(organization_id,client_id,version,granted,source,phone_snapshot,revoked_at) '+
        "VALUES($1,$2,$3,false,'whatsapp_inbound',$4,now()) "+
        'ON CONFLICT(organization_id,client_id) DO UPDATE SET version=excluded.version,granted=false,'+
        'source=excluded.source,evidence_reference=NULL,phone_snapshot=excluded.phone_snapshot,'+
        'recorded_by=NULL,granted_at=NULL,revoked_at=now(),updated_at=now()',
        [orgId,client.id,version,data.from]);
      await db.query(
        "INSERT INTO whatsapp_consent_events(id,organization_id,client_id,version,granted,source,phone_snapshot) "+
        "VALUES($1,$2,$3,$4,false,'whatsapp_inbound',$5)",
        [randomUUID(),orgId,client.id,version,data.from]);
      await db.query('UPDATE clients SET whatsapp_opt_in=false WHERE organization_id=$1 AND id=$2',
        [orgId,client.id]);
      await db.query("UPDATE whatsapp_outbox SET state='blocked',last_error='client_opted_out',updated_at=now() "+
        "WHERE organization_id=$1 AND client_id=$2 AND state='queued'",[orgId,client.id]);
      await db.query(
        "INSERT INTO audit_logs(id,organization_id,action,entity_type,entity_id,metadata) "+
        "VALUES($1,$2,'WHATSAPP_CLIENT_OPT_OUT','client',$3,$4::jsonb)",
        [randomUUID(),orgId,client.id,JSON.stringify({source:'whatsapp_inbound',version})]);
    }
  });
}
export function registerMetaWebhook(app:Express){
  app.get('/api/webhooks/meta-whatsapp',(req,res)=>{
    const expected=process.env.META_WEBHOOK_VERIFY_TOKEN??'';
    const mode=String(req.query['hub.mode']??''),challenge=String(req.query['hub.challenge']??'');
    const supplied=String(req.query['hub.verify_token']??'');
    if(!expected||mode!=='subscribe'||!challenge||challenge.length>200||!secureEquals(expected,supplied)){
      res.status(403).json({error:'meta_webhook_verification_failed'});return;
    }
    res.type('text/plain').send(challenge);
  });
  app.post('/api/webhooks/meta-whatsapp',async(req,res,next)=>{
    try{
      const secret=process.env.META_APP_SECRET??'';
      const raw=(req as Request & {metaRawBody?:Buffer}).metaRawBody;
      if(!raw||!verifyMetaSignature(raw,req.header('X-Hub-Signature-256'),secret)){
        res.status(403).json({error:'invalid_meta_signature'});return;
      }
      const parsed=payload.parse(req.body);
      for(const entry of parsed.entry){
        for(const change of entry.changes){
          await transaction(async db=>{
            const a=await db.query(
              'SELECT organization_id FROM whatsapp_accounts WHERE phone_number_id=$1',
              [change.value.metadata.phone_number_id]);
            if(!a.rowCount)return;
            const orgId=a.rows[0].organization_id as string;
            for(const status of change.value.statuses??[]){
              const stamp=Number(status.timestamp),errorCode=status.errors?.[0]?.code?String(status.errors[0].code):null;
              await db.query(
                'INSERT INTO whatsapp_callback_buffer(id,organization_id,provider_message_id,status,provider_timestamp,error_code) '+
                'VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(provider_message_id,status,provider_timestamp) DO NOTHING',
                [randomUUID(),orgId,status.id,status.status,stamp,errorCode]);
              const applied=await applyDeliveryStatus(db,orgId,status.id,status.status,stamp,errorCode);
              if(applied)await db.query(
                'DELETE FROM whatsapp_callback_buffer WHERE organization_id=$1 AND provider_message_id=$2 '+
                'AND status=$3 AND provider_timestamp=$4',[orgId,status.id,status.status,stamp]);
            }
          });
          // Process opt-out after status transaction, with idempotent per-message transactions.
          const org=await transaction(async db=>{
            const a=await db.query('SELECT organization_id FROM whatsapp_accounts WHERE phone_number_id=$1',
              [change.value.metadata.phone_number_id]);
            return a.rows[0]?.organization_id as string|undefined;
          });
          if(org)for(const msg of change.value.messages??[])await processIncoming(org,msg);
        }
      }
      res.json({received:true});
    }catch(err){next(err);}
  });
}
