// F8 #04: static guard for the *repository* dependency resolution and CI supply chain.
// Never fetches packages, executes code or reads secret values.
import {readFile,readdir,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const pinnedActions=new Map([
 ['actions/checkout','11d5960a326750d5838078e36cf38b85af677262'],
 ['actions/setup-node','49933ea5288caeca8642d1e84afbd3f7d6820020'],
 ['actions/upload-artifact','ea165f8d65b6e75b540449e92b4886f43607fa02']
]);
const approvedImages={
 node:'node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a',
 postgres:'postgres:16@sha256:3950ad7c3148ca2175ef1b6c36c9efbf78957ae8fbe8b3a5d7c35af50500382f'
};
const equalDeps=(a,b)=>{
 const keys=new Set([...Object.keys(a||{}),...Object.keys(b||{})]);
 return [...keys].every(k=>a?.[k]===b?.[k]);
};
export function validateLock(pkg,lock){
 const failures=[];
 if(lock?.lockfileVersion!==3)failures.push('NPM lockfile v3 required');
 if(lock?.name!==pkg?.name||lock?.version!==pkg?.version)
  failures.push('Package name/version differs from lockfile');
 if(!equalDeps(pkg?.dependencies,lock?.packages?.['']?.dependencies))
  failures.push('Runtime dependencies differ from lockfile');
 if(!equalDeps(pkg?.devDependencies,lock?.packages?.['']?.devDependencies))
  failures.push('Dev dependencies differ from lockfile');
 if(!lock?.packages||Object.keys(lock.packages).length<2)
  failures.push('Lockfile package tree is missing');
 // npm ci remains authoritative. Do not claim this static test validates package integrity.
 return failures;
}
export function validateWorkflow(content,path){
 const failures=[];
 if(!/^permissions:\s*\n[ \t]+contents:[ \t]+read(?:\s|$)/m.test(content))
  failures.push(path+': missing read-only default GitHub token permissions');
 if(/^\s*permissions:\s*write-all/m.test(content)||/^\s*contents:\s*write\b/m.test(content))
  failures.push(path+': write permission without explicit review');
 if(/\bnpm\s+install\b|\bnpm\s+i\s+--no-package-lock\b/.test(content))
  failures.push(path+': unpinned npm install used instead of npm ci');
 const imageRefs=[...content.matchAll(/\bpostgres:16(?:@sha256:[a-f0-9]{64})?/g)].map(x=>x[0]);
 for(const ref of imageRefs)
  if(ref!==approvedImages.postgres)failures.push(path+': PostgreSQL must use reviewed digest');
 const actionRefs=[...content.matchAll(/^\s*-\s*uses:\s*([^\s#]+)/gm)].map(x=>x[1]);
 if(!actionRefs.length)failures.push(path+': no actions found');
 for(const ref of actionRefs){
  const match=ref.match(/^([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)@([a-f0-9]{40})$/);
  if(!match){failures.push(path+': mutable or unpinned action '+ref);continue;}
  if(pinnedActions.get(match[1])!==match[2])
   failures.push(path+': unreviewed action or different SHA '+match[1]);
 }
 return failures;
}
export function validateDocker(content){
 const failures=[];
 if(!/^COPY package\.json package-lock\.json \.\/$/m.test(content))
  failures.push('Dockerfile must copy exact package manifest and lockfile together');
 if(!content.includes('FROM '+approvedImages.node))
  failures.push('Dockerfile Node base image must be pinned to reviewed digest');
 if(!/^RUN npm ci --no-audit --no-fund$/m.test(content))
  failures.push('Dockerfile must use npm ci');
 if(/\bnpm\s+install\b/.test(content))failures.push('Dockerfile contains non-frozen install');
 return failures;
}
export async function inspect(repoRoot=root){
 const pkg=JSON.parse(await readFile(resolve(repoRoot,'package.json'),'utf8'));
 const lock=JSON.parse(await readFile(resolve(repoRoot,'package-lock.json'),'utf8'));
 const failures=validateLock(pkg,lock);
 const names=(await readdir(resolve(repoRoot,'.github/workflows'))).filter(x=>/\.ya?ml$/.test(x));
 for(const name of names){
  const path='.github/workflows/'+name;
  failures.push(...validateWorkflow(await readFile(resolve(repoRoot,path),'utf8'),path));
 }
 failures.push(...validateDocker(await readFile(resolve(repoRoot,'Dockerfile'),'utf8')));
 try{await stat(resolve(repoRoot,'bun.lock'));failures.push('Stale second package-manager lockfile bun.lock remains');}
 catch(e){if(e?.code!=='ENOENT')failures.push('Unable to inspect legacy lock status');}
 return {failures:failures.sort(),workflows:names.length,
  packages:Object.keys(lock.packages).length,actionAllowlist:[...pinnedActions.keys()]};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const r=await inspect();
  for(const failure of r.failures)process.stderr.write('F8 SUPPLY CHAIN ERROR: '+failure+'\n');
  process.stdout.write('F8 supply chain: '+r.workflows+' workflows; '+r.packages+' lock entries; '+
   (r.failures.length?'FAILED':'STATIC CONTRACT PASSED')+'\n');
  process.stdout.write('LIMIT: does not verify provenance of downloaded packages, Docker base digests or vulnerabilities.\n');
  if(r.failures.length)process.exitCode=1;
 }catch{
  process.stderr.write('F8 SUPPLY CHAIN ERROR: cannot inspect local project manifests/workflows\n');
  process.exitCode=1;
 }
}
