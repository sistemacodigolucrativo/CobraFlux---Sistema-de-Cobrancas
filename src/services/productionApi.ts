/** Real HTTPS/API client: no demo data, no local shadow ledger, no client-held payment secrets. */
export type Session = {
  user: { id:string;name:string;email:string;role:'owner'|'operator'|'super_admin' };
  organizationId:string;
  csrfToken:string;
};
export type Client = {
  id:string; internal_code:string;name:string;phone:string;email:string|null;notes:string;
  status:'active'|'archived';whatsapp_opt_in:boolean;service_name:string;
  monthly_fee_cents:string;preferred_due_day:number;created_at:string;updated_at:string;
};
export type Service = {
  id:string;name:string;description:string;price_cents:string;
  default_frequency:'unica'|'semanal'|'mensal'|'personalizada';active:boolean;created_at:string;
};
export type Charge = {
  id:string;public_token:string;client_id:string;service_id:string|null;description:string;
  amount_cents:string;discount_cents:string;paid_cents:string;due_date:string;
  status:string;provider:string|null;provider_charge_id:string|null;refunded_cents:string;client_name:string;created_at:string;updated_at:string;
};
export type PublicCharge = {
  description:string;amountCents:number;dueDate:string;status:string;
  merchant:string;pixPayload:string|null;paymentEnabled:boolean;sandboxOnly?:boolean;
};
export type CsvPreviewRow={
  rowNumber:number;name:string;phone:string;email:string;serviceName:string;
  monthlyFeeCents:number;preferredDueDay:number;valid:boolean;errors:string[];
};
export type ChargeEvent={
  id:string;action:string;details:Record<string,unknown>;created_at:string;
};
export type SupportTicket={
  id:string;subject:string;message:string;status:string;created_at:string;
};
export type Profile={
  user:{id:string;name:string;email:string;role:string};
  organization:{id:string;name:string;category:string;contact_phone:string;contact_email:string};
};
export type ClientInput={
  name:string;phone:string;email?:string;notes?:string;whatsappOptIn:boolean;
  serviceName?:string;monthlyFeeCents?:number;preferredDueDay?:number;
};
export type ServiceInput={
  name:string;description:string;priceCents:number;defaultFrequency?:'unica'|'semanal'|'mensal'|'personalizada';
};
export type ChargeInput={
  clientId:string;serviceId?:string;description:string;amountCents:number;discountCents?:number;dueDate:string;
};
export type OrganizationChoice={id:string;name:string;role:'owner'|'operator'|'super_admin'};
export type TeamMember={id:string;name:string;email:string;role:'owner'|'operator'|'super_admin';organization_id:string};
export type TeamInvitation={
  id:string;email:string;role:'operator';created_at:string;expires_at:string;
  accepted_at:string|null;revoked_at:string|null;
};
export type TeamInfo={members:TeamMember[];invitations:TeamInvitation[]};
export type InvitePreview={email:string;organizationName:string;expiresAt:string};
export class ApiFailure extends Error{
  readonly code:string;
  readonly organizations:OrganizationChoice[];
  constructor(payload:{error?:string;message?:string;organizations?:OrganizationChoice[]},status:number){
    super(payload.message??payload.error??'Erro HTTP '+status);
    this.code=payload.error??'http_error';
    this.organizations=Array.isArray(payload.organizations)?payload.organizations:[];
  }
}
let csrfToken='';
async function request<T>(path:string,method='GET',body?:object):Promise<T>{
  const response=await fetch('/api'+path,{
    method,credentials:'include',
    headers:{...(body?{'Content-Type':'application/json'}:{}),...(csrfToken&&method!=='GET'?{'X-CF-CSRF':csrfToken}:{})},
    body:body?JSON.stringify(body):undefined
  });
  let payload:unknown;
  try{payload=await response.json();}catch{throw new Error('Resposta inválida do servidor.');}
  if(!response.ok){
    const result=payload as {error?:string;message?:string;organizations?:OrganizationChoice[]};
    throw new ApiFailure(result,response.status);
  }
  return payload as T;
}
function qs(fields:Record<string,string|number|undefined>):string{
 const p=new URLSearchParams();
 for(const [key,value] of Object.entries(fields)){
   if(value!==undefined&&value!=='')p.set(key,String(value));
 }
 return p.size?'?'+p.toString():'';
}
const encode=(id:string)=>encodeURIComponent(id);
export const productionApi={
  async me():Promise<Session|null>{
    try{const data=await request<Session>('/auth/me');csrfToken=data.csrfToken;return data;}
    catch{csrfToken='';return null;}
  },
  register:(input:{name:string;businessName:string;email:string;password:string})=>
    request<{ok:boolean}>('/auth/register','POST',input),
  login:async(email:string,password:string,totpCode?:string,organizationId?:string)=>{
    await request('/auth/login','POST',{email,password,...(totpCode?{totpCode}:{}),
      ...(organizationId?{organizationId}:{})});
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
  sandboxConnection:()=>request<{configured:boolean;provider:string;sandboxOnly:true;webhookPath:string|null}>('/sandbox/connection'),
  connectAsaasSandbox:(apiKey:string,webhookToken:string)=>request<{configured:boolean;webhookPath:string;sandboxOnly:true}>('/sandbox/connection','PUT',{apiKey,webhookToken}),
  issueSandboxPix:(id:string)=>request<{id:string;status:string;sandboxOnly:true}>('/sandbox/charges/'+encode(id)+'/issue','POST',{}),
  reconcileSandboxPix:(id:string)=>request<{id:string;status:string;sandboxOnly:true}>('/sandbox/charges/'+encode(id)+'/reconcile','POST',{}),
  requestSandboxCancellation:(id:string,reason:string)=>request<{
    id:string;state:string;chargeStatus:string;sandboxOnly:true;providerDeleteRetried:false
  }>('/sandbox/charges/'+encode(id)+'/cancellation','POST',{reason}),
  reconcileSandboxCancellation:(id:string)=>request<{
    id:string;state:string;chargeStatus:string;sandboxOnly:true;providerDeleteRetried:false
  }>('/sandbox/charges/'+encode(id)+'/cancellation/reconcile','POST',{}),
  sandboxCancellationStatus:(id:string)=>request<{
    id:string;state:string;reason:string;last_error:string|null;created_at:string;sandboxOnly:true
  }>('/sandbox/charges/'+encode(id)+'/cancellation'),
  sandboxQr:(token:string)=>request<{payload:string;encodedImage?:string;sandboxOnly:true}>('/public/charges/'+encode(token)+'/sandbox-qr'),
  sandboxPaymentReceipt:(id:string)=>request<{receiptUrl:string;sandboxOnly:true}>('/sandbox/charges/'+encode(id)+'/payment-receipt'),
  sandboxReconciliationOverview:()=>request<{sandboxOnly:true;automated:false;schedulerRequired:true;
    summary:{total:number;due:number;flagged:number;repeated_failures:number};
    incidents:Array<{charge_id:string;code:string;first_seen_at:string;last_seen_at:string}>}>('/sandbox/reconciliation/overview'),
  sandboxRefunds:(id:string)=>request<{items:Array<{id:string;requested_cents:string;state:string;receipt_url:string|null;created_at:string}>;
    chargeStatus:string;refundedCents:string;reconciliationRequired:boolean;sandboxOnly:true}>('/sandbox/charges/'+encode(id)+'/refunds'),
  requestSandboxRefund:(id:string,amountCents:number,reason:string)=>request<{id:string;state:string;sandboxOnly:true}>('/sandbox/charges/'+encode(id)+'/refunds','POST',{amountCents,reason}),
  reconcileSandboxFinancial:(id:string)=>request<{status:string;refundedCents:number;paidCents:number;
    pendingRefundCents:number;needsReview:boolean;sandboxOnly:true}>('/sandbox/charges/'+encode(id)+'/reconcile-financial','POST',{}),
  organizations:()=>request<{items:OrganizationChoice[];currentOrganizationId:string}>('/auth/organizations'),
  switchOrganization:async(organizationId:string)=>{
    await request('/auth/switch-organization','POST',{organizationId});
    const session=await productionApi.me();
    if(!session)throw new Error('Sessão não disponível após a troca de organização.');
    return session;
  },
  team:()=>request<TeamInfo>('/team'),
  inviteOperator:(email:string)=>request<{id:string;email:string;role:string;expiresAt:string}>('/team/invitations','POST',{email}),
  revokeInvite:(id:string)=>request<{ok:boolean}>('/team/invitations/'+encode(id)+'/revoke','POST',{}),
  removeOperator:(id:string)=>request<{ok:boolean}>('/team/members/'+encode(id),'DELETE',{}),
  previewInvite:(token:string)=>request<InvitePreview>('/team/invitation/'+encode(token)),
  activateInvite:(token:string,name:string,password:string)=>
    request<{ok:boolean;organizationId:string;organizationName:string;email:string}>('/team/activate','POST',{token,name,password}),
  acceptInvite:(token:string)=>request<{ok:boolean;organizationId:string;organizationName:string}>('/team/accept','POST',{token}),

  clients:(filter:{search?:string;status?:'active'|'archived';limit?:number;offset?:number}={})=>
    request<{items:Client[];total:number}>('/clients'+qs(filter)),
  createClient:(data:ClientInput)=>request<Client>('/clients','POST',data),
  updateClient:(id:string,patch:Partial<ClientInput>&{status?:Client['status']})=>
    request<Client>('/clients/'+encode(id),'PATCH',patch),
  setClientStatus:(id:string,status:'active'|'archived')=>
    request<Client>('/clients/'+encode(id),'PATCH',{status}),
  clientCharges:(id:string)=>request<{items:Charge[]}>('/clients/'+encode(id)+'/charges'),
  previewClientCsv:(csv:string)=>request<{items:CsvPreviewRow[];valid:number;invalid:number}>('/clients/import/preview','POST',{csv}),
  importClients:(csv:string,mode:'strict'|'valid_only')=>
    request<{id:string;importedCount:number;rejectedCount:number}>('/clients/import','POST',{csv,mode}),
  clientImports:()=>request<{items:Array<{id:string;imported_count:number;rejected_count:number;created_at:string}>}>('/clients/imports'),

  services:()=>request<{items:Service[]}>('/services'),
  createService:(data:ServiceInput)=>request<Service>('/services','POST',data),
  updateService:(id:string,patch:Partial<ServiceInput>&{active?:boolean})=>
    request<Service>('/services/'+encode(id),'PATCH',patch),

  charges:(filter:{search?:string;status?:string;limit?:number;offset?:number}={})=>
    request<{items:Charge[];total:number}>('/charges'+qs(filter)),
  createCharge:(data:ChargeInput)=>request<{id:string;public_token:string;status:string;paymentEnabled:boolean}>('/charges','POST',data),
  updateCharge:(id:string,patch:Partial<Omit<ChargeInput,'clientId'|'serviceId'>>)=>
    request<{id:string;status:string}>('/charges/'+encode(id),'PATCH',patch),
  duplicateCharge:(id:string,dueDate?:string)=>request<{id:string;public_token:string;status:string}>('/charges/'+encode(id)+'/duplicate','POST',dueDate?{dueDate}:{}),
  cancelCharge:(id:string,reason='Cancelada pelo profissional')=>request<{id:string;status:string}>('/charges/'+encode(id)+'/cancel','POST',{reason}),
  chargeHistory:(id:string)=>request<{items:ChargeEvent[]}>('/charges/'+encode(id)+'/history'),
  publicCharge:(token:string)=>request<PublicCharge>('/public/charges/'+encode(token)),
  overview:()=>request<{total_charges:number;paid_charges:number;total_paid_cents:string;sandbox_paid_charges:number;sandbox_paid_cents:string}>('/reports/overview'),

  profile:()=>request<Profile>('/profile'),
  updateProfile:(name:string)=>request<{id:string;name:string;email:string}>('/profile','PATCH',{name}),
  changePassword:(currentPassword:string,newPassword:string)=>
    request<{ok:boolean;otherSessionsRevoked:boolean}>('/profile/change-password','POST',{currentPassword,newPassword}),
  updateOrganization:(patch:Partial<{name:string;category:string;contactPhone:string;contactEmail:string}>)=>
    request<Profile['organization']>('/organization','PATCH',patch),
  supportTickets:()=>request<{items:SupportTicket[]}>('/support/tickets'),
  createSupportTicket:(subject:string,message:string)=>
    request<SupportTicket>('/support/tickets','POST',{subject,message}),
};
