import React,{useEffect,useState} from 'react';
import {Button,Card,Input} from '../../components/ui/Primitives';
import {productionApi,type Service,type ServiceInput} from '../../services/productionApi';

const money=(n:number|string)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(n)/100);
function cents(raw:string):number{
 const value=raw.trim().replace(/R\$\s*/,'').replace(/\s/g,'');
 if(!/^\d+(?:\.\d{3})*(?:,\d{1,2})?$/.test(value)&&!/^\d+(?:,\d{1,2})?$/.test(value))throw new Error('Utilize um valor válido: 250,00.');
 const number=Math.round(Number(value.replace(/\./g,'').replace(',','.'))*100);
 if(!Number.isSafeInteger(number)||number>1e10)throw new Error('Valor fora do limite.');
 return number;
}
const initial={name:'',description:'',price:'250,00',defaultFrequency:'mensal' as ServiceInput['defaultFrequency']};
export function ServicesOperationsView({onChanged}:{onChanged:()=>Promise<void>}){
 const [items,setItems]=useState<Service[]>([]);
 const [editing,setEditing]=useState<string|null>(null);
 const [open,setOpen]=useState(false);
 const [form,setForm]=useState({...initial});
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');
 async function load(){const r=await productionApi.services();setItems(r.items);}
 useEffect(()=>{void load().catch(e=>setError(String(e)));},[]);
 async function run(fn:()=>Promise<void>,message:string){
   setBusy(true);setError('');setSuccess('');
   try{await fn();setSuccess(message);}catch(e){setError(e instanceof Error?e.message:'Falha ao salvar.');}
   finally{setBusy(false);}
 }
 function start(s?:Service){
  setEditing(s?.id??null);setOpen(true);
  setForm(s?{name:s.name,description:s.description,price:(Number(s.price_cents)/100).toFixed(2).replace('.',','),defaultFrequency:s.default_frequency}:{...initial});
 }
 async function save(){
  await run(async()=>{
    const value={name:form.name,description:form.description,priceCents:cents(form.price),defaultFrequency:form.defaultFrequency};
    if(editing)await productionApi.updateService(editing,value);
    else await productionApi.createService(value);
    await load();await onChanged();setOpen(false);
  },editing?'Serviço atualizado.':'Serviço cadastrado.');
 }
 return <div className="space-y-5">
   <div className="flex flex-wrap gap-3 justify-between items-center">
     <div><p className="text-xs text-[#E2BE72]">Catálogo de serviços da organização</p><h2 className="text-2xl font-bold">Serviços</h2></div>
     <Button size="sm" onClick={()=>start()}>Novo serviço</Button>
   </div>
   {error&&<p role="alert" className="text-sm text-[#F16C79]">{error}</p>}
   {success&&<p role="status" className="text-sm text-[#33C994]">{success}</p>}
   {open&&<Card className="p-5 space-y-4">
     <h3 className="text-lg font-semibold">{editing?'Editar serviço':'Cadastrar serviço'}</h3>
     <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={e=>{e.preventDefault();void save();}}>
       <Input label="Nome do serviço" required value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/>
       <Input label="Preço padrão (R$)" required value={form.price} onChange={e=>setForm(v=>({...v,price:e.target.value}))}/>
       <label className="text-sm">Frequência padrão
         <select className="block w-full rounded-lg border border-white/20 bg-[#0B0D12] p-3 mt-2" value={form.defaultFrequency}
           onChange={e=>setForm(v=>({...v,defaultFrequency:e.target.value as ServiceInput['defaultFrequency']}))}>
           <option value="unica">Única</option><option value="semanal">Semanal</option>
           <option value="mensal">Mensal</option><option value="personalizada">Personalizada</option>
         </select>
       </label>
       <label className="text-sm sm:col-span-2">Descrição
         <textarea rows={3} maxLength={1000} value={form.description} onChange={e=>setForm(v=>({...v,description:e.target.value}))}
           className="block w-full rounded-lg border border-white/20 bg-[#0B0D12] p-3 mt-2"/>
       </label>
       <div className="sm:col-span-2 flex gap-2"><Button type="submit" disabled={busy}>Salvar serviço</Button>
         <Button type="button" variant="secondary" onClick={()=>setOpen(false)}>Fechar</Button></div>
     </form>
   </Card>}
   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
     {items.map(s=><Card key={s.id} className="p-5 space-y-3">
       <div className="flex items-start justify-between gap-3">
         <div><h3 className="font-semibold">{s.name}</h3><p className="text-xs text-[#B8BFCD]">{s.description}</p></div>
         <span className={s.active?'text-xs text-[#33C994]':'text-xs text-[#F5D491]'}>{s.active?'Ativo':'Arquivado'}</span>
       </div>
       <p className="text-[#E2BE72] font-semibold">{money(s.price_cents)} · {s.default_frequency}</p>
       <div className="flex flex-wrap gap-2">
         <Button size="sm" variant="secondary" onClick={()=>start(s)}>Editar</Button>
         <Button size="sm" variant="ghost" disabled={busy} onClick={()=>void run(async()=>{
           await productionApi.updateService(s.id,{active:!s.active});await load();await onChanged();
         },s.active?'Serviço arquivado.':'Serviço reativado.')}>{s.active?'Arquivar':'Reativar'}</Button>
       </div>
     </Card>)}
   </div>
   {!items.length&&<Card className="p-6 text-sm text-[#B8BFCD]">Nenhum serviço cadastrado.</Card>}
 </div>;
}
