import React,{useEffect,useState} from 'react';
import {Button,Card,Input} from '../../components/ui/Primitives';
import {productionApi,type Session} from '../../services/productionApi';

type Connection={configured:boolean;provider:string;sandboxOnly:true;webhookPath:string|null};
function makeToken(){
 const bytes=new Uint8Array(48);
 crypto.getRandomValues(bytes);
 return Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('');
}
export function SandboxConnectionView({session}:{session:Session}){
 const [connection,setConnection]=useState<Connection|null>(null);
 const [apiKey,setApiKey]=useState('');
 const [webhookToken,setWebhookToken]=useState('');
 const [newToken,setNewToken]=useState('');
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false);
 const owner=session.user.role==='owner'||session.user.role==='super_admin';
 useEffect(()=>{
  void productionApi.sandboxConnection().then(setConnection)
    .catch(e=>setError(e instanceof Error?e.message:'Integração indisponível.'));
 },[session.organizationId]);
 async function configure(){
  setBusy(true);setError('');setNotice('');
  try{
   const result=await productionApi.connectAsaasSandbox(apiKey,webhookToken);
   setConnection({configured:true,provider:'asaas_sandbox',sandboxOnly:true,webhookPath:result.webhookPath});
   setApiKey('');setNewToken(webhookToken);setWebhookToken('');
   setNotice('Conta de sandbox registrada. Configure o webhook na conta correspondente do Asaas e teste a entrega.');
  }catch(e){setError(e instanceof Error?e.message:'Falha ao configurar sandbox.');}
  finally{setBusy(false);}
 }
 return <Card className="p-5 space-y-4">
  <div className="space-y-1">
   <p className="text-xs text-[#E2BE72] tracking-wide uppercase">Integração de pagamentos — Fase 3</p>
   <h3 className="text-lg font-semibold">Asaas Pix · SANDBOX</h3>
   <p className="text-sm text-[#F5D491]">Somente ambiente de testes, sem movimentação financeira real. A habilitação de produção NÃO existe nesta etapa.</p>
  </div>
  <p className="text-sm text-[#B8BFCD]">
   {connection?.configured?'Conta de sandbox conectada para esta organização.':'Nenhuma conta Asaas Sandbox vinculada a esta organização.'}
  </p>
  {connection?.configured&&connection.webhookPath&&<div className="space-y-2">
   <p className="text-xs text-[#B8BFCD]">URL do webhook para cadastrar no painel de sandbox do Asaas:</p>
   <code className="block rounded-lg p-3 bg-[#0B0D12] text-xs text-[#E2BE72] break-all" data-testid="sandbox-webhook-url">
    {window.location.origin+connection.webhookPath}
   </code>
   <Button size="sm" variant="secondary" onClick={()=>void navigator.clipboard.writeText(window.location.origin+connection.webhookPath!)}>
    Copiar URL
   </Button>
   <p className="text-xs text-[#B8BFCD]">O endereço deve estar disponível via HTTPS público para o Asaas entregar webhooks. Em ambiente local, será necessário túnel seguro durante a homologação.</p>
  </div>}
  {newToken&&<div className="border border-[#E2BE72]/40 rounded-xl p-3 space-y-2">
   <p className="text-sm text-[#F5D491]">Copie agora este token para o campo authToken do webhook no Asaas. Ele não poderá ser recuperado depois.</p>
   <code className="block break-all text-xs">{newToken}</code>
   <Button size="sm" variant="secondary" onClick={()=>void navigator.clipboard.writeText(newToken)}>Copiar token</Button>
   <Button size="sm" variant="ghost" onClick={()=>setNewToken('')}>Ocultar</Button>
  </div>}
  {owner&&!connection?.configured&&<form className="space-y-3" onSubmit={e=>{e.preventDefault();void configure();}}>
    <Input label="Chave de API da conta Asaas Sandbox" type="password" required minLength={30}
      value={apiKey} autoComplete="off" onChange={e=>setApiKey(e.target.value)}/>
    <Input label="Token exclusivo do webhook (não use a chave de API)" type="password" required minLength={32}
      value={webhookToken} autoComplete="off" onChange={e=>setWebhookToken(e.target.value)}/>
    <Button type="button" variant="secondary" onClick={()=>setWebhookToken(makeToken())}>Gerar token seguro</Button>
    <p className="text-xs text-[#B8BFCD]">A chave fica criptografada no PostgreSQL e é utilizada apenas no servidor para chamadas ao Asaas Sandbox. O token é guardado como hash e deve ser configurado no webhook Asaas. Sem chave-mestra do servidor, a integração permanece indisponível.</p>
    <Button type="submit" disabled={busy}>Vincular sandbox</Button>
  </form>}
  {!owner&&<p className="text-sm text-[#B8BFCD]">Apenas o titular pode configurar credenciais de pagamento.</p>}
  {error&&<p role="alert" className="text-xs text-[#F16C79]">{error}</p>}
  {notice&&<p role="status" className="text-xs text-[#33C994]">{notice}</p>}
 </Card>;
}
