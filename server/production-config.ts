// F8 #02: fail closed for production misconfiguration, without network or secrets in logs.
type ConfigEnv=Readonly<Record<string,string|undefined>>;
function canonicalHttpsOrigin(value:string|undefined):string|null{
 if(!value||value.trim()!==value)return null;
 let url:URL;
 try{url=new URL(value);}catch{return null;}
 const host=url.hostname.toLowerCase().replace(/^\[|\]$/g,'');
 if(url.protocol!=='https:'||!host||url.username||url.password||
  url.search||url.hash||url.pathname!=='/'||
  (value!==url.origin&&value!==url.origin+'/')||
  host==='localhost'||host.endsWith('.localhost')||
  host==='0.0.0.0'||host==='::1'||/^127\./.test(host))return null;
 return url.origin;
}
export function validateProductionConfig(env:ConfigEnv):{origin:string|undefined}{
 if(env.NODE_ENV!=='production')return {origin:env.APP_ORIGIN};
 const origin=canonicalHttpsOrigin(env.APP_ORIGIN);
 if(!origin)throw new Error('APP_ORIGIN must be a canonical, public HTTPS origin in production.');
 if(env.DATABASE_SSL!=='require')
  throw new Error('DATABASE_SSL=require is mandatory in production (validated server CA).');
 const secret=env.SESSION_SECRET??'';
 if(secret.length<32||/(?:change-me|ci-test-secret|synthetic-only|ci-only|testpass)/i.test(secret))
  throw new Error('SESSION_SECRET must be a unique non-example secret of at least 32 characters.');
 return {origin};
}
