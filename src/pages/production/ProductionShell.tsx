import React,{useEffect,useState} from 'react';
import {
  CreditCard,Home,LogOut,Menu,Settings,ShieldCheck,Users,UserRoundCheck,
  X,Layers,CalendarClock,MessageCircle
} from 'lucide-react';
import { GoldenLogo } from '../../components/ui/Primitives';
import type { OrganizationChoice,Session } from '../../services/productionApi';

export type ProductionTab='inicio'|'clientes'|'cobrancas'|'recorrencias'|'whatsapp'|'servicos'|'equipe'|'sessoes'|'configuracoes';
type NavItem={id:ProductionTab;label:string;icon:React.ComponentType<{className?:string}>};
const NAV_ITEMS:NavItem[]=[
  {id:'inicio',label:'Início',icon:Home},
  {id:'clientes',label:'Clientes',icon:Users},
  {id:'cobrancas',label:'Cobranças',icon:CreditCard},
  {id:'recorrencias',label:'Recorrências',icon:CalendarClock},
  {id:'whatsapp',label:'WhatsApp Business',icon:MessageCircle},
  {id:'servicos',label:'Serviços',icon:Layers},
  {id:'equipe',label:'Equipe e permissões',icon:UserRoundCheck},
  {id:'sessoes',label:'Sessões e segurança',icon:ShieldCheck},
  {id:'configuracoes',label:'Configurações',icon:Settings},
];
export function ProductionShell({session,organizations,tab,onTabChange,onSwitch,onLogout,children}:{
  session:Session;organizations:OrganizationChoice[];tab:ProductionTab;
  onTabChange:(tab:ProductionTab)=>void;onSwitch:(organizationId:string)=>void;onLogout:()=>void;
  children:React.ReactNode;
}){
  const [menuOpen,setMenuOpen]=useState(false);
  const allowed=NAV_ITEMS.filter(item=>item.id!=='equipe'||session.user.role!=='operator');
  useEffect(()=>{setMenuOpen(false);},[tab,session.organizationId]);
  useEffect(()=>{
    if(!menuOpen)return;
    const handler=(event:KeyboardEvent)=>{if(event.key==='Escape')setMenuOpen(false);};
    document.addEventListener('keydown',handler);
    return ()=>document.removeEventListener('keydown',handler);
  },[menuOpen]);
  function choose(next:ProductionTab){onTabChange(next);setMenuOpen(false);}
  const logo=<GoldenLogo compact/>;
  const organizationName=organizations.find(o=>o.id===session.organizationId)?.name??'Painel profissional';
  const initials=session.user.name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase();
  const quick:NAV_ITEM_QUICK[]=([
    {id:'inicio',label:'Início',icon:Home},
    {id:'clientes',label:'Clientes',icon:Users},
    {id:'cobrancas',label:'Cobranças',icon:CreditCard},
    {id:'servicos',label:'Serviços',icon:Layers},
  ]);
  return <div className="min-h-screen bg-[#0B0D12] text-[#F6F1E8] flex flex-col md:flex-row">
    {/* Identical navigation structure to the demo, but isolated from its data/context. */}
    <aside className="hidden md:flex md:w-64 lg:w-[260px] shrink-0 flex-col border-r border-white/10 bg-[#151922]/65">
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
        {logo}<span className="text-[11px] font-semibold text-[#33C994]">Operacional</span>
      </div>
      <nav aria-label="Menu profissional" className="flex-1 p-3 space-y-1 overflow-y-auto">
        {allowed.map(item=>{
          const Icon=item.icon,active=tab===item.id;
          return <button type="button" key={item.id} aria-current={active?'page':undefined}
            onClick={()=>choose(item.id)}
            className={'w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-left transition-colors cursor-pointer '+
            (active?'bg-[#E2BE72] text-[#0B0D12]':'text-[#B8BFCD] hover:bg-white/5 hover:text-[#F6F1E8]')}>
            <Icon className="w-4 h-4 shrink-0"/><span className="truncate">{item.label}</span>
          </button>;
        })}
      </nav>
      <div className="p-4 border-t border-white/10 space-y-3">
        <p className="text-[11px] text-[#B8BFCD]">Dados protegidos da organização</p>
        <div className="flex gap-2 items-center">
          <ShieldCheck className="w-4 h-4 text-[#33C994] shrink-0"/>
          <p className="text-xs text-[#E2BE72] truncate">{organizationName}</p>
        </div>
        <button type="button" onClick={onLogout}
          className="flex gap-2 items-center text-sm text-[#B8BFCD] hover:text-[#F6F1E8] cursor-pointer">
          <LogOut className="w-4 h-4"/> Sair da conta
        </button>
      </div>
    </aside>
    <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-0">
      <header className="sticky top-0 z-30 h-14 md:h-16 bg-[#0B0D12]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={()=>setMenuOpen(true)} aria-label="Abrir menu completo"
            className="md:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl hover:bg-white/10 cursor-pointer">
            <Menu className="w-5 h-5"/>
          </button>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{organizationName}</p>
            <p className="text-[11px] text-[#9EA7BA] truncate">{session.user.name} · {session.user.role==='operator'?'Operador':'Titular/Admin'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          {organizations.length>1&&<label className="hidden sm:block text-xs text-[#B8BFCD]">
            Organização
            <select aria-label="Trocar organização" className="ml-2 max-w-40 rounded-lg border border-white/20 bg-[#151922] text-[#F6F1E8] text-xs p-2"
              value={session.organizationId} onChange={event=>onSwitch(event.target.value)}>
              {organizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </label>}
          <span className="w-9 h-9 rounded-full bg-[#1F2531] border border-[#A78952]/50 text-[#E2BE72] text-xs font-bold flex items-center justify-center shrink-0"
            aria-label={session.user.name}>{initials}</span>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">{children}</main>
    </div>
    <nav aria-label="Navegação rápida mobile" className="md:hidden fixed bottom-0 left-0 right-0 z-40 min-h-[64px] pb-[env(safe-area-inset-bottom)] bg-[#151922]/95 backdrop-blur-md border-t border-white/10 grid grid-cols-5 items-center">
      {quick.map(item=>{
        const Icon=item.icon;
        return <button key={item.id} type="button" onClick={()=>choose(item.id)}
          aria-current={tab===item.id?'page':undefined}
          className={'min-h-[56px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium cursor-pointer '+(tab===item.id?'text-[#E2BE72]':'text-[#9EA7BA]')}>
          <Icon className="w-[18px] h-[18px]"/>{item.label}
        </button>;
      })}
      <button type="button" onClick={()=>setMenuOpen(true)} aria-label="Mais opções do painel"
        className="min-h-[56px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-[#9EA7BA] cursor-pointer">
        <Menu className="w-[18px] h-[18px]"/>Mais
      </button>
    </nav>
    {menuOpen&&<div className="md:hidden fixed inset-0 z-50 flex bg-black/70 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-label="Menu completo" className="w-72 max-w-[85vw] bg-[#151922] h-full flex flex-col border-r border-white/10">
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
          {logo}
          <button type="button" className="p-2 cursor-pointer text-[#9EA7BA]" aria-label="Fechar menu" onClick={()=>setMenuOpen(false)}>
            <X className="w-5 h-5"/>
          </button>
        </div>
        <nav aria-label="Menu profissional mobile" className="flex-1 p-3 space-y-1 overflow-y-auto">
          {allowed.map(item=>{
            const Icon=item.icon,active=item.id===tab;
            return <button type="button" key={item.id} onClick={()=>choose(item.id)}
              className={'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-left font-medium cursor-pointer '+
              (active?'bg-[#E2BE72] text-[#0B0D12]':'text-[#B8BFCD] hover:bg-white/5')}>
              <Icon className="w-4 h-4"/>{item.label}
            </button>;
          })}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-3">
          {organizations.length>1&&<label className="text-xs text-[#B8BFCD] block">
            Trocar organização
            <select aria-label="Trocar organização mobile" className="block w-full rounded-lg mt-2 p-3 bg-[#0B0D12] border border-white/20"
              value={session.organizationId} onChange={event=>{onSwitch(event.target.value);setMenuOpen(false);}}>
              {organizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </label>}
          <button type="button" onClick={()=>{setMenuOpen(false);onLogout();}}
            className="flex items-center gap-2 p-2 text-sm text-[#B8BFCD] cursor-pointer">
            <LogOut className="w-4 h-4"/> Sair
          </button>
        </div>
      </div>
      <button className="flex-1 cursor-pointer" type="button" aria-label="Fechar menu" onClick={()=>setMenuOpen(false)}/>
    </div>}
  </div>;
}
type NAV_ITEM_QUICK={id:'inicio'|'clientes'|'cobrancas'|'servicos';label:string;icon:React.ComponentType<{className?:string}>};
