// F8 #03: offline inventory of env variable NAMES only. No credentials/network.
import {readFile,readdir} from 'node:fs/promises';
import {resolve,dirname,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const inventoryPath='docs/security/staging-config-inventory.json';
const shouldScan=path=>path.startsWith('server/')?
 path.endsWith('.ts')&&!/(?:\.test|\.integration)\.ts$/.test(path):
 path.startsWith('scripts/')?
 (path.endsWith('.mjs')||path.endsWith('.sh'))&&!path.endsWith('.test.mjs'):
 path.startsWith('src/')?/\.(?:ts|tsx|js|jsx)$/.test(path)&&
 !/\.test\./.test(path):false;
async function walk(dir,acc,base){
 for(const e of await readdir(dir,{withFileTypes:true})){
  const full=join(dir,e.name);
  if(e.isDirectory())await walk(full,acc,base);
  else if(e.isFile()){
   const rel=relative(base,full).replaceAll('\\','/');
   if(shouldScan(rel))acc.push(rel);
  }
 }
}
export function discoverInText(source,path){
 const found=new Set();
 for(const regex of [
  /\bprocess\s*\.\s*env\s*(?:\.\s*([A-Z][A-Z0-9_]*)|\[\s*['"]([A-Z][A-Z0-9_]*)['"]\s*\])/g,
  /\bimport\s*\.\s*meta\s*\.\s*env\s*\.\s*(VITE_[A-Z0-9_]+)/g
 ]){
  for(const match of source.matchAll(regex))found.add(match[1]||match[2]);
 }
 if(path==='server/production-config.ts'||path==='scripts/phase8-readiness.mjs')
  for(const m of source.matchAll(/\benv\.([A-Z][A-Z0-9_]*)/g))found.add(m[1]);
 if(path.endsWith('.sh'))
  for(const m of source.matchAll(/\$\{([A-Z][A-Z0-9_]*):\?/g))found.add(m[1]);
 if(path==='.env.example')
  for(const m of source.matchAll(/^([A-Z][A-Z0-9_]*)=/gm))found.add(m[1]);
 return [...found].sort();
}
export function validateInventory(manifest,observed){
 if(manifest.schemaVersion!==1||!Array.isArray(manifest.items))return ['Invalid schema'];
 const errors=[],seen=new Set(),kinds=new Set(manifest.allowedKinds||[]);
 for(const i of manifest.items){
  if(!i||typeof i.name!=='string'||!/^[A-Z][A-Z0-9_]*$/.test(i.name)){
   errors.push('Invalid variable name');continue;
  }
  if(seen.has(i.name))errors.push('Duplicate variable: '+i.name);
  seen.add(i.name);
  if(!kinds.has(i.kind)||!i.when||!i.storage||!i.handling)
   errors.push('Unclassified variable: '+i.name);
  if(Object.keys(i).some(k=>!['name','kind','when','storage','handling'].includes(k)))
   errors.push('Unexpected field (possible secret value): '+i.name);
  if(i.name.startsWith('VITE_')&&i.kind!=='browser-public')
   errors.push('VITE_ variable cannot be secret/restricted: '+i.name);
  if(i.kind==='secret'&&i.storage!=='secret-manager')
   errors.push('Secret not in secret-manager: '+i.name);
  if(i.kind==='legacy-example'&&i.when!=='not-proven-runtime')
   errors.push('Legacy example incorrectly marked runtime-ready: '+i.name);
 }
 for(const name of observed)if(!seen.has(name))errors.push('Undocumented source env name: '+name);
 for(const name of seen)if(!observed.has(name))errors.push('No source/example evidence: '+name);
 return errors.sort();
}
export async function inspect(base=root){
 const all=[],observed=new Set(),references={};
 await Promise.all(['server','scripts','src'].map(dir=>walk(resolve(base,dir),all,base)));
 all.push('.env.example');
 for(const path of all){
  const source=await readFile(resolve(base,path),'utf8');
  for(const key of discoverInText(source,path)){
   observed.add(key);
   (references[key]??=[]).push(path);
  }
 }
 const manifest=JSON.parse(await readFile(resolve(base,inventoryPath),'utf8'));
 return {documented:manifest.items.length,observed,references,
  errors:validateInventory(manifest,observed)};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const output=await inspect();
  process.stdout.write('F8 offline audit: '+output.documented+' classified; '+
   output.observed.size+' referenced variable names\n');
  for(const e of output.errors)process.stderr.write('F8 CONFIG AUDIT: '+e+'\n');
  process.stdout.write(output.errors.length?'STATUS: FAILED\n':
   'STATUS: CONTRACT PASSED. REAL SECRETS/STAGING NOT VERIFIED.\n');
  if(output.errors.length)process.exitCode=1;
 }catch{
  process.stderr.write('F8 CONFIG AUDIT: unable to inspect sources/inventory\n');
  process.exitCode=1;
 }
}
