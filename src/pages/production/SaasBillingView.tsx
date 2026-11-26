import React,{useCallback,useEffect,useState} from 'react';
import {Button,Card,Input} from '../../components/ui/Primitives';
import {productionApi,type SaaSPlan,type SaaSSubscription,type SaaSInvoice,type SaaSChangeRequest,
 type SaaSQuote,type SaaSResource} from '../../services/productionApi';

const brl=(value:number|string)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'})
 .format(Number(value)/100);
const metricNames:Record<SaaSResource,string>={
 clients:'Clientes ativos',services:'Serviços ativos',charges_month:'Cobranças criadas neste mês',
 recurrences:'Recorrências abertas',members:'Membros da equipe',
 messages_month:'Lembretes na fila neste mês'
};
const keys=Object.keys(metricNames) as SaaSResource[];
function cents(value:string):number{
 const raw=value.trim().replace(/^R\$\s*/,'').replace(/\s/g,'');
 if(!/^\d+(?:\.\d{3})*(?:,\d{1,2})?$/.test(raw))throw new Error('Valor inválido. Use 99,90.');
 const result=Math.round(Number(raw.replace(/\./g,'').replace(',','.'))*100);
 if(!Number.isInteger(result)||result<100||result>100000000)throw new Error('Preço fora do limite autorizado.');
 return result;
}
export function SaasBillingView({canManage,isPlatformAdmin}:{
 canManage:boolean;isPlatformAdmin:boolean;
}){
 const [plans,setPlans]=useState<SaaSPlan[]>([]);
 const [subscription,setSubscription]=useState<SaaSSubscription|null>(null);
 const [invoices,setInvoices]=useState<SaaSInvoice[]>([]);
 const [requests,setRequests]=useState<SaaSChangeRequest[]>([]);
 const [selected,setSelected]=useState<'starter'|'business'|null>(null);
 const [coupon,setCoupon]=useState(''),[quote,setQuote]=useState<SaaSQuote|null>(null);
 const [price,setPrice]=useState(''),[published,setPublished]=useState(false);
 const [error,setError]=useState(''),[notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const load=useCallback(async()=>{
  const [catalog,current,ledger,changes]=await Promise.all([
   productionApi.saasPlans(),productionApi.saasSubscription(),
   canManage?productionApi.saasInvoices():Promise.resolve({items:[] as SaaSInvoice[]}),
   canManage?productionApi.saasChangeRequests():Promise.resolve({items:[] as SaaSChangeRequest[]})
  ]);
  setPlans(catalog.items);setSubscription(current);setInvoices(ledger.items);setRequests(changes.items);
 },[canManage]);
 useEffect(()=>{setLoading(true);void load().catch(e=>setError(e instanceof Error?e.message:'Não foi possível consultar a assinatura.'))
  .finally(()=>setLoading(false));},[load]);
 async function action(fn:()=>Promise<unknown>,success:string){
  setBusy(true);setError('');setNotice('');
  try{await fn();await load();setNotice(success);}
  catch(e){setError(e instanceof Error?e.message:'Operação não concluída.');}
  finally{setBusy(false);}
 }
 const active=plans.find(p=>p.code===subscription?.effectivePlan);
 const currentPlan=subscription?.subscription.plan_code;
 return <div className="space-y-5">
  <header className="flex flex-wrap items-center justify-between gap-3">
   <div><p className="text-xs text-[#E2BE72]">Fase 6 · Plano da plataforma</p>
    <h2 className="text-2xl font-bold">Assinatura CobraFlux</h2></div>
   <Button size="sm" variant="secondary" disabled={busy} onClick={()=>void action(load,'Informações atualizadas.')}>
    Atualizar
   </Button>
  </header>
  <Card className="p-4 space-y-2">
   <p className="text-[#F5D491] text-sm font-semibold">Faturamento da plataforma separado das cobranças dos clientes.</p>
   <p className="text-xs text-[#B8BFCD]">
    Planos pagos ainda não dispõem de checkout real. Um pedido de upgrade prepara uma fatura em rascunho,
    mas nunca libera recursos pagos antes da confirmação financeira por um provedor autorizado.
    O recebimento Pix de clientes não altera o plano CobraFlux.
   </p>
  </Card>
  {loading&&<p className="text-sm text-[#B8BFCD]">Consultando dados de assinatura...</p>}
  {error&&<p role="alert" className="text-sm text-[#F16C79]">{error}</p>}
  {notice&&<p role="status" className="text-sm text-[#33C994]">{notice}</p>}
  {subscription&&<Card className="p-5 space-y-3">
   <div className="flex flex-wrap justify-between items-start gap-3">
    <div><p className="text-xs text-[#B8BFCD]">Plano com acesso efetivo</p>
     <p className="text-xl font-bold">{active?.label??subscription.effectivePlan}</p>
     <p className="text-xs text-[#B8BFCD]">Assinatura registrada: {currentPlan} · Estado: {subscription.subscription.status}</p>
    </div>
    {subscription.subscription.status==='past_due'&&<p className="text-[#F5D491] text-xs">
     Fatura vencida. Acesso premium sujeito ao prazo de regularização.
    </p>}
    {subscription.subscription.status==='restricted'&&<p className="text-[#F16C79] text-xs">
     Recursos premium limitados; todos os dados anteriores foram preservados.
    </p>}
   </div>
   {subscription.subscription.current_period_end&&<p className="text-xs text-[#B8BFCD]">
    Fim do período atual: {subscription.subscription.current_period_end}
    {subscription.subscription.cancel_at_period_end?' · Cancelamento agendado':''}
   </p>}
   {canManage&&['active','trialing'].includes(subscription.subscription.status)&&currentPlan!=='free'&&
    <Button size="sm" variant="secondary" disabled={busy} onClick={()=>{
     const next=!subscription.subscription.cancel_at_period_end;
     if(!next||window.confirm('Encerrar a assinatura no fim do período pago? O histórico será preservado.'))
      void action(()=>productionApi.saasCancelAtPeriodEnd(next),
       next?'Cancelamento programado no fim do período.':'Cancelamento futuro revertido.');
    }}>{subscription.subscription.cancel_at_period_end?'Manter assinatura':'Cancelar no fim do período'}</Button>}
  </Card>}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
   {keys.map(key=>{
    const used=subscription?.usage[key]??0,limit=subscription?.limits[key]??0;
    const fraction=limit?Math.min(100,Math.round(100*used/limit)):0;
    return <Card className="p-4 space-y-2" key={key}>
     <p className="text-xs text-[#B8BFCD]">{metricNames[key]}</p>
     <p className="font-semibold">{used.toLocaleString('pt-BR')} / {limit.toLocaleString('pt-BR')}</p>
     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
      <div className="h-1.5 bg-[#E2BE72] rounded-full" style={{width:fraction+'%'}}/>
     </div>
     {used>=limit&&<p className="text-xs text-[#F5D491]">Limite atingido. Dados existentes continuam acessíveis.</p>}
    </Card>;
   })}
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
   {plans.map(p=><Card className="p-5 space-y-3" key={p.code}>
    <h3 className="text-lg font-semibold">{p.label}</h3>
    <p className="text-xl text-[#E2BE72] font-bold">
     {p.monthly_price_cents===null?'Preço não configurado':p.code==='free'?'Gratuito':brl(p.monthly_price_cents)+'/mês'}
    </p>
    <p className="text-xs text-[#B8BFCD]">
     {p.clients_limit.toLocaleString('pt-BR')} clientes · {p.recurrences_limit.toLocaleString('pt-BR')} recorrências
    </p>
    {!p.published&&<p className="text-xs text-[#F5D491]">Plano ainda não publicado</p>}
    {p.code===subscription?.effectivePlan&&<p className="text-xs text-[#33C994]">Plano efetivo atual</p>}
    {canManage&&p.code!=='free'&&<Button size="sm" variant="secondary"
     disabled={busy||!p.published||p.monthly_price_cents===null}
     onClick={()=>{setSelected(p.code as 'starter'|'business');setQuote(null);setCoupon('');}}>
     Consultar condições
    </Button>}
   </Card>)}
  </div>
  {selected&&canManage&&<Card className="p-5 space-y-3">
   <h3 className="font-semibold">Solicitação do plano {selected}</h3>
   <p className="text-xs text-[#B8BFCD]">A consulta não autoriza débito e não muda sua assinatura.</p>
   <Input label="Cupom (opcional)" value={coupon} onChange={e=>{setCoupon(e.target.value.toUpperCase());setQuote(null);}}/>
   <div className="flex flex-wrap gap-2">
    <Button size="sm" variant="secondary" disabled={busy} onClick={()=>void action(async()=>{
     const result=await productionApi.saasQuote(selected,coupon||undefined);setQuote(result);
    },'Condições verificadas.')}>Consultar preço</Button>
    <Button size="sm" variant="secondary" onClick={()=>setSelected(null)}>Fechar</Button>
   </div>
   {quote&&<div className="text-sm space-y-1">
    <p>Valor do plano: {quote.baseCents===null?'Indisponível':brl(quote.baseCents)}</p>
    <p>Desconto: {brl(quote.discountCents)}</p>
    <p className="font-semibold">Total do rascunho: {quote.totalCents===null?'Indisponível':brl(quote.totalCents)}</p>
    <Button size="sm" disabled={busy||!quote.priceConfigured||requests.some(r=>r.state==='pending')}
     onClick={()=>{
      if(window.confirm('Criar somente uma solicitação com fatura em rascunho, sem ativar plano nem efetuar cobrança?'))
       void action(async()=>{
        await productionApi.saasRequestUpgrade(selected,crypto.randomUUID(),coupon||undefined);
        setSelected(null);setQuote(null);
       },'Pedido registrado. Aguardando integração de pagamento da própria plataforma.');
     }}>Registrar solicitação sem cobrança</Button>
   </div>}
  </Card>}
  {canManage&&<Card className="p-5 space-y-3">
   <h3 className="font-semibold">Pedidos de mudança de plano</h3>
   {!requests.length&&<p className="text-xs text-[#B8BFCD]">Nenhum pedido registrado.</p>}
   {requests.map(req=><div key={req.id} className="flex flex-wrap justify-between items-center gap-2 py-2 border-b border-white/10">
    <div className="text-xs"><p>{req.requested_plan} · {brl(req.total_cents)}</p>
     <p className="text-[#B8BFCD]">Pedido: {req.state} · Fatura: {req.invoice_status}</p></div>
    {req.state==='pending'&&<Button size="sm" variant="secondary" disabled={busy}
     onClick={()=>void action(()=>productionApi.saasCancelUpgrade(req.id),
      'Pedido cancelado e fatura ainda não enviada anulada.')}>Cancelar solicitação</Button>}
   </div>)}
  </Card>}
  {canManage&&<Card className="p-5 space-y-3">
   <h3 className="font-semibold">Faturas CobraFlux</h3>
   <p className="text-xs text-[#B8BFCD]">Faturas da plataforma, nunca recibos das cobranças dos seus clientes.</p>
   {!invoices.length&&<p className="text-xs text-[#B8BFCD]">Nenhuma fatura de assinatura.</p>}
   {invoices.map(i=><div key={i.id} className="flex flex-wrap justify-between gap-2 py-2 border-b border-white/10">
    <div className="text-xs"><p>{i.plan_code} · {i.period_start} até {i.period_end}</p>
     <p className="text-[#B8BFCD]">{i.status} · {i.payment_verified_at?'Pagamento verificado':'Sem pagamento confirmado'}</p></div>
    <p className="text-sm font-semibold">{brl(i.total_cents)}</p>
   </div>)}
  </Card>}
  {isPlatformAdmin&&<Card className="p-5 space-y-3">
   <h3 className="font-semibold">Configuração global de preços (MFA administrativa)</h3>
   <p className="text-xs text-[#F5D491]">Publicar uma tarifa não habilita cobrança financeira nem upgrade automático.</p>
   <label className="block text-sm">Plano pago
    <select aria-label="Plano pago para configurar" value={selected??'starter'}
     onChange={e=>setSelected(e.target.value as 'starter'|'business')}
     className="block mt-2 w-full p-3 bg-[#0B0D12] border border-white/20 rounded-lg">
     <option value="starter">Starter</option><option value="business">Business</option>
    </select>
   </label>
   <Input label="Tarifa mensal (R$)" value={price} onChange={e=>setPrice(e.target.value)}/>
   <label className="flex items-center text-sm gap-2"><input type="checkbox" checked={published}
    onChange={e=>setPublished(e.target.checked)}/> Publicar o preço ao catálogo</label>
   <Button size="sm" disabled={busy} onClick={()=>void action(async()=>{
    await productionApi.saasAdminSetPlan(selected??'starter',cents(price),published);
   },'Preço atualizado; checkout real continua bloqueado.')}>Salvar preço global</Button>
  </Card>}
 </div>;
}
