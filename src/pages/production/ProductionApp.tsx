import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, GoldenLogo, Input } from '../../components/ui/Primitives';
import { productionApi, type Session, type Client, type Service, type Charge, type PublicCharge } from '../../services/productionApi';

const money=(cents:number|string)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(cents)/100);
function centsOf(value:string):number{
  const n=Number(value.replace(/\s/g,'').replace('R$','').replace(/\./g,'').replace(',','.'));
  if(!Number.isFinite(n)||n<=0) throw new Error('Informe um valor maior que zero.');
  return Math.round(n*100);
}
function CardForm({children}: {children:React.ReactNode}){
  return <Card className="p-5 sm:p-7 space-y-4 max-w-2xl">{children}</Card>;
}
function PublicPayment({token}:{token:string}){
  const [charge,setCharge]=useState<PublicCharge|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{
    productionApi.publicCharge(token).then(setCharge).catch((e)=>setError(e.message));
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
          {charge.paymentEnabled&&charge.pixPayload
          ? <><p>Código Pix emitido pelo provedor:</p><textarea readOnly className="w-full bg-[#0B0D12] p-3" value={charge.pixPayload}/>
              <Button onClick={()=>navigator.clipboard.writeText(charge.pixPayload!)}>Copiar Pix</Button></>
          : <p className="text-[#F5D491]">Pagamento online indisponível. Esta cobrança ainda não foi emitida por um provedor financeiro. Nenhum valor será transferido.</p>}
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
  const [mode,setMode]=useState<'login'|'register'|'recover'|'reset'>('login');
  const [tab,setTab]=useState<'inicio'|'clientes'|'servicos'|'cobrancas'>('inicio');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [fullName,setFullName]=useState('');
  const [business,setBusiness]=useState('');
  const [clients,setClients]=useState<Client[]>([]);
  const [services,setServices]=useState<Service[]>([]);
  const [charges,setCharges]=useState<Charge[]>([]);
  const [overview,setOverview]=useState<{total_charges:number;paid_charges:number;total_paid_cents:string}|null>(null);
  const [clientName,setClientName]=useState('');
  const [phone,setPhone]=useState('');
  const [clientEmail,setClientEmail]=useState('');
  const [serviceName,setServiceName]=useState('');
  const [servicePrice,setServicePrice]=useState('150,00');
  const [chargeClient,setChargeClient]=useState('');
  const [chargeDescription,setChargeDescription]=useState('');
  const [chargeAmount,setChargeAmount]=useState('150,00');
  const [chargeDue,setChargeDue]=useState(new Date().toISOString().slice(0,10));
  const token=hash.startsWith('#/pagar/')?hash.split('#/pagar/')[1].split('?')[0]:null;
  useEffect(()=>{
    const fn=()=>setHash(window.location.hash);
    window.addEventListener('hashchange',fn);
    productionApi.me().then(setSession).finally(()=>setBooting(false));
    return ()=>window.removeEventListener('hashchange',fn);
  },[]);
  useEffect(()=>{if(hash.startsWith('#/recuperar?token='))setMode('reset');},[hash]);
  const refresh=useCallback(async()=>{
    const [a,b,c,d]=await Promise.all([
      productionApi.clients(),productionApi.services(),productionApi.charges(),productionApi.overview()
    ]);
    setClients(a.items);setServices(b.items);setCharges(c.items);setOverview(d);
  },[]);
  useEffect(()=>{if(session)refresh().catch((e)=>setError(e.message));},[session,refresh]);
  async function submitAction(fn:()=>Promise<unknown>){
    setBusy(true);setError('');setNotice('');
    try{await fn();}catch(e){setError(e instanceof Error?e.message:'Falha na operação.');}
    finally{setBusy(false);}
  }
  if(token)return <PublicPayment token={token}/>;
  return <div className="min-h-screen bg-[#0B0D12] text-[#F6F1E8]">
    <header className="border-b border-white/10 px-4 py-4 flex justify-between items-center max-w-6xl mx-auto">
      <GoldenLogo compact/>
      {session&&<Button variant="secondary" size="sm" onClick={()=>submitAction(async()=>{await productionApi.logout();setSession(null);})}>Sair</Button>}
    </header>
    <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {error&&<p role="alert" className="p-3 border border-[#F16C79]/50 rounded-xl text-[#F16C79]">{error}</p>}
      {notice&&<p role="status" className="p-3 border border-[#33C994]/50 rounded-xl text-[#33C994]">{notice}</p>}
      {booting?<p>Carregando sessão...</p>:!session?
        <CardForm>
          <p className="text-sm text-[#E2BE72]">Ambiente operacional · dados persistidos no servidor</p>
          <h1 className="text-2xl font-bold">{mode==='login'?'Acessar CobraFlux':mode==='register'?'Criar minha conta':mode==='recover'?'Recuperar senha':'Definir nova senha'}</h1>
          <form className="space-y-4" onSubmit={(e)=>{e.preventDefault();submitAction(async()=>{
            if(mode==='login'){const result=await productionApi.login(email,password);if(!result)throw new Error('Falha na autenticação.');setSession(result);}
            if(mode==='register'){await productionApi.register({name:fullName,businessName:business,email,password});setMode('login');setNotice('Conta criada. Faça login.');}
            if(mode==='recover'){await productionApi.resetRequest(email);setNotice('Se a conta existir e o e-mail estiver configurado, enviaremos instruções.');}
            if(mode==='reset'){const code=new URLSearchParams(hash.split('?')[1]??'').get('token')??'';await productionApi.resetPassword(code,password);window.location.hash='#/entrar';setMode('login');setNotice('Senha atualizada. Faça login.');}
          });}}>
            {mode==='register'&&<><Input label="Seu nome" required value={fullName} onChange={e=>setFullName(e.target.value)}/><Input label="Nome do negócio" required value={business} onChange={e=>setBusiness(e.target.value)}/></>}
            {mode!=='reset'&&<Input label="E-mail" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/>}
            {mode!=='recover'&&<Input label="Senha" type="password" minLength={mode==='login'?8:12} required value={password} onChange={e=>setPassword(e.target.value)}/>}
            <Button type="submit" disabled={busy}>{busy?'Enviando...':mode==='login'?'Entrar':mode==='register'?'Criar conta':mode==='recover'?'Solicitar link':'Redefinir senha'}</Button>
          </form>
          <div className="flex flex-wrap gap-4 text-sm text-[#E2BE72]">
            <button onClick={()=>setMode('login')}>Login</button>
            <button onClick={()=>setMode('register')}>Criar conta</button>
            <button onClick={()=>setMode('recover')}>Esqueci a senha</button>
          </div>
        </CardForm>
        : <>
          <div><p className="text-[#E2BE72] text-sm">Painel operacional</p><h1 className="text-2xl font-bold">Olá, {session.user.name}</h1></div>
          <div className="flex flex-wrap gap-2">
            {(['inicio','clientes','servicos','cobrancas'] as const).map(t=>
              <Button key={t} size="sm" variant={tab===t?'primary':'secondary'} onClick={()=>{setTab(t);setError('');}}>{t==='inicio'?'Início':t==='clientes'?'Clientes':t==='servicos'?'Serviços':'Cobranças'}</Button>
            )}
          </div>
          {tab==='inicio'&&<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5"><p>Cobranças</p><p className="text-3xl font-bold">{overview?.total_charges??0}</p></Card>
            <Card className="p-5"><p>Pagamentos confirmados</p><p className="text-3xl font-bold">{overview?.paid_charges??0}</p></Card>
            <Card className="p-5"><p>Recebimento confirmado</p><p className="text-2xl font-bold">{money(overview?.total_paid_cents??0)}</p></Card>
            <Card className="p-5 sm:col-span-3">
              <p className="font-semibold text-[#F5D491]">Cobranças reais ainda não habilitadas</p>
              <p className="text-sm text-[#B8BFCD] mt-2">Os registros já são salvos no PostgreSQL. A emissão Pix, a conciliação e os recebimentos dependem da integração e homologação de um provedor de pagamentos.</p>
            </Card>
          </div>}
          {tab==='clientes'&&<>
            <CardForm><h2 className="text-xl font-semibold">Cadastrar cliente</h2>
              <form className="space-y-3" onSubmit={e=>{e.preventDefault();submitAction(async()=>{
                await productionApi.createClient({name:clientName,phone,email:clientEmail,whatsappOptIn:false});
                setClientName('');setPhone('');setClientEmail('');await refresh();setNotice('Cliente salvo no servidor.');
              });}}>
                <Input label="Nome" required value={clientName} onChange={e=>setClientName(e.target.value)}/>
                <Input label="Telefone" required value={phone} onChange={e=>setPhone(e.target.value)}/>
                <Input label="E-mail (opcional)" type="email" value={clientEmail} onChange={e=>setClientEmail(e.target.value)}/>
                <Button type="submit" disabled={busy}>Salvar cliente</Button>
              </form>
            </CardForm>
            <div className="grid gap-3">{clients.map(c=><Card key={c.id} className="p-4 flex justify-between items-center gap-3">
              <div><p className="font-semibold">{c.name}</p><p className="text-sm text-[#B8BFCD]">{c.phone} · {c.status==='archived'?'Arquivado':'Ativo'}</p></div>
              <Button size="sm" variant="secondary" onClick={()=>submitAction(async()=>{
                await productionApi.setClientStatus(c.id,c.status==='archived'?'active':'archived');await refresh();
              })}>{c.status==='archived'?'Restaurar':'Arquivar'}</Button>
            </Card>)}</div>
          </>}
          {tab==='servicos'&&<>
            <CardForm><h2 className="text-xl font-semibold">Cadastrar serviço</h2>
              <form className="space-y-3" onSubmit={e=>{e.preventDefault();submitAction(async()=>{
                await productionApi.createService({name:serviceName,description:'',priceCents:centsOf(servicePrice)});
                setServiceName('');await refresh();setNotice('Serviço salvo.');
              });}}>
                <Input label="Nome do serviço" required value={serviceName} onChange={e=>setServiceName(e.target.value)}/>
                <Input label="Preço (R$)" required value={servicePrice} onChange={e=>setServicePrice(e.target.value)}/>
                <Button type="submit" disabled={busy}>Salvar serviço</Button>
              </form>
            </CardForm>
            {services.map(s=><Card key={s.id} className="p-4"><b>{s.name}</b><p>{money(s.price_cents)}</p></Card>)}
          </>}
          {tab==='cobrancas'&&<>
            <CardForm><h2 className="text-xl font-semibold">Criar rascunho de cobrança</h2>
              <p className="text-sm text-[#F5D491]">Rascunhos não geram Pix e não podem ser confirmados pelo navegador.</p>
              <form className="space-y-3" onSubmit={e=>{e.preventDefault();submitAction(async()=>{
                await productionApi.createCharge({clientId:chargeClient,description:chargeDescription,amountCents:centsOf(chargeAmount),dueDate:chargeDue});
                setChargeDescription('');await refresh();setNotice('Rascunho criado no servidor.');
              });}}>
                <label className="block text-sm">Cliente
                  <select required className="block w-full mt-2 bg-[#151922] p-3 rounded-lg border border-white/20" value={chargeClient} onChange={e=>setChargeClient(e.target.value)}>
                    <option value="">Selecione um cliente</option>{clients.filter(c=>c.status==='active').map(c=><option value={c.id} key={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <Input label="Descrição" required value={chargeDescription} onChange={e=>setChargeDescription(e.target.value)}/>
                <Input label="Valor (R$)" required value={chargeAmount} onChange={e=>setChargeAmount(e.target.value)}/>
                <Input label="Vencimento" type="date" required value={chargeDue} onChange={e=>setChargeDue(e.target.value)}/>
                <Button type="submit" disabled={busy}>Salvar rascunho</Button>
              </form>
            </CardForm>
            {charges.map(c=><Card key={c.id} className="p-4 space-y-2">
              <div className="flex gap-4 justify-between"><div><b>{c.client_name}</b><p>{c.description}</p></div><b>{money(Number(c.amount_cents)-Number(c.discount_cents))}</b></div>
              <p className="text-sm text-[#B8BFCD]">Status: {c.status} · Vencimento: {String(c.due_date).slice(0,10)}</p>
              <a href={'/#/pagar/'+c.public_token} target="_blank" rel="noopener noreferrer" className="text-[#E2BE72] underline">Abrir página pública</a>
              {c.status==='draft'&&<div><Button variant="secondary" size="sm" onClick={()=>submitAction(async()=>{await productionApi.cancelCharge(c.id);await refresh();})}>Cancelar rascunho</Button></div>}
            </Card>)}
          </>}
        </>}
    </main>
  </div>;
}
