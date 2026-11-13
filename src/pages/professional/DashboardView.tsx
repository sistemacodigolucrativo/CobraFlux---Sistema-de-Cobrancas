import React, { useMemo } from 'react';
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FastForward,
  Plus,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button, Card, EmptyState } from '../../components/ui/Primitives';
import { useApp } from '../../context/AppContext';
import { computeDashboardMetrics } from '../../domain/finance';
import { formatBRL } from '../../domain/money';
import { formatDateBR } from '../../domain/recurrence';
import { demoBillingService } from '../../services/demoService';
import { getChargeStatusColor, getChargeStatusLabel } from '../../utils/labels';

export const DashboardView: React.FC = () => {
  const {
    snapshot,
    activeOrg,
    activeSubscription,
    activePlan,
    setProfTab,
    openPublicPayment,
    refreshSnapshot,
    pushToast,
    playSound,
  } = useApp();

  const orgCharges = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.charges.filter((c) => c.organizationId === activeOrg.id);
  }, [snapshot, activeOrg]);

  const orgClients = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.clients.filter((c) => c.organizationId === activeOrg.id);
  }, [snapshot, activeOrg]);

  const metrics = useMemo(() => {
    return computeDashboardMetrics(
      orgCharges,
      orgClients,
      snapshot?.simulatedDate ?? '2026-11-13'
    );
  }, [orgCharges, orgClients, snapshot?.simulatedDate]);

  const handleAdvanceDays = async (days: number) => {
    await demoBillingService.advanceSimulatedDate(days);
    await refreshSnapshot();
    playSound('notification');
    pushToast({
      type: 'info',
      title: `Data simulada avançada em ${days} dias`,
      message: 'Vencimentos e recorrências foram recalculados automaticamente.',
    });
  };

  if (!snapshot || !activeOrg) return null;

  return (
    <div className="space-y-6">
      {/* Subscription Alert if overdue or tolerance */}
      {activeSubscription &&
        (activeSubscription.status === 'vencida' || activeSubscription.status === 'cancelada') && (
          <Card className="p-4 border-[#F16C79]/50 bg-[#F16C79]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[#F6F1E8]">
                Assinatura {activePlan?.name} {activeSubscription.status}
              </p>
              <p className="text-xs text-[#B8BFCD]">
                Novos cadastros de clientes e emissões de cobranças estão bloqueados até a regularização.
              </p>
            </div>
            <Button size="sm" variant="danger" onClick={() => setProfTab('assinatura')}>
              Regularizar assinatura
            </Button>
          </Card>
        )}

      {/* Header + Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#E2BE72]">
            {activeOrg.businessName} · Data simulada: {formatDateBR(snapshot.simulatedDate)}
          </p>
          <h1 className="text-2xl font-display font-bold text-[#F6F1E8] mt-0.5">
            Visão financeira do mês
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button size="sm" variant="secondary" onClick={() => handleAdvanceDays(5)}>
            <FastForward className="w-4 h-4 text-[#E2BE72]" />
            Avançar +5 dias (Demo)
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setProfTab('clientes')}>
            <Users className="w-4 h-4" />
            Novo cliente
          </Button>
          <Button size="sm" onClick={() => setProfTab('cobrancas')}>
            <Plus className="w-4 h-4" />
            Nova cobrança
          </Button>
        </div>
      </div>

      {/* 4 KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2 golden-sheen">
          <div className="flex items-center justify-between text-xs text-[#B8BFCD]">
            <span>Recebido no mês</span>
            <Wallet className="w-4 h-4 text-[#33C994]" />
          </div>
          <p className="text-2xl font-display font-bold text-[#F6F1E8] tabular-nums">
            {formatBRL(metrics.receivedMonthCents)}
          </p>
          <p className="text-xs text-[#33C994] tabular-nums">
            {metrics.monthGrowthPercent >= 0 ? '+' : ''}
            {metrics.monthGrowthPercent}% frente ao mês anterior ({formatBRL(metrics.receivedPreviousMonthCents)})
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#B8BFCD]">
            <span>Previsto em aberto</span>
            <CalendarClock className="w-4 h-4 text-[#E2BE72]" />
          </div>
          <p className="text-2xl font-display font-bold text-[#F6F1E8] tabular-nums">
            {formatBRL(metrics.expectedCents)}
          </p>
          <p className="text-xs text-[#9EA7BA]">Cobranças aguardando ou agendadas</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#B8BFCD]">
            <span>Total em atraso</span>
            <CreditCard className="w-4 h-4 text-[#F16C79]" />
          </div>
          <p className="text-2xl font-display font-bold text-[#F16C79] tabular-nums">
            {formatBRL(metrics.overdueCents)}
          </p>
          <p className="text-xs text-[#9EA7BA] tabular-nums">
            Taxa de inadimplência: {metrics.defaultRatePercent}%
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#B8BFCD]">
            <span>Clientes ativos</span>
            <Users className="w-4 h-4 text-[#E86FAE]" />
          </div>
          <p className="text-2xl font-display font-bold text-[#F6F1E8] tabular-nums">
            {metrics.activeClientsCount}
          </p>
          <p className="text-xs text-[#9EA7BA] tabular-nums">
            {metrics.overdueClientsCount} com pendência · Plano {activePlan?.name ?? 'Free'}
          </p>
        </Card>
      </div>

      {/* Main Chart + Upcoming Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <Card className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
                Evolução mensal dos recebimentos
              </h2>
              <p className="text-xs text-[#9EA7BA]">
                Calculado em tempo real sobre os registros de {activeOrg.name}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#B8BFCD]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#E2BE72]" aria-hidden="true" /> Recebido
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#33C994]" aria-hidden="true" /> Previsto
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.monthlySeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E2BE72" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#E2BE72" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="emeraldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#33C994" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#33C994" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="month" stroke="#9EA7BA" fontSize={12} tickLine={false} axisLine={false} />
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
                  formatter={(value: unknown) =>
                    Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="recebido"
                  name="Recebido"
                  stroke="#E2BE72"
                  strokeWidth={2}
                  fill="url(#goldAreaGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="previsto"
                  name="Previsto"
                  stroke="#33C994"
                  strokeWidth={2}
                  fill="url(#emeraldAreaGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-5 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
              Próximas do vencimento
            </h2>
            <button
              type="button"
              onClick={() => setProfTab('cobrancas')}
              className="text-xs font-medium text-[#E2BE72] hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          {metrics.upcomingCharges.length === 0 ? (
            <EmptyState
              title="Sem vencimentos próximos"
              description="Nenhuma cobrança prevista para os próximos 14 dias."
              actionLabel="Emitir cobrança"
              onAction={() => setProfTab('cobrancas')}
            />
          ) : (
            <div className="divide-y divide-white/8">
              {metrics.upcomingCharges.map((ch) => (
                <div key={ch.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#F6F1E8] truncate">{ch.clientName}</p>
                    <p className="text-xs text-[#9EA7BA] truncate">
                      Vence em {formatDateBR(ch.dueDate)} ·{' '}
                      <span className={getChargeStatusColor(ch.status)}>
                        {getChargeStatusLabel(ch.status)}
                      </span>
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#F6F1E8] tabular-nums">
                      {formatBRL(ch.amountCents - ch.discountCents - ch.paidCents)}
                    </span>
                    <button
                      type="button"
                      onClick={() => openPublicPayment(ch.publicId)}
                      aria-label={`Abrir link de pagamento de ${ch.clientName}`}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg bg-[#1F2531] text-[#E2BE72] hover:bg-[#E2BE72] hover:text-[#0B0D12] transition-colors cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Paid Charges */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
            Cobranças pagas recentemente
          </h2>
          <button
            type="button"
            onClick={() => setProfTab('pagamentos')}
            className="text-xs font-medium text-[#E2BE72] hover:underline cursor-pointer"
          >
            Ir para pagamentos
          </button>
        </div>

        {metrics.recentPaidCharges.length === 0 ? (
          <p className="text-sm text-[#9EA7BA]">Nenhum recebimento confirmado neste perfil até o momento.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-[#9EA7BA]">
                  <th className="py-2.5 pr-4 font-medium">Cliente</th>
                  <th className="py-2.5 pr-4 font-medium">Referência</th>
                  <th className="py-2.5 pr-4 font-medium">Data liquidação</th>
                  <th className="py-2.5 pr-4 font-medium">Situação</th>
                  <th className="py-2.5 text-right font-medium">Valor recebido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {metrics.recentPaidCharges.map((ch) => (
                  <tr key={ch.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 font-medium text-[#F6F1E8]">{ch.clientName}</td>
                    <td className="py-3 pr-4 text-[#B8BFCD] max-w-xs truncate">{ch.description}</td>
                    <td className="py-3 pr-4 text-[#9EA7BA] tabular-nums">
                      {formatDateBR(ch.paidAt ?? ch.updatedAt.slice(0, 10))}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#33C994]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {getChargeStatusLabel(ch.status)}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-[#F6F1E8] tabular-nums">
                      {formatBRL(ch.paidCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
