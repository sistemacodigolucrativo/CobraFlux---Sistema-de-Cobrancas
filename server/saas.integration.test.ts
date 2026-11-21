import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import type {AddressInfo} from 'node:net';

process.env.CF_NO_LISTEN='true';
const {app}=await import('./index');
app.set('trust proxy',1); // CI-only: independent IP fixture.
const {pool,transaction}=await import('./db');
const {enforceSaasQuota,SaasQuotaError}=await import('./saas-domain');
const {reconcileSaasBilling}=await import('./saas-worker');
const {localBillingDate}=await import('./recurrence-calendar');
const server=app.listen(0,'127.0.0.1');
await new Promise<void>(resolve=>server.once('listening',resolve));
const base='http://127.0.0.1:'+(server.address() as AddressInfo).port+'/api';
type User={cookie:string;csrf:string;orgId:string};
async function call(path:string,method='GET',body?:unknown,user?:User){
 const res=await fetch(base+path,{
  method,
  headers:{'X-Forwarded-For':'198.51.100.92','Origin':'http://localhost:3000',
   ...(body?{'Content-Type':'application/json'}:{}),
   ...(user?{Cookie:user.cookie}:{}),
   ...(user?.csrf?{'X-CF-CSRF':user.csrf}:{})},
  body:body?JSON.stringify(body):undefined
 });
 return {status:res.status,body:await res.json(),
  cookie:(res.headers.get('set-cookie')??'').split(';')[0]};
}
async function owner():Promise<User>{
 const email='saas-'+randomUUID().slice(0,10)+'@example.com',password='SenhaSaaSDeTeste#2026';
 const register=await call('/auth/register','POST',{name:'Titular de SaaS',
  businessName:'Empresa SaaS Teste',email,password});
 assert.equal(register.status,201,JSON.stringify(register.body));
 await pool.query('UPDATE users SET email_verified_at=now() WHERE email=$1',[email]);
 const login=await call('/auth/login','POST',{email,password});
 assert.equal(login.status,200,JSON.stringify(login.body));
 const me=await call('/auth/me','GET',undefined,{cookie:login.cookie,csrf:' ' ,orgId:''});
 assert.equal(me.status,200,JSON.stringify(me.body));
 return {cookie:login.cookie,csrf:me.body.csrfToken,orgId:me.body.organizationId};
}
test('SaaS separate ledger, fail-closed plan checkout, tenant permissions, quotas and dunning',async()=>{
 const price=18990,couponCode='SAAS'+randomUUID().slice(0,9).toUpperCase();
 try{
  const a=await owner(),b=await owner();
  const status=await call('/saas/subscription','GET',undefined,a);
  assert.equal(status.status,200);
  assert.equal(status.body.effectivePlan,'free');
  assert.equal(status.body.limits.clients,250);
  assert.equal(status.body.realCheckoutEnabled,false);
  assert.equal((await call('/saas/invoices','GET',undefined,b)).body.items.length,0);
  const unavailable=await call('/saas/quote','POST',{planCode:'starter'},a);
  assert.equal(unavailable.status,200);
  assert.equal(unavailable.body.priceConfigured,false);
  const disabled=await call('/saas/change-requests','POST',{
   planCode:'starter',clientRequestId:randomUUID()
  },a);
  assert.equal(disabled.status,409);
  assert.equal(disabled.body.error,'plan_pricing_not_configured');
  const beforePlan=await pool.query(
   "SELECT monthly_price_cents,published FROM saas_plans WHERE code='starter'");
  await pool.query("UPDATE saas_plans SET monthly_price_cents=$1,published=true WHERE code='starter'",[price]);
  await pool.query(
   'INSERT INTO saas_coupons(id,code,percent_off,max_redemptions) VALUES($1,$2,25,1)',
   [randomUUID(),couponCode]);
  const quote=await call('/saas/quote','POST',{planCode:'starter',couponCode},a);
  assert.equal(quote.status,200,JSON.stringify(quote.body));
  assert.equal(quote.body.baseCents,18990);
  assert.equal(quote.body.discountCents,4747);
  assert.equal(quote.body.totalCents,14243);
  const key=randomUUID();
  const checkout=await call('/saas/change-requests','POST',{
   planCode:'starter',clientRequestId:key,couponCode
  },a);
  assert.equal(checkout.status,201,JSON.stringify(checkout.body));
  assert.equal(checkout.body.subscriptionActivated,false);
  assert.equal(checkout.body.platformPaymentVerified,false);
  assert.equal(checkout.body.realCheckoutEnabled,false);
  const repeat=await call('/saas/change-requests','POST',{
   planCode:'starter',clientRequestId:key,couponCode
  },a);
  assert.equal(repeat.status,200);
  assert.equal(repeat.body.id,checkout.body.id);
  assert.equal(repeat.body.alreadyRequested,true);
  assert.equal((await call('/saas/change-requests','POST',{
   planCode:'business',clientRequestId:key
  },a)).status,409);
  assert.equal((await call('/saas/change-requests','POST',{
   planCode:'starter',clientRequestId:randomUUID()
  },a)).status,409,'only one pending platform checkout per organization');
  const invoice=await call('/saas/invoices','GET',undefined,a);
  assert.equal(invoice.status,200);
  assert.equal(invoice.body.ledger,'platform_saas');
  assert.equal(invoice.body.items.length,1);
  assert.equal(invoice.body.items[0].status,'draft');
  assert.equal(Number(invoice.body.items[0].total_cents),14243);
  const current=await call('/saas/subscription','GET',undefined,a);
  assert.equal(current.body.subscription.plan_code,'free','a draft platform invoice cannot grant premium');
  assert.equal((await call('/saas/invoices','GET',undefined,b)).body.items.length,0);
  const merchant=await pool.query('SELECT count(*)::int AS count FROM charges WHERE organization_id=$1',[a.orgId]);
  assert.equal(merchant.rows[0].count,0,'SaaS invoices never create merchant charges');

  const client=await call('/clients','POST',{name:'Cliente Limite',phone:'+5511999999031'},a);
  assert.equal(client.status,201,JSON.stringify(client.body));
  const before=await pool.query('SELECT count(*)::int AS used FROM clients WHERE organization_id=$1',[a.orgId]);
  assert.equal(before.rows[0].used,1);
  await pool.query(
   "INSERT INTO clients(id,organization_id,internal_code,name,phone) "+
   "SELECT gen_random_uuid(),$1,'CF-Q-'+g::text,'Conta '+g::text,"+
   "'+55118'||lpad(g::text,8,'0') FROM generate_series(1,249) AS g",
   [a.orgId]);
  const limit=await call('/clients','POST',{name:'Cliente Excedente',phone:'+5511999999032'},a);
  assert.equal(limit.status,409,JSON.stringify(limit.body));
  assert.equal(limit.body.error,'saas_quota_exceeded');
  assert.equal(limit.body.resource,'clients');
  assert.equal((await call('/clients','POST',{name:'Outra Organização',phone:'+5511999999033'},b)).status,201);
  const store=await pool.query('SELECT id FROM clients WHERE id=$1 AND organization_id=$2',
   [client.body.id,a.orgId]);
  assert.equal(store.rowCount,1);
  const archive=await call('/clients/'+client.body.id,'PATCH',{status:'archived'},a);
  assert.equal(archive.status,200);
  assert.equal((await call('/clients/'+client.body.id,'PATCH',{status:'active'},a)).status,200);
  await assert.rejects(
    ()=>transaction(db=>enforceSaasQuota(db,a.orgId,'clients',1)),
    (err:unknown)=>err instanceof SaasQuotaError&&err.resource==='clients'
  );
  const cancel=await call('/saas/change-requests/'+checkout.body.id+'/cancel','POST',{},a);
  assert.equal(cancel.status,200);
  assert.equal(cancel.body.state,'cancelled');
  const afterCancel=await call('/saas/invoices','GET',undefined,a);
  assert.equal(afterCancel.body.items[0].status,'void');
  assert.equal((await call('/saas/subscription','GET',undefined,a)).body.effectivePlan,'free');
  // Fixture simulates a PSP-verified subscription by direct DB setup, NOT through an HTTP endpoint.
  const nextDay=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
  await pool.query(
    "UPDATE saas_subscriptions SET plan_code='starter',status='active',current_period_end=$2::date,"+
    "provider='ci_fixture',provider_subscription_id=$3 WHERE organization_id=$1",
    [a.orgId,nextDay,'ci-sub-'+randomUUID()]
  );
  assert.equal((await call('/saas/subscription','GET',undefined,a)).body.effectivePlan,'starter');
  assert.equal((await call('/clients','POST',{name:'Cliente Plano Pago',phone:'+5511999999034'},a)).status,201);
  // Past due after grace must reduce entitlements to Free without deleting existing records.
  await pool.query(
    "UPDATE saas_subscriptions SET status='past_due',grace_until=current_date - interval '1 day' WHERE organization_id=$1",
    [a.orgId]);
  assert.equal((await call('/saas/subscription','GET',undefined,a)).body.effectivePlan,'free');
  assert.equal((await call('/clients','POST',{name:'Cliente Bloqueado',phone:'+5511999999035'},a)).status,409);
  const maintained=await reconcileSaasBilling(10,localBillingDate());
  assert.ok(maintained.restricted>=1);
  assert.equal((await call('/saas/subscription','GET',undefined,a)).body.subscription.status,'restricted');
  const history=await pool.query("SELECT action FROM saas_subscription_history WHERE organization_id=$1",[a.orgId]);
  assert.ok(history.rows.some((x:{action:string})=>x.action==='SAAS_GRACE_EXPIRED'));
 }catch(e){
  throw e;
 }finally{
  await pool.query("UPDATE saas_plans SET monthly_price_cents=NULL,published=false WHERE code='starter'");
  await new Promise<void>((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
  await pool.end();
 }
});
