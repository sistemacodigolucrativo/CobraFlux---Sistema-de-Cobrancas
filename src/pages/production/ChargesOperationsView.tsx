import React,{useCallback,useEffect,useState} from 'react';
import {Button,Card,Input} from '../../components/ui/Primitives';
import {productionApi,type Charge,type Client,type Service,type ChargeEvent} from '../../services/productionApi';
import {SandboxRefundPanel} from './SandboxRefundPanel';
const money=(c:number|string)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(c)/100);
const asMoney=(c:number|string)=>(Number(c)/100).toFixed(2).replace('.',',');
function cents(input:string):number{
  const raw=input.replace(/R\$\s*/,'').replace(/\s/g,'');
  if(!/^\d+(?:\.\d{3})*(?:,\d{1,2})?$/.test(raw)&&!/^\d+(?:,\d{1,2})?$/.test(raw))throw new Error('Valor inválido; utilize 450,00.');
  const value=Math.round(Number(raw.replace(/\./g,'').replace(',','.'))*100);
  if(!Number.isSafeInteger(value)||value>1e10)throw new Error('Valor fora do limite.');
  return value;
}
type Form={clientId:string;serviceId:string;description:string;amount:string;discount:string;dueDate:string};
type Filter='all'|'draft'|'pending_provider'|'cancel_pending'|'cancelled'|'pending'|'paid'|'partial'|'partially_refunded'|'overdue'|'refunded';
const defaults:Form={clientId:'',serviceId:'',description:'',amount:'450,00',discount:'0,00',dueDate:new Date().toISOString().slice(0,10)};
export function ChargesOperationsView({onChanged,canIssue=false}:{onChanged:()=>Promise<void>;canIssue?:boolean}){
 const [items,setItems]=useState<Charge[]>([]);
 const [clients,setClients]=useState<Client[]>([]);
 const [services,setServices]=useState<Service[]>([]);
 const [search,setSearch]=useState('');
 const [status,setStatus]=useState<Filter>('all');
 const [page,setPage]=useState(0);
 const [total,setTotal]=useState(0);
 const [form,setForm]=useState<Form>({...defaults});
 const [editing,setEditing]=useState<string|null>(null);
 const [open,setOpen]=useState(false);
 const [working,setWorking]=useState(false);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [historyId,setHistoryId]=useState<string|null>(null);
 const [history,setHistory]=useState<ChargeEvent[]>([]);
 const [duplicateId,setDuplicateId]=useState<string|null>(null);
 const [duplicateDue,setDuplicateDue]=useState('');
 const [cancelId,setCancelId]=useState<string|null>(null);
 const [cancelReason,setCancelReason]=useState('Cancelada pelo profissional');
 const [cancelSandboxFor,setCancelSandboxFor]=useState<string|null>(null);
 const [cancelSandboxReason,setCancelSandboxReason]=useState('Cobrança de teste não deve mais ser paga');
 const [refundFor,setRefundFor]=useState<string|null>(null);
 const [receipt,setReceipt]=useState<{id:string;url:string}|null>(null);
 const [sandboxConfigured,setSandboxConfigured]=useState(false);
 const load=useCallback(async()=>{
   try{const r=await productionApi.charges({search,status:status==='all'?undefined:status,limit:25,offset:page*25});setItems(r.items);setTotal(r.total);}
   catch(e){setError(e instanceof Error?e.message:'Falha ao consultar cobranças.');}
 },[search,status,page]);
 useEffect(()=>{void load();},[load]);
 useEffect(()=>{void productionApi.sandboxConnection().then(c=>setSandboxConfigured(c.configured)).catch(()=>setSandboxConfigured(false));},[]);
 useEffect(()=>{void Promise.all([productionApi.clients({status:'active',limit:200}),productionApi.services()])
   .then(([c,s])=>{setClients(c.items);setServices(s.items);}).catch(e=>setError(String(e)));},[]);
 async function run(fn:()=>Promise<void>,done:string){
   setWorking(true);setError('');setMessage('');
   try{await fn();setMessage(done);}catch(e){setError(e instanceof Error?e.message:'Falha ao salvar.');}
   finally{setWorking(false);}
 }
 function update<K extends keyof Form>(key:K,value:Form[K]){setForm(v=>({...v,[key]:value}));}
 function start(c?:Charge){
   setEditing(c?.id??null);setOpen(true);
   setForm(c?{clientId:c.client_id,serviceId:c.service_id??'',description:c.description,
     amount:asMoney(c.amount_cents),discount:asMoney(c.discount_cents),dueDate:String(c.due_date).slice(0,10)}
     :{...defaults,clientId:clients[0]?.id??''});
 }
 async function save(){
   await run(async()=>{
     const amountCents=cents(form.amount),discountCents=cents(form.discount);
     if(amountCents<=0||discountCents>=amountCents)throw new Error('Desconto precisa ser menor que o valor bruto.');
     const patch={description:form.description,amountCents,discountCents,dueDate:form.dueDate};
     if(editing)await productionApi.updateCharge(editing,patch);
     else await productionApi.createCharge({...patch,clientId:form.clientId,...(form.serviceId?{serviceId:form.serviceId}:{})});
     setOpen(false);await load();await onChanged();
   },editing?'Rascunho atualizado.':'Rascunho salvo, sem processamento Pix.');
 }
 return <div className="space-y-4">
   <header className="flex flex-wrap justify-between items-center gap-3">
     <div><p className="text-xs text-[#E2BE72]">Gestão de recebíveis · Modo operacional</p><h2 className="text-2xl font-bold">Cobranças</h2></div>
     <Button size="sm" disabled={!clients.length} onClick={()=>start()}>Nova cobrança</Button>
   </header>
   <Card className="p-4"><p className="text-sm text-[#F5D491]">Emissão Pix Asaas disponível somente no SANDBOX, quando configurado pelo titular. Nenhum QR desta etapa movimenta dinheiro real. Confirmações dependem exclusivamente do webhook autenticado, nunca de botões do navegador.</p></Card>
   <Card className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
     <label className="text-sm sm:col-span-2">Buscar por cliente, descrição ou token
       <input className="block w-full p-3 mt-1 rounded-lg bg-[#0B0D12] border border-white/20" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}/>
     </label>
     <label className="text-sm">Situação
       <select className="block w-full p-3 mt-1 rounded-lg bg-[#0B0D12] border border-white/20" value={status} onChange={e=>{setStatus(e.target.value as Filter);setPage(0);}}>
         <option value="all">Todas</option><option value="draft">Rascunho</option><option value="pending_provider">Emissão inconclusiva</option><option value="cancel_pending">Cancelamento em conciliação</option><option value="cancelled">Cancelada</option><option value="pending">Pendente</option><option value="paid">Paga</option><option value="partial">Parcial</option><option value="partially_refunded">Estornada parcialmente</option><option value="overdue">Vencida</option><option value="refunded">Estornada</option>
       </select>
     </label>
   </Card>
   {error&&<p role="alert" className="text-sm text-[#F16C79]">{error}</p>}
   {message&&<p role="status" className="text-sm text-[#33C994]">{message}</p>}
   {open&&<Card className="p-5 space-y-4">
     <h3 className="text-lg font-bold">{editing?'Editar rascunho':'Criar rascunho'}</h3>
     <form className="grid grid-cols-1 sm:grid-cols-2 gap-3" onSubmit={e=>{e.preventDefault();void save();}}>
       <label className="text-sm">Cliente
         <select disabled={Boolean(editing)} required className="block w-full p-3 mt-1 rounded-lg bg-[#0B0D12] border border-white/20" value={form.clientId} onChange={e=>update('clientId',e.target.value)}>
           <option value="">Selecione</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
           {editing&&!clients.some(c=>c.id===form.clientId)&&<option value={form.clientId}>Cliente histórico</option>}
         </select>
       </label>
       <label className="text-sm">Serviço opcional
         <select disabled={Boolean(editing)} className="block w-full p-3 mt-1 rounded-lg bg-[#0B0D12] border border-white/20" value={form.serviceId} onChange={e=>update('serviceId',e.target.value)}>
           <option value="">Não vincular</option>{services.filter(s=>s.active).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
           {editing&&form.serviceId&&!services.some(s=>s.id===form.serviceId&&s.active)&&<option value={form.serviceId}>Serviço histórico</option>}
         </select>
       </label>
       <div className="sm:col-span-2"><Input required label="Descrição" value={form.description} onChange={e=>update('description',e.target.value)}/></div>
       <Input required label="Valor (R$)" value={form.amount} onChange={e=>update('amount',e.target.value)}/>
       <Input label="Desconto (R$)" value={form.discount} onChange={e=>update('discount',e.target.value)}/>
       <Input required type="date" label="Vencimento" value={form.dueDate} onChange={e=>update('dueDate',e.target.value)}/>
       <div className="sm:col-span-2 flex gap-2"><Button type="submit" disabled={working}>Salvar rascunho</Button>
         <Button type="button" variant="secondary" onClick={()=>setOpen(false)}>Fechar</Button></div>
     </form>
   </Card>}
   {items.map(c=><Card key={c.id} className="p-5 space-y-3">
     <div className="flex flex-wrap justify-between gap-2"><div><b>{c.client_name}</b><p className="text-sm text-[#B8BFCD]">{c.description}</p>
       <p className="text-xs text-[#B8BFCD]">{String(c.due_date).slice(0,10)} · {c.status}
        {c.provider==='asaas_sandbox'?' · SANDBOX (sem dinheiro real)':''}</p></div>
       <div className="text-right"><b className="text-lg">{money(Number(c.amount_cents)-Number(c.discount_cents))}</b><p className="text-xs text-[#B8BFCD]">Desconto {money(c.discount_cents)}</p></div>
     </div>
     <div className="flex flex-wrap gap-2">
       <Button size="sm" variant="secondary" onClick={()=>void navigator.clipboard.writeText(window.location.origin+'/#/pagar/'+c.public_token).then(()=>setMessage('Link copiado.')).catch(()=>setError('Não foi possível copiar.'))}>Copiar link</Button>
       <a className="inline-flex items-center rounded-lg px-3 py-2 text-xs text-[#E2BE72] border border-white/20" href={'/#/pagar/'+c.public_token}>Ver página</a>
       <Button size="sm" variant="secondary" onClick={()=>void run(async()=>{const h=await productionApi.chargeHistory(c.id);setHistory(h.items);setHistoryId(historyId===c.id?null:c.id);},'Histórico consultado.')}>Histórico</Button>
       {c.status==='draft'&&<Button size="sm" variant="secondary" onClick={()=>start(c)}>Editar</Button>}
       {canIssue&&sandboxConfigured&&c.status==='draft'&&<Button size="sm" disabled={working}
         onClick={()=>void run(async()=>{await productionApi.issueSandboxPix(c.id);await load();await onChanged();},
           'Pix SANDBOX gerado. Nenhum dinheiro real é movimentado.')}>Emitir Pix SANDBOX</Button>}
       {canIssue&&c.status==='pending_provider'&&<Button size="sm" disabled={working} variant="secondary"
         onClick={()=>void run(async()=>{await productionApi.reconcileSandboxPix(c.id);await load();await onChanged();},
           'Reconciliação concluída. Nenhuma cobrança duplicada foi criada.')}>Reconciliar no sandbox</Button>}
       <Button size="sm" variant="secondary" onClick={()=>{setDuplicateId(duplicateId===c.id?null:c.id);setDuplicateDue(String(c.due_date).slice(0,10));}}>Duplicar</Button>
       {c.status==='draft'&&<Button size="sm" variant="danger" onClick={()=>setCancelId(cancelId===c.id?null:c.id)}>Cancelar</Button>}
       {canIssue&&c.provider==='asaas_sandbox'&&['pending','overdue'].includes(c.status)&&
         <Button size="sm" variant="danger" disabled={working} onClick={()=>
           setCancelSandboxFor(cancelSandboxFor===c.id?null:c.id)}>Cancelar Pix SANDBOX</Button>}
       {canIssue&&c.provider==='asaas_sandbox'&&c.status==='cancel_pending'&&
         <Button size="sm" variant="secondary" disabled={working} onClick={()=>void run(async()=>{
           const checked=await productionApi.reconcileSandboxCancellation(c.id);
           await load();await onChanged();
           if(checked.state!=='completed')setMessage('Cancelamento ainda não confirmado no Asaas Sandbox.');
         },'Cancelamento conferido junto ao Asaas Sandbox.')}>Verificar cancelamento</Button>}
       {canIssue&&c.provider==='asaas_sandbox'&&['paid','partially_refunded','refunded'].includes(c.status)&&
         <Button size="sm" variant="secondary" onClick={()=>setRefundFor(refundFor===c.id?null:c.id)}>
           Estornos SANDBOX
         </Button>}
       {canIssue&&c.provider==='asaas_sandbox'&&['paid','partially_refunded','refunded'].includes(c.status)&&
         <Button size="sm" variant="secondary" onClick={()=>void run(async()=>{
           const document=await productionApi.sandboxPaymentReceipt(c.id);
           setReceipt({id:c.id,url:document.receiptUrl});
         },'Comprovante confirmado pelo Asaas Sandbox.')}>Consultar comprovante</Button>}
     </div>
     {refundFor===c.id&&<SandboxRefundPanel key={c.id} charge={c} onChanged={async()=>{await load();await onChanged();}} onClose={()=>setRefundFor(null)}/>}
     {receipt?.id===c.id&&<a href={receipt.url} target="_blank" rel="noopener noreferrer"
       className="inline-flex text-xs text-[#E2BE72] underline">Abrir comprovante oficial SANDBOX</a>}
     {historyId===c.id&&<div className="border-t border-white/10 pt-2 space-y-1 text-xs">
       {history.map(event=><p key={event.id}>{new Date(event.created_at).toLocaleString('pt-BR')} · {event.action}</p>)}
       {!history.length&&<p>Sem histórico.</p>}
     </div>}
     {duplicateId===c.id&&<div className="flex flex-wrap gap-3 items-end border-t border-white/10 pt-3">
       <Input label="Novo vencimento" type="date" value={duplicateDue} onChange={e=>setDuplicateDue(e.target.value)}/>
       <Button size="sm" disabled={working||!duplicateDue} onClick={()=>void run(async()=>{await productionApi.duplicateCharge(c.id,duplicateDue);setDuplicateId(null);await load();await onChanged();},'Novo rascunho criado.')}>Confirmar duplicação</Button>
     </div>}
     {cancelSandboxFor===c.id&&<div className="space-y-3 border-t border-[#F5D491]/30 pt-3">
       <p className="text-xs text-[#F5D491]">
         Cancelamento exclusivo do SANDBOX. O link público deixará de mostrar o Pix imediatamente, mas códigos já copiados podem continuar válidos até a confirmação no Asaas;
         o status Cancelada somente será aplicado após confirmação do Asaas.
         Um pagamento já recebido exige estorno, não cancelamento.
       </p>
       <Input label="Motivo do cancelamento Pix de testes" minLength={5} maxLength={200} required
         value={cancelSandboxReason} onChange={e=>setCancelSandboxReason(e.target.value)}/>
       <div className="flex flex-wrap gap-2">
         <Button size="sm" variant="danger" disabled={working||cancelSandboxReason.trim().length<5}
           onClick={()=>void run(async()=>{
             const requested=await productionApi.requestSandboxCancellation(c.id,cancelSandboxReason.trim());
             setCancelSandboxFor(null);await load();await onChanged();
             if(requested.state!=='completed')
               throw new Error('Exclusão no PSP ainda não confirmada. O Pix foi bloqueado no painel; use Verificar cancelamento, sem repetir a solicitação.');
           },'Cobrança de teste cancelada após confirmação do Asaas.')}>Confirmar cancelamento SANDBOX</Button>
         <Button size="sm" variant="secondary" disabled={working}
           onClick={()=>setCancelSandboxFor(null)}>Voltar</Button>
       </div>
     </div>}
     {cancelId===c.id&&<div className="flex flex-wrap gap-3 items-end border-t border-white/10 pt-3">
       <label className="text-sm flex-1">Motivo
         <input className="block w-full p-3 mt-1 rounded-lg bg-[#0B0D12] border border-white/20" value={cancelReason} onChange={e=>setCancelReason(e.target.value)}/>
       </label>
       <Button size="sm" variant="danger" disabled={working||cancelReason.length<3} onClick={()=>void run(async()=>{await productionApi.cancelCharge(c.id,cancelReason);setCancelId(null);await load();await onChanged();},'Rascunho cancelado.')}>Confirmar</Button>
     </div>}
   </Card>)}
   {!items.length&&<Card className="p-6 text-[#B8BFCD]">Nenhuma cobrança encontrada.</Card>}
   <div className="flex justify-between items-center gap-3">
     <Button size="sm" variant="secondary" disabled={!page} onClick={()=>setPage(p=>p-1)}>Anterior</Button>
     <span className="text-xs text-[#B8BFCD]">Página {page+1} · {total} registro(s)</span>
     <Button size="sm" variant="secondary" disabled={(page+1)*25>=total} onClick={()=>setPage(p=>p+1)}>Próxima</Button>
   </div>
 </div>;
}
