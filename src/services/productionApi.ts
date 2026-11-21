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
export type RecurrencePlan={
 id:string;client_id:string;service_id:string|null;client_name:string;description:string;
 amount_cents:string;discount_cents:string;frequency:'monthly'|'weekly';anchor_day:number;
 first_due_date:string;next_due_date:string;state:'active'|'paused'|'cancelled';
 generated_count:number;attempts:number;last_error:string|null;created_at:string;updated_at:string;
};
export type RecurrenceInput={
 clientId:string;description:string;amountCents:number;discountCents?:number;
 frequency:'monthly'|'weekly';anchorDay?:number;firstDueDate:string;
};
export type RecurrenceCycle={
 id:string;cycle_key:string;due_date:string;charge_id:string;charge_status:string;
 amount_cents:string;discount_cents:string;created_at:string;
};
export type SaaSResource='clients'|'services'|'charges_month'|'recurrences'|'members'|'messages_month';
export type SaaSPlan={
 code:'free'|'starter'|'business';label:string;monthly_price_cents:string|null;currency:'BRL';
 clients_limit:number;services_limit:number;charges_month_limit:number;recurrences_limit:number;
 members_limit:number;messages_month_limit:number;published:boolean;
};
export type SaaSSubscription={
 subscription:{plan_code:string;status:string;grace_until:string|null;current_period_end:string|null;
   current_period_start:string;cancel_at_period_end:boolean};
 effectivePlan:string;limits:Record<SaaSResource,number>;usage:Record<SaaSResource,number>;
 pendingPaymentDoesNotActivate:true;realCheckoutEnabled:false;
};
export type SaaSInvoice={
 id:string;plan_code:string;base_amount_cents:string;discount_cents:string;total_cents:string;
 status:string;period_start:string;period_end:string;due_date:string;payment_verified_at:string|null;
 created_at:string;
};
export type SaaSChangeRequest={
 id:string;client_request_id:string;requested_plan:string;state:string;created_at:string;
 invoice_id:string;invoice_status:string;total_cents:string;
};
export type SaaSQuote={
 planCode:string;label:string;priceConfigured:boolean;currency:'BRL';
 baseCents:number|null;discountCents:number;totalCents:number|null;couponCode:string|null;
 requiresVerifiedPlatformPayment:true;
};
export type Phase7Summary={
 counts:{clients_active:number;services_active:number;recurrence_plans_active:number;
  charges_total:number;drafts:number;outstanding:number;sandbox_paid_count:number;
  sandbox_net_cents:string;real_net_cents:string};
 monthlyCreatedCharges:Array<{month:string;created_charges:number}>;
 sandboxSeparate:true;realPaymentProviderIntegrated:false;
};
export type Phase7AuditEntry={
 id:string;organization_id?:string;action:string;entity_type:string;entity_id:string|null;
 created_at:string;actor_name:string|null;
};
export type Phase7AdminOrg={
 id:string;name:string;status:'active'|'suspended'|'blocked';created_at:string;
 plan_code:string;subscription_status:string;clients_active:number;
};
export type Phase7AdminOverview={
 organizations:{organizations_total:number;organizations_active:number;organizations_restricted:number;
 registered_users:number;tickets_open:number;privacy_requests_open:number};
 subscriptions:Array<{plan_code:string;status:string;total:number}>;
 finance:{mrrCents:string;merchantRealGpvCents:string;merchantSandboxGpvCents:string;
  platformVerifiedReceiptsCents:string};
 mrrDefinition:string;realMoneyRequiresVerifiedPSP:true;
 platformPspConnected:false;merchantLivePspConnected:false;sandboxExcludedFromReal:true;
};
export type Phase7AdminTicket={
 id:string;organization_id:string|null;organization_name:string|null;name:string;
 email:string;subject:string;message:string;status:'open'|'in_progress'|'closed';created_at:string;
 sla_due_at:string|null;sla_overdue:boolean;
};
export type Phase7OverdueAlert={
 ticket_id:string;subject:string;status:'open'|'in_progress';
 organization_name:string|null;due_at:string;sla_revision:string;
 acknowledgement_id:string|null;acknowledged_at:string|null;
 acknowledged_by_name:string|null;
};
export type Phase7OverdueAlertPage={
 items:Phase7OverdueAlert[];hasMore:boolean;
 internalOnly:true;externalNotificationSent:false;automaticSlaPolicy:false;
};
export type Phase7SupportSlaEvent={
 id:string;previous_due_at:string|null;new_due_at:string|null;reason:string;
 created_at:string;actor_name:string;
};
export type Phase7SupportSlaEventPage={
 items:Phase7SupportSlaEvent[];hasMore:boolean;auditOnly:true;externalNotificationSent:false;
};
export type Phase7SupportStatusEvent={
 id:string;old_status:'open'|'in_progress'|'closed';new_status:'open'|'in_progress'|'closed';
 reason:string;actor_name:string;created_at:string;
};
export type Phase7SupportEventPage={
 items:Phase7SupportStatusEvent[];hasMore:boolean;auditOnly:true;externalNotificationSent:false;
};
export type Phase7SupportReply={
  id:string;ticket_id:string;message:string;delivery_state:'portal_only';
  created_at:string;author_name:string;
};
export type Phase7SupportReplyPage={
  items:Phase7SupportReply[];hasMore:boolean;delivery:'portal_only';emailSent:false;
};
export type Phase7PrivacyRequest={
 id:string;organization_id?:string;organization_name?:string;
 kind:'access'|'rectification'|'erasure'|'portability';
 state:'open'|'in_review'|'awaiting_evidence'|'closed_rejected';
 reason:string;created_at:string;updated_at:string;
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
async function downloadPhase7Csv(dataset:'clients'|'charges'):Promise<void>{
 const response=await fetch('/api/reports/exports/'+encodeURIComponent(dataset),{
  method:'POST',credentials:'include',
  headers:{'Content-Type':'application/json',...(csrfToken?{'X-CF-CSRF':csrfToken}:{})},
  body:JSON.stringify({limit:1000,offset:0})
 });
 if(!response.ok){
  const details=await response.json() as {error?:string;message?:string};
  throw new ApiFailure(details,response.status);
 }
 if(!(response.headers.get('Content-Type')??'').includes('text/csv'))
  throw new Error('Servidor não devolveu uma exportação CSV válida.');
 const file=await response.blob();
 if(file.size>4000000)throw new Error('Arquivo excedeu o tamanho permitido.');
 const url=URL.createObjectURL(file),link=document.createElement('a');
 link.href=url;link.download='cobraflux-'+dataset+'-'+new Date().toISOString().slice(0,10)+'.csv';
 document.body.appendChild(link);
 try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
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

  phase7Summary:()=>request<Phase7Summary>('/reports/summary'),
  phase7Audit:()=>request<{items:Phase7AuditEntry[];metadataRedacted:true}>('/reports/audit'),
  phase7ExportCsv:downloadPhase7Csv,
  phase7MyPrivacy:()=>request<{items:Phase7PrivacyRequest[];automaticErasure:false}>('/privacy/requests'),
  phase7CreatePrivacy:(kind:Phase7PrivacyRequest['kind'],reason:string)=>request<{
    id:string;kind:string;state:'open';automaticDeletion:false
  }>('/privacy/requests','POST',{kind,reason}),
  phase7AdminOverview:()=>request<Phase7AdminOverview>('/admin/reports/overview'),
  phase7AdminOrganizations:(search?:string,status?:Phase7AdminOrg['status'])=>
    request<{items:Phase7AdminOrg[];total:number}>('/admin/organizations'+qs({search,status,limit:50})),
  phase7AdminSetStatus:(id:string,status:Phase7AdminOrg['status'],reason:string)=>
    request<{id:string;previous:string;status:string;sessionsRevoked:boolean}>(
      '/admin/organizations/'+encode(id)+'/status','PATCH',{status,reason}),
  phase7AdminTickets:(status?:Phase7AdminTicket['status'],sla?:'overdue'|'without_deadline')=>
    request<{items:Phase7AdminTicket[]}>('/admin/support/tickets'+qs({status,sla,limit:50})),
  phase7AdminOverdueAlerts:(state:'open'|'acknowledged'|'all'='open',offset=0)=>
    request<Phase7OverdueAlertPage>('/admin/support/sla-alerts'+qs({state,limit:50,offset})),
  phase7AdminAcknowledgeOverdue:(id:string,reason:string)=>
    request<{id:string;ticketId:string;slaRevision:string;acknowledged:true;internalOnly:true;
      externalNotificationSent:false}>('/admin/support/sla-alerts/'+encode(id)+'/acknowledge',
      'POST',{reason}),
  phase7AdminSetTicketSla:(id:string,dueAt:string|null,reason:string)=>
    request<{ticketId:string;dueAt:string|null;configured:boolean;automaticSlaPolicy:false;
      externalNotificationSent:false}>('/admin/support/tickets/'+encode(id)+'/sla',
      'PATCH',{dueAt,reason}),
  phase7AdminTicketSlaEvents:(id:string,offset=0)=>
    request<Phase7SupportSlaEventPage>(
      '/admin/support/tickets/'+encode(id)+'/sla/events'+qs({limit:50,offset})),
  phase7AdminTicketReview:(id:string,status:Phase7AdminTicket['status'],reason:string)=>
    request<{id:string;status:string;replySent:false}>('/admin/support/tickets/'+encode(id),
      'PATCH',{status,reason}),
  phase7AdminTicketEvents:(id:string,offset=0)=>
    request<Phase7SupportEventPage>(
      '/admin/support/tickets/'+encode(id)+'/events'+qs({limit:50,offset})),
  phase7AdminTicketReplies:(id:string,offset=0)=>
    request<Phase7SupportReplyPage>('/admin/support/tickets/'+encode(id)+'/replies'+qs({limit:50,offset})),
  phase7AdminTicketReply:(id:string,message:string,clientRequestId:string)=>
    request<{id:string;ticketId:string;deliveryState:'portal_only';emailSent:false;duplicate:boolean}>(
      '/admin/support/tickets/'+encode(id)+'/replies','POST',{message,clientRequestId}),
  phase7AdminPrivacy:()=>request<{items:Phase7PrivacyRequest[];manualLegalReviewRequired:true}>(
    '/admin/privacy/requests'),
  phase7AdminPrivacyReview:(id:string,state:'in_review'|'awaiting_evidence'|'closed_rejected',reviewerNote:string)=>
    request<{id:string;state:string;automaticDeletion:false}>('/admin/privacy/requests/'+encode(id),
      'PATCH',{state,reviewerNote}),
  phase7AdminAudit:(organizationId?:string)=>
    request<{items:Phase7AuditEntry[];metadataRedacted:true}>(
      '/admin/audit'+qs({organizationId,limit:50})),
  saasPlans:()=>request<{items:SaaSPlan[];billingProviderConfigured:false;realCheckoutEnabled:false}>('/saas/plans'),
  saasSubscription:()=>request<SaaSSubscription>('/saas/subscription'),
  saasInvoices:()=>request<{items:SaaSInvoice[];ledger:'platform_saas';excludedFromMerchantCashflow:true}>('/saas/invoices'),
  saasChangeRequests:()=>request<{items:SaaSChangeRequest[]}>('/saas/change-requests'),
  saasQuote:(planCode:'starter'|'business',couponCode?:string)=>
    request<SaaSQuote>('/saas/quote','POST',{planCode,...(couponCode?{couponCode}:{})}),
  saasRequestUpgrade:(planCode:'starter'|'business',clientRequestId:string,couponCode?:string)=>
    request<{id:string;invoice_id:string;state:string;amountCents:number;
      alreadyRequested:boolean;subscriptionActivated:false;platformPaymentVerified:false}>('/saas/change-requests',
      'POST',{planCode,clientRequestId,...(couponCode?{couponCode}:{})}),
  saasCancelUpgrade:(id:string)=>request<{id:string;state:string}>('/saas/change-requests/'+encode(id)+'/cancel','POST',{}),
  saasCancelAtPeriodEnd:(value:boolean)=>request<{cancelAtPeriodEnd:boolean;noProrationOrRefundTriggered:true}>(
    '/saas/cancellation','POST',{cancelAtPeriodEnd:value}),
  saasAdminSetPlan:(code:'starter'|'business',monthlyPriceCents:number,published:boolean)=>
    request<{code:string;monthly_price_cents:string;published:boolean;realCheckoutEnabled:false}>(
      '/admin/saas/plans/'+code,'PATCH',{monthlyPriceCents,published}),
  whatsappConnection:()=>request<{configured:boolean;enabled:boolean;wabaId:string|null;phoneNumberId:string|null;
    lastTemplateSyncAt:string|null;defaultTemplateId:string|null;deliveryEnabled:boolean;schedulerRequired:true}>('/whatsapp/connection'),
  configureWhatsApp:(payload:{wabaId:string;phoneNumberId:string;accessToken:string})=>
    request<{configured:true;enabled:false}>('/whatsapp/connection','PUT',payload),
  verifyWhatsAppTemplates:()=>request<{verified:number;approvedUtilityTemplates:Array<{name:string;language:string}>}>('/whatsapp/templates/sync','POST',{}),
  whatsappTemplates:()=>request<{items:Array<{id:string;name:string;language:string;approved:boolean;verified_at:string}>}>('/whatsapp/templates'),
  selectWhatsAppDefaultTemplate:(templateId:string)=>request<{defaultTemplateId:string}>('/whatsapp/default-template','POST',{templateId}),
  enableWhatsApp:()=>request<{enabled:true;deliveryEnabled:boolean}>('/whatsapp/connection/enable','POST',{}),
  disableWhatsApp:()=>request<{enabled:false}>('/whatsapp/connection/disable','POST',{}),
  whatsappConsents:()=>request<{items:Array<{client_id:string;name:string;phone:string;client_status:string;
    granted:boolean;version:number;phone_snapshot:string|null;source:string|null;updated_at:string|null}>}>('/whatsapp/consents'),
  recordWhatsAppConsent:(clientId:string,body:{action:'grant'|'revoke';source:'signed_form'|'web_form'|'documented_request'|'client_request';
    evidenceReference?:string;acknowledged?:boolean})=>
    request<{clientId:string;granted:boolean;version:number}>('/whatsapp/clients/'+encode(clientId)+'/consent','POST',body),
  whatsappOutbox:()=>request<{items:Array<{id:string;charge_id:string;client_name:string;state:string;
    template_name:string;attempts:number;last_error:string|null;sent_at:string|null;created_at:string}>;
    deliveryEnabled:boolean;acceptedIsNotDelivered:true}>('/whatsapp/outbox'),
  queueWhatsAppReminder:(chargeId:string,templateId:string)=>
    request<{id:string;state:string;alreadyQueued:boolean;sendEnabled:false}>('/whatsapp/messages/queue','POST',{chargeId,templateId}),
  recurrenceOverview:()=>request<{summary:{total:number;active:number;paused:number;due:number;generated:number};
    workerEnabled:false;schedulerRequired:true;financialProviderCalls:0}>('/recurrences/overview'),
  recurrences:(state?:'active'|'paused'|'cancelled')=>
    request<{items:RecurrencePlan[];total:number}>('/recurrences'+qs({state})),
  previewRecurrence:(input:{firstDueDate:string;frequency:'monthly'|'weekly';anchorDay:number;count?:number})=>
    request<{dates:string[];draftOnly:true}>('/recurrences/preview','POST',input),
  createRecurrence:(data:RecurrenceInput)=>
    request<{id:string;state:string;next_due_date:string;draftOnly:true}>('/recurrences','POST',data),
  updateRecurrence:(id:string,changes:Partial<Pick<RecurrenceInput,'description'|'amountCents'|'discountCents'>>)=>
    request<RecurrencePlan>('/recurrences/'+encode(id),'PATCH',changes),
  pauseRecurrence:(id:string)=>request<{id:string;state:string}>('/recurrences/'+encode(id)+'/pause','POST',{}),
  resumeRecurrence:(id:string,mode:'skip_missed'|'catch_up'='skip_missed')=>
    request<{id:string;state:string;nextDueDate:string;skippedCycles:number}>('/recurrences/'+encode(id)+'/resume','POST',{mode}),
  cancelRecurrence:(id:string)=>request<{id:string;state:string}>('/recurrences/'+encode(id)+'/cancel','POST',{}),
  recurrenceCycles:(id:string)=>request<{items:RecurrenceCycle[]}>('/recurrences/'+encode(id)+'/cycles'),

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
  supportTicketReplies:(id:string,offset=0)=>
    request<Phase7SupportReplyPage>('/support/tickets/'+encode(id)+'/replies'+qs({limit:50,offset})),
  createSupportTicket:(subject:string,message:string)=>
    request<SupportTicket>('/support/tickets','POST',{subject,message}),
};
