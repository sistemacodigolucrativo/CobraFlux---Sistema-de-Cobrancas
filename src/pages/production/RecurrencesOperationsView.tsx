import React,{useEffect,useState} from 'react';
import {Button,Card,Input} from '../../components/ui/Primitives';
import {productionApi,type Client,type RecurrencePlan,type RecurrenceCycle} from '../../services/productionApi';

const fmt=(c:number|string)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(c)/100);
const formMoney=(c:number|string)=>(Number(c)/100).toFixed(2).replace('.',',');
function centavos(value:string){
  const raw=value.trim().replace(/^R\$\s*/,'').replace(/\s/g,'');
  if(!/^\d+(?:\.\d{3})*(?:,\d{1,2})?$/.test(raw))throw new Error('Use o formato 150,00.');
  const n=Math.round(Number(raw.replace(/\./g,'').replace(',','.'))*100);
  if(!Number.isSafeInteger(n)||n<0||n>10000000000)throw new Error('Valor inválido.');
  return n;
}
function localDay(){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const p=(v:string)=>parts.find(x=>x.type===v)?.value??'';
  return p('year')+'-'+p('month')+'-'+p('day');
}
function firstDay(day:number){
  const now=localDay(),[year,month]=now.split('-').map(Number);
  const make=(y:number,m:number)=>new Date(Date.UTC(y,m-1,Math.min(day,new Date(Date.UTC(y,m,0)).getUTCDate()))).toISOString().slice(0,10);
  const current=make(year,month);
  return current>=now?current:make(month===12?year+1:year,month===12?1:month+1);
}
type Form={clientId:string;description:string;amount:string;discount:string;frequency:'monthly'|'weekly';anchorDay:number;firstDueDate:string};
const blank=():Form=>({clientId:'',description:'Mensalidade',amount:'150,00',discount:'0,00',frequency:'monthly',anchorDay:10,firstDueDate:firstDay(10)});
export function RecurrencesOperationsView({canManage,onChanged}:{canManage:boolean;onChanged:()=>Promise<void>}){
  const [plans,setPlans]=useState<RecurrencePlan[]>([]);
  const [clients,setClients]=useState<Client[]>([]);
  const [metrics,setMetrics]=useState<{total:number;active:number;paused:number;due:number;generated:number}|null>(null);
  const [form,setForm]=useState<Form>(blank);
  const [open,setOpen]=useState(false),[busy,setBusy]=useState(false);
  const [error,setError]=useState(''),[notice,setNotice]=useState('');
  const [preview,setPreview]=useState<string[]>([]);
  const [cycles,setCycles]=useState<RecurrenceCycle[]>([]);
  const [historyId,setHistoryId]=useState<string|null>(null);
  const [editId,setEditId]=useState<string|null>(null);
  const [editDescription,setEditDescription]=useState('');
  const [editAmount,setEditAmount]=useState(''),[editDiscount,setEditDiscount]=useState('');
  const [filter,setFilter]=useState<'all'|'active'|'paused'|'cancelled'>('all');
  async function refresh(){
    const [r,overview]=await Promise.all([productionApi.recurrences(filter==='all'?undefined:filter),productionApi.recurrenceOverview()]);
    setPlans(r.items);setMetrics(overview.summary);
  }
  useEffect(()=>{void refresh().catch(e=>setError(e instanceof Error?e.message:'Falha de consulta.'));},[filter]);
  useEffect(()=>{void productionApi.clients({status:'active',limit:200}).then(r=>setClients(r.items)).catch(()=>{});},[]);
  async function perform(fn:()=>Promise<void>,success:string){
    setBusy(true);setError('');setNotice('');
    try{await fn();await refresh();await onChanged();setNotice(success);}
    catch(e){setError(e instanceof Error?e.message:'Operação indisponível.');}
    finally{setBusy(false);}
  }
  async function submit(){
    const amountCents=centavos(form.amount),discountCents=centavos(form.discount);
    if(!form.clientId||amountCents<=0||discountCents>=amountCents)throw new Error('Cliente, valor e desconto precisam ser válidos.');
    await productionApi.createRecurrence({clientId:form.clientId,description:form.description.trim(),amountCents,
      discountCents,frequency:form.frequency,anchorDay:form.anchorDay,firstDueDate:form.firstDueDate});
    setOpen(false);setPreview([]);
  }
  function selectClient(id:string){
    const cl=clients.find(c=>c.id===id);
    const day=cl?.preferred_due_day??10;
    setForm(v=>({...v,clientId:id,anchorDay:day,firstDueDate:firstDay(day),
      description:cl?.service_name||v.description,
      amount:cl&&Number(cl.monthly_fee_cents)>0?formMoney(cl.monthly_fee_cents):v.amount}));
    setPreview([]);
  }
  return <div className="space-y-4">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs text-[#E2BE72]">Fase 4 · Gestão de recebíveis</p>
        <h2 className="text-2xl font-bold">Recorrências</h2></div>
      {canManage&&<Button size="sm" onClick={()=>{setForm(blank());setOpen(true);}}>Nova recorrência</Button>}
    </header>
    <Card className="p-4 space-y-2">
      <p className="text-sm text-[#F5D491]">A automação gera somente RASCUNHOS. Não envia mensagens, não cria Pix e não confirma pagamentos.</p>
      <p className="text-xs text-[#B8BFCD]">O trabalhador está preparado para agendamento futuro. Sem hospedagem, não há execução automática ativa.</p>
    </Card>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {([['Planos',metrics?.total??0],['Ativos',metrics?.active??0],['Pendentes',metrics?.due??0],['Gerados',metrics?.generated??0]] as const)
      .map(([label,value])=><Card className="p-4" key={label}>
        <p className="text-xs text-[#B8BFCD]">{label}</p><p className="text-2xl font-semibold">{value}</p>
      </Card>)}
    </div>
    {error&&<p role="alert" className="text-xs text-[#F16C79]">{error}</p>}
    {notice&&<p role="status" className="text-xs text-[#33C994]">{notice}</p>}
    {open&&canManage&&<Card className="p-5 space-y-3">
      <h3 className="font-semibold">Criar regra de recorrência</h3>
      <form className="grid grid-cols-1 sm:grid-cols-2 gap-3" onSubmit={e=>{e.preventDefault();void perform(submit,'Regra cadastrada para gerar rascunhos nos vencimentos.');}}>
        <label className="text-sm">Cliente
          <select required value={form.clientId} onChange={e=>selectClient(e.target.value)} className="block w-full mt-2 p-3 rounded-lg bg-[#0B0D12] border border-white/20">
            <option value="">Selecione</option>{clients.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="text-sm">Periodicidade
          <select value={form.frequency} onChange={e=>{
            const frequency=e.target.value as 'weekly'|'monthly';
            setForm(v=>({...v,frequency,firstDueDate:frequency==='monthly'?firstDay(v.anchorDay):localDay()}));setPreview([]);
          }} className="block w-full mt-2 p-3 rounded-lg bg-[#0B0D12] border border-white/20">
            <option value="monthly">Mensal</option><option value="weekly">Semanal</option>
          </select>
        </label>
        {form.frequency==='monthly'&&<label className="text-sm">Dia de vencimento
          <select value={form.anchorDay} onChange={e=>{
            const day=Number(e.target.value);setForm(v=>({...v,anchorDay:day,firstDueDate:firstDay(day)}));setPreview([]);
          }} className="block w-full mt-2 p-3 rounded-lg bg-[#0B0D12] border border-white/20">
            {Array.from({length:31},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}
          </select>
        </label>}
        <Input label="Primeiro vencimento" type="date" required value={form.firstDueDate}
          onChange={e=>{setForm(v=>({...v,firstDueDate:e.target.value}));setPreview([]);}}/>
        <div className="sm:col-span-2"><Input label="Descrição" required value={form.description}
          onChange={e=>setForm(v=>({...v,description:e.target.value}))}/></div>
        <Input label="Valor (R$)" required value={form.amount} onChange={e=>setForm(v=>({...v,amount:e.target.value}))}/>
        <Input label="Desconto (R$)" value={form.discount} onChange={e=>setForm(v=>({...v,discount:e.target.value}))}/>
        <div className="sm:col-span-2 space-y-2">
          <Button size="sm" type="button" variant="secondary" disabled={busy} onClick={()=>void perform(async()=>{
            const result=await productionApi.previewRecurrence({firstDueDate:form.firstDueDate,frequency:form.frequency,anchorDay:form.anchorDay,count:6});
            setPreview(result.dates);
          },'Calendário conferido.')}>Prévia de 6 ciclos</Button>
          {!!preview.length&&<p className="text-xs text-[#B8BFCD]">{preview.map(x=>x.split('-').reverse().join('/')).join(' · ')}</p>}
        </div>
        <div className="sm:col-span-2 flex gap-2">
          <Button type="submit" disabled={busy||!clients.length}>Salvar regra</Button>
          <Button type="button" variant="secondary" onClick={()=>setOpen(false)}>Fechar</Button>
        </div>
      </form>
    </Card>}
    <Card className="p-4">
      <label className="text-sm">Filtrar planos
        <select className="block mt-2 w-full sm:max-w-xs bg-[#0B0D12] border border-white/20 p-3 rounded-lg" value={filter}
          onChange={e=>setFilter(e.target.value as typeof filter)}>
          <option value="all">Todos</option><option value="active">Ativos</option><option value="paused">Pausados</option><option value="cancelled">Cancelados</option>
        </select>
      </label>
    </Card>
    {!plans.length&&<Card className="p-5 text-sm text-[#B8BFCD]">Nenhuma recorrência cadastrada.</Card>}
    {plans.map(plan=><Card key={plan.id} className="p-5 space-y-3">
      <div className="flex flex-wrap justify-between gap-2">
        <div><p className="font-semibold">{plan.client_name}</p><p className="text-sm text-[#B8BFCD]">{plan.description}</p>
          <p className="text-xs text-[#B8BFCD]">{plan.frequency==='monthly'?'Mensal · dia '+plan.anchor_day:'Semanal'} · {plan.state}</p>
          <p className="text-xs text-[#B8BFCD]">Próximo: {plan.next_due_date} · {plan.generated_count} rascunho(s)</p>
        </div><p className="text-[#E2BE72] font-semibold">{fmt(Number(plan.amount_cents)-Number(plan.discount_cents))}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="secondary" onClick={()=>void perform(async()=>{
          if(historyId===plan.id){setHistoryId(null);return;}
          const result=await productionApi.recurrenceCycles(plan.id);setCycles(result.items);setHistoryId(plan.id);
        },'Histórico consultado.')}>Histórico</Button>
        {canManage&&plan.state!=='cancelled'&&<Button size="sm" variant="secondary" onClick={()=>{
          setEditId(plan.id);setEditDescription(plan.description);setEditAmount(formMoney(plan.amount_cents));
          setEditDiscount(formMoney(plan.discount_cents));
        }}>Editar próximos ciclos</Button>}
        {canManage&&plan.state==='active'&&<Button size="sm" variant="secondary" disabled={busy}
          onClick={()=>void perform(async()=>{await productionApi.pauseRecurrence(plan.id);},'Regra pausada.')}>Pausar</Button>}
        {canManage&&plan.state==='paused'&&<Button size="sm" variant="secondary" disabled={busy}
          onClick={()=>void perform(async()=>{
            const r=await productionApi.resumeRecurrence(plan.id,'skip_missed');
            setNotice(String(r.skippedCycles)+' ciclos antigos ignorados.');
          },'Regra retomada sem geração retroativa.')}>Retomar sem atrasados</Button>}
        {canManage&&plan.state!=='cancelled'&&<Button size="sm" variant="danger" disabled={busy} onClick={()=>{
          if(window.confirm('Cancelar regra definitivamente? Rascunhos antigos permanecem.'))
            void perform(async()=>{await productionApi.cancelRecurrence(plan.id);},'Regra cancelada.');
        }}>Cancelar regra</Button>}
      </div>
      {editId===plan.id&&<form className="border-t border-white/10 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
        onSubmit={e=>{e.preventDefault();void perform(async()=>{
          const amountCents=centavos(editAmount),discountCents=centavos(editDiscount);
          if(amountCents<=0||discountCents>=amountCents)throw new Error('Valor ou desconto inválido.');
          await productionApi.updateRecurrence(plan.id,{description:editDescription,amountCents,discountCents});
          setEditId(null);
        },'Apenas os próximos ciclos foram alterados.');}}>
        <div className="sm:col-span-2"><Input label="Descrição futura" required value={editDescription}
          onChange={e=>setEditDescription(e.target.value)}/></div>
        <Input label="Novo valor" required value={editAmount} onChange={e=>setEditAmount(e.target.value)}/>
        <Input label="Novo desconto" required value={editDiscount} onChange={e=>setEditDiscount(e.target.value)}/>
        <div className="sm:col-span-2 flex gap-2"><Button type="submit" disabled={busy}>Atualizar regra</Button>
          <Button type="button" variant="secondary" onClick={()=>setEditId(null)}>Fechar</Button></div>
      </form>}
      {historyId===plan.id&&<div className="border-t border-white/10 pt-3 space-y-1">
        {!cycles.length&&<p className="text-xs text-[#B8BFCD]">Sem ciclos gerados.</p>}
        {cycles.map(c=><p key={c.id} className="text-xs text-[#B8BFCD]">
          {c.due_date} · {fmt(Number(c.amount_cents)-Number(c.discount_cents))} · {c.charge_status} · {c.cycle_key}
        </p>)}
      </div>}
    </Card>)}
  </div>;
}
