import test from 'node:test';
import assert from 'node:assert/strict';
import {inspect,assessRollback} from './phase8-rollback-preflight.mjs';
const safe={schemaVersion:1,targetEnvironment:'staging',authorizationStatus:'pending',
 documentationOnly:true,actualRollbackExecuted:false,recoveryPlan:{}};
test('documented staging rollback plan is safe, pending and never authorizes deployment',async()=>{
 const r=await inspect();
 assert.equal(r.valid,true);
 assert.ok(r.missing.length>=12);
 assert.equal(r.rollbackApproved,false);
 assert.equal(r.realRestoreVerified,false);
 assert.equal(r.deployApproved,false);
});
test('unsafe environment and false execution claim are rejected',()=>{
 for(const p of [
  {...safe,targetEnvironment:'production'},
  {...safe,actualRollbackExecuted:true},
  {...safe,documentationOnly:false}
 ])assert.equal(assessRollback(p).valid,false);
});
test('reviewed state without backup, operators and negative controls cannot pass',()=>{
 const r=assessRollback({...safe,authorizationStatus:'reviewed'});
 assert.equal(r.valid,false);
 assert.equal(r.rollbackApproved,false);
 assert.ok(r.missing.includes('backupEvidenceUrl'));
 assert.ok(r.missing.includes('schemaCompatibilityReviewUrl'));
});
