export type Session = {
  user: { id:string; name:string; email:string; role:string };
  organizationId:string;
  csrfToken:string;
};
export type Client = {
  id:string; name:string; phone:string; email:string|null; notes:string;
  status:'active'|'archived'; whatsapp_opt_in:boolean;
};
export type Service = { id:string; name:string; description:string; price_cents:string; active:boolean };
export type Charge = {
  id:string; public_token:string; description:string; amount_cents:string;
  discount_cents:string; due_date:string; status:string; client_name:string;
};
export type PublicCharge = {
  description:string; amountCents:number; dueDate:string; status:string;
  merchant:string; pixPayload:string|null; paymentEnabled:boolean;
};
let csrfToken = '';
async function request<T>(path:string, method='GET', body?:object):Promise<T> {
  const response=await fetch('/api'+path,{
    method,credentials:'include',
    headers:{...(body?{'Content-Type':'application/json'}:{}),...(csrfToken&&method!=='GET'?{'X-CF-CSRF':csrfToken}:{})},
    body:body?JSON.stringify(body):undefined
  });
  let payload: unknown;
  try{payload=await response.json();}catch{throw new Error('Resposta inválida do servidor.');}
  if(!response.ok){
    const object=payload as {error?:string;message?:string};
    throw new Error(object.message||object.error||'Erro HTTP '+response.status);
  }
  return payload as T;
}
export const productionApi={
  async me():Promise<Session|null>{
    try{const data=await request<Session>('/auth/me');csrfToken=data.csrfToken;return data;}
    catch{csrfToken='';return null;}
  },
  register:(input:{name:string;businessName:string;email:string;password:string})=>
    request<{ok:boolean}>('/auth/register','POST',input),
  login:async(email:string,password:string,totpCode?:string)=>{
    await request('/auth/login','POST',{email,password,...(totpCode?{totpCode}:{})});
    return productionApi.me();
  },
  logout:async()=>{await request('/auth/logout','POST',{});csrfToken='';},
  resetRequest:(email:string)=>request('/auth/request-reset','POST',{email}),
  resetPassword:(token:string,password:string)=>request('/auth/reset-password','POST',{token,password}),
  verifyEmail:(token:string)=>request<{ok:boolean}>('/auth/verify-email','POST',{token}),
  resendVerification:(email:string)=>request('/auth/resend-verification','POST',{email}),
  sessions:()=>request<{items:Array<{id:string;current:boolean;created_at:string;expires_at:string}>}>('/auth/sessions'),
  revokeAllSessions:async()=>{await request('/auth/sessions/revoke-all','POST',{});csrfToken='';},
  adminOverview:()=>request<{organizations:number;users:number}>('/admin/overview'),
  clients:()=>request<{items:Client[]}>('/clients'),
  createClient:(data:{name:string;phone:string;email?:string;notes?:string;whatsappOptIn:boolean})=>
    request<Client>('/clients','POST',data),
  setClientStatus:(id:string,status:'active'|'archived')=>
    request<Client>('/clients/'+encodeURIComponent(id),'PATCH',{status}),
  services:()=>request<{items:Service[]}>('/services'),
  createService:(data:{name:string;description:string;priceCents:number})=>
    request<Service>('/services','POST',data),
  charges:()=>request<{items:Charge[]}>('/charges'),
  createCharge:(data:{clientId:string;description:string;amountCents:number;dueDate:string})=>
    request<{id:string;public_token:string;status:string;message:string}>('/charges','POST',data),
  cancelCharge:(id:string)=>request('/charges/'+encodeURIComponent(id)+'/cancel','POST',{}),
  publicCharge:(token:string)=>request<PublicCharge>('/public/charges/'+encodeURIComponent(token)),
  overview:()=>request<{total_charges:number;paid_charges:number;total_paid_cents:string}>('/reports/overview'),
};
