import React,{useEffect,useState} from 'react';
import { Button,Card,GoldenLogo,Input } from '../../components/ui/Primitives';
import { ApiFailure,productionApi,type Session,type InvitePreview,type OrganizationChoice } from '../../services/productionApi';

export function TeamInvitationPage({token,session,onJoined,onLogout,onClose}:{
 token:string;session:Session|null;onJoined:(session:Session)=>void;onLogout:()=>void;onClose:()=>void;
}){
 const [info,setInfo]=useState<InvitePreview|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false);
 const [mode,setMode]=useState<'register'|'login'>('register');
 const [name,setName]=useState('');
 const [password,setPassword]=useState('');
 const [totp,setTotp]=useState('');
 const [orgChoice,setOrgChoice]=useState('');
 const [orgChoices,setOrgChoices]=useState<OrganizationChoice[]>([]);
 useEffect(()=>{
   setInfo(null);setError('');setLoading(true);
   void productionApi.previewInvite(token)
     .then(setInfo).catch(e=>setError(e instanceof Error?e.message:'Convite inválido.'))
     .finally(()=>setLoading(false));
 },[token]);
 async function perform(fn:()=>Promise<void>){
   setError('');setNotice('');setBusy(true);
   try{await fn();}catch(e){
     if(e instanceof ApiFailure&&e.code==='organization_selection_required'){
       setOrgChoices(e.organizations);
       setNotice('Selecione a organização usada para autenticação antes de aceitar o convite.');
     }else if(e instanceof ApiFailure&&e.code==='existing_account_login_required'){
       setMode('login');setError('Este e-mail já possui conta. Entre com a senha existente para aceitar o convite.');
     }else{
       setError(e instanceof Error?e.message:'Não foi possível aceitar o convite.');
     }
   }finally{setBusy(false);}
 }
 async function joined(organizationId:string){
   const current=await productionApi.switchOrganization(organizationId);
   onJoined(current);
   onClose();
 }
 async function acceptExisting(){
   if(!info)throw new Error('Convite indisponível.');
   if(!session){
     const current=await productionApi.login(info.email,password,totp||undefined,orgChoice||undefined);
     if(!current)throw new Error('Não foi possível autenticar.');
   }else if(session.user.email.toLowerCase()!==info.email.toLowerCase()){
     throw new Error('A conta atual não é a convidada. Saia para autenticar com o e-mail do convite.');
   }
   const accepted=await productionApi.acceptInvite(token);
   await joined(accepted.organizationId);
 }
 async function registerInvited(){
   const result=await productionApi.activateInvite(token,name,password);
   const current=await productionApi.login(result.email,password,undefined,result.organizationId);
   if(!current)throw new Error('Conta criada, mas não foi possível autenticar. Faça login.');
   onJoined(current);onClose();
 }
 return <div className="min-h-screen bg-[#0B0D12] text-[#F6F1E8] p-4 sm:p-8">
   <header className="max-w-2xl mx-auto pb-6"><GoldenLogo compact/></header>
   <main className="max-w-2xl mx-auto">
     <Card className="p-6 sm:p-8 space-y-5">
       <p className="text-xs tracking-wide text-[#E2BE72] uppercase">Convite individual · CobraFlux</p>
       <h1 className="text-2xl font-semibold">Participar da equipe</h1>
       {loading&&<p>Verificando convite...</p>}
       {info&&<>
         <div className="space-y-2 border border-white/10 rounded-xl p-4">
           <p><strong>Organização:</strong> {info.organizationName}</p>
           <p className="text-sm text-[#B8BFCD]">E-mail convidado: {info.email}</p>
           <p className="text-xs text-[#B8BFCD]">Expira em: {new Date(info.expiresAt).toLocaleString('pt-BR')}</p>
           <p className="text-sm text-[#F5D491]">Acesso como operador. Não concede privilégios administrativos.</p>
         </div>
         {!session&&<div className="flex flex-wrap gap-2">
           <Button variant={mode==='register'?'primary':'secondary'} size="sm" onClick={()=>setMode('register')}>Criar acesso</Button>
           <Button variant={mode==='login'?'primary':'secondary'} size="sm" onClick={()=>setMode('login')}>Já tenho conta</Button>
         </div>}
         {(!session||session.user.email.toLowerCase()===info.email.toLowerCase())&&<form className="space-y-4" onSubmit={e=>{
           e.preventDefault();void perform(async()=>{if(session||mode==='login')await acceptExisting();else await registerInvited();});
         }}>
           {!session&&mode==='register'&&<Input label="Nome completo" required minLength={2} value={name} onChange={e=>setName(e.target.value)}/>}
           {!session&&<Input label={mode==='register'?'Defina sua senha (12+ caracteres)':'Sua senha'} type="password"
             required minLength={mode==='register'?12:8} value={password} onChange={e=>setPassword(e.target.value)}/>}
           {!session&&mode==='login'&&<>
             <label className="text-sm">Código MFA (somente se sua conta exigir)
               <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={totp} onChange={e=>setTotp(e.target.value)}
                 className="block w-full mt-2 p-3 rounded-lg bg-[#0B0D12] border border-white/20"/>
             </label>
             {orgChoices.length>0&&<label className="text-sm">Organização da sua conta
               <select required className="block w-full mt-2 p-3 rounded-lg bg-[#0B0D12] border border-white/20"
                 value={orgChoice} onChange={e=>setOrgChoice(e.target.value)}>
                 <option value="">Selecione</option>
                 {orgChoices.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
               </select>
             </label>}
           </>}
           <Button type="submit" disabled={busy}>{busy?'Validando...':session?'Aceitar convite':mode==='login'?'Entrar e aceitar':'Criar conta e aceitar'}</Button>
         </form>}
         {session&&session.user.email.toLowerCase()!==info.email.toLowerCase()&&<div className="space-y-3">
           <p className="text-sm text-[#F5D491]">Você está conectado como {session.user.email}. Para aceitar, use a conta de {info.email}.</p>
           <Button variant="secondary" onClick={()=>void perform(async()=>{await productionApi.logout();onLogout();})}>Sair e usar outra conta</Button>
         </div>}
       </>}
       {error&&<p role="alert" className="text-sm text-[#F16C79]">{error}</p>}
       {notice&&<p role="status" className="text-sm text-[#33C994]">{notice}</p>}
       <Button variant="ghost" onClick={onClose}>Voltar ao CobraFlux</Button>
     </Card>
   </main>
 </div>;
}
