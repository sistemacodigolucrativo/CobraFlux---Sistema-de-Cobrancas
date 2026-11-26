import {createCipheriv,createDecipheriv,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import {z} from 'zod';

/** Official Meta Cloud API. No dynamic origins, redirects or arbitrary Graph paths. */
export const GRAPH_ORIGIN='https://graph.facebook.com/v27.0';
const secret=()=> {
  const value=process.env.WHATSAPP_CREDENTIAL_ENCRYPTION_KEY??'';
  if(!/^[0-9a-fA-F]{64}$/.test(value))throw new Error('whatsapp_encryption_key_missing');
  return Buffer.from(value,'hex');
};
export function encryptWhatsAppToken(value:string,orgId:string){
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',secret(),iv);
  cipher.setAAD(Buffer.from('whatsapp:'+orgId));
  const bytes=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),bytes]).toString('base64url');
}
export function decryptWhatsAppToken(value:string,orgId:string){
  const bytes=Buffer.from(value,'base64url');
  if(bytes.length<29)throw new Error('invalid_whatsapp_credentials');
  const decipher=createDecipheriv('aes-256-gcm',secret(),bytes.subarray(0,12));
  decipher.setAAD(Buffer.from('whatsapp:'+orgId));
  decipher.setAuthTag(bytes.subarray(12,28));
  return Buffer.concat([decipher.update(bytes.subarray(28)),decipher.final()]).toString('utf8');
}
export function whatsappSecretsReady(){
  return /^[a-fA-F0-9]{64}$/.test(process.env.WHATSAPP_CREDENTIAL_ENCRYPTION_KEY??'');
}
export function verifyMetaSignature(body:Buffer,signature:string|undefined,appSecret:string){
  if(!appSecret||!signature||!/^sha256=[a-fA-F0-9]{64}$/.test(signature))return false;
  const actual=Buffer.from(signature.slice(7),'hex');
  const expected=createHmac('sha256',appSecret).update(body).digest();
  return actual.length===expected.length&&timingSafeEqual(actual,expected);
}
const templateComponent=z.object({type:z.string(),text:z.string().optional()}).passthrough();
const templateRow=z.object({
  name:z.string(),language:z.string(),status:z.string(),category:z.string(),
  components:z.array(templateComponent).optional()
}).passthrough();
const list=z.object({
  data:z.array(templateRow),
  paging:z.object({next:z.string().optional()}).passthrough().optional()
}).passthrough();
const sendAck=z.object({
  messages:z.array(z.object({id:z.string().min(5).max(300)}).passthrough()).min(1)
}).passthrough();
export type ApprovedTemplate={name:string;language:string;category:'UTILITY';parameterCount:3};
export function eligibleUtilityTemplates(value:unknown):ApprovedTemplate[]{
  const page=list.parse(value);
  if(page.paging?.next)throw new Error('whatsapp_templates_paginated_manual_review');
  return page.data.flatMap(t=>{
    if(t.status!=='APPROVED'||t.category!=='UTILITY'||
       !/^[a-z0-9_]{3,120}$/.test(t.name)||
       !/^[a-z]{2}(_[A-Z]{2})?$/.test(t.language))return [];
    const body=t.components?.find(c=>c.type==='BODY')?.text??'';
    const variables=[...body.matchAll(/\{\{([1-9]\d*)\}\}/g)].map(m=>Number(m[1]));
    const unique=[...new Set(variables)].sort((a,b)=>a-b);
    if(unique.length!==3||unique.join(',')!=='1,2,3')return [];
    if(t.components?.some(c=>c.type==='HEADER'&&/\{\{\d+\}\}/.test(c.text??'')))return [];
    return [{name:t.name,language:t.language,category:'UTILITY' as const,parameterCount:3 as const}];
  });
}
export class MetaHttpError extends Error {
  constructor(public readonly status:number,public readonly definite:boolean){
    super(status===429?'meta_rate_limited':'meta_provider_request_failed');
  }
}
export class WhatsAppCloud {
  constructor(private readonly token:string,private readonly transport:typeof fetch=fetch){
    if(token.trim().length<20)throw new Error('invalid_whatsapp_access_token');
  }
  private async request(method:'GET'|'POST',path:string,body?:object){
    if(!/^\/[0-9]{5,30}(?:\/message_templates|\/messages)(?:\?.*)?$/.test(path))
      throw new Error('invalid_meta_path');
    let res:Response;
    try{
      res=await this.transport(GRAPH_ORIGIN+path,{
        method,headers:{Authorization:'Bearer '+this.token,...(body?{'Content-Type':'application/json'}:{})},
        ...(body?{body:JSON.stringify(body)}:{}),
        signal:AbortSignal.timeout(12000),redirect:'error'
      });
    }catch{throw new MetaHttpError(0,false);}
    // For a message POST, 5xx/429 can be inconclusive; NEVER resend blindly.
    if(!res.ok)throw new MetaHttpError(res.status,method==='GET'||res.status>=400&&res.status<500&&res.status!==429);
    try{return await res.json();}catch{throw new MetaHttpError(res.status,false);}
  }
  async listUtilityTemplates(wabaId:string){
    const params='?fields=name,language,status,category,components&limit=100';
    return eligibleUtilityTemplates(await this.request('GET','/'+wabaId+'/message_templates'+params));
  }
  async sendApprovedReminder(input:{
    phoneNumberId:string;recipient:string;name:string;language:string;
    values:[string,string,string]
  }){
    const response=await this.request('POST','/'+input.phoneNumberId+'/messages',{
      messaging_product:'whatsapp',to:input.recipient,type:'template',
      template:{name:input.name,language:{code:input.language},
        components:[{type:'body',parameters:input.values.map(text=>({type:'text',text}))}]}
    });
    return sendAck.parse(response).messages[0].id;
  }
}
export function inBusinessHours(date:Date){
  // Conservative internal window: 09:00–18:59 America/Sao_Paulo, Mon–Sat.
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',
    hour:'2-digit',hourCycle:'h23',weekday:'short'}).formatToParts(date);
  const h=Number(parts.find(x=>x.type==='hour')?.value);
  const day=parts.find(x=>x.type==='weekday')?.value;
  return h>=9&&h<19&&day!=='Sun';
}
