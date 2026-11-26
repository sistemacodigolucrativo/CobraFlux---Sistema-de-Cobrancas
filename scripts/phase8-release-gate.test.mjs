import test from 'node:test';
import assert from 'node:assert/strict';
import {inspect,reviewAcceptance} from './phase8-release-gate.mjs';
const fixture={schemaVersion:1,phase:8,deploymentAllowed:false,operationalHomologationCompleted:false,
 requiredGates:[{id:'staging_https_dns_proxy',status:'pending',evidence:null,approvedBy:null,verifiedAt:null}]};
test('versioned F8 checklist is coherent yet release stays blocked',async()=>{
 const r=await inspect();
 assert.deepEqual(r.errors,[]);
 assert.ok(r.pending.length>=12);
 assert.equal(r.externalApproved,false);
 assert.equal(r.deployAllowed,false);
});
test('missing gates are a hard error; no optimistic default',()=>{
 const r=reviewAcceptance(fixture);
 assert.ok(r.errors.some(s=>s.includes('Required gate missing')));
 assert.equal(r.deployAllowed,false);
});
test('self-declared release approval and fake external evidence are refused',()=>{
 const x={...fixture,deploymentAllowed:true};
 assert.ok(reviewAcceptance(x).errors.some(s=>s.includes('cannot grant')));
 const y={...fixture,requiredGates:[{id:'staging_https_dns_proxy',status:'verified',
  evidence:'README.md',approvedBy:'X',verifiedAt:'yesterday'}]};
 assert.ok(reviewAcceptance(y).errors.some(s=>s.includes('Missing external')));
});
