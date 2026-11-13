import React, { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Crown,
  FastForward,
  Headphones,
  LogOut,
  Megaphone,
  MessageSquare,
  RefreshCw,
  Settings,
  Shield,
  Sliders,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button, Card, GoldenLogo, Input, Select, Textarea } from '../../components/ui/Primitives';
import { useApp, type AdminTab } from '../../context/AppContext';
import { computeAdminSaaSMetrics } from '../../domain/finance';
import { formatBRL, parseBRLToCents } from '../../domain/money';
import { formatDateBR } from '../../domain/recurrence';
import { demoBillingService } from '../../services/demoService';
import type { AccountStatus, SubscriptionPlan } from '../../types/domain';
import { getAccountStatusLabel, getSubscriptionStatusLabel } from '../../utils/labels';

const ADMIN_TABS: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'visao_geral', label: 'Visão SaaS', icon: BarChart3 },
  { id: 'profissionais', label: 'Profissionais', icon: Users },
  { id: 'assinaturas', label: 'Planos e preços', icon: Crown },
  { id: 'simulacao', label: 'Central de simulação', icon: Sliders },
  { id: 'mensagens', label: 'Mensagens & avisos', icon: MessageSquare },
  { id: 'auditoria', label: 'Auditoria', icon: Activity },
  { id: 'configuracoes', label: 'Configurações globais', icon: Settings },
  { id: 'suporte', label: 'Suporte', icon: Headphones },
];

