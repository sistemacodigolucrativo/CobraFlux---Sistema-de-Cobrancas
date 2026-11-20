import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function base32Encode(buffer:Buffer):string{
  let bits=0, bufferValue=0, out='';
  for(const byte of buffer){
    bufferValue=(bufferValue<<8)|byte;
    bits+=8;
    while(bits>=5){out+=ALPHABET[(bufferValue>>>(bits-5))&31];bits-=5;}
    bufferValue&=(1<<bits)-1;
  }
  if(bits>0)out+=ALPHABET[(bufferValue<<(5-bits))&31];
  return out;
}
export function base32Decode(text:string):Buffer{
  const s=text.toUpperCase().replace(/=+$/,'').replace(/ /g,'');
  if(!s || !/^[A-Z2-7]+$/.test(s))throw new Error('Invalid TOTP seed');
  let bits=0, bufferValue=0;const bytes:number[]=[];
  for(const char of s){
    bufferValue=(bufferValue<<5)|ALPHABET.indexOf(char);
    bits+=5;
    if(bits>=8){bits-=8;bytes.push((bufferValue>>>bits)&255);bufferValue&=(1<<bits)-1;}
  }
  return Buffer.from(bytes);
}
export function createTotpSecret():string{return base32Encode(randomBytes(20));}
export function totpCode(secret:string, step:number, digits=6):string{
  const b=Buffer.alloc(8);
  b.writeBigUInt64BE(BigInt(step));
  const digest=createHmac('sha1',base32Decode(secret)).update(b).digest();
  const offset=digest[digest.length-1]&0x0f;
  const n=(digest.readUInt32BE(offset)&0x7fffffff)%(10**digits);
  return String(n).padStart(digits,'0');
}
export function matchTotpStep(secret:string, code:string, timestampMs=Date.now()):number|null{
  if(!/^\d{6}$/.test(code))return null;
  const step=Math.floor(timestampMs/30000);
  for(let delta=-1;delta<=1;delta++){
    const test=totpCode(secret,step+delta);
    if(timingSafeEqual(Buffer.from(test),Buffer.from(code)))return step+delta;
  }
  return null;
}
function keyFromEnv():Buffer{
  const key=process.env.MFA_ENCRYPTION_KEY;
  if(!key || !/^[0-9a-fA-F]{64}$/.test(key))throw new Error('MFA_ENCRYPTION_KEY must be exactly 32 bytes of hex');
  return Buffer.from(key,'hex');
}
export function encryptTotpSecret(secret:string):string{
  const iv=randomBytes(12);
  const c=createCipheriv('aes-256-gcm',keyFromEnv(),iv);
  const encrypted=Buffer.concat([c.update(secret,'utf8'),c.final()]);
  return [iv.toString('base64url'),c.getAuthTag().toString('base64url'),encrypted.toString('base64url')].join('.');
}
export function decryptTotpSecret(payload:string):string{
  const parts=payload.split('.');
  if(parts.length!==3)throw new Error('Invalid encrypted secret');
  const [iv,tag,data]=parts.map(x=>Buffer.from(x,'base64url'));
  if(iv.length!==12||tag.length!==16)throw new Error('Invalid encrypted secret');
  const d=createDecipheriv('aes-256-gcm',keyFromEnv(),iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(data),d.final()]).toString('utf8');
}
