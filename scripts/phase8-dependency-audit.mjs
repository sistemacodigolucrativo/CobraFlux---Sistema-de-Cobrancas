// F8 #05: summarize npm audit and lockfile-derived SBOM evidence without exfiltrating secrets.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export function parseAudit(report,kind){
 if(!report||typeof report!=='object'||!report.vulnerabilities||typeof report.vulnerabilities!=='object'
    ||!report.metadata?.vulnerabilities||!Number.isInteger(report.auditReportVersion))
  throw new Error(kind+': npm audit report missing or invalid (registry/network may have failed)');
 const severities=['critical','high','moderate','low','info'];
 const counts=Object.fromEntries(severities.map(severity=>{
  const n=report.metadata.vulnerabilities[severity];
  if(!Number.isInteger(n)||n<0)throw new Error(kind+': missing vulnerability count');
  return [severity,n];
 }));
 const packageNames=Object.keys(report.vulnerabilities).sort();
 const entries=packageNames.map(name=>{
  const item=report.vulnerabilities[name];
  if(!item||!severities.includes(item.severity))throw new Error(kind+': invalid advisory entry');
  return {name,severity:item.severity,range:String(item.range??''),isDirect:!!item.isDirect,
    fixAvailable:typeof item.fixAvailable==='boolean'?item.fixAvailable:'requires-review'};
 });
 return {scope:kind,counts,affectedPackages:entries.length,entries,
  releaseCandidatePass:counts.critical===0&&counts.high===0};
}
export function parseSbom(sbom){
 if(!sbom||sbom.bomFormat!=='CycloneDX'||!Array.isArray(sbom.components)||!sbom.specVersion)
  throw new Error('CycloneDX SBOM is missing or invalid');
 const components=sbom.components;
 if(components.some(x=>!x?.name||!x?.version))throw new Error('Invalid SBOM package');
 return {format:sbom.bomFormat,version:sbom.specVersion,components:components.length,
  serialPresent:typeof sbom.serialNumber==='string'};
}
export function evaluateEvidence(prod,all,sbom){
 const p=parseAudit(prod,'production');
 const a=parseAudit(all,'full');
 const b=parseSbom(sbom);
 return {schemaVersion:1,source:'npm audit registry snapshot + npm sbom from package-lock',
  production:p,full:a,sbom:b,requiresSecurityReview:!p.releaseCandidatePass||!a.releaseCandidatePass,
  approvedForProduction:false,externalHomologationCompleted:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const argv=process.argv.slice(2);
 const val=name=>{const i=argv.indexOf(name);return i===-1?null:argv[i+1]};
 const prod=val('--production'),all=val('--full'),sbom=val('--sbom'),output=val('--output');
 if(!prod||!all||!sbom||!output){process.stderr.write('usage: --production FILE --full FILE --sbom FILE --output FILE\n');process.exitCode=2;}
 else{
  try{
   const reports=await Promise.all([prod,all,sbom].map(x=>readFile(x,'utf8').then(JSON.parse)));
   const evaluation=evaluateEvidence(...reports);
   await writeFile(output,JSON.stringify(evaluation,null,2)+'\n',{mode:0o600});
   for(const scope of [evaluation.production,evaluation.full]){
    process.stdout.write('F8 audit '+scope.scope+': critical='+scope.counts.critical+
     ' high='+scope.counts.high+' moderate='+scope.counts.moderate+
     ' low='+scope.counts.low+' affectedPackages='+scope.affectedPackages+'\n');
   }
   process.stdout.write('F8 SBOM: '+evaluation.sbom.components+
    ' components. SECURITY/RELEASE APPROVAL: NOT GRANTED.\n');
   if(!evaluation.production.releaseCandidatePass)process.stdout.write(
    'BLOCKED: production high/critical advisories require remediation or human-approved exception.\n');
  }catch{
   process.stderr.write('F8 AUDIT FAILED: invalid/unavailable audit or SBOM evidence\n');
   process.exitCode=1;
  }
 }
}