export const AdminView: React.FC = () => {
  const { snapshot, adminTab, setAdminTab, setEnvironment, switchUser, refreshSnapshot, pushToast, playSound } =
    useApp();

  // Broadcast notice state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');

  // Global settings state
  const [platformName, setPlatformName] = useState(snapshot?.globalSettings.platformName ?? 'CobraFlux');
  const [msgCostStr, setMsgCostStr] = useState('0,28');
  const [txFeeEnabled, setTxFeeEnabled] = useState(
    snapshot?.globalSettings.transactionFeeEnabled ?? false
  );
  const [flagCsv, setFlagCsv] = useState(snapshot?.globalSettings.featureFlags.csvImportEnabled ?? true);
  const [flagPdf, setFlagPdf] = useState(snapshot?.globalSettings.featureFlags.pdfExportEnabled ?? true);

  // Plan editor
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planPriceStr, setPlanPriceStr] = useState('');
  const [planMaxClients, setPlanMaxClients] = useState('');
  const [planMsgQuota, setPlanMsgQuota] = useState('');

  // Payment simulator selection
  const [simChargeId, setSimChargeId] = useState(snapshot?.charges[0]?.id ?? '');

  const professionalOrgs = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.organizations.filter((o) => o.id !== 'org_platform');
  }, [snapshot]);

  const saasStats = useMemo(() => {
    if (!snapshot) return null;
    const sentMsgs = snapshot.messageEvents.filter((m) => m.status === 'enviada').length;
    return computeAdminSaaSMetrics(
      professionalOrgs,
      snapshot.subscriptions,
      snapshot.subscriptionPlans,
      snapshot.charges,
      sentMsgs,
      snapshot.globalSettings.estimatedMsgCostCents,
      snapshot.globalSettings.estimatedInfraCostPerOrgCents
    );
  }, [snapshot, professionalOrgs]);

  const revenueChartData = useMemo(() => {
    if (!snapshot || !saasStats) return [];
    return [
      { name: 'Receita SaaS (MRR)', valor: Number((saasStats.mrrCents / 100).toFixed(2)) },
      { name: 'Custos Estimados', valor: Number((saasStats.estimatedPlatformCostCents / 100).toFixed(2)) },
      { name: 'Margem Operacional', valor: Number((saasStats.estimatedMarginCents / 100).toFixed(2)) },
    ];
  }, [snapshot, saasStats]);

  if (!snapshot || !saasStats) return null;

  const handleSetOrgStatus = async (orgId: string, status: AccountStatus) => {
    await demoBillingService.adminSetOrganizationStatus(
      orgId,
      status,
      `Alteração administrativa em ${formatDateBR(snapshot.simulatedDate)}`
    );
    await refreshSnapshot();
    playSound('tap');
    pushToast({ type: 'info', title: `Conta marcada como ${getAccountStatusLabel(status)}` });
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMessage.trim()) return;
    await demoBillingService.adminBroadcastNotice(noticeTitle.trim(), noticeMessage.trim());
    await refreshSnapshot();
    setNoticeTitle('');
    setNoticeMessage('');
    playSound('notification');
    pushToast({ type: 'success', title: 'Aviso global enviado a todos os profissionais' });
  };

  const handleSaveGlobalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await demoBillingService.adminUpdateGlobalSettings({
      ...snapshot.globalSettings,
      platformName: platformName.trim() || 'CobraFlux',
      estimatedMsgCostCents: parseBRLToCents(msgCostStr),
      transactionFeeEnabled: txFeeEnabled,
      featureFlags: {
        ...snapshot.globalSettings.featureFlags,
        csvImportEnabled: flagCsv,
        pdfExportEnabled: flagPdf,
      },
    });
    await refreshSnapshot();
    playSound('signup_success');
    pushToast({ type: 'success', title: 'Configurações globais salvas sem alterar código' });
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    await demoBillingService.adminUpdatePlanConfig({
      ...editingPlan,
      monthlyPriceCents: parseBRLToCents(planPriceStr),
      maxClients: planMaxClients.trim() === '' ? null : Number.parseInt(planMaxClients, 10) || null,
      monthlyMessageQuota: Number.parseInt(planMsgQuota, 10) || 20,
    });
    await refreshSnapshot();
    setEditingPlan(null);
    playSound('signup_success');
    pushToast({ type: 'success', title: `Plano ${editingPlan.name} atualizado` });
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F6F1E8] flex flex-col">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 h-16 bg-[#151922]/95 backdrop-blur-md border-b border-[#A78952]/30 px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <GoldenLogo compact />
          <span className="text-xs font-semibold text-[#E2BE72] hidden sm:inline">
            · Administração Geral da Plataforma
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-[#9EA7BA] hidden md:inline tabular-nums">
            Data simulada: {formatDateBR(snapshot.simulatedDate)}
          </span>
          <Button size="sm" variant="secondary" onClick={() => switchUser('usr_rafael')}>
            Ver painel profissional
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEnvironment('site')}>
            <LogOut className="w-4 h-4" />
            Site
          </Button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Tab Bar */}
        <nav
          className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#151922] border border-white/10 overflow-x-auto"
          aria-label="Seções administrativas"
        >
          {ADMIN_TABS.map((t) => {
            const Icon = t.icon;
            const active = adminTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setAdminTab(t.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  active ? 'bg-[#E2BE72] text-[#0B0D12]' : 'text-[#B8BFCD] hover:text-[#F6F1E8]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* 1. SaaS Overview */}
        {adminTab === 'visao_geral' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 space-y-1 golden-sheen">
                <p className="text-xs text-[#E2BE72]">Receita Recorrente da Plataforma (MRR)</p>
                <p className="text-2xl font-display font-bold text-[#F6F1E8] tabular-nums">
                  {formatBRL(saasStats.mrrCents)}
                </p>
                <p className="text-xs text-[#9EA7BA] tabular-nums">
                  {saasStats.activePaidSubs} pagas · {saasStats.freeSubs} free · {saasStats.overdueOrCanceledSubs}{' '}
                  vencidas/canc.
                </p>
              </Card>

              <Card className="p-5 space-y-1">
                <p className="text-xs text-[#9EA7BA]">Conversão Free → Pago</p>
                <p className="text-2xl font-display font-bold text-[#33C994] tabular-nums">
                  {saasStats.conversionRate}%
                </p>
                <p className="text-xs text-[#9EA7BA]">Base ativa de profissionais</p>
              </Card>

              <Card className="p-5 space-y-1">
                <p className="text-xs text-[#9EA7BA]">Custos Estimados (Infra + WhatsApp)</p>
                <p className="text-2xl font-display font-bold text-[#F6F1E8] tabular-nums">
                  {formatBRL(saasStats.estimatedPlatformCostCents)}
                </p>
                <p className="text-xs text-[#9EA7BA] tabular-nums">
                  Margem SaaS est.: {formatBRL(saasStats.estimatedMarginCents)}
                </p>
              </Card>

              <Card className="p-5 space-y-1">
                <p className="text-xs text-[#9EA7BA]">Volume Administrado pelos Profissionais (GPV)</p>
                <p className="text-2xl font-display font-bold text-[#F5D491] tabular-nums">
                  {formatBRL(saasStats.managedGpvCents)}
                </p>
                <p className="text-[11px] text-[#9EA7BA]">
                  Separado rigorosamente da receita SaaS
                </p>
              </Card>
            </div>

            <Card className="p-6 space-y-4">
              <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
                Economia da Plataforma (Receita SaaS vs Custos Estimados)
              </h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="name" stroke="#9EA7BA" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#9EA7BA"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `R$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2531',
                        border: '1px solid rgba(167,137,82,0.35)',
                        borderRadius: '12px',
                        color: '#F6F1E8',
                        fontSize: '12px',
                      }}
                      formatter={(val: unknown) =>
                        Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      }
                    />
                    <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                      {revenueChartData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={index === 0 ? '#E2BE72' : index === 1 ? '#F16C79' : '#33C994'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* 2. Professionals & Accounts */}
        {adminTab === 'profissionais' && (
          <Card className="overflow-hidden">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
                Profissionais e Organizações ({professionalOrgs.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#9EA7BA] bg-[#0B0D12]/40">
                    <th className="py-3 px-4 font-medium">Profissional / Estúdio</th>
                    <th className="py-3 px-4 font-medium">Plano / Assinatura</th>
                    <th className="py-3 px-4 font-medium text-center">Clientes</th>
                    <th className="py-3 px-4 font-medium text-center">Mensagens</th>
                    <th className="py-3 px-4 font-medium">Status conta</th>
                    <th className="py-3 px-4 font-medium text-right">Ações administrativas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {professionalOrgs.map((org) => {
                    const sub = snapshot.subscriptions.find((s) => s.organizationId === org.id);
                    const plan = snapshot.subscriptionPlans.find((p) => p.id === sub?.planId);
                    const cliCount = snapshot.clients.filter(
                      (c) => c.organizationId === org.id && c.status !== 'arquivado'
                    ).length;

                    return (
                      <tr key={org.id}>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#F6F1E8]">{org.businessName}</p>
                          <p className="text-[#9EA7BA]">
                            {org.name} · {org.category} · {org.email}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-[#E2BE72]">{plan?.name ?? 'Free'}</p>
                          <p className="text-[#9EA7BA]">
                            {sub ? getSubscriptionStatusLabel(sub.status) : 'Sem assinatura'}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-center tabular-nums text-[#F6F1E8]">
                          {cliCount} / {plan?.maxClients ?? '∞'}
                        </td>
                        <td className="py-3.5 px-4 text-center tabular-nums text-[#B8BFCD]">
                          {sub?.messagesUsedThisMonth ?? 0} / {plan?.monthlyMessageQuota ?? 20}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-semibold ${
                              org.status === 'ativo'
                                ? 'text-[#33C994]'
                                : org.status === 'suspenso'
                                  ? 'text-[#E2BE72]'
                                  : 'text-[#F16C79]'
                            }`}
                          >
                            {getAccountStatusLabel(org.status)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {org.status !== 'ativo' ? (
                            <Button
                              size="sm"
                              variant="emerald"
                              onClick={() => handleSetOrgStatus(org.id, 'ativo')}
                            >
                              Reativar
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleSetOrgStatus(org.id, 'suspenso')}
                              >
                                Suspender
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleSetOrgStatus(org.id, 'bloqueado')}
                              >
                                Bloquear
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              await demoBillingService.adminExpireSubscription(org.id);
                              await refreshSnapshot();
                              pushToast({
                                type: 'warning',
                                title: `Assinatura de ${org.name} vencida no simulador`,
                              });
                            }}
                          >
                            Vencer plano
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* 3. Plans & Pricing Config */}
        {adminTab === 'assinaturas' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {snapshot.subscriptionPlans.map((plan) => (
                <Card key={plan.id} className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-display font-bold text-[#F6F1E8]">{plan.name}</h3>
                    <span className="text-sm font-bold text-[#E2BE72] tabular-nums">
                      {formatBRL(plan.monthlyPriceCents)}/mês
                    </span>
                  </div>
                  <div className="text-xs text-[#B8BFCD] space-y-1">
                    <p>Limite de clientes: {plan.maxClients ?? 'Ilimitados'}</p>
                    <p>Franquia WhatsApp: {plan.monthlyMessageQuota} envios/mês</p>
                    <p>CSV: {plan.allowCsvImport ? 'Liberado' : 'Bloqueado'}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setEditingPlan(plan);
                      setPlanPriceStr((plan.monthlyPriceCents / 100).toFixed(2).replace('.', ','));
                      setPlanMaxClients(plan.maxClients === null ? '' : String(plan.maxClients));
                      setPlanMsgQuota(String(plan.monthlyMessageQuota));
                    }}
                  >
                    Editar regras do plano
                  </Button>
                </Card>
              ))}
            </div>

            {editingPlan && (
              <Card elevated className="p-6 max-w-xl">
                <form onSubmit={handleSavePlan} className="space-y-4">
                  <h3 className="text-base font-display font-semibold text-[#F6F1E8]">
                    Editar Plano {editingPlan.name} (Sem alterar código-fonte)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Mensalidade (R$)"
                      value={planPriceStr}
                      onChange={(e) => setPlanPriceStr(e.target.value)}
                      required
                    />
                    <Input
                      label="Máx. clientes (vazio = ilimitado)"
                      value={planMaxClients}
                      onChange={(e) => setPlanMaxClients(e.target.value)}
                    />
                    <Input
                      label="Franquia WhatsApp/mês"
                      type="number"
                      value={planMsgQuota}
                      onChange={(e) => setPlanMsgQuota(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => setEditingPlan(null)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Aplicar configurações</Button>
                  </div>
                </form>
              </Card>
            )}
          </div>
        )}

        {/* 4. Central de Simulação */}
        {adminTab === 'simulacao' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-5 space-y-4 golden-sheen">
              <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
                Controle temporal e motores automáticos
              </h2>
              <p className="text-xs text-[#B8BFCD]">
                Data simulada atual: <strong className="text-[#E2BE72]">{formatDateBR(snapshot.simulatedDate)}</strong>
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Button
                  size="sm"
                  onClick={async () => {
                    await demoBillingService.advanceSimulatedDate(1);
                    await refreshSnapshot();
                    playSound('notification');
                    pushToast({ type: 'info', title: 'Data avançada +1 dia' });
                  }}
                >
                  <FastForward className="w-4 h-4" /> +1 dia
                </Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    await demoBillingService.advanceSimulatedDate(7);
                    await refreshSnapshot();
                    playSound('notification');
                    pushToast({ type: 'info', title: 'Data avançada +7 dias' });
                  }}
                >
                  <FastForward className="w-4 h-4" /> +7 dias
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    const res = await demoBillingService.runPendingReminders();
                    await refreshSnapshot();
                    pushToast({
                      type: 'success',
                      title: 'Lembretes pendentes executados',
                      message: `${res.sentCount} enviados, ${res.failedCount} falhas.`,
                    });
                  }}
                >
                  Disparar lembretes pendentes
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={async () => {
                    await demoBillingService.resetDemoData();
                    await refreshSnapshot();
                    pushToast({ type: 'info', title: 'Banco IndexedDB restaurado para estado inicial' });
                  }}
                >
                  <RefreshCw className="w-4 h-4" /> Restaurar dados iniciais
                </Button>
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
                Simulador global de eventos de pagamento
              </h2>
              <Select
                label="Cobrança alvo"
                value={simChargeId}
                onChange={(e) => setSimChargeId(e.target.value)}
              >
                {snapshot.charges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.clientName} · {formatBRL(c.amountCents)} ({c.status})
                  </option>
                ))}
              </Select>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="emerald"
                  onClick={async () => {
                    const ch = snapshot.charges.find((c) => c.id === simChargeId);
                    if (!ch) return;
                    const res = await demoBillingService.simulatePayment({
                      chargeId: ch.id,
                      amountCents: ch.amountCents - ch.discountCents - ch.paidCents,
                      method: 'pix_simulado',
                      mode: 'confirmado',
                      source: 'admin',
                      actorName: 'Admin Simulador',
                    });
                    await refreshSnapshot();
                    pushToast({ type: res.ok ? 'success' : 'error', title: res.message });
                  }}
                >
                  Confirmar pagamento
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={async () => {
                    const ch = snapshot.charges.find((c) => c.id === simChargeId);
                    if (!ch) return;
                    const res = await demoBillingService.simulatePayment({
                      chargeId: ch.id,
                      amountCents: ch.amountCents,
                      method: 'pix_simulado',
                      mode: 'erro',
                      source: 'admin',
                      actorName: 'Admin Simulador',
                    });
                    await refreshSnapshot();
                    pushToast({ type: 'warning', title: res.message });
                  }}
                >
                  Simular falha integração
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* 5. Messages Monitor & Global Notices */}
        {adminTab === 'mensagens' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <Card className="lg:col-span-5 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#E2BE72]" />
                <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
                  Enviar comunicado global
                </h2>
              </div>
              <form onSubmit={handleBroadcast} className="space-y-3">
                <Input
                  label="Título do aviso"
                  placeholder="Ex: Atualização nas taxas estimadas"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  required
                />
                <Textarea
                  label="Mensagem para todos os profissionais"
                  rows={3}
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  required
                />
                <Button type="submit">Publicar aviso na central</Button>
              </form>
            </Card>

            <Card className="lg:col-span-7 p-5 space-y-4">
              <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
                Monitoramento global de mensagens ({snapshot.messageEvents.length})
              </h2>
              <div className="divide-y divide-white/8 max-h-80 overflow-y-auto text-xs">
                {snapshot.messageEvents.map((ev) => (
                  <div key={ev.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#F6F1E8]">{ev.clientName}</p>
                      <p className="text-[#B8BFCD]">{ev.summary}</p>
                    </div>
                    <span className="text-[#E2BE72] shrink-0">{ev.status}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 6. Audit Logs */}
        {adminTab === 'auditoria' && (
          <Card className="p-5 space-y-4">
            <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
              Registro de auditoria administrativa e financeira ({snapshot.auditLogs.length})
            </h2>
            <div className="divide-y divide-white/8 max-h-[460px] overflow-y-auto text-xs">
              {snapshot.auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#F6F1E8]">
                      {log.action} · <span className="text-[#E2BE72]">{log.entityType}</span>
                    </p>
                    <p className="text-[#B8BFCD]">{log.details}</p>
                  </div>
                  <div className="text-right text-[#9EA7BA] shrink-0">
                    <p>{log.actorName}</p>
                    <p className="font-mono">{log.createdAt.slice(0, 16).replace('T', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 7. Global Settings & Feature Flags */}
        {adminTab === 'configuracoes' && (
          <Card className="p-6 max-w-2xl space-y-5">
            <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
              Configurações globais, identidade visual e recursos
            </h2>
            <form onSubmit={handleSaveGlobalSettings} className="space-y-4">
              <Input
                label="Nome da plataforma"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
              />
              <Input
                label="Custo estimado por mensagem WhatsApp (R$)"
                value={msgCostStr}
                onChange={(e) => setMsgCostStr(e.target.value)}
                hint="Usado no cálculo de custos estimados e margem operacional SaaS."
              />
              <div className="space-y-2.5 pt-2 text-xs text-[#B8BFCD]">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={txFeeEnabled}
                    onChange={(e) => setTxFeeEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#E2BE72]"
                  />
                  Habilitar taxa futura por transação (desativado por padrão na v1)
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flagCsv}
                    onChange={(e) => setFlagCsv(e.target.checked)}
                    className="w-4 h-4 accent-[#E2BE72]"
                  />
                  Recurso ativo: Importação de clientes em CSV
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flagPdf}
                    onChange={(e) => setFlagPdf(e.target.checked)}
                    className="w-4 h-4 accent-[#E2BE72]"
                  />
                  Recurso ativo: Exportação de relatórios em PDF
                </label>
              </div>
              <Button type="submit">Salvar configurações globais</Button>
            </form>
          </Card>
        )}

        {/* 8. Support Center */}
        {adminTab === 'suporte' && (
          <Card className="p-5 space-y-4">
            <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
              Central de suporte ({snapshot.supportTickets.length})
            </h2>
            <div className="divide-y divide-white/8">
              {snapshot.supportTickets.map((tkt) => (
                <div key={tkt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#F6F1E8]">{tkt.subject}</p>
                    <p className="text-xs text-[#B8BFCD]">{tkt.message}</p>
                    <p className="text-[11px] text-[#9EA7BA]">
                      {tkt.organizationName} · {tkt.createdAt.slice(0, 16).replace('T', ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Select
                      label="Situação"
                      value={tkt.status}
                      onChange={async (e) => {
                        await demoBillingService.adminUpdateTicketStatus(
                          tkt.id,
                          e.target.value as 'aberto' | 'em_atendimento' | 'resolvido'
                        );
                        await refreshSnapshot();
                        pushToast({ type: 'success', title: 'Chamado atualizado' });
                      }}
                    >
                      <option value="aberto">Aberto</option>
                      <option value="em_atendimento">Em atendimento</option>
                      <option value="resolvido">Resolvido</option>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
