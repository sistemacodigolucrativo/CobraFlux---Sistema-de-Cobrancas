// F8 #09: offline rollback readiness validator. Cannot deploy/restore/rollback.
import {readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const safeHttpsUrl=s=>typeof s==='string'&&/^https:\/\/[a-z0-9.-]+\/\S+$/i.test(s)&&
 !s.includes('@')&&!s.includes('?')&&!s.includes('#');
const isSha=s=>typeof s==='string'&&/^[a-f0-9]{40}$/i.test(s);
const isDigest=s=>typeof s==='string'&&/^sha256:[a-f0-9]{64}$/i.test(s);
export function assessRollback(plan){
 const errors=[],missing=[];
 if(plan?.schemaVersion!==1||plan?.targetEnvironment!=='staging'||
  plan.documentationOnly!==true||plan.actualRollbackExecuted!==false||
  !plan.recoveryPlan||typeof plan.recoveryPlan!=='object')return {
   valid:false,missing:['invalid-plan'],errors:['Invalid or unsafe rollback plan'],rollbackApproved:false};
 const info=plan.recoveryPlan;
 const requirements=[
  ['releaseSha',isSha(info.releaseSha)],
  ['previousImageDigest',isDigest(info.previousImageDigest)],
  ['operator',typeof info.operator==='string'&&info.operator.length>=3],
  ['reviewer',typeof info.reviewer==='string'&&info.reviewer.length>=3&&info.reviewer!==info.operator],
  ['backupEvidenceUrl',safeHttpsUrl(info.backupEvidenceUrl)],
  ['lastIsolatedRestoreEvidenceUrl',safeHttpsUrl(info.lastIsolatedRestoreEvidenceUrl)],
  ['schemaCompatibilityReviewUrl',safeHttpsUrl(info.schemaCompatibilityReviewUrl)],
  ['migrationReversalPolicy',typeof info.migrationReversalPolicy==='string'&&
    ['forward-fix','restore-from-approved-backup'].includes(info.migrationReversalPolicy)],
  ['workerDisablementApproved',info.workerDisablementApproved===true],
  ['maintenanceWindowApproved',info.maintenanceWindowApproved===true],
  ['rpoMinutes',Number.isInteger(info.rpoMinutes)&&info.rpoMinutes>=0],
  ['rtoMinutes',Number.isInteger(info.rtoMinutes)&&info.rtoMinutes>0],
  ['postRollbackSmokeEvidenceUrl',safeHttpsUrl(info.postRollbackSmokeEvidenceUrl)]
 ];
 for(const [key,ok] of requirements)if(!ok)missing.push(key);
 if(plan.authorizationStatus!=='pending'&&plan.authorizationStatus!=='reviewed')
  errors.push('Unrecognized approval state');
 if(plan.authorizationStatus==='reviewed'&&missing.length)
  errors.push('Reviewed status incompatible with missing evidence');
 // This repository doesn't have an independently verified release approval provider.
 return {valid:errors.length===0,missing,errors,rollbackApproved:false,
  realRestoreVerified:false,deployApproved:false};
}
export async function inspect(){
 return assessRollback(JSON.parse(await readFile(resolve(root,'docs/security/phase8-rollback-plan.json'),'utf8')));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const out=await inspect();
  for(const e of out.errors)process.stderr.write('F8 ROLLBACK INVALID: '+e+'\n');
  process.stdout.write('F8 ROLLBACK: '+out.missing.length+
   ' evidence items pending; no rollback/deploy permitted by this tool.\n');
  if(!out.valid||process.argv.includes('--assert-approved'))process.exitCode=2;
 }catch{process.stderr.write('F8 ROLLBACK INVALID: cannot load safe plan\n');process.exitCode=2;}
}
