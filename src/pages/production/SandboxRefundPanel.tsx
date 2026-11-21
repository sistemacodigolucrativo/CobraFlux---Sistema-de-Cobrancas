import React,{useEffect,useState} from 'react';
import {Button,Card,Input} from '../../components/ui/Primitives';
import {productionApi,type Charge} from '../../services/productionApi';

type RefundRequest={id:string;requested_cents:string;state:string;receipt_url:string|null;created_at:string};
const real=(c:number|string)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(c)/100);
function parseAmount(value:string){
 const raw=value.trim().replace(/^R\$\s*/,'').replace(/\s/g,'');
 if(!/^\d+(?:\.\d{3})*(?:,\d{1,2})?$/.test(raw))throw new Error('Informe um valor correto (ex.: 20,00).');
 const valueCents=Math.round(Number(raw.replace(/\./g,'').replace(',','.'))*100);
 if(!Number.isSafeInteger(valueCents)||valueCents<=0)throw new Error('Valor inválido.');
 return valueCents;
}
const labels:Record<string,string>={
 reserved:'Reservado — reconciliação necessária',
 submitted:'Aguardando confirmação do Asaas',
 reconcile_required:'Resultado inconclusivo — não reenviar',
 completed:'Estorno confirmado no Asaas',
 denied:'Estorno cancelado/negado no Asaas'
};
export function SandboxRefundPanel({charge,onChanged,onClose}:{charge:Charge;onChanged:()=>Promise<void>;onClose:()=>void}){
 const [items,setItems]=useState<RefundRequest[]>([]);
 const [refunded,setRefunded]=useState(Number(charge.refunded_cents));
 const [amount,setAmount]=useState('');
 const [reason,setReason]=useState('');
 const [ack,setAck]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const expected=Number(charge.amount_cents)-Number(charge.discount_cents);
 const available=Math.max(0,expected-refunded);
 async function refresh(){
   const result=await productionApi.sandboxRefunds(charge.id);
   setItems(result.items);setRefunded(Number(result.refundedCents));
 }
 useEffect(()=>{void refresh().catch(e=>setError(e instanceof Error?e.message:'Falha ao consultar estornos.'));},[charge.id]);
 async function perform(fn:()=>Promise<void>,done:string){
   setError('');setNotice('');setBusy(true);
   try{await fn();await refresh();await onChanged();setNotice(done);}
   catch(e){setError(e instanceof Error?e.message:'Falha na operação.');}
   finally{setBusy(false);}
 }
 const pending=items.some(r=>['reserved','submitted','reconcile_required'].includes(r.state));
 const canRequest=['paid','partially_refunded'].includes(charge.status)&&available>0&&!pending;
 return <Card className="p-4 space-y-4 border border-[#F5D491]/30" >
   <div className="flex gap-3 justify-between items-start">
     <div><h4 className="font-semibold text-[#F5D491]">Estornos Pix · Somente SANDBOX</h4>
       <p className="text-xs text-[#B8BFCD]">Os estornos só são contabilizados após confirmação DONE da API Asaas; uma solicitação aceita não significa dinheiro devolvido.</p></div>
     <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
   </div>
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
     <p>Original: <b>{real(expected)}</b></p>
     <p>Devolução confirmada: <b>{real(refunded)}</b></p>
     <p>Restante: <b>{real(available)}</b></p>
   </div>
   {error&&<p className="text-[#F16C79] text-xs" role="alert">{error}</p>}
   {notice&&<p className="text-[#33C994] text-xs" role="status">{notice}</p>}
   {canRequest&&<form className="space-y-3" onSubmit={e=>{
     e.preventDefault();void perform(async()=>{
       if(!ack)throw new Error('Confirme a solicitação de teste.');
       const amountCents=parseAmount(amount);
       if(amountCents>available)throw new Error('O valor supera o saldo disponível.');
       await productionApi.requestSandboxRefund(charge.id,amountCents,reason.trim());
       setAmount('');setReason('');setAck(false);
     },'Solicitação registrada no Asaas Sandbox. Concilie para verificar a devolução.');
   }}>
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
       <Input label="Valor do estorno (R$)" value={amount} required onChange={e=>setAmount(e.target.value)}
         placeholder="20,00"/>
       <Input label="Motivo do estorno" minLength={5} maxLength={120} required value={reason}
         onChange={e=>setReason(e.target.value)} placeholder="Ajuste no valor"/>
     </div>
     <label className="flex gap-2 items-start text-xs text-[#B8BFCD]">
       <input type="checkbox" className="mt-1" checked={ack} onChange={e=>setAck(e.target.checked)}/>
       Entendo que este pedido é exclusivo do sandbox e que não deve ser repetido após falha de rede sem consultar a reconciliação.
     </label>
     <Button type="submit" size="sm" disabled={busy||!ack}>Solicitar estorno SANDBOX</Button>
   </form>}
   {pending&&<p className="text-xs text-[#F5D491]">Existe estorno em análise: novas solicitações estão bloqueadas para evitar duplicidade.</p>}
   <Button size="sm" variant="secondary" disabled={busy} onClick={()=>void perform(async()=>{
     const data=await productionApi.reconcileSandboxFinancial(charge.id);
     setRefunded(data.refundedCents);
   },'Conciliação consultou o PSP. Apenas estornos concluídos foram reconhecidos.')}>
     Conciliar pagamentos e estornos no Asaas Sandbox
   </Button>
   <div className="space-y-2">
     <h5 className="text-sm font-semibold">Histórico de solicitações</h5>
     {!items.length&&<p className="text-xs text-[#B8BFCD]">Sem pedidos de estorno neste ambiente.</p>}
     {items.map(item=><div key={item.id} className="flex flex-wrap justify-between gap-2 py-2 border-b border-white/10 text-xs">
       <span>{real(item.requested_cents)} · {labels[item.state]??item.state}</span>
       <span className="text-[#B8BFCD]">{new Date(item.created_at).toLocaleString('pt-BR')}</span>
       {item.state==='completed'&&item.receipt_url&&
         <a href={item.receipt_url} rel="noopener noreferrer" target="_blank"
           className="text-xs text-[#E2BE72] underline">Comprovante oficial Asaas Sandbox</a>}
     </div>)}
   </div>
 </Card>;
}
