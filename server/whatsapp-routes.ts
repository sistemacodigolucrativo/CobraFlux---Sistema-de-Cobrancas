import {randomUUID} from 'node:crypto';
import type {Express,Request,Response,RequestHandler} from 'express';
import {z} from 'zod';
import {pool,transaction} from './db';
import {WhatsAppCloud,encryptWhatsAppToken,decryptWhatsAppToken,whatsappSecretsReady} from './whatsapp-cloud';

type Principal={userId:string;orgId:string;role:string};
type Deps={sessions:RequestHandler;csrf:RequestHandler;who:(r:Request)=>Principal;
  route:(fn:(r:Request,res:Response)=>Promise<unknown>)=>RequestHandler};
const id=z.object({id:z.uuid()});
const config=z.object({
  wabaId:z.string().regex(/^[0-9]{5,30}$/),
  phoneNumberId:z.string().regex(/^[0-9]{5,30}$/),
  accessToken:z.string().trim().min(20).max(2048)
}).strict();
const consentRecord=z.object({
  action:z.enum(['grant','revoke']),
  source:z.enum(['signed_form','web_form','documented_request','client_request']),
  evidenceReference:z.string().trim().min(12).max(500).optional(),
  acknowledged:z.boolean().default(false)
}).strict();
function isOwner(p:Principal,res:Response):boolean{
  if(p.role==='owner'||p.role==='super_admin')return true;
  res.status(403).json({error:'owner_role_required'});return false;
}
async function audit(db:{query:Function},p:Principal,action:string,kind:string,entity:string,meta:object={}){
  await db.query(
    'INSERT INTO audit_logs(id,organization_id,actor_id,action,entity_type,entity_id,metadata) '+
    'VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)',
    [randomUUID(),p.orgId,p.userId,action,kind,entity,JSON.stringify(meta)]
  );
}
export function registerWhatsApp(app:Express,{sessions,csrf,who,route}:Deps){
  app.get('/api/whatsapp/connection',sessions,route(async(req,res)=>{
    const p=who(req);if(!isOwner(p,res))return;
    const q=await pool.query('SELECT waba_id,phone_number_id,enabled,last_template_sync_at '+
      'FROM whatsapp_accounts WHERE organization_id=$1',[p.orgId]);
    const a=q.rows[0];
    res.json({configured:!!a,enabled:a?.enabled??false,
      wabaId:a?.waba_id??null,phoneNumberId:a?.phone_number_id??null,
      lastTemplateSyncAt:a?.last_template_sync_at??null,
      deliveryEnabled:process.env.WHATSAPP_SEND_ENABLED==='true',
      schedulerRequired:true});
  }));
  app.put('/api/whatsapp/connection',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!isOwner(p,res))return;
    if(!whatsappSecretsReady()){res.status(503).json({error:'whatsapp_master_key_missing'});return;}
    const body=config.parse(req.body);
    const encrypted=encryptWhatsAppToken(body.accessToken,p.orgId);
    await transaction(async db=>{
      await db.query('SELECT id FROM organizations WHERE id=$1 FOR UPDATE',[p.orgId]);
      const before=await db.query('SELECT waba_id,phone_number_id FROM whatsapp_accounts WHERE organization_id=$1 FOR UPDATE',[p.orgId]);
      const changed=before.rowCount&&
        (before.rows[0].waba_id!==body.wabaId||before.rows[0].phone_number_id!==body.phoneNumberId);
      await db.query(
        'INSERT INTO whatsapp_accounts(organization_id,waba_id,phone_number_id,access_token_ciphertext,enabled) '+
        'VALUES($1,$2,$3,$4,false) ON CONFLICT(organization_id) DO UPDATE SET '+
        'waba_id=excluded.waba_id,phone_number_id=excluded.phone_number_id,'+
        'access_token_ciphertext=excluded.access_token_ciphertext,enabled=false,updated_at=now(),'+
        'last_template_sync_at=CASE WHEN whatsapp_accounts.waba_id=excluded.waba_id AND '+
        'whatsapp_accounts.phone_number_id=excluded.phone_number_id THEN whatsapp_accounts.last_template_sync_at ELSE NULL END',
        [p.orgId,body.wabaId,body.phoneNumberId,encrypted]);
      if(changed){
        await db.query('UPDATE whatsapp_templates SET approved=false WHERE organization_id=$1',[p.orgId]);
        await db.query("UPDATE whatsapp_outbox SET state='blocked',last_error='account_changed',"+
          "lease_token=NULL,lease_until=NULL,updated_at=now() WHERE organization_id=$1 AND state='queued'",[p.orgId]);
      }
      await audit(db,p,'WHATSAPP_CONNECTION_CONFIGURED','organization',p.orgId,{credentialsRotated:true});
    });
    res.json({configured:true,enabled:false,schedulerRequired:true});
  }));
  app.post('/api/whatsapp/templates/sync',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!isOwner(p,res))return;
    if(!whatsappSecretsReady()){res.status(503).json({error:'whatsapp_master_key_missing'});return;}
    const a=await pool.query('SELECT waba_id,access_token_ciphertext FROM whatsapp_accounts WHERE organization_id=$1',[p.orgId]);
    if(!a.rowCount){res.status(409).json({error:'whatsapp_account_not_configured'});return;}
    let list:Awaited<ReturnType<WhatsAppCloud['listUtilityTemplates']>>;
    try{
      const api=new WhatsAppCloud(decryptWhatsAppToken(a.rows[0].access_token_ciphertext,p.orgId));
      list=await api.listUtilityTemplates(a.rows[0].waba_id);
    }catch{res.status(502).json({error:'meta_template_verification_failed'});return;}
    await transaction(async db=>{
      const lock=await db.query('SELECT waba_id FROM whatsapp_accounts WHERE organization_id=$1 FOR UPDATE',[p.orgId]);
      if(lock.rows[0]?.waba_id!==a.rows[0].waba_id)throw new Error('whatsapp_account_changed_during_sync');
      await db.query('UPDATE whatsapp_templates SET approved=false WHERE organization_id=$1',[p.orgId]);
      for(const item of list){
        await db.query(
          'INSERT INTO whatsapp_templates(id,organization_id,name,language,category,parameter_count,approved) '+
          'VALUES($1,$2,$3,$4,$5,$6,true) ON CONFLICT(organization_id,name,language) '+
          'DO UPDATE SET approved=true,category=excluded.category,parameter_count=excluded.parameter_count,verified_at=now()',
          [randomUUID(),p.orgId,item.name,item.language,item.category,item.parameterCount]);
      }
      await db.query('UPDATE whatsapp_accounts SET last_template_sync_at=now(),updated_at=now() WHERE organization_id=$1',[p.orgId]);
      await audit(db,p,'WHATSAPP_TEMPLATES_VERIFIED','organization',p.orgId,{eligible:list.length});
    });
    res.json({verified:list.length,approvedUtilityTemplates:list,enabledForSending:false});
  }));
  app.get('/api/whatsapp/templates',sessions,route(async(req,res)=>{
    const p=who(req);
    const q=await pool.query(
      'SELECT id,name,language,category,parameter_count,approved,verified_at FROM whatsapp_templates '+
      'WHERE organization_id=$1 ORDER BY name,language LIMIT 100',[p.orgId]);
    res.json({items:q.rows});
  }));
  app.post('/api/whatsapp/connection/enable',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!isOwner(p,res))return;
    if(!process.env.META_APP_SECRET||!process.env.META_WEBHOOK_VERIFY_TOKEN){
      res.status(503).json({error:'meta_webhook_not_configured'});return;
    }
    const q=await pool.query('UPDATE whatsapp_accounts SET enabled=true,updated_at=now() '+
      'WHERE organization_id=$1 AND last_template_sync_at>now()-interval \'24 hours\' '+
      'AND EXISTS(SELECT 1 FROM whatsapp_templates WHERE organization_id=$1 AND approved=true) '+
      'RETURNING phone_number_id',[p.orgId]);
    if(!q.rowCount){res.status(409).json({error:'whatsapp_templates_not_verified'});return;}
    await audit(pool,p,'WHATSAPP_CONNECTION_ENABLED','organization',p.orgId);
    res.json({enabled:true,deliveryEnabled:process.env.WHATSAPP_SEND_ENABLED==='true'});
  }));
  app.post('/api/whatsapp/connection/disable',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!isOwner(p,res))return;
    await transaction(async db=>{
      await db.query('UPDATE whatsapp_accounts SET enabled=false,updated_at=now() WHERE organization_id=$1',[p.orgId]);
      await db.query("UPDATE whatsapp_outbox SET state='blocked',last_error='account_disabled',updated_at=now() "+
        "WHERE organization_id=$1 AND state='queued'",[p.orgId]);
      await audit(db,p,'WHATSAPP_CONNECTION_DISABLED','organization',p.orgId);
    });
    res.json({enabled:false});
  }));
  app.get('/api/whatsapp/consents',sessions,route(async(req,res)=>{
    const p=who(req);
    const q=await pool.query(
      'SELECT c.id AS client_id,c.name,c.phone,c.status AS client_status,'+
      'coalesce(w.granted,false) AS granted,coalesce(w.version,0)::int AS version,'+
      'w.phone_snapshot,w.source,w.updated_at FROM clients c '+
      'LEFT JOIN whatsapp_consents w ON w.client_id=c.id AND w.organization_id=c.organization_id '+
      'WHERE c.organization_id=$1 ORDER BY c.created_at DESC LIMIT 200',[p.orgId]);
    res.json({items:q.rows,legacyCheckboxIsNotEvidence:true});
  }));
  app.post('/api/whatsapp/clients/:id/consent',sessions,csrf,route(async(req,res)=>{
    const p=who(req),{id:clientId}=id.parse(req.params),b=consentRecord.parse(req.body);
    if(b.action==='grant'&&!isOwner(p,res))return;
    if(b.action==='grant'&&(!b.acknowledged||!b.evidenceReference||b.source==='client_request')){
      res.status(422).json({error:'documented_consent_evidence_required'});return;
    }
    const result=await transaction(async db=>{
      const client=await db.query('SELECT phone,status FROM clients WHERE organization_id=$1 AND id=$2 FOR UPDATE',
        [p.orgId,clientId]);
      if(!client.rowCount)return null;
      if(b.action==='grant'&&client.rows[0].status!=='active')return {error:'client_archived'};
      const before=await db.query('SELECT version FROM whatsapp_consents WHERE organization_id=$1 AND client_id=$2 FOR UPDATE',
        [p.orgId,clientId]);
      const version=Number(before.rows[0]?.version??0)+1,granted=b.action==='grant';
      const rawPhone=String(client.rows[0].phone).replace(/[^0-9]/g,'');
      await db.query(
        'INSERT INTO whatsapp_consents(organization_id,client_id,version,granted,source,evidence_reference,phone_snapshot,recorded_by,granted_at,revoked_at) '+
        'VALUES($1,$2,$3,$4,$5,$6,$7,$8,CASE WHEN $4 THEN now() ELSE NULL END,CASE WHEN $4 THEN NULL ELSE now() END) '+
        'ON CONFLICT(organization_id,client_id) DO UPDATE SET version=excluded.version,granted=excluded.granted,'+
        'source=excluded.source,evidence_reference=excluded.evidence_reference,phone_snapshot=excluded.phone_snapshot,'+
        'recorded_by=excluded.recorded_by,granted_at=excluded.granted_at,revoked_at=excluded.revoked_at,updated_at=now()',
        [p.orgId,clientId,version,granted,b.source,b.evidenceReference??null,rawPhone,p.userId]);
      await db.query(
        'INSERT INTO whatsapp_consent_events(id,organization_id,client_id,version,granted,source,evidence_reference,phone_snapshot,recorded_by) '+
        'VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [randomUUID(),p.orgId,clientId,version,granted,b.source,b.evidenceReference??null,rawPhone,p.userId]);
      if(!granted){
        await db.query("UPDATE whatsapp_outbox SET state='blocked',last_error='consent_revoked',updated_at=now() "+
          "WHERE organization_id=$1 AND client_id=$2 AND state='queued'",[p.orgId,clientId]);
      }
      await audit(db,p,granted?'WHATSAPP_CONSENT_RECORDED':'WHATSAPP_CONSENT_REVOKED','client',clientId,
        {version,source:b.source,proofRecorded:Boolean(b.evidenceReference)});
      return {clientId,granted,version,phoneSnapshot:rawPhone,sendEnabled:false};
    });
    if(!result){res.status(404).json({error:'client_not_found'});return;}
    if('error' in result){res.status(409).json(result);return;}
    res.json(result);
  }));
  app.get('/api/whatsapp/outbox',sessions,route(async(req,res)=>{
    const p=who(req),q=z.object({
      limit:z.coerce.number().int().min(1).max(100).default(50)
    }).strict().parse(req.query);
    const rows=await pool.query(
      'SELECT o.id,o.charge_id,o.client_id,c.name AS client_name,t.name AS template_name,'+
      'o.kind,o.state,o.attempts,o.last_error,o.created_at,o.updated_at,'+
      'o.sent_at,o.provider_message_id FROM whatsapp_outbox o '+
      'JOIN clients c ON c.id=o.client_id AND c.organization_id=o.organization_id '+
      'JOIN whatsapp_templates t ON t.id=o.template_id AND t.organization_id=o.organization_id '+
      'WHERE o.organization_id=$1 ORDER BY o.created_at DESC LIMIT $2',
      [p.orgId,q.limit]);
    res.json({items:rows.rows,deliveryEnabled:process.env.WHATSAPP_SEND_ENABLED==='true',
      acceptedIsNotDelivered:true});
  }));
  app.post('/api/whatsapp/messages/queue',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!isOwner(p,res))return;
    const b=z.object({chargeId:z.uuid(),templateId:z.uuid()}).strict().parse(req.body);
    const result=await transaction(async db=>{
      const charge=await db.query(
        'SELECT ch.id,ch.client_id,ch.status,ch.provider,cl.status AS client_status,cl.phone,'+
        'w.granted,w.version,w.phone_snapshot,wt.approved,wt.verified_at,wa.enabled '+
        'FROM charges ch JOIN clients cl ON cl.id=ch.client_id AND cl.organization_id=ch.organization_id '+
        'LEFT JOIN whatsapp_consents w ON w.client_id=ch.client_id AND w.organization_id=ch.organization_id '+
        'JOIN whatsapp_templates wt ON wt.id=$3 AND wt.organization_id=ch.organization_id '+
        'JOIN whatsapp_accounts wa ON wa.organization_id=ch.organization_id '+
        'WHERE ch.organization_id=$1 AND ch.id=$2 FOR UPDATE OF ch',
        [p.orgId,b.chargeId,b.templateId]);
      if(!charge.rowCount)return {error:'charge_or_template_not_found'};
      const row=charge.rows[0];
      const phone=String(row.phone).replace(/[^0-9]/g,'');
      if(!['pending','overdue'].includes(row.status)||row.client_status!=='active')
        return {error:'charge_not_collectible'};
      if(!row.granted||String(row.phone_snapshot)!==phone)
        return {error:'current_documented_consent_required'};
      if(!row.enabled||!row.approved||Date.now()-new Date(row.verified_at).getTime()>86400000)
        return {error:'meta_template_or_connection_not_verified'};
      const duplicate=await db.query('SELECT id,state FROM whatsapp_outbox WHERE organization_id=$1 AND charge_id=$2 AND kind=$3',
        [p.orgId,b.chargeId,'due_reminder']);
      if(duplicate.rowCount)return {...duplicate.rows[0],alreadyQueued:true};
      const id=randomUUID();
      await db.query(
        "INSERT INTO whatsapp_outbox(id,organization_id,client_id,charge_id,template_id,kind,consent_version,target_phone,created_by) "+
        "VALUES($1,$2,$3,$4,$5,'due_reminder',$6,$7,$8)",
        [id,p.orgId,row.client_id,b.chargeId,b.templateId,Number(row.version),phone,p.userId]);
      await audit(db,p,'WHATSAPP_MESSAGE_QUEUED','charge',b.chargeId,{templateId:b.templateId});
      return {id,state:'queued',alreadyQueued:false,sendEnabled:false};
    });
    if('error' in result){res.status(409).json(result);return;}
    res.status(result.alreadyQueued?200:201).json(result);
  }));
}
