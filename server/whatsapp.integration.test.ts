import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac,randomBytes,randomUUID} from 'node:crypto';
import type {AddressInfo} from 'node:net';

process.env.CF_NO_LISTEN='true';
process.env.WHATSAPP_CREDENTIAL_ENCRYPTION_KEY=randomBytes(32).toString('hex');
process.env.META_APP_SECRET='meta_app_secret_for_signed_test';
process.env.META_WEBHOOK_VERIFY_TOKEN='test_verify_token_32_chars_long_123';
process.env.WHATSAPP_SEND_ENABLED='false';
process.env.WHATSAPP_SEND_SCOPE='test';
process.env.WHATSAPP_TEST_RECIPIENT_ALLOWLIST='5511999001010';

const oldFetch=globalThis.fetch.bind(globalThis);
const businessPhone='123456789098765',waba='987654321012345';
let sent=0;
let apiBase='';
function webhookBody(statuses?:Array<{id:string;status:string;timestamp:string}>,messages?:Array<{id:string;from:string;type:string;text:{body:string}}>){
  return {object:'whatsapp_business_account',entry:[{changes:[{
    value:{metadata:{phone_number_id:businessPhone},...(statuses?{statuses}:{}),
      ...(messages?{messages}:{})}
  }]}]};
}
async function signedWebhook(body:unknown,valid=true){
  const raw=JSON.stringify(body),sig='sha256='+createHmac('sha256',valid?process.env.META_APP_SECRET!:'invalid')
    .update(raw).digest('hex');
  return oldFetch(apiBase+'/webhooks/meta-whatsapp',{
    method:'POST',headers:{'Content-Type':'application/json','X-Hub-Signature-256':sig},body:raw
  });
}
globalThis.fetch=(async(input:URL|Request|string,init?:RequestInit):Promise<Response>=>{
  const url=String(input);
  if(!url.startsWith('https://graph.facebook.com/v27.0/'))return oldFetch(input,init);
  const parsed=new URL(url),method=init?.method??'GET';
  if(parsed.pathname==='/v27.0/'+waba+'/message_templates'&&method==='GET'){
    return new Response(JSON.stringify({data:[
      {name:'cobranca_lembrete',language:'pt_BR',status:'APPROVED',category:'UTILITY',
        components:[{type:'BODY',text:'Olá {{1}}, sobre {{2}}, vencimento {{3}}.'}]},
      {name:'promo',language:'pt_BR',status:'APPROVED',category:'MARKETING',
        components:[{type:'BODY',text:'{{1}} {{2}} {{3}}'}]}
    ]}),{status:200,headers:{'Content-Type':'application/json'}});
  }
  if(parsed.pathname==='/v27.0/'+businessPhone+'/messages'&&method==='POST'){
    sent++;
    const payload=JSON.parse(String(init?.body));
    assert.equal(payload.type,'template');
    assert.equal(payload.template.components[0].parameters.length,3);
    const id='wamid.testid'+sent+'abcdefgh';
    const when=String(Math.floor(Date.now()/1000));
    // Delivery arrives before HTTP acknowledgement, requiring durable buffering.
    const hook=await signedWebhook(webhookBody([
      {id,status:'delivered',timestamp:when},{id,status:'sent',timestamp:when},
      {id,status:'read',timestamp:when}
    ]));
    assert.equal(hook.status,200);
    return new Response(JSON.stringify({messages:[{id}]}),{
      status:200,headers:{'Content-Type':'application/json'}
    });
  }
  return new Response(JSON.stringify({error:{message:'unmocked meta path'}}),{status:404});
}) as typeof fetch;

