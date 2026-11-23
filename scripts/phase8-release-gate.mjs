// F8 #06: offline validation of acceptance checklist. Not a deployment authorizer.
import {readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const required=[
 'staging_https_dns_proxy','database_tenant_segregation_tls','offsite_backup_restore_pitr',
 'monitoring_alerting_incidents','asaas_sandbox_external','meta_test_delivery_consent',
 'resend_test_delivery','security_review_cve','privacy_fiscal_review',
 'phase7_deferred_requirements','accessibility_real_devices','rollback_pilot_release_approval'
];
export function reviewAcceptance(document){
 const errors=[];
 if(document?.schemaVersion!==1||document.phase!==8||!Array.isArray(document.requiredGates))
  return {errors:['Invalid F8 acceptance schema'],pending:required,externalApproved:false,deployAllowed:false};
 const ids=new Set(),pending=[];
 for(const gate of document.requiredGates){
  if(!gate||typeof gate.id!=='string'||!required.includes(gate.id)||ids.has(gate.id)){
   errors.push('Invalid or duplicate gate');continue;
  }
  ids.add(gate.id);
  if(gate.status!=='pending'&&gate.status!=='verified')
   errors.push('Invalid gate status: '+gate.id);
  if(gate.status==='verified'){
   if(typeof gate.evidence!=='string'||!/^https:\/\/[a-z0-9.-]+\//i.test(gate.evidence)||
    typeof gate.approvedBy!=='string'||gate.approvedBy.length<3||
    typeof gate.verifiedAt!=='string'||Number.isNaN(Date.parse(gate.verifiedAt)))
    errors.push('Missing external approval reference: '+gate.id);
  }else{
   pending.push(gate.id);
   if(gate.evidence||gate.approvedBy||gate.verifiedAt)
    errors.push('Pending gate must not pretend to be approved: '+gate.id);
  }
 }
 for(const id of required)if(!ids.has(id)){errors.push('Required gate missing: '+id);pending.push(id);}
 if(document.deploymentAllowed!==false||document.operationalHomologationCompleted!==false)
  errors.push('Repository cannot grant operational homologation or deployment');
 // A committed JSON file is not independent proof, even if all fields are filled.
 return {errors:errors.sort(),pending:pending.sort(),externalApproved:false,deployAllowed:false};
}
export async function inspect(base=root){
 return reviewAcceptance(JSON.parse(await readFile(resolve(base,'docs/security/phase8-acceptance-gates.json'),'utf8')));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const result=await inspect();
  for(const e of result.errors)process.stderr.write('F8 GATE INVALID: '+e+'\n');
  process.stdout.write('F8 RELEASE GATE: '+result.pending.length+
   ' external conditions pending; deployment NOT approved\n');
  if(result.errors.length||process.argv.includes('--assert-release'))process.exitCode=2;
 }catch{process.stderr.write('F8 GATE INVALID: unable to inspect checklist\n');process.exitCode=2;}
}
