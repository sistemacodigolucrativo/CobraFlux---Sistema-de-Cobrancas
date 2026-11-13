import React, { useMemo, useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button, Card, Input, Select } from '../../components/ui/Primitives';
import { useApp } from '../../context/AppContext';
import { calculateRemainingCents, formatBRL } from '../../domain/money';
import { formatDateBR } from '../../domain/recurrence';
import { demoBillingService } from '../../services/demoService';
import type { ChargeStatus } from '../../types/domain';
import { exportChargesToCsv, exportChargesToPdf } from '../../utils/export';
import { getChargeStatusColor, getChargeStatusLabel } from '../../utils/labels';

export const ReportsView: React.FC = () => {
  const { snapshot, activeOrg, refreshSnapshot, pushToast, playSound } = useApp();

  const [periodMonth, setPeriodMonth] = useState<string>('todos');
  const [clientIdFilter, setClientIdFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | ChargeStatus>('todos');
  const [serviceFilter, setServiceFilter] = useState<string>('');

  const orgClients = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.clients.filter((c) => c.organizationId === activeOrg.id);
  }, [snapshot, activeOrg]);

  const orgCharges = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.charges.filter((c) => {
      if (c.organizationId !== activeOrg.id) return false;
      if (periodMonth !== 'todos' && !c.dueDate.startsWith(periodMonth)) return false;
      if (clientIdFilter !== 'todos' && c.clientId !== clientIdFilter) return false;
      if (statusFilter !== 'todos' && c.status !== statusFilter) return false;
      if (
        serviceFilter.trim() &&
        !c.description.toLowerCase().includes(serviceFilter.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [snapshot, activeOrg, periodMonth, clientIdFilter, statusFilter, serviceFilter]);

  const summary = useMemo(() => {
    let grossPaidCents = 0;
    let netEstimatedCents = 0;
    let overdueCents = 0;
    let partialCount = 0;
    let partialPaidCents = 0;

    for (const c of orgCharges) {
      if (c.status === 'paga' || c.status === 'parcialmente_paga') {
        grossPaidCents += c.paidCents;
        netEstimatedCents += c.netCents;
      }
      if (c.status === 'parcialmente_paga') {
        partialCount += 1;
        partialPaidCents += c.paidCents;
      }
      if (c.status === 'vencida') {
        overdueCents += calculateRemainingCents(c.amountCents, c.discountCents, c.paidCents);
      }
    }

    return {
      grossPaidCents,
      netEstimatedCents,
      overdueCents,
      partialCount,
      partialPaidCents,
    };
  }, [orgCharges]);

  const chartData = useMemo(() => {
    const groups: Record<string, number> = {
      Pagas: 0,
      Parciais: 0,
      Aguardando: 0,
      Vencidas: 0,
    };
    for (const c of orgCharges) {
      if (c.status === 'paga') groups.Pagas += c.paidCents / 100;
      else if (c.status === 'parcialmente_paga') groups.Parciais += c.paidCents / 100;
      else if (c.status === 'vencida')
        groups.Vencidas += calculateRemainingCents(c.amountCents, c.discountCents, c.paidCents) / 100;
      else if (c.status === 'aguardando_pagamento' || c.status === 'agendada')
        groups.Aguardando += calculateRemainingCents(c.amountCents, c.discountCents, c.paidCents) / 100;
    }
    return Object.entries(groups).map(([name, valor]) => ({
      name,
      valor: Number(valor.toFixed(2)),
    }));
  }, [orgCharges]);

  const orgExports = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.exportRecords.filter((e) => e.organizationId === activeOrg.id);
  }, [snapshot, activeOrg]);

  const handleCsvExport = async () => {
    if (!activeOrg) return;
    exportChargesToCsv(orgCharges, `relatorio-${activeOrg.id}`);
    await demoBillingService.recordExport(
      activeOrg.id,
      'CSV',
      `Relatório financeiro (${periodMonth})`,
      orgCharges.length
    );
    await refreshSnapshot();
    playSound('tap');
    pushToast({ type: 'success', title: 'Exportação CSV gerada com sucesso' });
  };

  const handlePdfExport = async () => {
    if (!activeOrg) return;
    exportChargesToPdf(orgCharges, activeOrg, {
      periodLabel: periodMonth === 'todos' ? 'Todos os meses' : periodMonth,
      ...summary,
    });
    await demoBillingService.recordExport(
      activeOrg.id,
      'PDF',
      `Relatório executivo (${periodMonth})`,
      orgCharges.length
    );
    await refreshSnapshot();
    playSound('tap');
    pushToast({ type: 'success', title: 'Exportação PDF gerada com sucesso' });
  };

  if (!activeOrg) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <p className="text-xs text-[#E2BE72]">
            Totais calculados exatamente a partir dos lançamentos filtrados
          </p>
          <h1 className="text-2xl font-display font-bold text-[#F6F1E8] mt-0.5">Relatórios</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
          <Button size="sm" variant="secondary" onClick={handleCsvExport}>
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Button size="sm" onClick={handlePdfExport}>
            <FileText className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
        <Select label="Período" value={periodMonth} onChange={(e) => setPeriodMonth(e.target.value)}>
          <option value="todos">Todos os períodos</option>
          <option value="2026-11">Novembro / 2026</option>
          <option value="2026-10">Outubro / 2026</option>
          <option value="2026-09">Setembro / 2026</option>
        </Select>
        <Select label="Cliente" value={clientIdFilter} onChange={(e) => setClientIdFilter(e.target.value)}>
          <option value="todos">Todos os clientes</option>
          {orgClients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          label="Situação"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'todos' | ChargeStatus)}
        >
          <option value="todos">Todas as situações</option>
          <option value="paga">Pagas</option>
          <option value="parcialmente_paga">Parcialmente pagas</option>
          <option value="aguardando_pagamento">Aguardando pagamento</option>
          <option value="vencida">Vencidas</option>
          <option value="estornada">Estornadas</option>
        </Select>
        <Input
          label="Serviço contratado"
          placeholder="Filtrar descrição..."
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
        />
      </Card>

      {/* Summary Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-1">
          <p className="text-xs text-[#9EA7BA]">Receita bruta recebida</p>
          <p className="text-xl font-display font-bold text-[#F6F1E8] tabular-nums">
            {formatBRL(summary.grossPaidCents)}
          </p>
        </Card>
        <Card className="p-5 space-y-1">
          <p className="text-xs text-[#9EA7BA]">Receita líquida estimada</p>
          <p className="text-xl font-display font-bold text-[#33C994] tabular-nums">
            {formatBRL(summary.netEstimatedCents)}
          </p>
        </Card>
        <Card className="p-5 space-y-1">
          <p className="text-xs text-[#9EA7BA]">Pagamentos parciais ({summary.partialCount})</p>
          <p className="text-xl font-display font-bold text-[#E2BE72] tabular-nums">
            {formatBRL(summary.partialPaidCents)}
          </p>
        </Card>
        <Card className="p-5 space-y-1">
          <p className="text-xs text-[#9EA7BA]">Inadimplência em aberto</p>
          <p className="text-xl font-display font-bold text-[#F16C79] tabular-nums">
            {formatBRL(summary.overdueCents)}
          </p>
        </Card>
      </div>

      {/* Chart + Export History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7 p-5 space-y-4">
          <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
            Distribuição financeira por situação
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
                  formatter={(value: unknown) =>
                    Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  }
                />
                <Bar dataKey="valor" fill="#E2BE72" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-5 p-5 space-y-4 no-print">
          <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
            Histórico de exportações
          </h2>
          {orgExports.length === 0 ? (
            <p className="text-xs text-[#9EA7BA]">Nenhuma exportação realizada ainda.</p>
          ) : (
            <div className="divide-y divide-white/8 max-h-56 overflow-y-auto">
              {orgExports.map((exp) => (
                <div key={exp.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-medium text-[#F6F1E8] truncate">{exp.reportName}</p>
                    <p className="text-[#9EA7BA]">{exp.createdAt.slice(0, 16).replace('T', ' ')}</p>
                  </div>
                  <span className="font-mono text-[#E2BE72] shrink-0">
                    {exp.format} · {exp.rowCount} linhas
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Detailed Data Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#9EA7BA] bg-[#0B0D12]/40">
                <th className="py-3 px-4 font-medium">Cliente</th>
                <th className="py-3 px-4 font-medium">Descrição</th>
                <th className="py-3 px-4 font-medium">Vencimento</th>
                <th className="py-3 px-4 font-medium">Situação</th>
                <th className="py-3 px-4 font-medium text-right">Bruto</th>
                <th className="py-3 px-4 font-medium text-right">Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {orgCharges.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 px-4 font-medium text-[#F6F1E8]">{c.clientName}</td>
                  <td className="py-3 px-4 text-[#B8BFCD]">{c.description}</td>
                  <td className="py-3 px-4 text-[#9EA7BA] tabular-nums">{formatDateBR(c.dueDate)}</td>
                  <td className={`py-3 px-4 font-semibold ${getChargeStatusColor(c.status)}`}>
                    {getChargeStatusLabel(c.status)}
                  </td>
                  <td className="py-3 px-4 text-right text-[#F6F1E8] tabular-nums">
                    {formatBRL(c.amountCents)}
                  </td>
                  <td className="py-3 px-4 text-right text-[#33C994] tabular-nums">
                    {formatBRL(c.paidCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
