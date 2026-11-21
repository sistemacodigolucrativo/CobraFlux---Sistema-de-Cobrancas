import React,{useEffect,useState} from 'react';
import {Button,Card,Input} from '../../components/ui/Primitives';
import {productionApi,type Charge} from '../../services/productionApi';
type Conn=Awaited<ReturnType<typeof productionApi.whatsappConnection>>;
type Template=Awaited<ReturnType<typeof productionApi.whatsappTemplates>>['items'][number];
type Consent=Awaited<ReturnType<typeof productionApi.whatsappConsents>>['items'][number];
type Job=Awaited<ReturnType<typeof productionApi.whatsappOutbox>>['items'][number];
export function WhatsAppOperationsView({canManage}:{canManage:boolean}){
 const [connection,setConnection]=useState<Conn|null>(null);
 const [templates,setTemplates]=useState<Template[]>([]);
 const [consents,setConsents]=useState<Consent[]>([]);
 const [jobs,setJobs]=useState<Job[]>([]);
 const [charges,setCharges]=useState<Charge[]>([]);
 const [error,setError]=useState(''),[notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false),[showConfig,setShowConfig]=useState(false);
 const [waba,setWaba]=useState(''),[phoneId,setPhoneId]=useState(''),[token,setToken]=useState('');
 const [clientId,setClientId]=useState(''),[source,setSource]=useState<'signed_form'|'web_form'|'documented_request'>('signed_form');
 const [evidence,setEvidence]=useState(''),[ack,setAck]=useState(false);
 const [chargeId,setChargeId]=useState(''),[templateId,setTemplateId]=useState('');
 const [defaultId,setDefaultId]=useState('');
 async function load(){
   const [conn,t,c,j,ch]=await Promise.all([
     canManage?productionApi.whatsappConnection():Promise.resolve(null),
     productionApi.whatsappTemplates(),productionApi.whatsappConsents(),
     productionApi.whatsappOutbox(),
     canManage?productionApi.charges({limit:200}):Promise.resolve({items:[] as Charge[],total:0})
   ]);
   setConnection(conn);setTemplates(t.items);setConsents(c.items);setJobs(j.items);setCharges(ch.items);
   if(conn){setWaba(conn.wabaId??'');setPhoneId(conn.phoneNumberId??'');setDefaultId(conn.defaultTemplateId??'');}
 }
 useEffect(()=>{void load().catch(e=>setError(String(e)));},[canManage]);
 async function act(fn:()=>Promise<unknown>,message:string){
   setBusy(true);setError('');setNotice('');
   try{await fn();await load();setNotice(message);}
   catch(e){setError(e instanceof Error?e.message:'Operação não concluída.');}
   finally{setBusy(false);}
 }
 const approved=templates.filter(t=>t.approved&&Date.now()-new Date(t.verified_at).getTime()<86400000);
 const selected=consents.find(c=>c.client_id===clientId);
 return <div className="space-y-4">
   <header><p className="text-xs text-[#E2BE72]">Fase 5 · Meta Cloud API</p>
     <h2 className="text-2xl font-bold">WhatsApp Business</h2></header>
   <Card className="p-4 space-y-2">
     <p className="text-sm text-[#F5D491]">Envios desligados até homologação. Nenhum lembrete é enviado ao clicar em preparar.</p>
     <p className="text-xs text-[#B8BFCD]">São exigidos consentimento documentado, modelos UTILITY aprovados pela Meta, horários permitidos, limites por destinatário e ativação deliberada do worker.</p>
   </Card>
   {error&&<p role="alert" className="text-sm text-[#F16C79]">{error}</p>}
   {notice&&<p role="status" className="text-sm text-[#33C994]">{notice}</p>}
   {canManage&&<Card className="p-5 space-y-3">
     <h3 className="font-semibold">Conexão oficial Meta</h3>
     <p className="text-sm text-[#B8BFCD]">{connection?.configured?'Conta cadastrada':'Sem conta cadastrada'} · {connection?.enabled?'Conexão habilitada':'Conexão desabilitada'} · Envios {connection?.deliveryEnabled?'sujeitos às políticas do servidor':'desativados no servidor'}</p>
     <div className="flex flex-wrap gap-2">
       <Button size="sm" variant="secondary" onClick={()=>setShowConfig(!showConfig)}>Configurar</Button>
       <Button size="sm" variant="secondary" disabled={!connection?.configured||busy} onClick={()=>void act(
         ()=>productionApi.verifyWhatsAppTemplates(),'Modelos consultados na Meta.')}>Sincronizar templates</Button>
       {!connection?.enabled?<Button size="sm" disabled={!approved.length||busy} onClick={()=>void act(
         ()=>productionApi.enableWhatsApp(),'Conexão habilitada; worker continua desligado.')}>Habilitar conexão</Button>:
       <Button size="sm" variant="danger" disabled={busy} onClick={()=>void act(
         ()=>productionApi.disableWhatsApp(),'Conexão desativada.')}>Desabilitar conexão</Button>}
     </div>
     {showConfig&&<form className="space-y-3" onSubmit={e=>{e.preventDefault();void act(async()=>{
       await productionApi.configureWhatsApp({wabaId:waba,phoneNumberId:phoneId,accessToken:token});
       setToken('');setShowConfig(false);
     },'Token armazenado criptografado. Sincronize os modelos antes de habilitar.');}}>
       <Input label="WhatsApp Business Account ID" required value={waba} onChange={setWaba}/>
       <Input label="Phone Number ID" required value={phoneId} onChange={setPhoneId}/>
       <Input label="Token de acesso Meta" type="password" required value={token} onChange={setToken}/>
       <Button type="submit" disabled={busy}>Salvar configuração</Button>
     </form>}
     <p className="text-xs text-[#B8BFCD]">Modelos UTILITY aprovados com três variáveis: {approved.length}</p>
     {templates.map(t=><p className="text-xs" key={t.id}>{t.name} · {t.language} · {t.approved?'Aprovado':'Indisponível'}</p>)}
     <label className="text-xs block">Modelo padrão para lembretes automáticos (com 3 variáveis)
       <select aria-label="Modelo padrão de cobrança" value={defaultId} onChange={e=>setDefaultId(e.target.value)}
         className="mt-2 block w-full p-3 bg-[#0B0D12] border border-white/20 rounded-lg">
         <option value="">Nenhum</option>
         {approved.map(t=><option value={t.id} key={t.id}>{t.name} · {t.language}</option>)}
       </select></label>
     <Button size="sm" variant="secondary" disabled={!defaultId||busy} onClick={()=>void act(
       ()=>productionApi.selectWhatsAppDefaultTemplate(defaultId),'Modelo padrão definido; agendador continua desligado.'
     )}>Definir modelo padrão</Button>
   </Card>}
   <Card className="p-5 space-y-3">
     <h3 className="font-semibold">Consentimentos documentados</h3>
     <p className="text-xs text-[#B8BFCD]">O campo antigo de cadastro não autoriza mensagens. Guarde prova do aceite do cliente e registre sua referência. A plataforma armazena a declaração, não autentica automaticamente a assinatura.</p>
     {canManage&&<form className="space-y-3" onSubmit={e=>{e.preventDefault();void act(async()=>{
       await productionApi.recordWhatsAppConsent(clientId,{action:'grant',source,evidenceReference:evidence,acknowledged:ack});
       setEvidence('');setAck(false);
     },'Registro versionado de consentimento salvo.');}}>
       <label className="text-sm block">Cliente
         <select aria-label="Cliente para autorização" required value={clientId} onChange={e=>setClientId(e.target.value)}
           className="mt-2 block w-full p-3 bg-[#0B0D12] border border-white/20 rounded-lg">
           <option value="">Selecione</option>
           {consents.filter(c=>c.client_status==='active').map(c=><option key={c.client_id} value={c.client_id}>{c.name}</option>)}
         </select></label>
       <label className="text-sm block">Origem da autorização
         <select aria-label="Origem comprovável" value={source} onChange={e=>setSource(e.target.value as typeof source)}
           className="mt-2 block w-full p-3 bg-[#0B0D12] border border-white/20 rounded-lg">
           <option value="signed_form">Termo assinado</option>
           <option value="web_form">Formulário web com registro</option>
           <option value="documented_request">Pedido documentado do cliente</option>
         </select></label>
       <Input label="Referência da prova (mínimo 12 caracteres)" value={evidence} onChange={setEvidence} required/>
       <label className="text-xs flex gap-2 items-center"><input type="checkbox" checked={ack}
         onChange={e=>setAck(e.target.checked)}/> Confirmo que tenho autorização do destinatário.</label>
       <div className="flex flex-wrap gap-2">
         <Button type="submit" disabled={busy||!clientId||!ack||evidence.trim().length<12}>Registrar aceite</Button>
         {selected?.granted&&<Button variant="danger" type="button" disabled={busy}
           onClick={()=>void act(()=>productionApi.recordWhatsAppConsent(clientId,{action:'revoke',source:'client_request'}),
             'Consentimento revogado; fila pendente bloqueada.')}>Revogar</Button>}
       </div>
     </form>}
     <div className="max-h-56 overflow-y-auto space-y-1">
       {consents.map(c=><div className="flex flex-wrap justify-between text-xs border-b border-white/10 py-2" key={c.client_id}>
         <span>{c.name}</span><span>{c.granted&&c.phone_snapshot===c.phone.replace(/[^0-9]/g,'')?'Aceite vigente':'Sem aceite vigente'} · v{c.version}</span>
       </div>)}
     </div>
   </Card>
   <Card className="p-5 space-y-3">
     <h3 className="font-semibold">Lembretes na fila</h3>
     <p className="text-xs text-[#B8BFCD]">Aceite da API não significa entrega. O webhook assinado atualiza enviado, entregue, lido ou falhou.</p>
     {canManage&&<form className="space-y-3" onSubmit={e=>{e.preventDefault();void act(async()=>{
       await productionApi.queueWhatsAppReminder(chargeId,templateId);setChargeId('');
     },'Lembrete preparado, sem envio imediato.');}}>
       <label className="block text-sm">Cobrança
         <select aria-label="Cobrança para lembrete" value={chargeId} required onChange={e=>setChargeId(e.target.value)}
           className="block mt-2 w-full p-3 bg-[#0B0D12] border border-white/20 rounded-lg">
           <option value="">Selecione</option>
           {charges.filter(c=>['pending','overdue'].includes(c.status)).map(c=><option key={c.id} value={c.id}>
             {c.client_name} · {c.description}</option>)}
         </select></label>
       <label className="block text-sm">Modelo aprovado
         <select aria-label="Modelo aprovado" value={templateId} required onChange={e=>setTemplateId(e.target.value)}
           className="block mt-2 w-full p-3 bg-[#0B0D12] border border-white/20 rounded-lg">
           <option value="">Selecione</option>{approved.map(t=><option key={t.id} value={t.id}>{t.name} · {t.language}</option>)}
         </select></label>
       <Button type="submit" disabled={busy||!connection?.enabled||!templateId||!chargeId}>Preparar lembrete (não enviar)</Button>
     </form>}
     {!jobs.length&&<p className="text-xs text-[#B8BFCD]">Nenhum lembrete preparado.</p>}
     {jobs.map(j=><div key={j.id} className="flex flex-wrap justify-between gap-2 text-xs border-b border-white/10 py-2">
       <span>{j.client_name} · {j.template_name}</span><span className="text-[#E2BE72]">
         {j.state}{j.last_error?' · '+j.last_error:''}</span>
     </div>)}
   </Card>
 </div>;
}
