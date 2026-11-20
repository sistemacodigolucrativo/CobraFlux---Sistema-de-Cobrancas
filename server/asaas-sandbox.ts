import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { z } from 'zod';

/** Sandbox is deliberately hardcoded: no environment variable can point at the live Asaas API. */
const SANDBOX_ORIGIN='https://api-sandbox.asaas.com/v3';
export const sandboxProvider='asaas_sandbox' as const;

function encryptionKey():Buffer {
  const secret=process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY??'';
  if(!/^[0-9a-fA-F]{64}$/.test(secret))throw new Error('payment_credentials_key_not_configured');
  return Buffer.from(secret,'hex');
}
export function credentialsReady():boolean {
  return /^[0-9a-fA-F]{64}$/.test(process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY??'');
}
export function encryptApiKey(value:string,orgId:string):string{
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',encryptionKey(),iv);
  cipher.setAAD(Buffer.from(orgId));
  const ciphertext=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),ciphertext]).toString('base64url');
}
export function decryptApiKey(ciphertext:string,orgId:string):string{
  const combined=Buffer.from(ciphertext,'base64url');
  if(combined.length<29)throw new Error('invalid_encrypted_api_key');
  const decipher=createDecipheriv('aes-256-gcm',encryptionKey(),combined.subarray(0,12));
  decipher.setAAD(Buffer.from(orgId));
  decipher.setAuthTag(combined.subarray(12,28));
  return Buffer.concat([decipher.update(combined.subarray(28)),decipher.final()]).toString('utf8');
}
const providerId=z.string().trim().min(3).max(120);
const customerData=z.object({id:providerId,externalReference:z.string().optional()}).passthrough();
const paymentData=z.object({id:providerId,externalReference:z.string().optional(),
  value:z.number().finite().optional(),status:z.string().optional()}).passthrough();
export const providerRefund=z.object({
  value:z.number().finite().nonnegative(),
  status:z.enum(['PENDING','CANCELLED','DONE']),
  description:z.string().nullable().optional(),
  transactionReceiptUrl:z.string().url().nullable().optional()
}).passthrough();
export type SandboxRefund=z.infer<typeof providerRefund>;
const refundResponse=z.union([
  z.array(providerRefund),
  z.object({data:z.array(providerRefund),hasMore:z.boolean().optional()}).passthrough()
]);
const detailedPayment=z.object({
  id:providerId,value:z.number().finite().positive(),status:z.string().min(3),
  externalReference:z.string().optional(),billingType:z.string().optional(),
  transactionReceiptUrl:z.string().url().nullable().optional()
}).passthrough();
const qrData=z.object({payload:z.string().trim().min(20).max(6000),
  encodedImage:z.string().regex(/^[A-Za-z0-9+/=]+$/).max(500000).optional(),expirationDate:z.string().nullable().optional()}).passthrough();
const asaasList=z.object({data:z.array(z.unknown()),hasMore:z.boolean().optional()}).passthrough();

export class AsaasError extends Error {
  constructor(public readonly status:number,public readonly step:string){
    super('asaas_sandbox_'+step+'_failed');
  }
}
export class AsaasSandbox {
  constructor(private readonly apiKey:string,private readonly transport:typeof fetch=fetch){
    if(!apiKey||apiKey.length<30)throw new Error('asaas_sandbox_api_key_required');
  }
  private async request(method:'GET'|'POST',path:string,body?:object):Promise<unknown>{
    if(!path.startsWith('/')||path.startsWith('//')||path.includes('..'))throw new Error('invalid_provider_path');
    const url=SANDBOX_ORIGIN+path;
    let res:Response;
    try{
      res=await this.transport(url,{
        method,headers:{access_token:this.apiKey,'User-Agent':'CobraFlux-Sandbox-Connector/1.0',
          ...(body?{'Content-Type':'application/json'}:{})},
        ...(body?{body:JSON.stringify(body)}:{}),
        signal:AbortSignal.timeout(15000),
        redirect:'error'
      });
    }catch{throw new AsaasError(0,'network_or_timeout');}
    if(!res.ok)throw new AsaasError(res.status,'http');
    try{return await res.json();}catch{throw new AsaasError(res.status,'invalid_json');}
  }
  async customerByReference(clientId:string):Promise<string|null>{
    const q=await this.request('GET','/customers?externalReference='+encodeURIComponent(clientId)+'&limit=100');
    const parsed=asaasList.parse(q);
    const entry=parsed.data.map(row=>customerData.safeParse(row))
      .find(item=>item.success&&item.data.externalReference===clientId);
    return entry?.success?entry.data.id:null;
  }
  async createCustomer(data:{clientId:string;name:string;email:string|null;phone:string}):Promise<string>{
    const response=await this.request('POST','/customers',{
      name:data.name,externalReference:data.clientId,notificationDisabled:true,
      ...(data.email?{email:data.email}:{}),
      mobilePhone:data.phone.replace(/^\+55/,'').replace(/\D/g,'')
    });
    return customerData.parse(response).id;
  }
  async paymentByReference(chargeId:string):Promise<{id:string;value?:number;status?:string}|null>{
    const q=await this.request('GET','/payments?externalReference='+encodeURIComponent(chargeId)+'&limit=100');
    const parsed=asaasList.parse(q);
    const entry=parsed.data.map(row=>paymentData.safeParse(row))
      .find(item=>item.success&&item.data.externalReference===chargeId);
    return entry?.success?{id:entry.data.id,value:entry.data.value,status:entry.data.status}:null;
  }
  async createPayment(data:{chargeId:string;customerId:string;amountCents:number;description:string;dueDate:string}){
    if(!Number.isSafeInteger(data.amountCents)||data.amountCents<1)throw new Error('invalid_payment_amount');
    const response=await this.request('POST','/payments',{
      customer:data.customerId,billingType:'PIX',value:Number((data.amountCents/100).toFixed(2)),
      dueDate:data.dueDate,description:data.description,externalReference:data.chargeId
    });
    return paymentData.parse(response);
  }
  async getPayment(providerPaymentId:string){
    const id=providerId.parse(providerPaymentId);
    return detailedPayment.parse(await this.request('GET','/payments/'+encodeURIComponent(id)));
  }
  async getRefunds(providerPaymentId:string):Promise<SandboxRefund[]>{
    const id=providerId.parse(providerPaymentId);
    const body=refundResponse.parse(await this.request('GET','/payments/'+encodeURIComponent(id)+'/refunds'));
    if(!Array.isArray(body)&&body.hasMore)throw new Error('provider_refunds_pagination_required');
    return Array.isArray(body)?body:body.data;
  }
  async requestRefund(providerPaymentId:string,amountCents:number,description:string):Promise<void>{
    const id=providerId.parse(providerPaymentId);
    if(!Number.isSafeInteger(amountCents)||amountCents<=0||amountCents>10000000000)
      throw new Error('invalid_refund_amount');
    if(description.length<12||description.length>220)throw new Error('invalid_refund_description');
    // HTTP acceptance is NOT refund completion; only GET /refunds entries with status DONE count.
    await this.request('POST','/payments/'+encodeURIComponent(id)+'/refund',{
      value:Number((amountCents/100).toFixed(2)),description
    });
  }
  async getQrCode(providerPaymentId:string){
    const id=providerId.parse(providerPaymentId);
    const response=await this.request('GET','/payments/'+encodeURIComponent(id)+'/pixQrCode');
    return qrData.parse(response);
  }
}
