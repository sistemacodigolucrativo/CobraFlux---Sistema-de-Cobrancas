import {randomUUID} from 'node:crypto';
import type {Express,Request,Response,RequestHandler} from 'express';
import {z} from 'zod';
import {pool,transaction} from './db';
import {secureEquals,sha256} from './security';
import {AsaasSandbox,credentialsReady,decryptApiKey,encryptApiKey} from './asaas-sandbox';
import {applySandboxEvent,providerEvent,providerMoneyCents,type ChargeStatus} from './asaas-events';
import {trustedAsaasReceipt} from './sandbox-reconciliation';

type Principal={userId:string;orgId:string;role:string;email:string;name:string;token:string};
type Deps={
  sessions:RequestHandler;csrf:RequestHandler;
  who:(req:Request)=>Principal;
  route:(fn:(req:Request,res:Response)=>Promise<unknown>)=>RequestHandler;
};
type Account={id:string;organization_id:string;api_key_ciphertext:string;webhook_token_hash:string;enabled:boolean};
const chargeParam=z.object({id:z.uuid()});
const accountParam=z.object({accountId:z.uuid()});
function requireOwner(p:Principal,res:Response):boolean{
  if(p.role==='owner'||p.role==='super_admin')return true;
  res.status(403).json({error:'owner_role_required'});return false;
}
function responseError(e:unknown):string{
  return e instanceof Error?e.message:'provider_unavailable';
}
async function audit(db:{query:Function},p:Principal,action:string,entityId:string,meta:object={}){
  await db.query('INSERT INTO audit_logs(id,organization_id,actor_id,action,entity_type,entity_id,metadata) '+
    'VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)',
    [randomUUID(),p.orgId,p.userId,action,'sandbox_payment',entityId,JSON.stringify(meta)]);
}
async function accountForOrg(orgId:string):Promise<Account|null>{
  const q=await pool.query('SELECT id,organization_id,api_key_ciphertext,webhook_token_hash,enabled '+
    'FROM sandbox_payment_accounts WHERE organization_id=$1 AND enabled=true',[orgId]);
  return q.rows[0]??null;
}
async function customerForCharge(api:AsaasSandbox,account:Account,client:{
  id:string;name:string;email:string|null;phone:string
}):Promise<string>{
  const claim=await transaction(async db=>{
    const existing=await db.query('SELECT provider_customer_id,state FROM sandbox_customers '+
      'WHERE account_id=$1 AND client_id=$2 FOR UPDATE',[account.id,client.id]);
    if(existing.rowCount){
      if(existing.rows[0].state==='ready'&&existing.rows[0].provider_customer_id)
        return {providerId:existing.rows[0].provider_customer_id as string,created:false};
      return {providerId:null,created:false};
    }
    await db.query("INSERT INTO sandbox_customers(organization_id,account_id,client_id,state) VALUES($1,$2,$3,'reserved')",
      [account.organization_id,account.id,client.id]);
    return {providerId:null,created:true};
  });
  if(claim.providerId)return claim.providerId;
  if(!claim.created)throw new Error('sandbox_customer_reconciliation_required');
  try{
    const found=await api.customerByReference(client.id);
    const providerId=found??await api.createCustomer({
      clientId:client.id,name:client.name,email:client.email,phone:client.phone
    });
    await pool.query("UPDATE sandbox_customers SET provider_customer_id=$1,state='ready' "+
      'WHERE account_id=$2 AND client_id=$3',[providerId,account.id,client.id]);
    return providerId;
  }catch(e){
    await pool.query("UPDATE sandbox_customers SET state='reconcile_required' "+
      'WHERE account_id=$1 AND client_id=$2 AND state=$3',[account.id,client.id,'reserved']);
    throw e;
  }
}
async function finishIssue(p:Principal,chargeId:string,account:Account,api:AsaasSandbox,
  providerPaymentId:string,expectedCents:number){
  const qr=await api.getQrCode(providerPaymentId);
  await transaction(async db=>{
    const row=await db.query('SELECT status,amount_cents,discount_cents FROM charges '+
      'WHERE id=$1 AND organization_id=$2 FOR UPDATE',[chargeId,p.orgId]);
    if(!row.rowCount)throw new Error('charge_not_found');
    if(Number(row.rows[0].amount_cents)-Number(row.rows[0].discount_cents)!==expectedCents)
      throw new Error('amount_changed_during_issuance');
    await db.query("UPDATE sandbox_issuances SET state='ready',provider_payment_id=$3,updated_at=now() "+
      'WHERE charge_id=$1 AND account_id=$2 AND (provider_payment_id IS NULL OR provider_payment_id=$3)',[chargeId,account.id,providerPaymentId]);
    await db.query("UPDATE charges SET provider='asaas_sandbox',provider_charge_id=$3,pix_payload=$4,"+
      "status=CASE WHEN status='pending_provider' THEN 'pending' ELSE status END,updated_at=now() "+
      'WHERE id=$1 AND organization_id=$2 AND (provider_charge_id IS NULL OR provider_charge_id=$3)',
      [chargeId,p.orgId,providerPaymentId,qr.payload]);
    await db.query('INSERT INTO charge_history(id,organization_id,charge_id,actor_id,action,details) '+
      "VALUES($1,$2,$3,$4,'SANDBOX_PIX_ISSUED',$5::jsonb)",
      [randomUUID(),p.orgId,chargeId,p.userId,JSON.stringify({provider:'asaas_sandbox'})]);
    await audit(db,p,'SANDBOX_PIX_ISSUED',chargeId);
  });
  return {id:chargeId,status:'sandbox_issued',paymentEnabled:true,sandboxOnly:true};
}
function apiFor(account:Account):AsaasSandbox{
  if(!credentialsReady())throw new Error('payment_credentials_key_not_configured');
  return new AsaasSandbox(decryptApiKey(account.api_key_ciphertext,account.organization_id));
}
export function registerSandboxPayments(app:Express,{sessions,csrf,route,who}:Deps):void{
  app.get('/api/sandbox/connection',sessions,route(async(req,res)=>{
    const p=who(req);const account=await accountForOrg(p.orgId);
    res.json({configured:!!account,provider:'asaas_sandbox',sandboxOnly:true,
      webhookPath:account?'/api/webhooks/asaas-sandbox/'+account.id:null});
  }));
  app.get('/api/public/charges/:publicToken/sandbox-qr',route(async(req,res)=>{
    const token=z.string().min(20).max(120).parse(req.params.publicToken);
    const q=await pool.query('SELECT ch.provider_charge_id,sp.organization_id,sp.api_key_ciphertext,sp.id,sp.webhook_token_hash,sp.enabled '+
      'FROM charges ch JOIN sandbox_issuances si ON si.charge_id=ch.id '+
      'JOIN sandbox_payment_accounts sp ON sp.id=si.account_id AND sp.organization_id=ch.organization_id '+
      "WHERE ch.public_token=$1 AND ch.provider='asaas_sandbox' AND ch.status='pending' AND si.state='ready' AND sp.enabled=true",[token]);
    if(!q.rowCount){res.status(404).json({error:'sandbox_qr_not_available'});return;}
    try{
      const api=apiFor(q.rows[0] as Account);
      const qr=await api.getQrCode(q.rows[0].provider_charge_id);
      res.json({payload:qr.payload,...(qr.encodedImage?{encodedImage:qr.encodedImage}:{}),sandboxOnly:true});
    }catch(e){
      console.error('sandbox_qr_unavailable',responseError(e));
      res.status(502).json({error:'sandbox_qr_unavailable'});
    }
  }));
  app.put('/api/sandbox/connection',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!requireOwner(p,res))return;
    if(!credentialsReady()){res.status(503).json({error:'payment_credentials_key_not_configured'});return;}
    const body=z.object({
      apiKey:z.string().min(30).max(400),
      webhookToken:z.string().min(32).max(255).regex(/^\S+$/),
    }).strict().parse(req.body);
    if(secureEquals(body.apiKey,body.webhookToken)){
      res.status(400).json({error:'webhook_token_must_be_distinct'});return;
    }
    const output=await transaction(async db=>{
      const existing=await db.query('SELECT id FROM sandbox_payment_accounts '+
        'WHERE organization_id=$1 FOR UPDATE',[p.orgId]);
      if(existing.rowCount){
        const used=await db.query('SELECT 1 FROM sandbox_issuances WHERE account_id=$1 LIMIT 1',[existing.rows[0].id]);
        if(used.rowCount)return {error:'account_rotation_requires_manual_review'} as const;
        await db.query("UPDATE sandbox_payment_accounts SET api_key_ciphertext=$2,webhook_token_hash=$3,enabled=true,updated_at=now() WHERE id=$1",
          [existing.rows[0].id,encryptApiKey(body.apiKey,p.orgId),sha256(body.webhookToken)]);
        await audit(db,p,'SANDBOX_PSP_CONFIG_UPDATED',existing.rows[0].id);
        return {id:existing.rows[0].id};
      }
      const id=randomUUID();
      await db.query('INSERT INTO sandbox_payment_accounts(id,organization_id,api_key_ciphertext,webhook_token_hash) '+
        'VALUES($1,$2,$3,$4)',[id,p.orgId,encryptApiKey(body.apiKey,p.orgId),sha256(body.webhookToken)]);
      await audit(db,p,'SANDBOX_PSP_CONFIG_CREATED',id);
      return {id};
    });
    if('error' in output){res.status(409).json(output);return;}
    res.json({configured:true,provider:'asaas_sandbox',sandboxOnly:true,
      webhookPath:'/api/webhooks/asaas-sandbox/'+output.id});
  }));
  app.post('/api/sandbox/charges/:id/issue',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!requireOwner(p,res))return;
    const {id}=chargeParam.parse(req.params);
    const account=await accountForOrg(p.orgId);
    if(!account||!credentialsReady()){res.status(503).json({error:'sandbox_provider_not_configured'});return;}
    const selection=await transaction(async db=>{
      const existing=await db.query('SELECT ch.id,ch.client_id,ch.description,ch.amount_cents,ch.discount_cents,ch.due_date,ch.status,'+
        'cl.name AS client_name,cl.phone AS client_phone,cl.email AS client_email,cl.status AS client_status '+
        'FROM charges ch JOIN clients cl ON cl.id=ch.client_id AND cl.organization_id=ch.organization_id '+
        'WHERE ch.id=$1 AND ch.organization_id=$2 FOR UPDATE OF ch',[id,p.orgId]);
      if(!existing.rowCount)return null;
      const ch=existing.rows[0];
      if(ch.status!=='draft'||ch.client_status!=='active')return {error:'charge_not_issuable'} as const;
      const money=Number(ch.amount_cents)-Number(ch.discount_cents);
      const reserve=await db.query("UPDATE charges SET status='pending_provider',provider='asaas_sandbox',updated_at=now() "+
        "WHERE id=$1 AND organization_id=$2 AND status='draft' RETURNING id",[id,p.orgId]);
      if(!reserve.rowCount)return {error:'charge_already_claimed'} as const;
      await db.query("INSERT INTO sandbox_issuances(id,organization_id,account_id,charge_id,state,expected_cents) "+
        "VALUES($1,$2,$3,$4,'reserved',$5)",[randomUUID(),p.orgId,account.id,id,money]);
      await audit(db,p,'SANDBOX_PIX_RESERVED',id);
      return {...ch,expectedCents:money};
    });
    if(!selection){res.status(404).json({error:'not_found'});return;}
    if('error' in selection){res.status(409).json(selection);return;}
    let paymentId:string|null=null;
    try{
      const api=apiFor(account);
      const customerId=await customerForCharge(api,account,{
        id:selection.client_id,name:selection.client_name,email:selection.client_email,phone:selection.client_phone
      });
      await pool.query('UPDATE sandbox_issuances SET provider_customer_id=$2 WHERE charge_id=$1',[id,customerId]);
      const previous=await api.paymentByReference(id);
      const created=previous??await api.createPayment({
        chargeId:id,customerId,amountCents:selection.expectedCents,
        description:selection.description,dueDate:String(selection.due_date).slice(0,10)
      });
      if(created.value!==undefined&&providerMoneyCents(created.value)!==selection.expectedCents)
        throw new Error('provider_amount_mismatch');
      paymentId=created.id;
      const linked=await pool.query('UPDATE sandbox_issuances SET provider_payment_id=$2 WHERE charge_id=$1 '+
        'AND (provider_payment_id IS NULL OR provider_payment_id=$2) RETURNING id',[id,paymentId]);
      if(!linked.rowCount)throw new Error('conflicting_provider_payment_id');
      const result=await finishIssue(p,id,account,api,paymentId,selection.expectedCents);
      res.status(201).json(result);
    }catch(e){
      await pool.query("UPDATE sandbox_issuances SET state='reconcile_required',"+
        'provider_payment_id=coalesce(provider_payment_id,$2),updated_at=now() WHERE charge_id=$1',
        [id,paymentId]);
      // No blind retry. The PSP may have accepted the request despite a network timeout.
      console.error('sandbox_issue_reconcile_required',responseError(e));
      res.status(502).json({error:'sandbox_issuance_requires_reconciliation',
        message:'Resultado externo inconclusivo. Consulte a reconciliação; não emita novamente.'});
    }
  }));
  app.post('/api/sandbox/charges/:id/reconcile',sessions,csrf,route(async(req,res)=>{
    const p=who(req);if(!requireOwner(p,res))return;
    const {id}=chargeParam.parse(req.params);
    const q=await pool.query('SELECT si.*,ch.status FROM sandbox_issuances si '+
      'JOIN charges ch ON ch.id=si.charge_id WHERE si.charge_id=$1 AND si.organization_id=$2',[id,p.orgId]);
    if(!q.rowCount){res.status(404).json({error:'not_found'});return;}
    const issue=q.rows[0];
    if(issue.state==='ready'){res.json({id,status:issue.status,sandboxOnly:true,alreadyReady:true});return;}
    const account=await accountForOrg(p.orgId);
    if(!account||account.id!==issue.account_id){res.status(409).json({error:'provider_not_available'});return;}
    try{
      const api=apiFor(account);
      const result=issue.provider_payment_id
        ?{id:issue.provider_payment_id,value:undefined}
        :await api.paymentByReference(id);
      if(!result){res.status(409).json({error:'external_payment_not_found_manual_review_required'});return;}
      if(result.value!==undefined&&providerMoneyCents(result.value)!==Number(issue.expected_cents)){
        res.status(409).json({error:'provider_amount_mismatch'});return;
      }
      const finished=await finishIssue(p,id,account,api,result.id,Number(issue.expected_cents));
      res.json({...finished,reconciled:true});
    }catch(e){
      console.error('sandbox_reconcile_failed',responseError(e));
      res.status(502).json({error:'sandbox_reconcile_unavailable'});
    }
  }));

  // A public, opaque account ID chooses the correct tenant; bearer auth is ONLY the Asaas webhook authToken.
  app.post('/api/webhooks/asaas-sandbox/:accountId',route(async(req,res)=>{
    const {accountId}=accountParam.parse(req.params);
    const auth=req.get('asaas-access-token')??'';
    if(auth.length<32||auth.length>255){res.status(401).json({error:'webhook_unauthorized'});return;}
    const q=await pool.query('SELECT id,organization_id,webhook_token_hash FROM sandbox_payment_accounts '+
      'WHERE id=$1 AND enabled=true',[accountId]);
    if(!q.rowCount||!secureEquals(sha256(auth),q.rows[0].webhook_token_hash)){
      res.status(401).json({error:'webhook_unauthorized'});return;
    }
    const event=providerEvent.parse(req.body);
    const ref=event.payment.externalReference;
    if(!ref){res.status(200).json({ok:true,ignored:'no_external_reference'});return;}
    const org=q.rows[0].organization_id;
    const result=await transaction(async db=>{
      const ch=await db.query(
        'SELECT ch.id,ch.status,ch.amount_cents,ch.discount_cents,ch.paid_cents,'+
        'si.provider_payment_id,si.expected_cents FROM charges ch '+
        'JOIN sandbox_issuances si ON si.charge_id=ch.id AND si.account_id=$3 '+
        "WHERE ch.id=$1 AND ch.organization_id=$2 AND ch.provider='asaas_sandbox' "+
        'FOR UPDATE OF ch,si',[ref,org,accountId]
      );
      if(!ch.rowCount)return {result:'unmatched'};
      const row=ch.rows[0];
      if(row.provider_payment_id&&row.provider_payment_id!==event.payment.id)return {result:'payment_id_mismatch'};
      const unique=await db.query('INSERT INTO payment_events(id,charge_id,provider,provider_event_id,event_type,'+
        'event_payload,organization_id,processing_result) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7,$8) '+
        'ON CONFLICT(provider,provider_event_id) DO NOTHING RETURNING id',
        [randomUUID(),ref,'asaas_sandbox',event.id,event.event,
          JSON.stringify({paymentId:event.payment.id,status:event.payment.status??null,
            value:event.payment.value??null,externalReference:ref}),org,'received']);
      if(!unique.rowCount)return {result:'duplicate'};
      const expected=Number(row.amount_cents)-Number(row.discount_cents);
      const decision=applySandboxEvent(row.status as ChargeStatus,Number(row.paid_cents),expected,event);
      await db.query('UPDATE payment_events SET processing_result=$2 WHERE id=$1',
        [unique.rows[0].id,decision.result]);
      if(decision.result==='received'){
        const receipt=trustedAsaasReceipt(event.payment.transactionReceiptUrl);
        if(receipt){
          await db.query('UPDATE sandbox_issuances SET payment_receipt_url=coalesce(payment_receipt_url,$2) '+
            'WHERE charge_id=$1 AND account_id=$3',[ref,receipt,accountId]);
        }
      }
      if(decision.result==='refund_reconciliation_required'||event.event==='PAYMENT_REFUND_DENIED'){
        await db.query('UPDATE sandbox_issuances SET refund_sync_required=true,reconcile_due_at=now(),updated_at=now() '+
          'WHERE charge_id=$1 AND account_id=$2',[ref,accountId]);
      }
      if(decision.result==='provider_risk_manual_review'){
        const code=event.event.includes('CHARGEBACK')||event.event==='PAYMENT_AWAITING_CHARGEBACK_REVERSAL'
          ?'provider_chargeback_event'
          :event.event==='PAYMENT_REFUND_DENIED'?'provider_refund_denied':'provider_risk_event';
        await db.query('UPDATE sandbox_issuances SET review_required=true,review_reason=$3,'+
          'reconcile_due_at=now(),updated_at=now() WHERE charge_id=$1 AND account_id=$2',
          [ref,accountId,code]);
        await db.query('INSERT INTO sandbox_reconciliation_incidents(id,organization_id,charge_id,code) '+
          'VALUES($1,$2,$3,$4) ON CONFLICT(organization_id,charge_id,code) '+
          'DO UPDATE SET last_seen_at=now(),resolved_at=NULL',
          [randomUUID(),org,ref,code]);
      }
      if(!row.provider_payment_id){
        await db.query('UPDATE sandbox_issuances SET provider_payment_id=$2 WHERE charge_id=$1',[ref,event.payment.id]);
      }
      await db.query('UPDATE charges SET provider_charge_id=coalesce(provider_charge_id,$3),'+
        'status=$4,paid_cents=$5,updated_at=now() WHERE id=$1 AND organization_id=$2',
        [ref,org,event.payment.id,decision.status,decision.paidCents]);
      await db.query('INSERT INTO charge_history(id,organization_id,charge_id,action,details) '+
        "VALUES($1,$2,$3,'SANDBOX_WEBHOOK',$4::jsonb)",
        [randomUUID(),org,ref,JSON.stringify({event:event.event,result:decision.result})]);
      return {result:decision.result};
    });
    res.status(200).json({ok:true,...result});
  }));
}
