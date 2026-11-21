import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, GoldenLogo, Input } from '../../components/ui/Primitives';
import { ApiFailure,productionApi, type Session, type PublicCharge, type OrganizationChoice } from '../../services/productionApi';
import { TeamOperationsView } from './TeamOperationsView';
import { TeamInvitationPage } from './TeamInvitationPage';
import { ProductionShell,type ProductionTab } from './ProductionShell';
import { ClientsOperationsView } from './ClientsOperationsView';
import { ChargesOperationsView } from './ChargesOperationsView';
import { RecurrencesOperationsView } from './RecurrencesOperationsView';
import { WhatsAppOperationsView } from './WhatsAppOperationsView';
import { SaasBillingView } from './SaasBillingView';
import { ReportsOperationsView } from './ReportsOperationsView';
import { AdminOperationsView } from './AdminOperationsView';
import { ServicesOperationsView } from './ServicesOperationsView';
import { AccountOperationsView } from './AccountOperationsView';

const money=(cents:number|string)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(cents)/100);
function CardForm({children}: {children:React.ReactNode}){
  return <Card className="p-5 sm:p-7 space-y-4 max-w-2xl">{children}</Card>;
}
function PublicPayment({token}:{token:string}){
  const [charge,setCharge]=useState<PublicCharge|null>(null);
  const [qr,setQr]=useState<{payload:string;encodedImage?:string;sandboxOnly:true}|null>(null);
  const [qrError,setQrError]=useState('');
  const [error,setError]=useState('');
  useEffect(()=>{
    productionApi.publicCharge(token).then(async details=>{
      setCharge(details);
      if(details.paymentEnabled&&details.sandboxOnly){
        try{setQr(await productionApi.sandboxQr(token));}
        catch(e){setQrError(e instanceof Error?e.message:'Não foi possível carregar QR Code Sandbox.');}
      }
    }).catch((e)=>setError(e.message));
  },[token]);
  return <div className="min-h-screen bg-[#0B0D12] text-[#F6F1E8] p-4 sm:p-8">
    <header className="max-w-2xl mx-auto py-3"><GoldenLogo /></header>
    <main className="max-w-2xl mx-auto mt-8">
      <CardForm>
        <h1 className="text-2xl font-bold">Cobrança</h1>
        {error&&<p role="alert" className="text-[#F16C79]">{error}</p>}
        {!charge&&!error&&<p>Consultando cobrança...</p>}
        {charge&&<>
          <p>{charge.merchant}</p><p>{charge.description}</p>
          <p className="text-3xl font-bold text-[#E2BE72]">{money(charge.amountCents)}</p>
          <p>Vencimento: {String(charge.dueDate).slice(0,10)}</p>
          <p>Status: {charge.status}</p>
          {charge.sandboxOnly&&<div className="border border-[#F5D491]/50 p-4 rounded-xl text-[#F5D491] text-sm" role="note">
            <strong>AMBIENTE SANDBOX — TESTES APENAS.</strong> Não tente transferir dinheiro real para este QR Code. Os estados são provenientes do provedor de testes.
          </div>}
          {charge.paymentEnabled&&charge.pixPayload
          ? <div className="space-y-3">
              {qr?.encodedImage&&<img className="w-56 h-56 bg-white rounded-xl p-2 mx-auto" width={224} height={224}
                src={'data:image/png;base64,'+qr.encodedImage} alt="QR Code Pix somente de testes em sandbox"/>}
              <p>Pix Copia e Cola · Somente SANDBOX</p>
              <textarea aria-label="Código Pix sandbox" readOnly className="w-full bg-[#0B0D12] p-3 rounded-lg border border-white/20 text-xs"
                rows={4} value={qr?.payload??charge.pixPayload}/>
              {qrError&&<p className="text-xs text-[#F5D491]">QR atualizado indisponível: {qrError}. O código da cobrança permanece disponível.</p>}
              <Button onClick={()=>void navigator.clipboard.writeText(qr?.payload??charge.pixPayload!)}>Copiar código de teste</Button>
            </div>
          : <p className="text-[#F5D491]">Pagamento online indisponível nesta cobrança. Nenhum valor será transferido.</p>}
        </>}
        <a href="/#" className="text-[#E2BE72] underline">Voltar</a>
      </CardForm>
    </main>
  </div>;
}
export function ProductionApp(){
  const [hash,setHash]=useState(()=>window.location.hash);
  const [session,setSession]=useState<Session|null>(null);
  const [booting,setBooting]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [mode,setMode]=useState<'login'|'register'|'recover'|'reset'|'verify'|'resend'>('login');
  const [tab,setTab]=useState<ProductionTab>('inicio');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [totp,setTotp]=useState('');
  const [adminAccess,setAdminAccess]=useState(false);
  const [loginOrganizations,setLoginOrganizations]=useState<OrganizationChoice[]>([]);
  const [loginOrganizationId,setLoginOrganizationId]=useState('');
  const [myOrganizations,setMyOrganizations]=useState<OrganizationChoice[]>([]);
  const [fullName,setFullName]=useState('');
  const [business,setBusiness]=useState('');
  const [overview,setOverview]=useState<{total_charges:number;paid_charges:number;total_paid_cents:string;sandbox_paid_charges:number;sandbox_paid_cents:string}|null>(null);
  const [activeSessions,setActiveSessions]=useState<Array<{id:string;current:boolean;created_at:string;expires_at:string}>>([]);
  const token=hash.startsWith('#/pagar/')?hash.split('#/pagar/')[1].split('?')[0]:null;
  const inviteToken=hash.startsWith('#/convite/')?hash.split('#/convite/')[1].split('?')[0]:null;
  useEffect(()=>{
    const fn=()=>setHash(window.location.hash);
    window.addEventListener('hashchange',fn);
    productionApi.me().then(setSession).finally(()=>setBooting(false));
    return ()=>window.removeEventListener('hashchange',fn);
  },[]);
  useEffect(()=>{
    if(hash.startsWith('#/recuperar?token='))setMode('reset');
    if(hash.startsWith('#/verificar?token='))setMode('verify');
  },[hash]);
  const refresh=useCallback(async()=>{
    const result=await productionApi.overview();
    setOverview(result);
  },[]);
  useEffect(()=>{if(session)refresh().catch((e)=>setError(e.message));},[session,refresh]);
  useEffect(()=>{
    if(!session){setMyOrganizations([]);return;}
    void productionApi.organizations().then(r=>setMyOrganizations(r.items)).catch(e=>setError(e instanceof Error?e.message:'Não foi possível consultar suas organizações.'));
  },[session?.organizationId,session?.user.id]);
  useEffect(()=>{if(session&&tab==='sessoes')productionApi.sessions().then(v=>setActiveSessions(v.items)).catch(e=>setError(e.message));},[session,tab]);
  async function submitAction(fn:()=>Promise<unknown>){
    setBusy(true);setError('');setNotice('');
    try{await fn();}catch(e){
      const message=e instanceof Error?e.message:'Falha na operação.';
      if(message.includes('MFA')||message==='admin_mfa_required')setAdminAccess(true);
      if(e instanceof ApiFailure&&e.code==='organization_selection_required'){
        setLoginOrganizations(e.organizations);
        setNotice('Selecione uma organização para entrar.');
      }
      if(message==='email_unverified')setMode('resend');
      setError(message);
    }
    finally{setBusy(false);}
  }
  if(token)return <PublicPayment token={token}/>;
  if(inviteToken)return booting?<p>Carregando convite...</p>:
    <TeamInvitationPage token={inviteToken} session={session} onJoined={setSession} onLogout={()=>setSession(null)} onClose={()=>{window.location.hash='#/';}}/>;

  if(!booting && session)return <ProductionShell
    session={session} organizations={myOrganizations} tab={tab}
    onTabChange={next=>{setTab(next);setError('');}}
    onSwitch={id=>void submitAction(async()=>{
      const next=await productionApi.switchOrganization(id);
      setSession(next);setTab('inicio');setNotice('Organização alterada com segurança.');
    })}
    onLogout={()=>void submitAction(async()=>{await productionApi.logout();setSession(null);})}
  >
    {error&&<p role="alert" className="p-3 border border-[#F16C79]/50 rounded-xl text-[#F16C79]">{error}</p>}
    {notice&&<p role="status" className="p-3 border border-[#33C994]/50 rounded-xl text-[#33C994]">{notice}</p>}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div><p className="text-xs text-[#E2BE72]">Painel profissional · Dados isolados por organização</p>
        <h1 className="text-2xl font-display font-bold">Olá, {session.user.name}</h1></div>
      <span className="inline-flex items-center rounded-full border border-[#33C994]/30 bg-[#33C994]/10 px-3 py-1.5 text-xs text-[#33C994]">Ambiente operacional</span>
    </div>
    {tab==='inicio'&&<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5"><p>Cobranças</p><p className="text-3xl font-bold">{overview?.total_charges??0}</p></Card>
            <Card className="p-5"><p>Pagamentos confirmados</p><p className="text-3xl font-bold">{overview?.paid_charges??0}</p></Card>
            <Card className="p-5"><p>Recebimento real confirmado</p><p className="text-2xl font-bold">{money(overview?.total_paid_cents??0)}</p></Card>
            <Card className="p-5 sm:col-span-3 border-[#F5D491]/30">
              <p className="text-xs font-semibold text-[#F5D491]">Simulações exclusivamente no SANDBOX</p>
              <p className="text-xl font-semibold">{overview?.sandbox_paid_charges??0} recebimentos simulados · {money(overview?.sandbox_paid_cents??0)} de testes</p>
              <p className="text-xs text-[#B8BFCD]">Os valores acima nunca compõem o caixa real.</p>
            </Card>
            <Card className="p-5 sm:col-span-3">
              <p className="font-semibold text-[#F5D491]">Cobranças comerciais reais ainda não habilitadas</p>
              <p className="text-sm text-[#B8BFCD] mt-2">Os registros já são salvos no PostgreSQL. A emissão Pix, a conciliação e os recebimentos dependem da integração e homologação de um provedor de pagamentos.</p>
            </Card>
          </div>}
          {tab==='sessoes'&&<Card className="p-5 space-y-4"><h2 className="font-semibold text-xl">Sessões conectadas</h2>
            <p className="text-sm text-[#B8BFCD]">Dispositivos com acesso à sua conta. Revogar todas as sessões desconecta todos os dispositivos, inclusive este.</p>
            {activeSessions.map(s=><p key={s.id} className="text-sm border-b border-white/10 py-2">{s.current?'Este dispositivo':'Outra sessão'} · Criada: {new Date(s.created_at).toLocaleString('pt-BR')}</p>)}
            <Button variant="danger" disabled={busy} onClick={()=>submitAction(async()=>{await productionApi.revokeAllSessions();setSession(null);setNotice('Todas as sessões foram revogadas.');})}>Desconectar todos os dispositivos</Button>
          </Card>}
          {tab==='clientes'&&<ClientsOperationsView key={session.organizationId} onChanged={refresh}/>}
          {tab==='servicos'&&<ServicesOperationsView key={session.organizationId} onChanged={refresh}/>}
          {tab==='cobrancas'&&<ChargesOperationsView key={session.organizationId} onChanged={refresh} canIssue={session.user.role!=='operator'}/>}
          {tab==='recorrencias'&&<RecurrencesOperationsView key={session.organizationId} canManage={session.user.role!=='operator'} onChanged={refresh}/>}
          {tab==='whatsapp'&&<WhatsAppOperationsView key={session.organizationId} canManage={session.user.role!=='operator'}/>}
          {tab==='assinatura'&&<SaasBillingView key={session.organizationId} canManage={session.user.role!=='operator'} isPlatformAdmin={session.user.role==='super_admin'}/>}
          {tab==='relatorios'&&<ReportsOperationsView key={session.organizationId} canManage={session.user.role!=='operator'}/>}
          {tab==='admin'&&session.user.role==='super_admin'&&<AdminOperationsView key={session.organizationId}/>}
          {tab==='equipe'&&<TeamOperationsView key={session.organizationId} session={session}/>}
          {tab==='configuracoes'&&<AccountOperationsView key={session.organizationId} session={session} onSessionChange={setSession}/>}
  </ProductionShell>;
  return <div className="min-h-screen bg-[#0B0D12] text-[#F6F1E8]">
    <header className="border-b border-white/10 px-4 py-4 max-w-6xl mx-auto"><GoldenLogo compact/></header>
    <main className="max-w-xl mx-auto px-4 py-8 sm:py-14 space-y-6">
      {error&&<p role="alert" className="p-3 border border-[#F16C79]/50 rounded-xl text-[#F16C79]">{error}</p>}
      {notice&&<p role="status" className="p-3 border border-[#33C994]/50 rounded-xl text-[#33C994]">{notice}</p>}
      {booting?<p>Carregando sessão...</p>:
      <CardForm>
          <p className="text-sm text-[#E2BE72]">Ambiente operacional · dados persistidos no servidor</p>
          <h1 className="text-2xl font-bold">{mode==='login'?'Acessar CobraFlux':mode==='register'?'Criar minha conta':mode==='recover'?'Recuperar senha':mode==='reset'?'Definir nova senha':mode==='resend'?'Reenviar verificação':'Confirmar e-mail'}</h1>
          <form className="space-y-4" onSubmit={(e)=>{e.preventDefault();submitAction(async()=>{
            if(mode==='login'){const result=await productionApi.login(email,password,adminAccess?totp:undefined,loginOrganizationId||undefined);if(!result)throw new Error('Falha na autenticação.');setSession(result);setLoginOrganizations([]);setLoginOrganizationId('');}
            if(mode==='register'){await productionApi.register({name:fullName,businessName:business,email,password});setMode('login');setNotice('Conta criada. Confirme seu e-mail antes de entrar.');}
            if(mode==='verify'){const code=new URLSearchParams(hash.split('?')[1]??'').get('token')??'';await productionApi.verifyEmail(code);window.location.hash='#/entrar';setMode('login');setNotice('E-mail confirmado. Faça login.');}
            if(mode==='resend'){await productionApi.resendVerification(email);setNotice('Se houver uma conta pendente, enviaremos instruções.');}
            if(mode==='recover'){await productionApi.resetRequest(email);setNotice('Se a conta existir e o e-mail estiver configurado, enviaremos instruções.');}
            if(mode==='reset'){const code=new URLSearchParams(hash.split('?')[1]??'').get('token')??'';await productionApi.resetPassword(code,password);window.location.hash='#/entrar';setMode('login');setNotice('Senha atualizada. Faça login.');}
          });}}>
            {mode==='register'&&<><Input label="Seu nome" required value={fullName} onChange={e=>setFullName(e.target.value)}/><Input label="Nome do negócio" required value={business} onChange={e=>setBusiness(e.target.value)}/></>}
            {mode!=='reset'&&mode!=='verify'&&<Input label="E-mail" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/>}
            {!['recover','resend','verify'].includes(mode)&&<Input label="Senha" type="password" minLength={mode==='login'?8:12} required value={password} onChange={e=>setPassword(e.target.value)}/>} 
            {mode==='login'&&adminAccess&&<Input label="Código MFA do autenticador" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={totp} onChange={e=>setTotp(e.target.value)}/>}
            {mode==='login'&&loginOrganizations.length>0&&<label className="text-sm">
              Organização de acesso
              <select className="block w-full mt-2 bg-[#151922] p-3 rounded-lg border border-white/20" required
                value={loginOrganizationId} onChange={e=>setLoginOrganizationId(e.target.value)}>
                <option value="">Selecione</option>
                {loginOrganizations.map(o=><option key={o.id} value={o.id}>{o.name} ({o.role})</option>)}
              </select>
            </label>}
            <Button type="submit" disabled={busy}>{busy?'Enviando...':mode==='login'?'Entrar':mode==='register'?'Criar conta':mode==='recover'?'Solicitar link':mode==='resend'?'Reenviar link':mode==='verify'?'Confirmar e-mail':'Redefinir senha'}</Button>
          </form>
          <div className="flex flex-wrap gap-4 text-sm text-[#E2BE72]">
            <button onClick={()=>setMode('login')}>Login</button>
            <button onClick={()=>setMode('register')}>Criar conta</button>
            <button onClick={()=>setMode('recover')}>Esqueci a senha</button>
            <button onClick={()=>setMode('resend')}>Verificar e-mail</button>
            <button onClick={()=>setAdminAccess(v=>!v)}>{adminAccess?'Ocultar MFA':'Acesso admin com MFA'}</button>
          </div>
        </CardForm>}
    </main>
  </div>;
}
