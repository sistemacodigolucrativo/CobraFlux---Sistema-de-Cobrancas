import React,{useCallback,useEffect,useState} from 'react';
import {Button,Card,Input} from '../../components/ui/Primitives';
import {productionApi,type Phase7Summary,type Phase7AuditEntry,type Phase7PrivacyRequest} from '../../services/productionApi';

const money=(cents:string|number)=>new Intl.NumberFormat('pt-BR',{
 style:'currency',currency:'BRL'}).format(Number(cents)/100);
const privacyLabels:Record<Phase7PrivacyRequest['kind'],string>={
 access:'Acesso aos dados',rectification:'Correção de dados',
 erasure:'Pedido de exclusão (análise obrigatória)',portability:'Portabilidade'
};
export function ReportsOperationsView({canManage}:{canManage:boolean}){
 const [summary,setSummary]=useState<Phase7Summary|null>(null);
 const [audit,setAudit]=useState<Phase7AuditEntry[]>([]);
 const [requests,setRequests]=useState<Phase7PrivacyRequest[]>([]);
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 const [error,setError]=useState(''),[notice,setNotice]=useState('');
 const [kind,setKind]=useState<Phase7PrivacyRequest['kind']>('access');
 const [reason,setReason]=useState('');
 const load=useCallback(async()=>{
  const [report,history,privacy]=await Promise.all([
   productionApi.phase7Summary(),
   canManage?productionApi.phase7Audit():Promise.resolve({items:[] as Phase7AuditEntry[]}),
   canManage?productionApi.phase7MyPrivacy():Promise.resolve({items:[] as Phase7PrivacyRequest[]})
  ]);
  setSummary(report);setAudit(history.items);setRequests(privacy.items);
 },[canManage]);
 useEffect(()=>{setLoading(true);void load().catch(e=>setError(e instanceof Error?e.message:'Não foi possível carregar o relatório.'))
  .finally(()=>setLoading(false));},[load]);
 async function action(fn:()=>Promise<unknown>,message:string){
  setBusy(true);setError('');setNotice('');
  try{await fn();await load();setNotice(message);}
  catch(e){setError(e instanceof Error?e.message:'Não foi possível concluir.');}
  finally{setBusy(false);}
 }
 const m=summary?.counts;
 const biggest=Math.max(1,...(summary?.monthlyCreatedCharges??[]).map(x=>x.created_charges));
 return <div className="space-y-5">
  <header className="flex flex-wrap items-center justify-between gap-3">
   <div><p className="text-xs text-[#E2BE72]">Fase 7 · Indicadores com origem verificável</p>
    <h2 className="text-2xl font-bold">Relatórios e auditoria</h2></div>
   <Button variant="secondary" size="sm" disabled={busy} onClick={()=>void action(load,'Indicadores atualizados.')}>
    Atualizar
   </Button>
  </header>
  {error&&<p role="alert" className="text-sm text-[#F16C79]">{error}</p>}
  {notice&&<p role="status" className="text-sm text-[#33C994]">{notice}</p>}
  {loading&&<p className="text-xs text-[#B8BFCD]">Consultando registros do PostgreSQL...</p>}
  <Card className="p-4 space-y-2">
   <p className="text-[#F5D491] text-sm font-semibold">Valores reais, testes de sandbox e assinaturas SaaS são indicadores diferentes.</p>
   <p className="text-xs text-[#B8BFCD]">
    Não existem pagamentos reais habilitados por esta implementação. Recebimentos simulados da Asaas
    Sandbox não compõem o caixa real. Os relatórios mensais abaixo contabilizam registros criados,
    não vendas liquidadas.
   </p>
  </Card>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
   {([
    ['Clientes ativos',m?.clients_active??0],
    ['Serviços ativos',m?.services_active??0],
    ['Cobranças registradas',m?.charges_total??0],
    ['Rascunhos financeiros',m?.drafts??0],
    ['Cobranças pendentes',m?.outstanding??0],
    ['Planos recorrentes ativos',m?.recurrence_plans_active??0]
   ] as Array<[string,number]>).map(([label,count])=>
    <Card className="p-4 space-y-1" key={label}>
     <p className="text-xs text-[#B8BFCD]">{label}</p><p className="font-bold text-2xl">{count.toLocaleString('pt-BR')}</p>
    </Card>)}
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
   <Card className="p-5 space-y-2">
    <p className="text-sm font-semibold">Caixa real confirmado</p>
    <p className="text-2xl font-bold">{money(m?.real_net_cents??0)}</p>
    <p className="text-xs text-[#B8BFCD]">Somente PSP real verificado. Integração de recebimento real ainda não habilitada.</p>
   </Card>
   <Card className="p-5 space-y-2">
    <p className="text-sm font-semibold">Movimentações de teste — Sandbox</p>
    <p className="text-2xl font-bold text-[#F5D491]">{money(m?.sandbox_net_cents??0)}</p>
    <p className="text-xs text-[#B8BFCD]">{m?.sandbox_paid_count??0} cobrança(s) de teste com status financeiro. Não é receita real.</p>
   </Card>
  </div>
  <Card className="p-5 space-y-3">
   <h3 className="font-semibold">Cobranças criadas por mês</h3>
   <p className="text-xs text-[#B8BFCD]">Contagem de criação de registros, independente de pagamento.</p>
   {!summary?.monthlyCreatedCharges.length&&<p className="text-xs text-[#B8BFCD]">Sem registros no período.</p>}
   {summary?.monthlyCreatedCharges.map(x=><div className="flex items-center gap-3 text-xs" key={x.month}>
    <span className="w-16 shrink-0">{x.month}</span>
    <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
     <div className="bg-[#E2BE72] h-2 rounded-full" style={{width:Math.round(100*x.created_charges/biggest)+'%'}}/>
    </div>
    <span className="w-9 text-right">{x.created_charges}</span>
   </div>)}
  </Card>
  {canManage&&<Card className="p-5 space-y-4">
   <h3 className="font-semibold">Exportações autorizadas (CSV)</h3>
   <p className="text-xs text-[#B8BFCD]">
    Exclusivas do titular. Exportação limitada a 1.000 registros por arquivo, protegida contra fórmulas
    de planilhas e registrada na auditoria. Não inclui credenciais, tokens de cobrança, QR Pix nem segredos.
   </p>
   <div className="flex flex-wrap gap-2">
    <Button size="sm" variant="secondary" disabled={busy}
     onClick={()=>void action(()=>productionApi.phase7ExportCsv('clients'),'Arquivo CSV solicitado ao navegador.')}>
     Exportar clientes
    </Button>
    <Button size="sm" variant="secondary" disabled={busy}
     onClick={()=>void action(()=>productionApi.phase7ExportCsv('charges'),'Arquivo CSV solicitado ao navegador.')}>
     Exportar cobranças
    </Button>
   </div>
  </Card>}
  {canManage&&<Card className="p-5 space-y-3">
   <h3 className="font-semibold">Solicitações de privacidade — LGPD</h3>
   <p className="text-xs text-[#B8BFCD]">
    Solicitações são registradas para revisão humana. Pedidos de exclusão não eliminam automaticamente
    dados financeiros sujeitos a obrigações de retenção, nem significam que a solicitação foi cumprida.
   </p>
   <form className="space-y-3" onSubmit={e=>{e.preventDefault();void action(async()=>{
    await productionApi.phase7CreatePrivacy(kind,reason);setReason('');
   },'Solicitação registrada para análise.');}}>
    <label className="text-sm block">Tipo de solicitação
     <select aria-label="Tipo de solicitação LGPD" value={kind}
      onChange={e=>setKind(e.target.value as Phase7PrivacyRequest['kind'])}
      className="mt-2 block w-full p-3 bg-[#0B0D12] border border-white/20 rounded-lg">
      {Object.entries(privacyLabels).map(([code,label])=><option key={code} value={code}>{label}</option>)}
     </select>
    </label>
    <label className="block text-sm">Justificativa
     <textarea aria-label="Justificativa da solicitação LGPD" required minLength={12} maxLength={1500}
      className="w-full mt-2 rounded-lg p-3 bg-[#0B0D12] border border-white/20"
      value={reason} onChange={e=>setReason(e.target.value)} rows={3}/>
    </label>
    <Button type="submit" disabled={busy||reason.trim().length<12}>Registrar solicitação</Button>
   </form>
   {requests.map(r=><p className="text-xs border-b border-white/10 py-2" key={r.id}>
    {privacyLabels[r.kind]} · {r.state} · {new Date(r.created_at).toLocaleDateString('pt-BR')}
   </p>)}
  </Card>}
  {canManage&&<Card className="p-5 space-y-2">
   <h3 className="font-semibold">Trilha de auditoria</h3>
   <p className="text-xs text-[#B8BFCD]">Registros recentes da sua organização; metadados livres e dados sensíveis não são exibidos.</p>
   {!audit.length&&<p className="text-xs text-[#B8BFCD]">Sem eventos.</p>}
   <div className="max-h-72 overflow-y-auto">
    {audit.map(a=><div key={a.id} className="flex flex-wrap justify-between gap-2 text-xs py-2 border-b border-white/10">
     <span>{a.action} · {a.actor_name??'Sistema'}</span>
     <span className="text-[#B8BFCD]">{new Date(a.created_at).toLocaleString('pt-BR')}</span>
    </div>)}
   </div>
  </Card>}
 </div>;
}