const {app}=await import('./index');
app.set('trust proxy',1); // Only in isolated CI test process, never in production configuration.
const {pool}=await import('./db');
const {runWhatsAppBatch}=await import('./whatsapp-worker');
const server=app.listen(0,'127.0.0.1');
await new Promise<void>(resolve=>server.once('listening',resolve));
apiBase='http://127.0.0.1:'+(server.address() as AddressInfo).port+'/api';
async function call(path:string,method='GET',data?:unknown,cookie='',csrf=''){
  const r=await oldFetch(apiBase+path,{
    method,headers:{'X-Forwarded-For':'198.51.100.60',
      ...(data?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),
      ...(csrf?{'X-CF-CSRF':csrf}:{})},
    body:data?JSON.stringify(data):undefined
  });
  return {status:r.status,body:await r.json(),
    cookie:(r.headers.get('set-cookie')??'').split(';')[0]};
}
async function owner(label:string){
  const email='meta'+randomUUID().slice(0,10)+'@example.com';
  const r=await call('/auth/register','POST',{name:'Titular '+label,
    businessName:'Conta WhatsApp '+label,email,password:'SenhaMetaBusiness#2026'});
  assert.equal(r.status,201,JSON.stringify(r.body));
  await pool.query('UPDATE users SET email_verified_at=now() WHERE email=$1',[email]);
  const login=await call('/auth/login','POST',{email,password:'SenhaMetaBusiness#2026'});
  assert.equal(login.status,200);
  const me=await call('/auth/me','GET',undefined,login.cookie);
  assert.equal(me.status,200);
  return {cookie:login.cookie,csrf:me.body.csrfToken,orgId:me.body.organizationId};
}
async function chargeFor(user:{cookie:string;csrf:string;orgId:string},clientId:string){
  const ch=await call('/charges','POST',{clientId,description:'Mensalidade de teste',
    amountCents:25000,dueDate:'2026-12-31'},user.cookie,user.csrf);
  assert.equal(ch.status,201,JSON.stringify(ch.body));
  await pool.query("UPDATE charges SET status='pending',provider='asaas_sandbox' WHERE id=$1",[ch.body.id]);
  return ch.body.id as string;
}
test('Meta Cloud: canonical opt-in, signed webhooks, no blind sends, pre-ack callbacks and multi-tenancy',async()=>{
 try{
   const a=await owner('A'),b=await owner('B');
   const client=await call('/clients','POST',{name:'Pagadora Teste',phone:'+5511999001010',
     whatsappOptIn:true},a.cookie,a.csrf);
   assert.equal(client.status,201);
   const clientId=client.body.id as string;
   const chargeId=await chargeFor(a,clientId);
   const conn=await call('/whatsapp/connection','PUT',{
     wabaId:waba,phoneNumberId:businessPhone,
     accessToken:'EAA_fake_long_lived_meta_token_test_1234567890'
   },a.cookie,a.csrf);
   assert.equal(conn.status,200,JSON.stringify(conn.body));
   assert.equal((await call('/whatsapp/connection','GET',undefined,b.cookie)).body.configured,false);
   const stored=await pool.query('SELECT access_token_ciphertext,enabled FROM whatsapp_accounts WHERE organization_id=$1',[a.orgId]);
   assert.notEqual(stored.rows[0].access_token_ciphertext,'EAA_fake_long_lived_meta_token_test_1234567890');
   assert.equal(stored.rows[0].enabled,false);
   assert.equal((await call('/whatsapp/connection/enable','POST',{},a.cookie,a.csrf)).status,409);
   const synced=await call('/whatsapp/templates/sync','POST',{},a.cookie,a.csrf);
   assert.equal(synced.status,200,JSON.stringify(synced.body));
   assert.equal(synced.body.verified,1);
   assert.equal((await call('/whatsapp/connection/enable','POST',{},a.cookie,a.csrf)).status,200);
   const templates=await call('/whatsapp/templates','GET',undefined,a.cookie);
   const templateId=templates.body.items[0].id as string;
   assert.equal((await call('/whatsapp/messages/queue','POST',{chargeId,templateId},a.cookie,a.csrf)).status,409);
   assert.equal((await call('/whatsapp/clients/'+clientId+'/consent','POST',{
     action:'grant',source:'signed_form',acknowledged:true},a.cookie,a.csrf)).status,422);
   assert.equal((await call('/whatsapp/clients/'+clientId+'/consent','POST',{
     action:'grant',source:'signed_form',evidenceReference:'signed-proof-sample-00001',acknowledged:true},b.cookie,b.csrf)).status,404);
   const consent=await call('/whatsapp/clients/'+clientId+'/consent','POST',{
     action:'grant',source:'signed_form',evidenceReference:'signed-proof-sample-00001',acknowledged:true
   },a.cookie,a.csrf);
   assert.equal(consent.status,200,JSON.stringify(consent.body));
   const queued=await call('/whatsapp/messages/queue','POST',{chargeId,templateId},a.cookie,a.csrf);
   assert.equal(queued.status,201,JSON.stringify(queued.body));
   const duplicate=await call('/whatsapp/messages/queue','POST',{chargeId,templateId},a.cookie,a.csrf);
   assert.equal(duplicate.status,200,JSON.stringify(duplicate.body));
   assert.equal(duplicate.body.id,queued.body.id);
   assert.equal((await call('/whatsapp/outbox','GET',undefined,b.cookie)).body.items.length,0);
   assert.equal((await call('/whatsapp/messages/queue','POST',{chargeId,templateId},b.cookie,b.csrf)).status,409);
   assert.equal((await call('/whatsapp/messages/queue','POST',{chargeId,templateId},a.cookie)).status,403);
   const hookPath='/webhooks/meta-whatsapp';
   const verify=await oldFetch(apiBase+hookPath+'?hub.mode=subscribe&hub.verify_token='+
     process.env.META_WEBHOOK_VERIFY_TOKEN+'&hub.challenge=TEST_CHALLENGE_123');
   assert.equal(verify.status,200);
   assert.equal(await verify.text(),'TEST_CHALLENGE_123');
   const invalid=await signedWebhook(webhookBody(undefined,[{id:'wamid.optout1abcdef',from:'5511999001010',type:'text',text:{body:'PARAR'}}]),false);
   assert.equal(invalid.status,403);
   const stop=webhookBody(undefined,[{id:'wamid.optout1abcdef',from:'5511999001010',type:'text',text:{body:'PARAR'}}]);
   assert.equal((await signedWebhook(stop)).status,200);
   assert.equal((await signedWebhook(stop)).status,200,'duplicate inbound webhook must not increment consent version');
   const revoked=await pool.query('SELECT granted,version FROM whatsapp_consents WHERE organization_id=$1 AND client_id=$2',
     [a.orgId,clientId]);
   assert.equal(revoked.rows[0].granted,false);
   assert.equal(Number(revoked.rows[0].version),2);
   const blocked=await pool.query('SELECT state FROM whatsapp_outbox WHERE id=$1',[queued.body.id]);
   assert.equal(blocked.rows[0].state,'blocked');
   assert.equal(sent,0);
   // Regrant with a new verifiable reference, then enqueue a different charge.
   assert.equal((await call('/whatsapp/clients/'+clientId+'/consent','POST',{
     action:'grant',source:'web_form',evidenceReference:'checkout-consent-version-2026-001',acknowledged:true
   },a.cookie,a.csrf)).status,200);
   const secondCharge=await chargeFor(a,clientId);
   assert.equal((await call('/whatsapp/messages/queue','POST',{
     chargeId:secondCharge,templateId},a.cookie,a.csrf)).status,201);
   assert.rejects(()=>runWhatsAppBatch(10),/whatsapp_send_disabled/);
   process.env.WHATSAPP_SEND_ENABLED='true';
   const sunday=await runWhatsAppBatch(10,new Date('2026-11-22T13:00:00Z'));
   assert.equal(sunday.examined,0);
   const work=await runWhatsAppBatch(10,new Date('2026-11-23T13:00:00Z'));
   assert.equal(work.accepted,1,JSON.stringify(work));
   assert.equal(sent,1);
   const delivered=await pool.query('SELECT state,provider_message_id FROM whatsapp_outbox WHERE charge_id=$1',[secondCharge]);
   assert.equal(delivered.rows[0].state,'read','callback buffered before HTTP ack must be replayed');
   const receiptCount=await pool.query('SELECT count(*)::int AS total FROM whatsapp_delivery_events WHERE outbox_id IN '+
     '(SELECT id FROM whatsapp_outbox WHERE charge_id=$1)',[secondCharge]);
   assert.equal(Number(receiptCount.rows[0].total),3);
   const lateFailed=await signedWebhook(webhookBody([{id:delivered.rows[0].provider_message_id,
     status:'failed',timestamp:String(Math.floor(Date.now()/1000)+2)}]));
   assert.equal(lateFailed.status,200);
   const later=await pool.query('SELECT state FROM whatsapp_outbox WHERE charge_id=$1',[secondCharge]);
   assert.equal(later.rows[0].state,'read','late failed status never downgrades proved read');
   const thirdCharge=await chargeFor(a,clientId);
   assert.equal((await call('/whatsapp/messages/queue','POST',{
     chargeId:thirdCharge,templateId},a.cookie,a.csrf)).status,201);
   const throttled=await runWhatsAppBatch(10,new Date('2026-11-23T13:00:00Z'));
   assert.equal(throttled.deferred,1,'no more than one request per recipient per 24 hours');
   assert.equal(sent,1);
   const allA=await call('/whatsapp/outbox','GET',undefined,a.cookie);
   assert.ok(allA.body.items.length>=3);
   assert.equal((await call('/whatsapp/outbox','GET',undefined,b.cookie)).body.items.length,0);
 }finally{
  process.env.WHATSAPP_SEND_ENABLED='false';
  await new Promise<void>((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
  await pool.end();
 }
});
