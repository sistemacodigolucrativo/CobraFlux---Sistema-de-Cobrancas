import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import type {AddressInfo} from 'node:net';

process.env.CF_NO_LISTEN='true';
process.env.MFA_ENCRYPTION_KEY=randomBytes(32).toString('hex');
const {app}=await import('./index');
const {pool}=await import('./db');
const {createTotpSecret,encryptTotpSecret,totpCode}=await import('./totp');
app.set('trust proxy',1);
const server=app.listen(0,'127.0.0.1');
await new Promise<void>(resolve=>server.once('listening',resolve));
const base='http://127.0.0.1:'+(server.address() as AddressInfo).port+'/api';
type User={cookie:string;csrf:string;orgId:string;userId:string;email:string;password:string};
async function call(path:string,method='GET',body?:unknown,u?:Pick<User,'cookie'|'csrf'>,raw=false){
 const r=await fetch(base+path,{method,
  headers:{'X-Forwarded-For':'203.0.113.89','Origin':'http://localhost:3000',
   ...(body?{'Content-Type':'application/json'}:{}),...(u?{Cookie:u.cookie}:{}),
   ...(u?.csrf?{'X-CF-CSRF':u.csrf}:{})},
  body:body?JSON.stringify(body):undefined});
 return {status:r.status,body:raw?await r.text():await r.json(),headers:r.headers};
}
async function registered(name:string):Promise<User>{
 const email='f7'+randomUUID().slice(0,10)+'@example.com',password='SenhaDeTesteFase7#2026';
 const reg=await call('/auth/register','POST',{name, businessName:'Loja '+name,email,password});
 assert.equal(reg.status,201,JSON.stringify(reg.body));
 const q=await pool.query('UPDATE users SET email_verified_at=now() WHERE email=$1 RETURNING id',[email]);
 return {cookie:'',csrf:'',orgId:'',userId:q.rows[0].id,email,password};
}
async function signedIn(u:User,totp?:string):Promise<User>{
 const login=await fetch(base+'/auth/login',{method:'POST',headers:{
  'Content-Type':'application/json','X-Forwarded-For':'203.0.113.89','Origin':'http://localhost:3000'},
  body:JSON.stringify({email:u.email,password:u.password,...(totp?{totpCode:totp}:{})})});
 assert.equal(login.status,200,'login denied: '+await login.text());
 const cookie=(login.headers.get('set-cookie')??'').split(';')[0];
 const me=await call('/auth/me','GET',undefined,{cookie,csrf:''});
 assert.equal(me.status,200,JSON.stringify(me.body));
 return {...u,cookie,csrf:me.body.csrfToken,orgId:me.body.organizationId};
}
test('Phase 7 platform admin, audited exports, financial segregation, ticket triage and privacy requests',async()=>{
 try{
  const a=await signedIn(await registered('Ana7'));
  const b=await signedIn(await registered('Bruna7'));
  const adminBase=await registered('Admin7');
  const secret=createTotpSecret();
  await pool.query('INSERT INTO admin_mfa(user_id,secret_encrypted) VALUES($1,$2)',
    [adminBase.userId,encryptTotpSecret(secret)]);
  await pool.query("UPDATE memberships SET role='super_admin' WHERE user_id=$1",[adminBase.userId]);
  const root=await signedIn(adminBase,totpCode(secret,Math.floor(Date.now()/30000)));

  const anon=await call('/admin/reports/overview');
  assert.equal(anon.status,401);
  assert.equal((await call('/admin/reports/overview','GET',undefined,a)).status,403);
  assert.equal((await call('/admin/organizations','GET',undefined,b)).status,403);
  const overview=await call('/admin/reports/overview','GET',undefined,root);
  assert.equal(overview.status,200,JSON.stringify(overview.body));
  assert.equal(overview.body.finance.mrrCents,'0');
  assert.equal(overview.body.finance.merchantRealGpvCents,'0');
  assert.equal(overview.body.finance.platformVerifiedReceiptsCents,'0');
  assert.equal(overview.body.sandboxExcludedFromReal,true);
  const c=await call('/clients','POST',{
   name:'=HYPERLINK("https://bad.example","x")',phone:'+5511999998012',email:'owner7@example.com'
  },a);
  assert.equal(c.status,201,JSON.stringify(c.body));
  const ch=await call('/charges','POST',{clientId:c.body.id,
   description:'@SUM(1,2)',amountCents:9900,dueDate:'2026-12-20'},a);
  assert.equal(ch.status,201,JSON.stringify(ch.body));
  const reportA=await call('/reports/summary','GET',undefined,a);
  const reportB=await call('/reports/summary','GET',undefined,b);
  assert.equal(reportA.status,200);
  assert.equal(reportA.body.counts.charges_total,1);
  assert.equal(reportA.body.counts.real_net_cents,'0');
  assert.equal(reportB.body.counts.charges_total,0);
  assert.equal(reportB.body.counts.clients_active,0);
  assert.equal(reportA.body.monthlyCreatedCharges.length,1);

  const forbiddenExport=await call('/reports/exports/clients','POST',{},a.cookie?{cookie:a.cookie,csrf:''}:undefined);
  assert.equal(forbiddenExport.status,403,'no CSRF must deny sensitive exports');
  const illegalDataset=await call('/reports/exports/secrets','POST',{},a);
  assert.equal(illegalDataset.status,400);
  const exportA=await call('/reports/exports/clients','POST',{limit:100},a,true);
  assert.equal(exportA.status,200);
  assert.match(String(exportA.body),/^"id","codigo"/); // fetch.text() strips UTF-8 BOM by specification.
  assert.match(String(exportA.body),/'=HYPERLINK/,'spreadsheet formula must be escaped');
  assert.match(String(exportA.body),/owner7@example\.com/);
  assert.match(String(exportA.headers.get('content-disposition')),/attachment;/);
  const exportB=await call('/reports/exports/clients','POST',{},b,true);
  assert.equal(exportB.status,200);
  assert.doesNotMatch(String(exportB.body),/owner7@example\.com/);
  const chargesCsv=await call('/reports/exports/charges','POST',{},a,true);
  assert.equal(chargesCsv.status,200);
  assert.match(String(chargesCsv.body),/'@SUM\(1,2\)/);
  assert.doesNotMatch(String(chargesCsv.body),/public_token|pix_payload|access_token_ciphertext/);

  const auditA=await call('/reports/audit','GET',undefined,a);
  assert.equal(auditA.status,200);
  assert.ok(auditA.body.items.some((item:{action:string})=>item.action==='CSV_EXPORT_GENERATED'));
  assert.equal(auditA.body.metadataRedacted,true);
  assert.equal(JSON.stringify(auditA.body).includes('owner7@example.com'),false);
  assert.equal((await call('/reports/audit','GET',undefined,b)).body.items.some(
   (e:{action:string;entity_id:string|null})=>e.action==='CSV_EXPORT_GENERATED'&&e.entity_id===c.body.id),false);
  await assert.rejects(()=>pool.query('DELETE FROM audit_logs WHERE organization_id=$1',[a.orgId]),
    /audit_logs are append-only/);

  const support=await call('/support/tickets','POST',{subject:'Acompanhar exportação',
   message:'O cadastro precisa de conferência para o relatório.'},a);
  assert.equal(support.status,201);
  assert.equal((await call('/admin/support/tickets','GET',undefined,a)).status,403);
  const tickets=await call('/admin/support/tickets','GET',undefined,root);
  assert.ok(tickets.body.items.some((x:{id:string})=>x.id===support.body.id));
  assert.equal((await call('/admin/support/tickets/'+support.body.id,'PATCH',{
    status:'in_progress',reason:'iniciando revisão de suporte'},a)).status,403);
  assert.equal((await call('/admin/support/tickets/'+support.body.id,'PATCH',{
    status:'in_progress',reason:'iniciando revisão de suporte'},
    {cookie:root.cookie,csrf:''})).status,403);
  const triage=await call('/admin/support/tickets/'+support.body.id,'PATCH',{
   status:'in_progress',reason:'Acompanhamento administrativo registrado.'},root);
  assert.equal(triage.status,200,JSON.stringify(triage.body));
  assert.equal(triage.body.replySent,false);
  const event=await pool.query('SELECT actor_id,old_status,new_status FROM support_ticket_events WHERE ticket_id=$1',[support.body.id]);
  assert.equal(event.rowCount,1);
  assert.equal(event.rows[0].new_status,'in_progress');
  // Fase 7: resposta persistida apenas no portal autenticado, sem entrega externa.
  const key=randomUUID();
  const answer={message:'A equipe validou seu chamado. Acompanhe esta resposta neste painel.',clientRequestId:key};
  assert.equal((await call('/admin/support/tickets/'+support.body.id+'/replies','POST',answer,a)).status,403);
  assert.equal((await call('/admin/support/tickets/'+support.body.id+'/replies','POST',answer,
   {cookie:root.cookie,csrf:''})).status,403,'CSRF required for replies');
  assert.equal((await call('/admin/support/tickets/'+support.body.id+'/replies','GET',undefined,a)).status,403);
  assert.equal((await call('/support/tickets/'+support.body.id+'/replies','GET',undefined,b)).status,404,
   'another tenant must not read replies');
  const reply=await call('/admin/support/tickets/'+support.body.id+'/replies','POST',answer,root);
  assert.equal(reply.status,201,JSON.stringify(reply.body));
  assert.equal(reply.body.deliveryState,'portal_only');
  assert.equal(reply.body.emailSent,false);
  const duplicate=await call('/admin/support/tickets/'+support.body.id+'/replies','POST',answer,root);
  assert.equal(duplicate.status,200);
  assert.equal(duplicate.body.id,reply.body.id);
  assert.equal(duplicate.body.duplicate,true);
  assert.equal((await call('/admin/support/tickets/'+support.body.id+'/replies','POST',
    {...answer,message:'Tentativa com chave reutilizada e conteúdo diferente.'},root)).status,409);
  const customerHistory=await call('/support/tickets/'+support.body.id+'/replies','GET',undefined,a);
  assert.equal(customerHistory.status,200);
  assert.equal(customerHistory.body.items.length,1);
  assert.equal(customerHistory.body.items[0].message,answer.message);
  assert.equal(customerHistory.body.delivery,'portal_only');
  assert.equal(customerHistory.body.emailSent,false);
  const adminHistory=await call('/admin/support/tickets/'+support.body.id+'/replies','GET',undefined,root);
  assert.equal(adminHistory.status,200);
  assert.equal(adminHistory.body.items.length,1);
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM support_ticket_replies WHERE ticket_id=$1',
   [support.body.id])).rows[0].n,1,'idempotency must prevent duplicate replies');
  const publicTicketId=randomUUID();
  await pool.query('INSERT INTO support_tickets(id,name,email,subject,message) VALUES($1,$2,$3,$4,$5)',
   [publicTicketId,'Contato público','public7@example.com','Acesso público','Mensagem de contato sem sessão']);
  assert.equal((await call('/admin/support/tickets/'+publicTicketId+'/replies','POST',
   {...answer,clientRequestId:randomUUID()},root)).status,409,'public contact needs verified channel');
  assert.equal((await call('/support/tickets/'+publicTicketId+'/replies','GET',undefined,a)).status,404);
  const closing=await call('/admin/support/tickets/'+support.body.id,'PATCH',
   {status:'closed',reason:'Acompanhamento de suporte encerrado e documentado.'},root);
  assert.equal(closing.status,200);
  assert.equal((await call('/admin/support/tickets/'+support.body.id+'/replies','POST',
   {...answer,clientRequestId:randomUUID()},root)).status,409,'closed ticket cannot receive new reply');


  const privacy=await call('/privacy/requests','POST',{kind:'erasure',
   reason:'Desejo consultar os requisitos legais para a exclusão da empresa.'},a);
  assert.equal(privacy.status,201);
  assert.equal(privacy.body.automaticDeletion,false);
  assert.equal((await call('/admin/privacy/requests','GET',undefined,b)).status,403);
  assert.equal((await call('/admin/privacy/requests/'+privacy.body.id,'PATCH',{
   state:'completed',reviewerNote:'pedido concluído sem validação'},root)).status,400);
  const review=await call('/admin/privacy/requests/'+privacy.body.id,'PATCH',{
   state:'in_review',reviewerNote:'Em análise jurídica e retenção obrigatória.'},root);
  assert.equal(review.status,200,JSON.stringify(review.body));
  assert.equal(review.body.automaticDeletion,false);
  const current=await call('/privacy/requests','GET',undefined,a);
  assert.equal(current.body.items.find((e:{id:string})=>e.id===privacy.body.id).state,'in_review');
  assert.equal((await call('/privacy/requests','GET',undefined,b)).body.items.some(
   (e:{id:string})=>e.id===privacy.body.id),false);
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM clients WHERE id=$1',[c.body.id])).rows[0].n,1);

  const list=await call('/admin/organizations','GET',undefined,root);
  assert.ok(list.body.items.some((o:{id:string})=>o.id===b.orgId));
  assert.equal((await call('/admin/organizations/'+b.orgId+'/status','PATCH',{
   status:'suspended',reason:'Conta sob análise de segurança.'},a)).status,403);
  assert.equal((await call('/admin/organizations/'+root.orgId+'/status','PATCH',{
   status:'suspended',reason:'Ação proibida sobre o próprio tenant.'},root)).status,403);
  const suspend=await call('/admin/organizations/'+b.orgId+'/status','PATCH',{
   status:'suspended',reason:'Suspensão preventiva após alerta de segurança.'},root);
  assert.equal(suspend.status,200,JSON.stringify(suspend.body));
  assert.equal(suspend.body.sessionsRevoked,true);
  assert.equal((await call('/auth/me','GET',undefined,b)).status,401);
  const revived=await call('/admin/organizations/'+b.orgId+'/status','PATCH',{
   status:'active',reason:'Revisão concluída, reativação aprovada pelo administrador.'},root);
  assert.equal(revived.status,200);
  assert.equal((await call('/auth/me','GET',undefined,b)).status,401,'old sessions remain revoked after restoration');
  const again=await signedIn(b);
  assert.equal(again.orgId,b.orgId);

  await pool.query("UPDATE memberships SET role='operator' WHERE user_id=$1 AND organization_id=$2",[again.userId,again.orgId]);
  assert.equal((await call('/reports/summary','GET',undefined,again)).status,200);
  assert.equal((await call('/reports/audit','GET',undefined,again)).status,403);
  assert.equal((await call('/reports/exports/clients','POST',{},again)).status,403);
  assert.equal((await call('/privacy/requests','POST',{
   kind:'access',reason:'Preciso consultar os meus dados.'},again)).status,403);

  const adminLog=await call('/admin/audit','GET',undefined,root);
  assert.equal(adminLog.status,200);
  assert.ok(adminLog.body.items.some((i:{action:string})=>i.action==='ADMIN_ORGANIZATION_STATUS_CHANGED'));
  assert.ok(adminLog.body.items.some((i:{action:string})=>i.action==='ADMIN_SUPPORT_STATUS_CHANGED'));
  assert.equal(adminLog.body.metadataRedacted,true);
 }finally{
  await new Promise<void>((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
  await pool.end();
 }
});
