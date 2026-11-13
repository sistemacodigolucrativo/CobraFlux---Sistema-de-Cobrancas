import React, { useState } from 'react';
import {
  BarChart3,
  Bell,
  CreditCard,
  Crown,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  QrCode,
  Repeat,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { GoldenLogo, PWAInstallButton } from '../../components/ui/Primitives';
import { useApp, type ProfessionalTab } from '../../context/AppContext';
import { resolveAvatarUrl } from '../../utils/media';
import { NotificationsView, SettingsView, SubscriptionView } from './AccountSections';
import { ChargesView } from './ChargesView';
import { ClientsView } from './ClientsView';
import { DashboardView } from './DashboardView';
import { MessagesView } from './MessagesView';
import { PaymentsView } from './PaymentsView';
import { RecurrencesView } from './RecurrencesView';
import { ReportsView } from './ReportsView';

const NAV_ITEMS: Array<{ id: ProfessionalTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'cobrancas', label: 'Cobranças', icon: CreditCard },
  { id: 'recorrencias', label: 'Recorrências', icon: Repeat },
  { id: 'pagamentos', label: 'Pagamentos', icon: QrCode },
  { id: 'mensagens', label: 'Mensagens e lembretes', icon: MessageSquare },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'assinatura', label: 'Minha assinatura', icon: Crown },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

export const ProfessionalShell: React.FC = () => {
  const {
    snapshot,
    activeUser,
    activeOrg,
    profTab,
    setProfTab,
    setEnvironment,
    switchUser,
    unreadNotificationsCount,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const resolvedAvatar = resolveAvatarUrl(activeUser?.avatarUrl, activeUser?.id);
  React.useEffect(() => {
    setAvatarFailed(false);
  }, [activeUser?.id, resolvedAvatar]);

  const renderTab = () => {
    switch (profTab) {
      case 'inicio':
        return <DashboardView />;
      case 'clientes':
        return <ClientsView />;
      case 'cobrancas':
        return <ChargesView />;
      case 'recorrencias':
        return <RecurrencesView />;
      case 'pagamentos':
        return <PaymentsView />;
      case 'mensagens':
        return <MessagesView />;
      case 'relatorios':
        return <ReportsView />;
      case 'notificacoes':
        return <NotificationsView />;
      case 'assinatura':
        return <SubscriptionView />;
      case 'configuracoes':
        return <SettingsView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F6F1E8] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-[260px] shrink-0 flex-col border-r border-white/8 bg-[#151922]/65">
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/8">
          <button
            type="button"
            onClick={() => setEnvironment('site')}
            className="cursor-pointer"
            aria-label="Ir para o site institucional"
          >
            <GoldenLogo compact />
          </button>
          <span className="text-[11px] font-medium text-[#E2BE72]">Demo</span>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Menu profissional">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = profTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setProfTab(item.id)}
                className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#E2BE72] text-[#0B0D12]'
                    : 'text-[#B8BFCD] hover:text-[#F6F1E8] hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.id === 'notificacoes' && unreadNotificationsCount > 0 && (
                  <span
                    className={`text-[11px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
                      active ? 'bg-[#0B0D12]/20 text-[#0B0D12]' : 'bg-[#E86FAE] text-[#0B0D12]'
                    }`}
                  >
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/8 space-y-2">
          <label className="block text-[11px] text-[#9EA7BA] px-1">Trocar conta demo</label>
          <select
            aria-label="Alternar perfil de demonstração"
            value={activeUser?.id ?? ''}
            onChange={(e) => switchUser(e.target.value)}
            className="w-full rounded-xl bg-[#0B0D12] border border-white/12 px-3 py-2 text-xs text-[#F6F1E8] focus:outline-none focus:border-[#E2BE72]"
          >
            {snapshot?.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === 'admin' ? 'Admin' : 'Prof.'})
              </option>
            ))}
          </select>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => switchUser('usr_admin')}
              className="inline-flex items-center gap-1.5 text-xs text-[#E2BE72] hover:underline cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Geral
            </button>
            <button
              type="button"
              onClick={() => setEnvironment('site')}
              className="inline-flex items-center gap-1.5 text-xs text-[#9EA7BA] hover:text-[#F6F1E8] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Site
            </button>
          </div>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-14 md:h-16 bg-[#0B0D12]/90 backdrop-blur-md border-b border-white/8 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menu completo"
              className="md:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#F6F1E8] hover:bg-white/5 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#F6F1E8] truncate">
                {activeOrg?.businessName ?? 'Painel Profissional'}
              </p>
              <p className="text-[11px] text-[#9EA7BA] truncate hidden sm:block">
                {activeUser?.demoLabel} · Dados isolados por organização
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:block">
              <PWAInstallButton />
            </div>
            <button
              type="button"
              onClick={() => setProfTab('notificacoes')}
              aria-label={`Abrir notificações (${unreadNotificationsCount} não lidas)`}
              className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-[#151922] border border-white/10 text-[#B8BFCD] hover:text-[#F6F1E8] cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E86FAE] text-[#0B0D12] text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            {resolvedAvatar && !avatarFailed ? (
              <img
                src={resolvedAvatar}
                alt={activeUser?.name ?? 'Profissional'}
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
                className="w-9 h-9 rounded-full object-cover border border-[#A78952]/50"
              />
            ) : activeUser ? (
              <span
                aria-label={activeUser.name}
                className="w-9 h-9 rounded-full bg-[#1F2531] border border-[#A78952]/50 text-[#E2BE72] text-xs font-bold flex items-center justify-center shrink-0"
              >
                {activeUser.name
                  .split(' ')
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join('')
                  .toUpperCase()}
              </span>
            ) : null}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">{renderTab()}</main>
      </div>

      {/* Mobile Bottom Tab Bar (Compact <= 60px) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-15 bg-[#151922]/95 backdrop-blur-md border-t border-white/10 grid grid-cols-5 items-center"
        aria-label="Navegação rápida mobile"
      >
        {(
          [
            { id: 'inicio', label: 'Início', icon: Home },
            { id: 'clientes', label: 'Clientes', icon: Users },
            { id: 'cobrancas', label: 'Cobranças', icon: CreditCard },
            { id: 'pagamentos', label: 'Pix', icon: QrCode },
            { id: 'mensagens', label: 'Avisos', icon: MessageSquare },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = profTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setProfTab(item.id)}
              className={`h-full flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium cursor-pointer ${
                active ? 'text-[#E2BE72]' : 'text-[#9EA7BA]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Full Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex">
          <div className="w-72 max-w-[85vw] bg-[#151922] h-full flex flex-col border-r border-white/10">
            <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
              <GoldenLogo compact />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fechar menu"
                className="p-2 text-[#9EA7BA] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = profTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setProfTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${
                      active ? 'bg-[#E2BE72] text-[#0B0D12]' : 'text-[#B8BFCD]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="p-3 border-t border-white/10 space-y-2">
              <select
                aria-label="Alternar conta demo mobile"
                value={activeUser?.id ?? ''}
                onChange={(e) => {
                  switchUser(e.target.value);
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-xl bg-[#0B0D12] border border-white/12 px-3 py-2 text-xs text-[#F6F1E8]"
              >
                {snapshot?.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setEnvironment('site');
                }}
                className="w-full py-2 text-xs text-[#9EA7BA] hover:text-[#F6F1E8] text-left px-1 cursor-pointer"
              >
                Voltar ao site institucional
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
