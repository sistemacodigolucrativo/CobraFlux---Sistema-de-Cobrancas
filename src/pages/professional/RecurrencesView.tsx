import React, { useMemo, useState } from 'react';
import { Pause, Play, Plus, RefreshCw, XCircle } from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
} from '../../components/ui/Primitives';
import { useApp } from '../../context/AppContext';
import { formatBRL, parseBRLToCents } from '../../domain/money';
import { formatDateBR } from '../../domain/recurrence';
import { demoBillingService } from '../../services/demoService';
import type { RecurrenceFrequency, RecurrenceRule } from '../../types/domain';
import { getRecurrenceFrequencyLabel, getRecurrenceStatusLabel } from '../../utils/labels';

export const RecurrencesView: React.FC = () => {
  const { snapshot, activeOrg, activeUser, refreshSnapshot, pushToast, playSound } = useApp();

  const [showCreate, setShowCreate] = useState(false);
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('Mensalidade recorrente');
  const [amountStr, setAmountStr] = useState('500,00');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('mensal');
  const [customIntervalDays, setCustomIntervalDays] = useState('15');
  const [dueDay, setDueDay] = useState('10');
  const [startDate, setStartDate] = useState(snapshot?.simulatedDate ?? '2026-11-13');
  const [endDate, setEndDate] = useState('');

  // Adjust Future Price Modal
  const [editingRule, setEditingRule] = useState<RecurrenceRule | null>(null);
  const [futureAmountStr, setFutureAmountStr] = useState('');

  const orgClients = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.clients.filter((c) => c.organizationId === activeOrg.id && c.status !== 'arquivado');
  }, [snapshot, activeOrg]);

  const orgRules = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.recurrenceRules.filter((r) => r.organizationId === activeOrg.id);
  }, [snapshot, activeOrg]);

  const handleOpenCreate = () => {
    const first = orgClients[0];
    setClientId(first?.id ?? '');
    setDescription(first ? first.serviceName : 'Mensalidade recorrente');
    setAmountStr(first ? (first.monthlyFeeCents / 100).toFixed(2).replace('.', ',') : '450,00');
    setDueDay(first ? String(first.preferredDueDay) : '10');
    setFrequency('mensal');
    setStartDate(snapshot?.simulatedDate ?? '2026-11-13');
    setEndDate('');
    setShowCreate(true);
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !activeUser) return;
    const cli = orgClients.find((c) => c.id === clientId);
    if (!cli) return;

    const amountCents = parseBRLToCents(amountStr);
    const res = await demoBillingService.createRecurrence(
      activeOrg.id,
      {
        clientId: cli.id,
        clientName: cli.name,
        serviceId: cli.serviceId,
        description,
        amountCents,
        frequency,
        customIntervalDays:
          frequency === 'personalizada' ? Number.parseInt(customIntervalDays, 10) || 15 : undefined,
        dueDay: Number.parseInt(dueDay, 10) || 10,
        startDate,
        endDate: endDate || undefined,
        status: 'ativa',
      },
      activeUser.name
    );

    if (!res.ok) {
      playSound('error');
      pushToast({ type: 'error', title: 'Não foi possível criar recorrência', message: res.error });
      return;
    }

    await refreshSnapshot();
    playSound('signup_success');
    pushToast({ type: 'success', title: 'Regra de recorrência criada' });
    setShowCreate(false);
  };

  const handleRunEngine = async () => {
    if (!activeOrg) return;
    const res = await demoBillingService.runRecurrenceEngine(activeOrg.id);
    await refreshSnapshot();
    playSound('notification');
    pushToast({
      type: 'info',
      title: 'Motor de recorrências executado',
      message: `${res.generatedCount} cobrança(s) gerada(s) e ${res.closedCount} regra(s) encerrada(s).`,
    });
  };

  const handleToggleStatus = async (rule: RecurrenceRule) => {
    if (!activeOrg || !activeUser) return;
    const nextStatus = rule.status === 'ativa' ? 'pausada' : 'ativa';
    await demoBillingService.updateRecurrence(
      activeOrg.id,
      rule.id,
      { status: nextStatus },
      activeUser.name
    );
    await refreshSnapshot();
    playSound('tap');
    pushToast({
      type: 'info',
      title: nextStatus === 'ativa' ? 'Recorrência reativada' : 'Recorrência suspensa',
    });
  };

  const handleEndRule = async (rule: RecurrenceRule) => {
    if (!activeOrg || !activeUser) return;
    await demoBillingService.updateRecurrence(
      activeOrg.id,
      rule.id,
      { status: 'encerrada' },
      activeUser.name
    );
    await refreshSnapshot();
    playSound('cancel');
    pushToast({ type: 'info', title: 'Recorrência encerrada definitivamente' });
  };

  const handleSaveFuturePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !activeUser || !editingRule) return;
    const cents = parseBRLToCents(futureAmountStr);
    await demoBillingService.updateRecurrence(
      activeOrg.id,
      editingRule.id,
      { amountCents: cents },
      activeUser.name
    );
    await refreshSnapshot();
    setEditingRule(null);
    playSound('signup_success');
    pushToast({
      type: 'success',
      title: 'Valor futuro atualizado',
      message: 'Os próximos ciclos usarão o novo valor sem alterar cobranças já emitidas.',
    });
  };

  if (!activeOrg) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#E2BE72]">
            Proteção contra duplicidade · Ajuste automático para meses sem dia 29, 30 ou 31
          </p>
          <h1 className="text-2xl font-display font-bold text-[#F6F1E8] mt-0.5">Recorrências</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button size="sm" variant="secondary" onClick={handleRunEngine}>
            <RefreshCw className="w-4 h-4" />
            Executar geração de ciclos
          </Button>
          <Button size="sm" onClick={handleOpenCreate} disabled={orgClients.length === 0}>
            <Plus className="w-4 h-4" />
            Nova recorrência
          </Button>
        </div>
      </div>

      {orgRules.length === 0 ? (
        <EmptyState
          title="Nenhuma recorrência configurada"
          description="Automatize mensalidades ou cobranças semanais sem risco de gerar cobranças duplicadas."
          actionLabel={orgClients.length > 0 ? 'Configurar recorrência' : undefined}
          onAction={orgClients.length > 0 ? handleOpenCreate : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {orgRules.map((rule) => (
            <Card key={rule.id} className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[#9EA7BA]">
                    {getRecurrenceFrequencyLabel(rule.frequency)} · Dia preferencial {rule.dueDay}
                  </p>
                  <h2 className="text-base font-display font-semibold text-[#F6F1E8] truncate mt-0.5">
                    {rule.clientName}
                  </h2>
                  <p className="text-xs text-[#B8BFCD] truncate">{rule.description}</p>
                </div>
                <span
                  className={`text-xs font-semibold shrink-0 ${
                    rule.status === 'ativa'
                      ? 'text-[#33C994]'
                      : rule.status === 'pausada'
                        ? 'text-[#E2BE72]'
                        : 'text-[#9EA7BA]'
                  }`}
                >
                  {getRecurrenceStatusLabel(rule.status)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/8 text-xs">
                <div>
                  <p className="text-[#9EA7BA]">Valor ciclo</p>
                  <p className="font-semibold text-[#F6F1E8] tabular-nums mt-0.5">
                    {formatBRL(rule.amountCents)}
                  </p>
                </div>
                <div>
                  <p className="text-[#9EA7BA]">Próxima geração</p>
                  <p className="font-medium text-[#F6F1E8] tabular-nums mt-0.5">
                    {rule.status === 'encerrada' ? 'Encerrada' : formatDateBR(rule.nextRunDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#9EA7BA]">Ciclos gerados</p>
                  <p className="font-medium text-[#E2BE72] tabular-nums mt-0.5">
                    {rule.generatedCyclesCount}
                  </p>
                </div>
              </div>

              {rule.status !== 'encerrada' && (
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/8">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingRule(rule);
                      setFutureAmountStr((rule.amountCents / 100).toFixed(2).replace('.', ','));
                    }}
                  >
                    Reajustar valor futuro
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleToggleStatus(rule)}>
                    {rule.status === 'ativa' ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Suspender
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> Reativar
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleEndRule(rule)}>
                    <XCircle className="w-3.5 h-3.5 text-[#F16C79]" />
                    Encerrar
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Recurrence Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nova regra de recorrência"
      >
        <form onSubmit={handleCreateRule} className="space-y-4">
          <Select
            label="Cliente"
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              const cli = orgClients.find((c) => c.id === e.target.value);
              if (cli) {
                setDescription(cli.serviceName);
                setAmountStr((cli.monthlyFeeCents / 100).toFixed(2).replace('.', ','));
                setDueDay(String(cli.preferredDueDay));
              }
            }}
          >
            {orgClients.map((cli) => (
              <option key={cli.id} value={cli.id}>
                {cli.name}
              </option>
            ))}
          </Select>
          <Input
            label="Descrição do ciclo"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Valor por ciclo (R$)"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              required
            />
            <Select
              label="Periodicidade"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
            >
              <option value="mensal">Mensal</option>
              <option value="semanal">Semanal</option>
              <option value="personalizada">Personalizada (em dias)</option>
              <option value="unica">Cobrança única agendada</option>
            </Select>
          </div>
          {frequency === 'personalizada' && (
            <Input
              label="Intervalo em dias"
              type="number"
              min={1}
              value={customIntervalDays}
              onChange={(e) => setCustomIntervalDays(e.target.value)}
            />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Dia de vencimento"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Dia {d}
                </option>
              ))}
            </Select>
            <Input
              label="Data inicial"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Data final (opcional)"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
              Cancelar
            </Button>
            <Button type="submit">Ativar recorrência</Button>
          </div>
        </form>
      </Modal>

      {/* Adjust Future Amount Modal */}
      <Modal
        open={editingRule !== null}
        onClose={() => setEditingRule(null)}
        title="Alterar valor para ciclos futuros"
      >
        {editingRule && (
          <form onSubmit={handleSaveFuturePrice} className="space-y-4">
            <p className="text-xs text-[#B8BFCD]">
              Recorrência de <strong>{editingRule.clientName}</strong>. Cobranças já emitidas permanecem com o
              valor original.
            </p>
            <Input
              label="Novo valor (R$)"
              value={futureAmountStr}
              onChange={(e) => setFutureAmountStr(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditingRule(null)}>
                Cancelar
              </Button>
              <Button type="submit">Atualizar ciclos futuros</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
