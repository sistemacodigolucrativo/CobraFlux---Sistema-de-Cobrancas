import React,{useCallback,useEffect,useState} from 'react';
import {Button,Card,Input} from '../../components/ui/Primitives';
import {productionApi,type Phase7AdminOverview,type Phase7AdminOrg,
 type Phase7AdminTicket,type Phase7PrivacyRequest,type Phase7AuditEntry,type Phase7SupportReply} from '../../services/productionApi';

const money=(cents:string|number)=>new Intl.NumberFormat('pt-BR',{
 style:'currency',currency:'BRL'}).format(Number(cents)/100);
const statuses:Record<Phase7AdminOrg['status'],string>={
 active:'Ativa',suspended:'Suspensa',blocked:'Bloqueada'
};
export function AdminOperationsView(){
 const [overview,setOverview]=useState<Phase7AdminOverview|null>(null);
 const [organizations,setOrganizations]=useState<Phase7AdminOrg[]>([]);
 const [tickets,setTickets]=useState<Phase7AdminTicket[]>([]);
 const [privacy,setPrivacy]=useState<Phase7PrivacyRequest[]>([]);
 const [audit,setAudit]=useState<Phase7AuditEntry[]>([]);
 const [search,setSearch]=useState('');
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 const [error,setError]=useState(''),[notice,setNotice]=useState('');
 const [orgId,setOrgId]=useState(''),[orgStatus,setOrgStatus]=useState<Phase7AdminOrg['status']>('suspended');
 const [orgReason,setOrgReason]=useState('');
 const [ticketId,setTicketId]=useState(''),[ticketStatus,setTicketStatus]=useState<Phase7AdminTicket['status']>('in_progress');
 const [ticketReason,setTicketReason]=useState('');
 const [ticketReplies,setTicketReplies]=useState<Phase7SupportReply[]>([]);
 const [ticketReplyMessage,setTicketReplyMessage]=useState('');
 const [replyKey,setReplyKey]=useState('');
 const [privacyId,setPrivacyId]=useState(''),[privacyStatus,setPrivacyStatus]=useState<'in_review'|'awaiting_evidence'|'closed_rejected'>('in_review');
 const [privacyReason,setPrivacyReason]=useState('');
 const load=useCallback(async(filter='')=>{
  const [summary,orgs,support,requests,events]=await Promise.all([
   productionApi.phase7AdminOverview(),
   productionApi.phase7AdminOrganizations(filter),
   productionApi.phase7AdminTickets(),
   productionApi.phase7AdminPrivacy(),
   productionApi.phase7AdminAudit()
  ]);
  setOverview(summary);setOrganizations(orgs.items);setTickets(support.items);
  setPrivacy(requests.items);setAudit(events.items);
 },[]);
 useEffect(()=>{setLoading(true);void load().catch(e=>setError(e instanceof Error?e.message:'Administração indisponível.'))
  .finally(()=>setLoading(false));},[load]);
 useEffect(()=>{
  if(!ticketId){setTicketReplies([]);return;}
  let current=true;
  setTicketReplies([]);
  void productionApi.phase7AdminTicketReplies(ticketId).then(r=>{
   if(current)setTicketReplies(r.items);
  }).catch(e=>{if(current)setError(e instanceof Error?e.message:'Falha ao consultar respostas.');});
  return ()=>{current=false;};
 },[ticketId]);
 async function action(fn:()=>Promise<unknown>,success:string){
  setBusy(true);setError('');setNotice('');
  try{await fn();await load(search);setNotice(success);}
  catch(e){setError(e instanceof Error?e.message:'Ação não realizada.');}
  finally{setBusy(false);}
 }
 const selectedOrg=organizations.find(o=>o.id===orgId);
 const selectedTicket=tickets.find(t=>t.id===ticketId);
 const selectedPrivacy=privacy.find(p=>p.id===privacyId);
 return <div className="space-y-5">
  <header className="flex flex-wrap items-center justify-between gap-3">
   <div><p className="text-xs text-[#E2BE72]">Fase 7 · Acesso superadministrador com MFA</p>
    <h2 className="text-2xl font-bold">Administração da plataforma</h2></div>
   <Button size="sm" variant="secondary" disabled={busy} onClick={()=>void action(()=>load(search),'Administração atualizada.')}>
    Atualizar
   </Button>
  </header>
  <Card className="p-4 space-y-2">
   <p className="text-[#F5D491] font-semibold text-sm">Indicadores financeiros segregados e comprováveis.</p>
   <p className="text-xs text-[#B8BFCD]">
    MRR considera somente faturas SaaS da plataforma confirmadas por PSP real, no período vigente.
    GPV de profissionais não é receita de assinatura. Movimentação Asaas Sandbox é simulação,
    nunca receita reconhecida.
   </p>
  </Card>
  {loading&&<p className="text-xs text-[#B8BFCD]">Consultando indicadores administrativos...</p>}
  {error&&<p role="alert" className="text-sm text-[#F16C79]">{error}</p>}
  {notice&&<p role="status" className="text-sm text-[#33C994]">{notice}</p>}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
   {([
    ['MRR SaaS verificado',money(overview?.finance.mrrCents??'0')],
    ['GPV real dos profissionais',money(overview?.finance.merchantRealGpvCents??'0')],
    ['GPV somente sandbox',money(overview?.finance.merchantSandboxGpvCents??'0')],
    ['Recebimentos SaaS verificados',money(overview?.finance.platformVerifiedReceiptsCents??'0')],
    ['Organizações ativas',overview?.organizations.organizations_active??0],
    ['Contas restritas',overview?.organizations.organizations_restricted??0],
    ['Tickets em aberto',overview?.organizations.tickets_open??0],
    ['Pedidos de privacidade',overview?.organizations.privacy_requests_open??0]
   ] as Array<[string,string|number]>).map(([label,value])=><Card className="p-4 space-y-1" key={label}>
    <p className="text-xs text-[#B8BFCD]">{label}</p>
    <p className="font-bold text-lg">{typeof value==='number'?value.toLocaleString('pt-BR'):value}</p>
   </Card>)}
  </div>
  <Card className="p-5 space-y-3">
   <h3 className="font-semibold">Organizações e controle de acesso</h3>
   <p className="text-xs text-[#B8BFCD]">
    Suspender ou bloquear uma organização revoga suas sessões existentes, interrompe a conexão WhatsApp
    e bloqueia a fila pendente. Reativar exige novo login e não ativa o WhatsApp automaticamente.
   </p>
   <form onSubmit={e=>{e.preventDefault();void action(()=>load(search),'Consulta concluída.');}}
    className="flex flex-col sm:flex-row gap-2">
    <Input label="Buscar organização" value={search} onChange={e=>setSearch(e.target.value)}/>
    <div className="sm:self-end"><Button type="submit" size="sm" disabled={busy}>Buscar</Button></div>
   </form>
   <div className="max-h-72 overflow-auto space-y-2">
    {organizations.map(o=><button type="button" key={o.id} onClick={()=>{
     setOrgId(o.id);setOrgReason('');setOrgStatus(o.status==='active'?'suspended':'active');
    }} className={'w-full text-left border rounded-lg px-3 py-2 text-sm '+
      (orgId===o.id?'border-[#E2BE72]':'border-white/10')}>
     <span className="block font-semibold">{o.name}</span>
     <span className="block text-xs text-[#B8BFCD]">
      {statuses[o.status]} · Plano {o.plan_code??'free'} · {o.clients_active} cliente(s)
     </span>
    </button>)}
   </div>
   {selectedOrg&&<form className="space-y-3" onSubmit={e=>{e.preventDefault();
    if(!window.confirm('Alterar o acesso da organização "'+selectedOrg.name+'"?'))return;
    void action(async()=>{
     await productionApi.phase7AdminSetStatus(orgId,orgStatus,orgReason);
     setOrgId('');setOrgReason('');
    },'Status de organização alterado e registrado na auditoria.');
   }}>
    <p className="text-xs text-[#E2BE72]">Operação selecionada: {selectedOrg.name}</p>
    <label className="text-sm block">Novo estado
     <select aria-label="Estado da organização" value={orgStatus}
      onChange={e=>setOrgStatus(e.target.value as Phase7AdminOrg['status'])}
      className="block mt-2 w-full p-3 bg-[#0B0D12] border border-white/20 rounded-lg">
      <option value="active">Ativa</option><option value="suspended">Suspensa</option><option value="blocked">Bloqueada</option>
     </select>
    </label>
    <Input label="Motivo da alteração (mín. 12 caracteres)" value={orgReason}
     onChange={e=>setOrgReason(e.target.value)}/>
    <Button size="sm" type="submit" disabled={busy||orgReason.trim().length<12||orgStatus===selectedOrg.status}>
     Confirmar alteração com auditoria
    </Button>
   </form>}
  </Card>
  <Card className="p-5 space-y-3">
   <h3 className="font-semibold">Atendimento e triagem de tickets</h3>
   <p className="text-xs text-[#B8BFCD]">
    A alteração de status é registrada, mas não envia e-mail nem afirma que o cliente recebeu uma resposta.
    As mensagens podem conter dados pessoais, acessíveis somente à administração.
   </p>
   <div className="max-h-72 overflow-auto space-y-2">
    {tickets.map(t=><button type="button" key={t.id} onClick={()=>{
     setTicketId(t.id);setTicketReason('');setTicketReplyMessage('');setReplyKey('');setTicketStatus(t.status==='open'?'in_progress':'closed');
    }} className={'w-full text-left border rounded-lg p-3 '+
      (ticketId===t.id?'border-[#E2BE72]':'border-white/10')}>
     <span className="block text-sm font-semibold">{t.subject} · {t.status}</span>
     <span className="block text-xs text-[#B8BFCD]">{t.organization_name??'Contato público'} · {t.name}</span>
    </button>)}
   </div>
   {selectedTicket&&<form className="space-y-3" onSubmit={e=>{e.preventDefault();void action(async()=>{
    await productionApi.phase7AdminTicketReview(ticketId,ticketStatus,ticketReason);
    setTicketId('');setTicketReason('');
   },'Triagem atualizada sem envio automático de resposta.');}}>
    <p className="text-sm text-[#B8BFCD]">{selectedTicket.message}</p>
    <label className="text-sm block">Status do ticket
     <select aria-label="Estado do ticket" value={ticketStatus}
      onChange={e=>setTicketStatus(e.target.value as Phase7AdminTicket['status'])}
      className="block mt-2 w-full p-3 bg-[#0B0D12] border border-white/20 rounded-lg">
      <option value="open">Aberto</option><option value="in_progress">Em atendimento</option><option value="closed">Encerrado</option>
     </select>
    </label>
    <Input label="Motivo da triagem (mín. 10 caracteres)" value={ticketReason}
     onChange={e=>setTicketReason(e.target.value)}/>
    <Button size="sm" type="submit" disabled={busy||ticketReason.trim().length<10||selectedTicket.status===ticketStatus}>
     Registrar andamento
    </Button>
   </form>}
  </Card>
  {selectedTicket&&<div className="space-y-3 border-t border-white/10 pt-3">
   <p className="font-semibold text-sm">Histórico de respostas no painel</p>
   <p className="text-xs text-[#B8BFCD]">
    Respostas ficam disponíveis somente para usuários autenticados da organização.
    Não há envio de e-mail ou confirmação de leitura.
   </p>
   {ticketReplies.length===0
    ?<p className="text-xs text-[#B8BFCD]">Nenhuma resposta registrada.</p>
    :<div className="max-h-48 overflow-y-auto space-y-2">{ticketReplies.map(r=>
     <div key={r.id} className="p-3 rounded-lg border border-white/10 space-y-1">
      <p className="text-xs text-[#B8BFCD]">{r.author_name} · {new Date(r.created_at).toLocaleString('pt-BR')}</p>
      <p className="text-sm whitespace-pre-wrap break-words">{r.message}</p>
     </div>)}</div>}
   {selectedTicket.organization_id
    ?<form className="space-y-2" onSubmit={e=>{e.preventDefault();void action(async()=>{
      const key=replyKey||crypto.randomUUID();
      if(!replyKey)setReplyKey(key);
      await productionApi.phase7AdminTicketReply(ticketId,ticketReplyMessage,key);
      const replies=await productionApi.phase7AdminTicketReplies(ticketId);
      setTicketReplies(replies.items);setTicketReplyMessage('');setReplyKey('');
     },'Resposta registrada no painel da organização, sem envio de e-mail.');}}>
      <label className="block text-sm">Responder no portal (mín. 10 caracteres)
       <textarea rows={3} minLength={10} maxLength={3000}
        value={ticketReplyMessage} onChange={e=>{setTicketReplyMessage(e.target.value);setReplyKey('');}}
        className="block mt-2 w-full p-3 bg-[#0B0D12] border border-white/20 rounded-lg"/>
      </label>
      <Button size="sm" type="submit" disabled={busy||ticketReplyMessage.trim().length<10||selectedTicket.status==='closed'}>
       Registrar resposta no painel
      </Button>
      {selectedTicket.status==='closed'&&
       <p className="text-xs text-[#B8BFCD]">Reabra o chamado antes de registrar uma nova resposta.</p>}
     </form>
    :<p className="text-xs text-[#E2BE72]">
      Contato público: responder exige canal autenticado e verificação de identidade.
     </p>}
  </div>}
  <Card className="p-5 space-y-3">
   <h3 className="font-semibold">Solicitações de privacidade — triagem LGPD</h3>
   <p className="text-xs text-[#B8BFCD]">
    Revisão obrigatoriamente humana. Esta tela não elimina dados e não permite marcar uma exclusão
    como concluída sem um fluxo jurídico e técnico comprovado.
   </p>
   <div className="max-h-56 overflow-y-auto space-y-2">
    {privacy.map(x=><button key={x.id} type="button" onClick={()=>{
     setPrivacyId(x.id);setPrivacyReason('');setPrivacyStatus('in_review');
    }} className={'w-full text-left rounded-lg border p-3 '+
      (privacyId===x.id?'border-[#E2BE72]':'border-white/10')}>
     <span className="text-sm block">{x.organization_name??'Organização'} · {x.kind} · {x.state}</span>
     <span className="text-xs text-[#B8BFCD]">{x.reason}</span>
    </button>)}
   </div>
   {selectedPrivacy&&<form className="space-y-3" onSubmit={e=>{e.preventDefault();void action(async()=>{
    await productionApi.phase7AdminPrivacyReview(privacyId,privacyStatus,privacyReason);
    setPrivacyId('');setPrivacyReason('');
   },'Análise de privacidade atualizada com trilha de auditoria.');}}>
    <label className="text-sm block">Andamento da análise
     <select aria-label="Andamento da análise LGPD" value={privacyStatus}
      onChange={e=>setPrivacyStatus(e.target.value as typeof privacyStatus)}
      className="block mt-2 w-full p-3 bg-[#0B0D12] border border-white/20 rounded-lg">
      <option value="in_review">Em revisão</option>
      <option value="awaiting_evidence">Aguardando evidências</option>
      <option value="closed_rejected">Encerrar por indeferimento fundamentado</option>
     </select>
    </label>
    <Input label="Justificativa da análise (mín. 15 caracteres)" value={privacyReason}
     onChange={e=>setPrivacyReason(e.target.value)}/>
    <Button type="submit" size="sm" disabled={busy||privacyReason.trim().length<15||privacyStatus===selectedPrivacy.state}>
     Registrar análise
    </Button>
   </form>}
  </Card>
  <Card className="p-5 space-y-3">
   <h3 className="font-semibold">Auditoria global (últimos 50 eventos)</h3>
   <p className="text-xs text-[#B8BFCD]">Sem metadados livres, credenciais ou payload de mensagens.</p>
   <div className="max-h-72 overflow-y-auto space-y-1">
    {audit.map(e=><div key={e.id} className="flex flex-wrap justify-between gap-2 py-2 text-xs border-b border-white/10">
     <span>{e.action} · {e.actor_name??'Sistema'}</span>
     <span className="text-[#B8BFCD]">{new Date(e.created_at).toLocaleString('pt-BR')}</span>
    </div>)}
   </div>
  </Card>
 </div>;
}
