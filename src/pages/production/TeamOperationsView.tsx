import React,{useEffect,useState} from 'react';
import { Button,Card,Input } from '../../components/ui/Primitives';
import { productionApi,type Session,type TeamInfo } from '../../services/productionApi';

function inviteStatus(inv:{accepted_at:string|null;revoked_at:string|null;expires_at:string}):string{
  if(inv.accepted_at)return 'Aceito';
  if(inv.revoked_at)return 'Revogado';
  if(new Date(inv.expires_at).getTime()<=Date.now())return 'Expirado';
  return 'Pendente';
}
export function TeamOperationsView({session}:{session:Session}){
  const [data,setData]=useState<TeamInfo|null>(null);
  const [inviteEmail,setInviteEmail]=useState('');
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [busy,setBusy]=useState(false);
  const isOwner=session.user.role==='owner'||session.user.role==='super_admin';
  async function refresh(){
    const team=await productionApi.team();
    setData(team);
  }
  useEffect(()=>{
    if(isOwner)void refresh().catch(e=>setError(e instanceof Error?e.message:'Falha ao carregar equipe.'));
  },[isOwner,session.organizationId]);
  async function perform(action:()=>Promise<unknown>,success:string){
    setBusy(true);setError('');setNotice('');
    try{await action();await refresh();setNotice(success);}
    catch(e){setError(e instanceof Error?e.message:'Não foi possível concluir a operação.');}
    finally{setBusy(false);}
  }
  if(!isOwner)return <Card className="p-6">
    <h2 className="font-semibold text-xl">Equipe</h2>
    <p className="text-sm text-[#B8BFCD] mt-2">Somente o titular da organização administra convites e permissões.</p>
  </Card>;
  return <div className="space-y-5">
    <div>
      <p className="text-xs text-[#E2BE72]">Gestão de acesso · Isolamento por organização</p>
      <h2 className="text-2xl font-bold">Equipe e permissões</h2>
      <p className="text-sm text-[#B8BFCD] mt-1">Operadores podem trabalhar nos cadastros, mas não gerenciar convites, alterar a organização ou se promover.</p>
    </div>
    {error&&<p role="alert" className="text-sm text-[#F16C79]">{error}</p>}
    {notice&&<p role="status" className="text-sm text-[#33C994]">{notice}</p>}
    <Card className="p-5 space-y-4">
      <h3 className="font-semibold text-lg">Convidar operador</h3>
      <p className="text-sm text-[#B8BFCD]">O convite é enviado ao e-mail informado, é individual e expira em 48 horas. Para convidar novos membros, configure antes o e-mail transacional no ambiente do servidor.</p>
      <form className="flex flex-col sm:flex-row gap-3 sm:items-end" onSubmit={e=>{e.preventDefault();void perform(async()=>{
        await productionApi.inviteOperator(inviteEmail.trim());setInviteEmail('');
      },'Convite enviado.');}}>
        <div className="flex-1"><Input type="email" label="E-mail do colaborador" required value={inviteEmail}
          onChange={e=>setInviteEmail(e.target.value)} placeholder="profissional@exemplo.com"/></div>
        <Button type="submit" disabled={busy}>Enviar convite</Button>
      </form>
    </Card>
    <Card className="p-5 space-y-4">
      <h3 className="font-semibold text-lg">Membros ativos</h3>
      {!data&&<p className="text-sm text-[#B8BFCD]">Consultando equipe...</p>}
      {data?.members.map(member=><div key={member.id}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-white/10 last:border-0">
        <div><p className="font-semibold">{member.name}</p>
          <p className="text-xs text-[#B8BFCD]">{member.email} · {member.role==='owner'?'Titular':member.role==='super_admin'?'Superadministrador':'Operador'}</p>
        </div>
        {member.role==='operator'&&<Button variant="danger" size="sm" disabled={busy} onClick={()=>{
          if(window.confirm('Revogar o acesso deste operador imediatamente?'))
            void perform(()=>productionApi.removeOperator(member.id),'Operador removido. As sessões desta organização foram revogadas.');
        }}>Revogar acesso</Button>}
      </div>)}
    </Card>
    <Card className="p-5 space-y-4">
      <h3 className="font-semibold text-lg">Histórico de convites</h3>
      {data?.invitations.length===0&&<p className="text-sm text-[#B8BFCD]">Nenhum convite emitido.</p>}
      {data?.invitations.map(inv=><div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-white/10 last:border-0">
        <div><p className="text-sm">{inv.email}</p>
          <p className="text-xs text-[#B8BFCD]">{inviteStatus(inv)} · Enviado {new Date(inv.created_at).toLocaleString('pt-BR')}</p>
        </div>
        {inviteStatus(inv)==='Pendente'&&<Button size="sm" variant="secondary" disabled={busy} onClick={()=>
          void perform(()=>productionApi.revokeInvite(inv.id),'Convite revogado. O link não poderá mais ser aceito.')
        }>Revogar convite</Button>}
      </div>)}
    </Card>
  </div>;
}
