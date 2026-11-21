import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Input } from '../../components/ui/Primitives';
import { productionApi, type Charge, type Client, type ClientInput, type CsvPreviewRow } from '../../services/productionApi';
const numberBR=(n:number|string)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(n)/100);
const inputBR=(n:number|string)=> (Number(n)/100).toFixed(2).replace('.',',');
function parseBRL(value:string):number {
  const raw=value.trim().replace(/R\$\s*/,'').replace(/\s/g,'');
  if(!/^\d+(?:\.\d{3})*(?:,\d{1,2})?$/.test(raw)&&!/^\d+(?:,\d{1,2})?$/.test(raw))throw new Error('Informe um valor em reais válido (ex.: 450,00).');
  const cents=Math.round(Number(raw.replace(/\./g,'').replace(',','.'))*100);
  if(!Number.isSafeInteger(cents)||cents>10000000000)throw new Error('Valor fora do limite permitido.');
  return cents;
}
function Message({error,success}:{error:string;success:string}){
  return <>{error&&<p role="alert" className="text-sm text-[#F16C79]">{error}</p>}
    {success&&<p role="status" className="text-sm text-[#33C994]">{success}</p>}</>;
}
const initial:ClientInput={
  name:'',phone:'',email:'',notes:'',serviceName:'',monthlyFeeCents:0,
  preferredDueDay:10,whatsappOptIn:false,
};
export function ClientsOperationsView({onChanged}:{onChanged:()=>Promise<void>}){
  const [rows,setRows]=useState<Client[]>([]);
  const [total,setTotal]=useState(0);
  const [search,setSearch]=useState('');
  const [status,setStatus]=useState<'all'|'active'|'archived'>('all');
  const [page,setPage]=useState(0);
  const [loading,setLoading]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('');
  const [editing,setEditing]=useState<string|null>(null);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState<ClientInput>({...initial});
  const [fee,setFee]=useState('0,00');
  const [historyFor,setHistoryFor]=useState<string|null>(null);
  const [history,setHistory]=useState<Charge[]>([]);
  const [csv,setCsv]=useState('');
  const [preview,setPreview]=useState<CsvPreviewRow[]|null>(null);
  const [showCsv,setShowCsv]=useState(false);
  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const result=await productionApi.clients({search,status:status==='all'?undefined:status,limit:25,offset:page*25});
      setRows(result.items);setTotal(result.total);
    }catch(e){setError(e instanceof Error?e.message:'Erro ao consultar clientes.');}
    finally{setLoading(false);}
  },[search,status,page]);
  useEffect(()=>{void load();},[load]);
  async function run(fn:()=>Promise<void>,done:string){
    setBusy(true);setError('');setSuccess('');
    try{await fn();setSuccess(done);}catch(e){setError(e instanceof Error?e.message:'Falha na operação.');}
    finally{setBusy(false);}
  }
  function openEdit(client?:Client){
    setEditing(client?.id??null);setShowForm(true);setError('');setSuccess('');
    setForm(client?{
      name:client.name,phone:client.phone,email:client.email??'',notes:client.notes,
      serviceName:client.service_name,monthlyFeeCents:Number(client.monthly_fee_cents),
      preferredDueDay:client.preferred_due_day,whatsappOptIn:client.whatsapp_opt_in
    }:{...initial});
    setFee(client?inputBR(client.monthly_fee_cents):'0,00');
  }
  function set<K extends keyof ClientInput>(key:K,value:ClientInput[K]){setForm(v=>({...v,[key]:value}));}
  async function save(){
    await run(async()=>{
      const input={...form,monthlyFeeCents:parseBRL(fee)};
      if(editing)await productionApi.updateClient(editing,input);
      else await productionApi.createClient(input);
      setShowForm(false);await load();await onChanged();
    },editing?'Cliente atualizado.':'Cliente cadastrado.');
  }
  async function showHistory(id:string){
    if(historyFor===id){setHistoryFor(null);return;}
    await run(async()=>{
      const result=await productionApi.clientCharges(id);setHistoryFor(id);setHistory(result.items);
    },'Histórico consultado.');
  }
  async function readCsvFile(e:React.ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0];if(!file)return;
    if(file.size>180000){setError('Arquivo CSV muito grande. Máximo de 180 KB.');return;}
    setCsv(await file.text());setPreview(null);
  }
  return <div className="space-y-5">
    <div className="flex flex-wrap justify-between items-center gap-3">
      <div><p className="text-xs text-[#E2BE72]">Carteira de clientes · Banco centralizado</p>
        <h2 className="text-2xl font-bold">Clientes</h2><p className="text-sm text-[#B8BFCD]">{total} registro(s) no filtro</p></div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={()=>{setShowCsv(v=>!v);setShowForm(false);}}>Importar CSV</Button>
        <Button size="sm" onClick={()=>{openEdit();setShowCsv(false);}}>Novo cliente</Button>
      </div>
    </div>
    <Card className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <label className="sm:col-span-2 text-sm">Buscar por nome, código, telefone ou serviço
        <input className="block bg-[#0B0D12] rounded-lg border border-white/20 w-full p-3 mt-2" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} placeholder="Buscar cliente"/>
      </label>
      <label className="text-sm">Situação
        <select className="block bg-[#0B0D12] rounded-lg border border-white/20 w-full p-3 mt-2" value={status} onChange={e=>{setStatus(e.target.value as typeof status);setPage(0);}}>
          <option value="all">Todos</option><option value="active">Ativos</option><option value="archived">Arquivados</option>
        </select>
      </label>
    </Card>
    <Message error={error} success={success}/>
    {showForm&&<Card className="p-5 space-y-4">
      <h3 className="text-lg font-semibold">{editing?'Editar cliente':'Cadastrar cliente'}</h3>
      <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={e=>{e.preventDefault();void save();}}>
        <Input required label="Nome completo" value={form.name} onChange={e=>set('name',e.target.value)}/>
        <Input required label="Telefone com DDI (+55)" value={form.phone} onChange={e=>set('phone',e.target.value)}/>
        <Input label="E-mail (opcional)" type="email" value={form.email??''} onChange={e=>set('email',e.target.value)}/>
        <Input label="Serviço contratado" value={form.serviceName??''} onChange={e=>set('serviceName',e.target.value)}/>
        <Input required label="Mensalidade (R$)" value={fee} onChange={e=>setFee(e.target.value)}/>
        <Input required label="Dia preferido de vencimento (1–31)" type="number" min={1} max={31} value={form.preferredDueDay??10} onChange={e=>set('preferredDueDay',Number(e.target.value))}/>
        <label className="sm:col-span-2 text-sm">Observações
          <textarea className="block w-full bg-[#0B0D12] border border-white/20 rounded-lg p-3 mt-2" rows={3} maxLength={2000}
            value={form.notes??''} onChange={e=>set('notes',e.target.value)}/>
        </label>
        <label className="sm:col-span-2 flex items-start gap-3 text-sm text-[#B8BFCD]">
          <input type="checkbox" className="mt-1" checked={form.whatsappOptIn}
            onChange={e=>set('whatsappOptIn',e.target.checked)}/>
          Campo legado do cadastro; NÃO habilita envio. O consentimento documentado e revogável deve ser registrado separadamente na área WhatsApp.
        </label>
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          <Button type="submit" disabled={busy}>{busy?'Salvando...':'Salvar cliente'}</Button>
          <Button type="button" variant="secondary" onClick={()=>setShowForm(false)}>Cancelar</Button>
        </div>
      </form>
    </Card>}
    {showCsv&&<Card className="p-5 space-y-4">
      <h3 className="text-lg font-semibold">Importação CSV com prévia</h3>
      <p className="text-sm text-[#B8BFCD]">Colunas: nome;telefone;email;serviço;mensalidade;dia vencimento. Até 500 linhas, separador ponto e vírgula ou vírgula. Nenhum consentimento WhatsApp é presumido.</p>
      <input type="file" accept=".csv,text/csv,text/plain" onChange={e=>void readCsvFile(e)} className="block w-full text-sm"/>
      <textarea className="bg-[#0B0D12] border border-white/20 rounded-lg w-full p-3 text-sm" rows={5}
        value={csv} onChange={e=>{setCsv(e.target.value);setPreview(null);}}
        placeholder="nome;telefone;email;serviço;mensalidade;dia vencimento"/>
      <div className="flex flex-wrap gap-2">
        <Button disabled={!csv||busy} variant="secondary" onClick={()=>void run(async()=>{
          const res=await productionApi.previewClientCsv(csv);setPreview(res.items);
        },'Prévia gerada; nada foi importado.')}>Verificar linhas</Button>
        {preview&&<Button disabled={!preview.some(x=>x.valid)||busy} onClick={()=>void run(async()=>{
          const result=await productionApi.importClients(csv,preview.some(x=>!x.valid)?'valid_only':'strict');
          await load();await onChanged();setSuccess(result.importedCount+' cliente(s) importado(s), '+result.rejectedCount+' rejeitado(s).');
          setShowCsv(false);
        },'Importação processada.')}>Importar linhas válidas</Button>}
      </div>
      {preview&&<div className="space-y-2">
        <p className="text-sm">{preview.filter(x=>x.valid).length} válidas · {preview.filter(x=>!x.valid).length} com erros</p>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {preview.slice(0,80).map(row=><div key={row.rowNumber} className="border-b border-white/10 text-xs py-2">
            Linha {row.rowNumber} · {row.name} · {row.phone} · <span className={row.valid?'text-[#33C994]':'text-[#F16C79]'}>{row.valid?'Válida':row.errors.join(', ')}</span>
          </div>)}
        </div>
        {preview.length>80&&<p className="text-xs text-[#B8BFCD]">Prévia resumida às primeiras 80 linhas.</p>}
      </div>}
    </Card>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {rows.map(c=><Card key={c.id} className="p-5 space-y-3">
        <div className="flex justify-between gap-2">
          <div><p className="font-semibold">{c.name}</p><p className="text-xs text-[#B8BFCD]">{c.internal_code} · {c.phone}</p></div>
          <span className={c.status==='active'?'text-[#33C994] text-xs':'text-[#F5D491] text-xs'}>{c.status==='active'?'Ativo':'Arquivado'}</span>
        </div>
        <p className="text-sm text-[#B8BFCD]">{c.service_name||'Serviço não definido'} · {numberBR(c.monthly_fee_cents)} · Dia {c.preferred_due_day}</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={()=>openEdit(c)}>Editar</Button>
          <Button size="sm" variant="secondary" onClick={()=>void showHistory(c.id)}>Histórico</Button>
          <Button size="sm" variant="ghost" disabled={busy} onClick={()=>void run(async()=>{
            await productionApi.setClientStatus(c.id,c.status==='active'?'archived':'active');await load();await onChanged();
          },'Situação atualizada.')}>{c.status==='active'?'Arquivar':'Reativar'}</Button>
        </div>
        {historyFor===c.id&&<div className="border-t border-white/10 pt-3 text-xs space-y-2">
          {history.length===0?<p>Sem cobranças registradas.</p>:history.map(h=><p key={h.id}>{h.description} · {numberBR(Number(h.amount_cents)-Number(h.discount_cents))} · {h.status}</p>)}
        </div>}
      </Card>)}
    </div>
    {!loading&&rows.length===0&&<Card className="p-6 text-[#B8BFCD]">Nenhum cliente encontrado para os filtros selecionados.</Card>}
    <div className="flex justify-between items-center">
      <Button size="sm" variant="secondary" disabled={page===0||loading} onClick={()=>setPage(n=>n-1)}>Anterior</Button>
      <p className="text-xs text-[#B8BFCD]">Página {page+1} · 25 por página</p>
      <Button size="sm" variant="secondary" disabled={loading||(page+1)*25>=total} onClick={()=>setPage(n=>n+1)}>Próxima</Button>
    </div>
  </div>;
}
