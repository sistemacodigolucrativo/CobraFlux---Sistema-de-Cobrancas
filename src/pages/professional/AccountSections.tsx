import React, { useMemo, useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Download,
  RefreshCw,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  Input,
  PWAInstallButton,
} from '../../components/ui/Primitives';
import { useApp, type ProfessionalTab } from '../../context/AppContext';
import { formatBRL } from '../../domain/money';
import { formatDateBR } from '../../domain/recurrence';
import { demoBillingService } from '../../services/demoService';
import type { NotificationCategory, PlanTier } from '../../types/domain';
import { getSubscriptionStatusLabel } from '../../utils/labels';

export const NotificationsView: React.FC = () => {
  const {
    snapshot,
    activeOrg,
    setProfTab,
    refreshSnapshot,
    pushToast,
    playSound,
    notifyBrowser,
  } = useApp();
  const [catFilter, setCatFilter] = useState<'todas' | NotificationCategory>('todas');
  const [browserPerm, setBrowserPerm] = useState<string>(() =>
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const items = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.notifications
      .filter((n) => n.organizationId === activeOrg.id)
      .filter((n) => (catFilter === 'todas' ? true : n.category === catFilter));
  }, [snapshot, activeOrg, catFilter]);

  const handleRequestBrowserPush = async () => {
    if (!activeOrg) return;
    if (typeof window === 'undefined' || !('Notification' in window)) {
      pushToast({ type: 'warning', title: 'Navegador sem suporte a notificações locais' });
      return;
    }
    const perm = await Notification.requestPermission();
    setBrowserPerm(perm);
    await demoBillingService.savePushPermission(activeOrg.id, perm, perm === 'granted');
    await refreshSnapshot();
    if (perm === 'granted') {
      playSound('notification');
      notifyBrowser('CobraFlux', 'Notificações locais demonstrativas ativadas com sucesso.');
      pushToast({ type: 'success', title: 'Notificações do navegador ativadas' });
    } else {
      pushToast({ type: 'info', title: `Permissão atual: ${perm}` });
    }
  };

  if (!activeOrg) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#E2BE72]">Alertas internos e notificações locais do navegador</p>
          <h1 className="text-2xl font-display font-bold text-[#F6F1E8] mt-0.5">Notificações</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              await demoBillingService.markAllNotificationsRead(activeOrg.id);
              await refreshSnapshot();
              playSound('tap');
            }}
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      {/* Browser Native Permission Banner */}
      <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 golden-sheen">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#F6F1E8]">
            Notificações locais do navegador ({browserPerm === 'granted' ? 'Ativas' : 'Opcional'})
          </p>
          <p className="text-xs text-[#B8BFCD]">
            Receba avisos imediatos quando eventos demonstrativos acontecerem com a aba aberta. Notificações
            remotas com o app fechado exigirão backend push em produção.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {browserPerm === 'granted' ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                notifyBrowser('CobraFlux (Demo)', 'Teste de notificação local disparado!');
                playSound('notification');
              }}
            >
              <Bell className="w-4 h-4 text-[#E2BE72]" />
              Testar alerta agora
            </Button>
          ) : (
            <Button size="sm" onClick={handleRequestBrowserPush}>
              <Bell className="w-4 h-4" />
              Ativar notificações
            </Button>
          )}
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[#151922] border border-white/8 w-fit overflow-x-auto">
        {(['todas', 'pagamento', 'cobranca', 'assinatura', 'mensagem', 'sistema'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCatFilter(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize cursor-pointer ${
              catFilter === cat ? 'bg-[#E2BE72] text-[#0B0D12]' : 'text-[#B8BFCD] hover:text-[#F6F1E8]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Nenhuma notificação nesta categoria"
          description="Os avisos de pagamentos, vencimentos e assinatura aparecerão aqui."
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => (
            <Card
              key={n.id}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                !n.read ? 'border-[#E2BE72]/40' : ''
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="uppercase font-medium text-[#E2BE72]">{n.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#9EA7BA]">{n.createdAt.slice(0, 16).replace('T', ' ')}</span>
                  {!n.read && <span className="text-[#E86FAE] font-semibold">· Nova</span>}
                </div>
                <p className="text-sm font-semibold text-[#F6F1E8]">{n.title}</p>
                <p className="text-xs text-[#B8BFCD]">{n.message}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {n.targetSection && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setProfTab(n.targetSection as ProfessionalTab)}
                  >
                    Abrir seção
                  </Button>
                )}
                {!n.read && (
                  <button
                    type="button"
                    aria-label="Marcar como lida"
                    onClick={async () => {
                      await demoBillingService.markNotificationRead(n.id);
                      await refreshSnapshot();
                    }}
                    className="p-2 rounded-lg text-[#33C994] hover:bg-white/5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Excluir notificação"
                  onClick={async () => {
                    await demoBillingService.deleteNotification(n.id);
                    await refreshSnapshot();
                  }}
                  className="p-2 rounded-lg text-[#9EA7BA] hover:text-[#F16C79] hover:bg-white/5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export const SubscriptionView: React.FC = () => {
  const {
    snapshot,
    activeOrg,
    activeSubscription,
    activePlan,
    refreshSnapshot,
    pushToast,
    playSound,
  } = useApp();

  const [coupon, setCoupon] = useState('');

  if (!snapshot || !activeOrg || !activeSubscription || !activePlan) return null;

  const activeClientsCount = snapshot.clients.filter(
    (c) => c.organizationId === activeOrg.id && c.status !== 'arquivado'
  ).length;

  const handlePlanChange = async (targetPlan: PlanTier) => {
    const res = await demoBillingService.changeSubscriptionPlan(activeOrg.id, targetPlan, coupon);
    await refreshSnapshot();
    if (res.ok) {
      playSound('payment_success');
      pushToast({ type: 'success', title: 'Plano atualizado (Demo)', message: res.message });
    } else {
      playSound('error');
      pushToast({ type: 'error', title: res.message });
    }
  };

  const handleRenew = async () => {
    const res = await demoBillingService.renewOrPaySubscription(activeOrg.id);
    await refreshSnapshot();
    playSound('payment_success');
    pushToast({ type: 'success', title: 'Assinatura regularizada', message: res.message });
  };

  const handleCancel = async () => {
    const res = await demoBillingService.cancelSubscription(activeOrg.id);
    await refreshSnapshot();
    playSound('cancel');
    pushToast({ type: 'info', title: res.message });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-[#E2BE72]">
          Cobrança da plataforma separada das cobranças dos seus clientes
        </p>
        <h1 className="text-2xl font-display font-bold text-[#F6F1E8] mt-0.5">Minha Assinatura</h1>
      </div>

      {/* Current Plan Summary */}
      <Card className="p-6 space-y-4 golden-sheen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-[#9EA7BA]">
              Plano atual · Situação:{' '}
              <strong
                className={
                  activeSubscription.status === 'ativa' ? 'text-[#33C994]' : 'text-[#F16C79]'
                }
              >
                {getSubscriptionStatusLabel(activeSubscription.status)}
              </strong>
            </p>
            <h2 className="text-2xl font-display font-bold text-[#F6F1E8]">
              {activePlan.name} ·{' '}
              <span className="tabular-nums">{formatBRL(activePlan.monthlyPriceCents)}/mês</span>
            </h2>
            <p className="text-xs text-[#B8BFCD]">
              Ciclo vigente: {formatDateBR(activeSubscription.currentPeriodStart)} até{' '}
              {formatDateBR(activeSubscription.currentPeriodEnd)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeSubscription.status !== 'ativa' ? (
              <Button variant="emerald" onClick={handleRenew}>
                Pagar / Renovar assinatura (Demo)
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={handleRenew}>
                  Simular renovação antecipada
                </Button>
                <Button variant="ghost" onClick={handleCancel}>
                  Cancelar assinatura
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Consumption Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10 text-xs">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[#B8BFCD]">
              <span>Clientes ativos</span>
              <span className="tabular-nums font-semibold text-[#F6F1E8]">
                {activeClientsCount} / {activePlan.maxClients ?? 'Ilimitados'}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#0B0D12] overflow-hidden">
              <div
                className="h-full bg-[#E2BE72]"
                style={{
                  width: activePlan.maxClients
                    ? `${Math.min(100, (activeClientsCount / activePlan.maxClients) * 100)}%`
                    : '28%',
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[#B8BFCD]">
              <span>Franquia mensal de lembretes</span>
              <span className="tabular-nums font-semibold text-[#F6F1E8]">
                {activeSubscription.messagesUsedThisMonth} / {activePlan.monthlyMessageQuota}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#0B0D12] overflow-hidden">
              <div
                className="h-full bg-[#33C994]"
                style={{
                  width: `${Math.min(
                    100,
                    (activeSubscription.messagesUsedThisMonth / activePlan.monthlyMessageQuota) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Coupon + Upgrade/Downgrade */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-xs w-full">
            <Input
              label="Cupom promocional (opcional)"
              placeholder="Ex: GOLDEN20 (20% off)"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
          </div>
          <p className="text-xs text-[#9EA7BA]">
            Regra de downgrade: seus clientes já cadastrados nunca são apagados ao reduzir o plano.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {snapshot.subscriptionPlans.map((plan) => {
            const isCurrent = plan.id === activePlan.id;
            return (
              <Card key={plan.id} elevated={isCurrent} className="p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-display font-bold text-[#F6F1E8]">{plan.name}</h3>
                    {isCurrent && <span className="text-xs text-[#E2BE72] font-semibold">Atual</span>}
                  </div>
                  <p className="text-2xl font-display font-bold text-[#F6F1E8] tabular-nums">
                    {formatBRL(plan.monthlyPriceCents)}
                    <span className="text-xs font-normal text-[#9EA7BA]">/mês</span>
                  </p>
                  <ul className="space-y-1 text-xs text-[#B8BFCD]">
                    {plan.features.map((f) => (
                      <li key={f}>· {f}</li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant={isCurrent ? 'secondary' : 'primary'}
                  disabled={isCurrent}
                  onClick={() => handlePlanChange(plan.id)}
                >
                  {isCurrent ? 'Plano ativo' : `Migrar para ${plan.name}`}
                </Button>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Subscription Financial History */}
      <Card className="p-5 space-y-3">
        <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
          Histórico financeiro da assinatura
        </h2>
        {activeSubscription.invoices.length === 0 ? (
          <p className="text-xs text-[#9EA7BA]">Sem faturas geradas no plano gratuito.</p>
        ) : (
          <div className="divide-y divide-white/8 text-xs">
            {activeSubscription.invoices.map((inv) => (
              <div key={inv.id} className="py-2.5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-[#F6F1E8]">{inv.description}</p>
                  <p className="text-[#9EA7BA]">{formatDateBR(inv.date)}</p>
                </div>
                <div className="text-right tabular-nums">
                  <p className="font-semibold text-[#F6F1E8]">{formatBRL(inv.amountCents)}</p>
                  <p className={inv.status === 'paga' ? 'text-[#33C994]' : 'text-[#F16C79]'}>
                    {inv.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export const SettingsView: React.FC = () => {
  const {
    snapshot,
    activeOrg,
    uiPrefs,
    updateUiPrefs,
    refreshSnapshot,
    pushToast,
    playSound,
  } = useApp();

  const [businessName, setBusinessName] = useState(activeOrg?.businessName ?? '');
  const [supportWhatsApp, setSupportWhatsApp] = useState(activeOrg?.supportWhatsApp ?? '');
  const [email, setEmail] = useState(activeOrg?.email ?? '');

  if (!snapshot || !activeOrg) return null;

  const orgProviders = snapshot.providerConnections.filter((p) => p.organizationId === activeOrg.id);

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    await demoBillingService.updateOrganization(activeOrg.id, {
      businessName,
      supportWhatsApp,
      email,
    });
    await refreshSnapshot();
    playSound('signup_success');
    pushToast({ type: 'success', title: 'Dados da organização salvos' });
  };

  const handleExportDemoJson = () => {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `golden-billing-demo-${snapshot.simulatedDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast({ type: 'success', title: 'Dados de demonstração exportados em JSON' });
  };

  const handleImportDemoJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await demoBillingService.importDemoSnapshot(String(reader.result ?? ''));
      if (res.ok) {
        await refreshSnapshot();
        pushToast({ type: 'success', title: 'Snapshot de demonstração restaurado' });
      } else {
        pushToast({ type: 'error', title: 'Erro ao importar', message: res.error });
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = async () => {
    await demoBillingService.resetDemoData();
    await refreshSnapshot();
    playSound('notification');
    pushToast({ type: 'info', title: 'Dados iniciais restaurados com sucesso' });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-[#E2BE72]">Preferências, áudio, acessibilidade e conectores futuros</p>
        <h1 className="text-2xl font-display font-bold text-[#F6F1E8] mt-0.5">Configurações</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Org Profile */}
        <Card className="lg:col-span-6 p-5 space-y-4">
          <h2 className="text-base font-display font-semibold text-[#F6F1E8]">Perfil comercial</h2>
          <form onSubmit={handleSaveOrg} className="space-y-3.5">
            <Input
              label="Nome de exibição nas cobranças"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <Input
              label="WhatsApp de suporte ao pagador"
              value={supportWhatsApp}
              onChange={(e) => setSupportWhatsApp(e.target.value)}
            />
            <Input label="E-mail de contato" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit">Salvar perfil comercial</Button>
          </form>
        </Card>

        {/* Audio, Motion & PWA */}
        <Card className="lg:col-span-6 p-5 space-y-5">
          <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
            Áudio, animações e aplicativo
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#F6F1E8]">Efeitos sonoros contextuais</p>
                <p className="text-xs text-[#9EA7BA]">
                  Inicia desativado por padrão; persiste ao recarregar.
                </p>
              </div>
              <Button
                size="sm"
                variant={uiPrefs.soundEnabled ? 'primary' : 'secondary'}
                onClick={() => {
                  const next = !uiPrefs.soundEnabled;
                  updateUiPrefs({ soundEnabled: next });
                }}
              >
                {uiPrefs.soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4" /> Ativado
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" /> Silenciado
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#B8BFCD]">
                <label htmlFor="sound-vol">Volume dos efeitos</label>
                <span className="tabular-nums">{Math.round(uiPrefs.soundVolume * 100)}%</span>
              </div>
              <input
                id="sound-vol"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={uiPrefs.soundVolume}
                onChange={(e) => updateUiPrefs({ soundVolume: Number.parseFloat(e.target.value) })}
                className="w-full accent-[#E2BE72]"
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/8">
              <div>
                <p className="text-sm font-medium text-[#F6F1E8]">Reduzir animações</p>
                <p className="text-xs text-[#9EA7BA]">
                  Suaviza ou desativa transições e movimentos de interface.
                </p>
              </div>
              <Button
                size="sm"
                variant={uiPrefs.reduceMotion ? 'primary' : 'secondary'}
                onClick={() => updateUiPrefs({ reduceMotion: !uiPrefs.reduceMotion })}
              >
                {uiPrefs.reduceMotion ? 'Ativado' : 'Padrão'}
              </Button>
            </div>

            <div className="pt-2 border-t border-white/8 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#F6F1E8]">Aplicativo instalável (PWA)</p>
                <p className="text-xs text-[#9EA7BA]">Funciona com cache offline dos dados locais.</p>
              </div>
              <PWAInstallButton />
            </div>
          </div>
        </Card>
      </div>

      {/* Future Integrations Blueprint */}
      <Card className="p-5 space-y-4">
        <div>
          <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
            Conectores preparados para produção futura
          </h2>
          <p className="text-xs text-[#9EA7BA]">
            Nenhuma credencial secreta é armazenada no frontend. Em produção, os tokens ficam protegidos no
            servidor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {orgProviders.map((prov) => (
            <div
              key={prov.id}
              className="rounded-xl bg-[#0B0D12] border border-white/10 p-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#F6F1E8]">{prov.label}</p>
                <p className="text-xs text-[#9EA7BA] truncate">
                  {prov.accountAlias ?? 'Aguardando homologação no backend'}
                </p>
                <p className="text-[11px] font-mono text-[#E2BE72] truncate mt-1">
                  Webhook: {prov.webhookEndpointTemplate}
                </p>
              </div>
              <span className="text-xs text-[#B8BFCD] shrink-0">
                {prov.status === 'homologacao_demo' ? 'Simulador ativo' : 'Preparado'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Demo Backup & Reset */}
      <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[#F6F1E8]">Gerenciar dados locais da demonstração</h2>
          <p className="text-xs text-[#9EA7BA]">
            Exporte, importe ou restaure o conjunto inicial de demonstração armazenado no IndexedDB.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={handleExportDemoJson}>
            <Download className="w-4 h-4" />
            Exportar JSON
          </Button>
          <label className="inline-flex items-center gap-2 min-h-[38px] px-3.5 py-1.5 text-xs rounded-lg bg-[#1F2531] text-[#F6F1E8] border border-[#A78952]/30 hover:border-[#E2BE72]/60 cursor-pointer">
            <Upload className="w-4 h-4" />
            Importar JSON
            <input type="file" accept=".json,application/json" onChange={handleImportDemoJson} className="hidden" />
          </label>
          <Button size="sm" variant="danger" onClick={handleResetDemo}>
            <RefreshCw className="w-4 h-4" />
            Restaurar dados iniciais
          </Button>
        </div>
      </Card>
    </div>
  );
};
