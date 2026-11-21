import React,{useEffect,useState} from 'react';
import {Button,Card,Input} from '../../components/ui/Primitives';
import {productionApi,type Session,type Profile,type SupportTicket,type Phase7SupportReply} from '../../services/productionApi';
import {SandboxConnectionView} from './SandboxConnectionView';

export function AccountOperationsView({session,onSessionChange}:{session:Session;onSessionChange:(s:Session)=>void}){
 const [profile,setProfile]=useState<Profile|null>(null);
 const [tickets,setTickets]=useState<SupportTicket[]>([]);
 const [selectedTicketId,setSelectedTicketId]=useState('');
 const [ticketReplies,setTicketReplies]=useState<Phase7SupportReply[]>([]);
 const [name,setName]=useState(session.user.name);
 const [business,setBusiness]=useState('');
 const [category,setCategory]=useState('');
 const [contactPhone,setContactPhone]=useState('');
 const [contactEmail,setContactEmail]=useState('');
 const [currentPassword,setCurrentPassword]=useState('');
 const [newPassword,setNewPassword]=useState('');
 const [subject,setSubject]=useState('');
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');
 const [busy,setBusy]=useState(false);
 async function load(){
   const [p,t]=await Promise.all([productionApi.profile(),productionApi.supportTickets()]);
   setProfile(p);setTickets(t.items);setName(p.user.name);setBusiness(p.organization.name);setCategory(p.organization.category);
   setContactPhone(p.organization.contact_phone);setContactEmail(p.organization.contact_email);
 }
 useEffect(()=>{void load().catch(e=>setError(e instanceof Error?e.message:'Falha ao carregar conta.'));},[]);
 async function run(fn:()=>Promise<void>,text:string){
  setError('');setSuccess('');setBusy(true);
  try{await fn();setSuccess(text);}catch(e){setError(e instanceof Error?e.message:'Não foi possível concluir.');}
  finally{setBusy(false);}
 }
 useEffect(()=>{
  if(!selectedTicketId){setTicketReplies([]);return;}
  let current=true;
  setTicketReplies([]);
  void productionApi.supportTicketReplies(selectedTicketId).then(r=>{
   if(current)setTicketReplies(r.items);
  }).catch(e=>{if(current)setError(e instanceof Error?e.message:'Falha ao consultar respostas.');});
  return ()=>{current=false;};
 },[selectedTicketId]);
 if(!profile)return <Card className="p-6">Carregando configurações...</Card>;
 return <div className="space-y-5">
   <div><p className="text-xs text-[#E2BE72]">Conta e organização</p><h2 className="text-2xl font-bold">Configurações e suporte</h2></div>
   {error&&<p role="alert" className="text-[#F16C79] text-sm">{error}</p>}
   {success&&<p role="status" className="text-[#33C994] text-sm">{success}</p>}
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
     <Card className="p-5 space-y-3">
       <h3 className="text-lg font-semibold">Perfil profissional</h3>
       <p className="text-xs text-[#B8BFCD]">E-mail de acesso: {profile.user.email} · Perfil: {profile.user.role}</p>
       <form className="space-y-3" onSubmit={e=>{e.preventDefault();void run(async()=>{
         await productionApi.updateProfile(name);
         const updated=await productionApi.me();if(updated)onSessionChange(updated);
       },'Seu perfil foi atualizado.');}}>
         <Input label="Nome completo" required value={name} onChange={e=>setName(e.target.value)}/>
         <Button type="submit" disabled={busy}>Salvar perfil</Button>
       </form>
     </Card>
     <Card className="p-5 space-y-3">
       <h3 className="text-lg font-semibold">Dados do negócio</h3>
       <p className="text-xs text-[#B8BFCD]">Somente o titular pode alterar os dados da organização.</p>
       <form className="space-y-3" onSubmit={e=>{e.preventDefault();void run(async()=>{
         await productionApi.updateOrganization({name:business,category,contactPhone,contactEmail});
         await load();
       },'Dados da organização atualizados.');}}>
         <Input label="Nome do negócio" required value={business} onChange={e=>setBusiness(e.target.value)} disabled={session.user.role==='operator'}/>
         <Input label="Categoria de atuação" value={category} onChange={e=>setCategory(e.target.value)} disabled={session.user.role==='operator'}/>
         <Input label="Telefone comercial" value={contactPhone} onChange={e=>setContactPhone(e.target.value)} disabled={session.user.role==='operator'}/>
         <Input label="E-mail comercial" type="email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} disabled={session.user.role==='operator'}/>
         <Button type="submit" disabled={busy||session.user.role==='operator'}>Salvar negócio</Button>
       </form>
     </Card>
     <Card className="p-5 space-y-3">
       <h3 className="text-lg font-semibold">Alterar senha</h3>
       <p className="text-xs text-[#B8BFCD]">Após alterar, as outras sessões serão revogadas. Este dispositivo continua autenticado.</p>
       <form className="space-y-3" onSubmit={e=>{e.preventDefault();void run(async()=>{
         await productionApi.changePassword(currentPassword,newPassword);
         setCurrentPassword('');setNewPassword('');
       },'Senha alterada e demais sessões revogadas.');}}>
         <Input label="Senha atual" type="password" required value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)}/>
         <Input label="Nova senha (12+ caracteres)" type="password" required minLength={12} value={newPassword} onChange={e=>setNewPassword(e.target.value)}/>
         <Button type="submit" disabled={busy}>Alterar senha</Button>
       </form>
     </Card>
     <Card className="p-5 space-y-3">
       <h3 className="text-lg font-semibold">Atendimento</h3>
       <p className="text-xs text-[#B8BFCD]">Chamados da sua organização. Respostas da administração aparecem somente neste painel autenticado; não são enviadas por e-mail.</p>
       <form className="space-y-3" onSubmit={e=>{e.preventDefault();void run(async()=>{
         await productionApi.createSupportTicket(subject,message);
         setSubject('');setMessage('');await load();
       },'Chamado registrado.');}}>
         <Input label="Assunto" minLength={3} maxLength={200} required value={subject} onChange={e=>setSubject(e.target.value)}/>
         <label className="text-sm">Descrição
           <textarea minLength={10} required maxLength={4000} className="block rounded-lg w-full p-3 mt-2 bg-[#0B0D12] border border-white/20" rows={3}
             value={message} onChange={e=>setMessage(e.target.value)}/>
         </label>
         <Button type="submit" disabled={busy}>Abrir chamado</Button>
       </form>
       <div className="border-t border-white/10 pt-3 space-y-2">
         {tickets.length===0?<p className="text-sm text-[#B8BFCD]">Nenhum chamado anterior.</p>:tickets.slice(0,15).map(t=>
           <div key={t.id} className="border-b border-white/10 pb-2 space-y-2">
            <button type="button" aria-expanded={selectedTicketId===t.id}
             className="w-full text-left text-xs text-[#B8BFCD] hover:text-white"
             onClick={()=>setSelectedTicketId(current=>current===t.id?'':t.id)}>
             {t.subject} · {t.status} · {new Date(t.created_at).toLocaleDateString('pt-BR')}
             <span className="block mt-1 text-[#E2BE72]">Ver respostas no painel</span>
            </button>
            {selectedTicketId===t.id&&<div className="space-y-2">
             {ticketReplies.length===0
              ?<p className="text-xs text-[#B8BFCD]">Ainda não há respostas da administração.</p>
              :ticketReplies.map(r=><div key={r.id} className="p-3 rounded-lg border border-white/10">
               <p className="text-xs text-[#B8BFCD]">{r.author_name} · {new Date(r.created_at).toLocaleString('pt-BR')}</p>
               <p className="text-sm whitespace-pre-wrap break-words">{r.message}</p>
              </div>)}
            </div>}
           </div>)}
       </div>
     </Card>
   </div>
   <SandboxConnectionView session={session}/>
 </div>;
}
