// F8 #06 optional manual HTTPS smoke. NEVER runs network automatically in CI.
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export function stagingOrigin(raw){
 if(!raw||typeof raw!=='string'||raw.trim()!==raw)throw new Error('Explicit HTTPS staging origin required');
 let url;
 try{url=new URL(raw);}catch{throw new Error('Invalid staging origin');}
 const hostname=url.hostname.toLowerCase().replace(/^\[|\]$/g,'');
 const privateAddress=/^(?:localhost|.+\.localhost|.+\.local|.+\.internal|127\..*|10\..*|192\.168\..*|169\.254\..*|172\.(?:1[6-9]|2\d|3[01])\..*|0\.0\.0\.0|::1)$/i;
 if(url.protocol!=='https:'||!hostname||privateAddress.test(hostname)||
  /^(?:\d+\.){3}\d+$/.test(hostname)||hostname.includes(':')||
  url.username||url.password||url.search||url.hash||url.pathname!=='/'||
  (raw!==url.origin&&raw!==url.origin+'/'))
  throw new Error('Unsafe or noncanonical HTTPS staging origin');
 return url.origin;
}
export async function probe(origin,{fetchFn=fetch,timeoutMs=8000}={}){
 const base=stagingOrigin(origin);
 const r=await fetchFn(base+'/api/health',{
  method:'GET',redirect:'error',headers:{accept:'application/json'},
  signal:AbortSignal.timeout(timeoutMs)
 });
 if(!r||typeof r.status!=='number'||typeof r.headers?.get!=='function')
  throw new Error('Invalid HTTPS probe response');
 let body;
 try{body=await r.json();}catch{body=null;}
 const headers={
  cacheControl:r.headers.get('cache-control')||'',
  contentType:r.headers.get('content-type')||'',
  contentOptions:r.headers.get('x-content-type-options')||'',
  referrerPolicy:r.headers.get('referrer-policy')||''
 };
 const checks={
  httpsOrigin:true,healthOk:r.status===200&&body?.ok===true&&body?.service==='cobraflux-api',
  json:headers.contentType.includes('application/json'),
  noStore:headers.cacheControl.toLowerCase().includes('no-store'),
  noSniff:headers.contentOptions==='nosniff',
  referrer:headers.referrerPolicy==='strict-origin-when-cross-origin'
 };
 return {checks,passed:Object.values(checks).every(Boolean),
  // A read-only health check alone cannot validate DB isolation/backup/providers.
  operationallyHomologated:false,releaseApproved:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),index=args.indexOf('--origin'),raw=index>=0?args[index+1]:null;
 if(!raw){process.stdout.write('F8 HTTPS SMOKE: no network request. Explicit --origin https://staging.example is required.\n');}
 else{
  try{
   const r=await probe(raw);
   for(const [key,value] of Object.entries(r.checks))process.stdout.write(key+': '+(value?'PASS':'FAIL')+'\n');
   process.stdout.write('OPERATIONAL HOMOLOGATION/DEPLOY: NOT ESTABLISHED\n');
   if(!r.passed)process.exitCode=2;
  }catch{process.stderr.write('F8 HTTPS SMOKE FAILED (details suppressed)\n');process.exitCode=2;}
 }
}
