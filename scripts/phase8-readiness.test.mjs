import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assess,assessStagingEnvironment} from './phase8-readiness.mjs';

test('offline preflight validates only local contracts, never marks external homologation',async()=>{
 const r=await assess({mode:'offline',env:{}});
 assert.equal(r.mode,'offline');assert.equal(r.localContractsPassing,true);
 assert.equal(r.operationallyHomologated,false);assert.equal(r.deployApproved,false);
 assert.ok(r.checks.some(x=>x.code==='F8-RESTORE-OFFSITE'&&x.status==='pending'));
 assert.ok(r.checks.some(x=>x.code==='F8-HEALTH'&&x.status==='pass'));
});
test('staging config is not approved without strict origin and database separation',()=>{
 const empty=assessStagingEnvironment({});
 assert.ok(empty.every(x=>x.status==='pending'));
 const good=assessStagingEnvironment({
  APP_ORIGIN:'https://staging.example.com',
  DATABASE_URL:'postgresql://user:password@db.example.net:5432/cobraflux_staging',
  DATABASE_SSL:'require',SESSION_SECRET:'staging-unique-long-credential-should-not-log',
  TRUST_PROXY:'true',NODE_ENV:'production'
 });
 assert.ok(good.every(x=>x.status==='pass'));
 assert.ok(good.every(x=>!JSON.stringify(x).includes('password')));
 assert.ok(good.every(x=>!JSON.stringify(x).includes('staging-unique-long-credential')));
});
test('unsafe or fake configs are rejected without network access',()=>{
 for(const origin of ['http://staging.example.com','https://localhost:3000',
  'https://user:password@staging.example.com','https://staging.example.com/private']){
  const a=assessStagingEnvironment({APP_ORIGIN:origin});
  assert.equal(a.find(x=>x.code==='F8-HTTPS-ORIGIN').status,'pending');
 }
 const s=assessStagingEnvironment({DATABASE_URL:'postgresql://user:pwd@127.0.0.1:5432/prod',
  SESSION_SECRET:'ci-test-secret-change-me-not-production-123456789'});
 assert.equal(s.find(x=>x.code==='F8-MANAGED-DB').status,'pending');
 assert.equal(s.find(x=>x.code==='F8-SESSION-KEY').status,'pending');
});
test('staging inspection cannot self-certify operational readiness',async()=>{
 const env={APP_ORIGIN:'https://staging.example.com',
  DATABASE_URL:'postgresql://user:secret@db.example.net/stage',DATABASE_SSL:'require',
  SESSION_SECRET:'randomly-different-and-long-staging-key',TRUST_PROXY:'true',
  NODE_ENV:'production'};
 const r=await assess({mode:'staging',env});
 assert.ok(r.checks.filter(x=>x.code==='F8-EXTERNAL-HTTPS').every(x=>x.status==='pending'));
 assert.equal(r.operationallyHomologated,false);
 assert.equal(r.deployApproved,false);
});
