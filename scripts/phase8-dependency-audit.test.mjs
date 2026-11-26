import test from 'node:test';
import assert from 'node:assert/strict';
import {parseAudit,parseSbom,evaluateEvidence} from './phase8-dependency-audit.mjs';
const audit=(severity=null)=>{
 const counts={critical:0,high:0,moderate:0,low:0,info:0};
 if(severity)counts[severity]=1;
 return {auditReportVersion:2,metadata:{vulnerabilities:counts},vulnerabilities:severity?
 {example:{severity,range:'<3',isDirect:false,fixAvailable:false}}:{}};
};
const sbom=()=>({bomFormat:'CycloneDX',specVersion:'1.5',components:[{name:'example',version:'1'}]});
test('no advisories still does not approve production',()=>{
 const r=evaluateEvidence(audit(),audit(),sbom());
 assert.equal(r.production.releaseCandidatePass,true);
 assert.equal(r.approvedForProduction,false);
 assert.equal(r.externalHomologationCompleted,false);
 assert.equal(r.sbom.components,1);
});
test('production high or critical advisory blocks release candidate',()=>{
 for(const s of ['high','critical']){
  const r=evaluateEvidence(audit(s),audit(),sbom());
  assert.equal(r.production.releaseCandidatePass,false);
  assert.equal(r.requiresSecurityReview,true);
  assert.equal(r.production.entries[0].name,'example');
 }
});
test('dev dependencies still require security review, not silent clearance',()=>{
 const r=evaluateEvidence(audit(),audit('moderate'),sbom());
 assert.equal(r.requiresSecurityReview,true);
 assert.equal(r.production.releaseCandidatePass,true);
 assert.equal(r.approvedForProduction,false);
});
test('unavailable registry evidence and malformed SBOM are not green',()=>{
 assert.throws(()=>parseAudit({error:{code:'ECONNRESET'}},'production'));
 assert.throws(()=>parseAudit({auditReportVersion:2,metadata:{vulnerabilities:{high:0}},vulnerabilities:{}},'full'));
 assert.throws(()=>parseSbom({bomFormat:'SPDX',components:[]}));
});
