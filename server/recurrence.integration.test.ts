import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import type {AddressInfo} from 'node:net';
import {advanceRecurrence,localBillingDate} from './recurrence-calendar';

process.env.CF_NO_LISTEN='true';
const {app}=await import('./index');
const {pool}=await import('./db');
const {generateRecurrenceBatch,recurrenceDueCount}=await import('./recurrence-worker');
const server=app.listen(0,'127.0.0.1');
await new Promise<void>(resolve=>server.once('listening',resolve));
const base='http://127.0.0.1:'+(server.address() as AddressInfo).port+'/api';
const password='SenhaRecorrenciaSegura#2026';
async function call(path:string,method='GET',data?:unknown,cookie='',csrf=''){
 const response=await fetch(base+path,{
  method,
  headers:{...(data?{'Content-Type':'application/json'}:{}),
   ...(cookie?{Cookie:cookie}:{}),
   ...(csrf?{'X-CF-CSRF':csrf}:{})},
  body:data?JSON.stringify(data):undefined
 });
 return {status:response.status,body:await response.json(),
  cookie:(response.headers.get('set-cookie')??'').split(';')[0]};
}
async function owner(label:string){
 const email='recurrence-'+randomUUID().slice(0,9)+'@example.com';
 const reg=await call('/auth/register','POST',{
  name:'Titular '+label,businessName:'Org '+label,email,password
 });
 assert.equal(reg.status,201,JSON.stringify(reg.body));
 await pool.query('UPDATE users SET email_verified_at=now() WHERE email=$1',[email]);
 const login=await call('/auth/login','POST',{email,password});
 assert.equal(login.status,200,JSON.stringify(login.body));
 const me=await call('/auth/me','GET',undefined,login.cookie);
 assert.equal(me.status,200);
 return {cookie:login.cookie,csrf:me.body.csrfToken,orgId:me.body.organizationId,userId:me.body.user.id};
}
async function clientFor(user:{cookie:string;csrf:string},phone:string){
 const response=await call('/clients','POST',{
   name:'Cliente recorrente',phone,whatsappOptIn:false,monthlyFeeCents:35000,preferredDueDay:31
 },user.cookie,user.csrf);
 assert.equal(response.status,201,JSON.stringify(response.body));
 return response.body.id as string;
}
test('recurrence endpoints: monthly/weekly safety, draft-only cycles, deduplication, pausing and tenant authorization',async()=>{
 try{
  const a=await owner('A'),b=await owner('B');
  const idA=await clientFor(a,'+5511988771001'),idB=await clientFor(b,'+5511988771002');
  const today=localBillingDate(),anchor=Number(today.slice(8));
  const preview=await call('/recurrences/preview','POST',{
   firstDueDate:'2028-02-29',frequency:'monthly',anchorDay:31,count:4
  },a.cookie,a.csrf);
  assert.equal(preview.status,200,JSON.stringify(preview.body));
  assert.deepEqual(preview.body.dates,['2028-02-29','2028-03-31','2028-04-30','2028-05-31']);
  const invalid=await call('/recurrences','POST',{
   clientId:idA,description:'Mensalidade inválida',amountCents:35000,discountCents:35000,
   frequency:'monthly',anchorDay:anchor,firstDueDate:today
  },a.cookie,a.csrf);
  assert.equal(invalid.status,422);
  const crossClient=await call('/recurrences','POST',{
   clientId:idA,description:'Cliente externo',amountCents:35000,
   frequency:'monthly',anchorDay:anchor,firstDueDate:today
  },b.cookie,b.csrf);
  assert.equal(crossClient.status,404);
  assert.equal((await call('/recurrences','POST',{
    clientId:idA,description:'Não autorizado',amountCents:35000,
    frequency:'monthly',anchorDay:anchor,firstDueDate:today
  },a.cookie)).status,403,'write requires CSRF');
  const createA=await call('/recurrences','POST',{
   clientId:idA,description:'Mensalidade recorrente A',amountCents:35000,discountCents:5000,
   frequency:'monthly',anchorDay:anchor,firstDueDate:today
  },a.cookie,a.csrf);
  const createB=await call('/recurrences','POST',{
   clientId:idB,description:'Mensalidade recorrente B',amountCents:40000,
   frequency:'weekly',firstDueDate:today
  },b.cookie,b.csrf);
  assert.equal(createA.status,201,JSON.stringify(createA.body));
  assert.equal(createB.status,201,JSON.stringify(createB.body));
  const planA=createA.body.id,planB=createB.body.id;
  assert.equal((await call('/recurrences/'+planA+'/cycles','GET',undefined,b.cookie)).status,404);
  assert.equal((await call('/recurrences/'+planA+'/pause','POST',{},b.cookie,b.csrf)).status,404);
  assert.equal((await call('/recurrences/'+planA+'/cancel','POST',{},b.cookie,b.csrf)).status,404);
  assert.equal((await call('/recurrences','GET',undefined,b.cookie)).body.items.length,1);
  assert.equal((await call('/recurrences','GET',undefined,a.cookie)).body.items.length,1);

  // Each cycle is inserted atomically and uniquely, regardless of concurrent workers.
  const [first,second]=await Promise.all([generateRecurrenceBatch(3,today),generateRecurrenceBatch(3,today)]);
  assert.equal(first.failed+second.failed,0);
  assert.equal(first.generated+second.generated,2);
  const cyclesA=await call('/recurrences/'+planA+'/cycles','GET',undefined,a.cookie);
  const cyclesB=await call('/recurrences/'+planB+'/cycles','GET',undefined,b.cookie);
  assert.equal(cyclesA.body.items.length,1);
  assert.equal(cyclesB.body.items.length,1);
  assert.equal(cyclesA.body.items[0].charge_status,'draft');
  assert.equal(cyclesA.body.items[0].cycle_key,today.slice(0,7));
  assert.equal(Number(cyclesA.body.items[0].amount_cents),35000);
  assert.equal(Number(cyclesA.body.items[0].discount_cents),5000);
  const publicCharges=await pool.query('SELECT provider,pix_payload,status,amount_cents FROM charges WHERE id=$1',
    [cyclesA.body.items[0].charge_id]);
  assert.equal(publicCharges.rows[0].status,'draft');
  assert.equal(publicCharges.rows[0].provider,null);
  assert.equal(publicCharges.rows[0].pix_payload,null);
  assert.equal(await recurrenceDueCount(today),0);
  assert.equal((await generateRecurrenceBatch(10,today)).generated,0);
  // Even a mistakenly rewound cursor cannot create the same monthly cycle twice.
  await pool.query("UPDATE recurrence_plans SET next_due_date=$2::date WHERE id=$1",
    [planA,today]);
  assert.equal((await generateRecurrenceBatch(1,today)).generated,0);
  assert.equal((await call('/recurrences/'+planA+'/cycles','GET',undefined,a.cookie)).body.items.length,1);

  // Changing the template affects future cycles, never historical charges.
  const edit=await call('/recurrences/'+planA,'PATCH',{
   description:'Mensalidade ajustada',amountCents:45000,discountCents:0
  },a.cookie,a.csrf);
  assert.equal(edit.status,200,JSON.stringify(edit.body));
  const original=await pool.query('SELECT amount_cents,description FROM charges WHERE id=$1',
    [cyclesA.body.items[0].charge_id]);
  assert.equal(Number(original.rows[0].amount_cents),35000);
  assert.equal(original.rows[0].description,'Mensalidade recorrente A');

  const pause=await call('/recurrences/'+planA+'/pause','POST',{},a.cookie,a.csrf);
  assert.equal(pause.status,200);
  const dateNext=advanceRecurrence(today,'monthly',anchor);
  await pool.query('UPDATE recurrence_plans SET next_due_date=$2::date WHERE id=$1',[planA,'2026-01-31']);
  const pausedRun=await generateRecurrenceBatch(4,today);
  assert.equal(pausedRun.generated,0);
  const resume=await call('/recurrences/'+planA+'/resume','POST',{},a.cookie,a.csrf);
  assert.equal(resume.status,200,JSON.stringify(resume.body));
  assert.ok(resume.body.skippedCycles>0);
  assert.ok(resume.body.nextDueDate>=today);
  const cancel=await call('/recurrences/'+planA+'/cancel','POST',{},a.cookie,a.csrf);
  assert.equal(cancel.status,200);
  assert.equal((await call('/recurrences/'+planA+'/resume','POST',{},a.cookie,a.csrf)).status,409);
  assert.equal((await call('/recurrences/'+planA+'/cycles','GET',undefined,a.cookie)).body.items.length,1);
  const member=await pool.query('SELECT action FROM audit_logs WHERE organization_id=$1 AND entity_type=$2',
    [a.orgId,'recurrence']);
  assert.ok(member.rows.some((row:{action:string})=>row.action==='RECURRENCE_CREATED'));
  assert.ok(member.rows.some((row:{action:string})=>row.action==='RECURRENCE_CANCELLED'));
  const overview=await call('/recurrences/overview','GET',undefined,a.cookie);
  assert.equal(overview.status,200);
  assert.equal(overview.body.summary.total,1);
  assert.equal(overview.body.summary.generated,1);
  assert.equal(overview.body.schedulerRequired,true);
  assert.equal(overview.body.financialProviderCalls,0);

  // Client archival automatically pauses an active plan, never silently bills an archived client.
  await pool.query("UPDATE clients SET status='archived' WHERE id=$1",[idB]);
  await pool.query('UPDATE recurrence_plans SET next_due_date=$2::date WHERE id=$1',[planB,today]);
  const archiveRun=await generateRecurrenceBatch(1,today);
  assert.equal(archiveRun.paused,1);
  const bList=await call('/recurrences','GET',undefined,b.cookie);
  assert.equal(bList.body.items[0].state,'paused');
  assert.equal((await call('/recurrences/'+planB+'/resume','POST',{},b.cookie,b.csrf)).status,409);
  await pool.query("UPDATE clients SET status='active' WHERE id=$1",[idB]);
  assert.equal((await call('/recurrences/'+planB+'/resume','POST',{},b.cookie,b.csrf)).status,200);
  assert.equal((await call('/recurrences/'+planB+'/cancel','POST',{},b.cookie,b.csrf)).status,200);
 }finally{
  await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
  await pool.end();
 }
});
