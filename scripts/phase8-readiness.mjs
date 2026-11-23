// F8 staging-readiness: offline-only checks, no connections, secrets or side effects.
// "ready" is never a synonym for external verification or permission to deploy.
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
function result(code,pass,explanation){
 return {code,status:pass?'pass':'pending',explanation};
}
export function assessStagingEnvironment(env){
 const checks=[];
 let origin;
 try{origin=new URL(env.APP_ORIGIN??'');}catch{origin=null;}
 const publicHttps=Boolean(origin&&origin.protocol==='https:'&&
  !origin.username&&!origin.password&&!origin.search&&!origin.hash&&
  (origin.pathname==='/'||origin.pathname==='')&&
  !['localhost','127.0.0.1','0.0.0.0'].includes(origin.hostname));
 checks.push(result('F8-HTTPS-ORIGIN',publicHttps,
  'APP_ORIGIN must be a real HTTPS origin; never connect automatically.'));
 checks.push(result('F8-POSTGRES-TLS',env.DATABASE_SSL==='require',
  'DATABASE_SSL=require; certificate chain must still be validated externally.'));
 let pgUrl;
 try{pgUrl=new URL(env.DATABASE_URL??'');}catch{pgUrl=null;}
 const safeDb=Boolean(pgUrl&&['postgres:','postgresql:'].includes(pgUrl.protocol)&&
  pgUrl.hostname&&!['localhost','127.0.0.1','0.0.0.0'].includes(pgUrl.hostname));
 checks.push(result('F8-MANAGED-DB',safeDb,
  'A nonlocal PostgreSQL URL is configured; no credentials, connection, or backup are verified.'));
 const secret=env.SESSION_SECRET??'';
 checks.push(result('F8-SESSION-KEY',secret.length>=32&&
  !secret.includes('ci-test-secret')&&!secret.includes('change-me')&&
  !secret.includes('synthetic-only'),
  'SESSION_SECRET must be unique and at least 32 characters; never print its value.'));
 checks.push(result('F8-REVERSE-PROXY',env.TRUST_PROXY==='true',
  'TRUST_PROXY=true only for a deployment with a controlled trusted proxy.'));
 checks.push(result('F8-PRODUCTION-MODE',env.NODE_ENV==='production',
  'NODE_ENV=production; this script does not start the application.'));
 return checks;
}
export async function assessLocalContracts(){
 const definitions=[
  ['F8-HEALTH','server/index.ts',["'/api/health'"],'Health route exists in code, not probed over HTTPS.'],
  ['F8-BACKUP','scripts/backup-db.sh',['pg_dump','umask 077'],'Backup script exists; no encrypted offsite backup has been proven.'],
  ['F8-RESTORE-GUARD','scripts/restore-drill.sh',['_restore_drill','non-empty database'],
   'Restore drill has isolation guards; a real restore still needs evidence.'],
  ['F8-ROADMAP','docs/ai-memory/fases/08-homologacao.md',['Fase 8'],
   'Staging acceptance plan exists; no hosting has been provisioned.']
 ];
 return Promise.all(definitions.map(async ([code,path,needles,explanation])=>{
  try{const content=await readFile(resolve(root,path),'utf8');
   return result(code,needles.every(s=>content.includes(s)),explanation);
  }catch{return result(code,false,'Required local artifact not available: '+path);}
 }));
}
export async function assess({env=process.env,mode='offline'}={}){
 if(!['offline','staging'].includes(mode))throw new Error('Unknown readiness mode.');
 const checks=await assessLocalContracts();
 if(mode==='staging')checks.push(...assessStagingEnvironment(env));
 // No static preflight can prove any of these operational dependencies.
 const unverified=[
  ['F8-EXTERNAL-HTTPS','Independent HTTPS/TLS, headers, reverse proxy and firewall test pending.'],
  ['F8-RESTORE-OFFSITE','Encrypted offsite backup, PITR and restore on isolated REAL staging pending.'],
  ['F8-PROVIDER-SANDBOX','Asaas external sandbox, Meta templates/consent and Resend real delivery pending.'],
  ['F8-LEGAL','Legal LGPD/retention, fiscal and user acceptance pending.'],
  ['F8-SECURITY-REVIEW','Independent security, observability, alerting, rollback and pilot pending.']
 ];
 checks.push(...unverified.map(([code,explanation])=>result(code,false,explanation)));
 return {mode,localContractsPassing:checks.filter(x=>x.code.startsWith('F8-')&&
    ['F8-HEALTH','F8-BACKUP','F8-RESTORE-GUARD','F8-ROADMAP'].includes(x.code))
   .every(x=>x.status==='pass'),
  operationallyHomologated:false,deployApproved:false,checks};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv.includes('--staging')?'staging':'offline';
 const output=await assess({mode});
 if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(output,null,2)+'\n');
 else{
  process.stdout.write('CobraFlux F8 '+mode+': offline assessment only, no connections\n');
  for(const c of output.checks)process.stdout.write(c.status.toUpperCase()+' '+c.code+': '+c.explanation+'\n');
  process.stdout.write('OPERATIONAL HOMOLOGATION: NOT ESTABLISHED; DEPLOY: NOT AUTHORIZED\n');
 }
 if(!output.localContractsPassing||mode==='staging')process.exitCode=2;
}
