import React, { useMemo, useState } from 'react';
import { MessageSquare, Plus, Send, ShieldCheck } from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
  Textarea,
} from '../../components/ui/Primitives';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../domain/money';
import { formatDateBR } from '../../domain/recurrence';
import { demoBillingService } from '../../services/demoService';
import type { MessageTemplate, ReminderTriggerType } from '../../types/domain';
import { getMessageStatusLabel, getReminderTriggerLabel } from '../../utils/labels';

export const MessagesView: React.FC = () => {
  const { snapshot, activeOrg, activeSubscription, activePlan, refreshSnapshot, pushToast, playSound } =
    useApp();

  const [editingTpl, setEditingTpl] = useState<MessageTemplate | null>(null);
  const [tplName, setTplName] = useState('');
  const [tplTrigger, setTplTrigger] = useState<ReminderTriggerType>('antes_3_dias');
  const [tplOffset, setTplOffset] = useState('-3');
  const [tplContent, setTplContent] = useState('');
  const [tplQuietStart, setTplQuietStart] = useState('21:00');
  const [tplQuietEnd, setTplQuietEnd] = useState('08:00');
  const [tplMaxWeek, setTplMaxWeek] = useState('2');
  const [tplSuspend, setTplSuspend] = useState(true);
  const [tplActive, setTplActive] = useState(true);

  const orgTemplates = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.messageTemplates.filter((t) => t.organizationId === activeOrg.id);
  }, [snapshot, activeOrg]);

  const orgJobs = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.messageJobs.filter((j) => j.organizationId === activeOrg.id);
  }, [snapshot, activeOrg]);

  const orgClients = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.clients.filter((c) => c.organizationId === activeOrg.id && c.status !== 'arquivado');
  }, [snapshot, activeOrg]);

  const openTemplateModal = (tpl?: MessageTemplate) => {
    if (tpl) {
      setEditingTpl(tpl);
      setTplName(tpl.name);
      setTplTrigger(tpl.triggerType);
      setTplOffset(String(tpl.offsetDays));
      setTplContent(tpl.content);
      setTplQuietStart(tpl.quietHoursStart);
      setTplQuietEnd(tpl.quietHoursEnd);
      setTplMaxWeek(String(tpl.maxPerClientPerWeek));
      setTplSuspend(tpl.suspendOnPayment);
      setTplActive(tpl.active);
    } else {
      setEditingTpl({
        id: '',
        organizationId: activeOrg?.id ?? '',
        name: '1 dia antes do vencimento',
        triggerType: 'antes_1_dia',
        offsetDays: -1,
        content:
          'Olá, {nome}! Sua mensalidade de {valor} vence amanhã ({vencimento}). Link para pagamento: {link}',
        active: true,
        suspendOnPayment: true,
        quietHoursStart: '21:00',
        quietHoursEnd: '08:00',
        maxPerClientPerWeek: 2,
      });
      setTplName('1 dia antes do vencimento');
      setTplTrigger('antes_1_dia');
      setTplOffset('-1');
      setTplContent(
        'Olá, {nome}! Sua mensalidade de {valor} vence amanhã ({vencimento}). Link para pagamento: {link}'
      );
      setTplQuietStart('21:00');
      setTplQuietEnd('08:00');
      setTplMaxWeek('2');
      setTplSuspend(true);
      setTplActive(true);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !editingTpl) return;

    await demoBillingService.saveMessageTemplate(activeOrg.id, {
      ...editingTpl,
      organizationId: activeOrg.id,
      name: tplName.trim(),
      triggerType: tplTrigger,
      offsetDays: Number.parseInt(tplOffset, 10) || 0,
      content: tplContent.trim(),
      quietHoursStart: tplQuietStart,
      quietHoursEnd: tplQuietEnd,
      maxPerClientPerWeek: Number.parseInt(tplMaxWeek, 10) || 2,
      suspendOnPayment: tplSuspend,
      active: tplActive,
    });
    await refreshSnapshot();
    setEditingTpl(null);
    playSound('signup_success');
    pushToast({ type: 'success', title: 'Modelo de mensagem salvo' });
  };

  const handleRunPending = async () => {
    if (!activeOrg) return;
    const res = await demoBillingService.runPendingReminders(activeOrg.id);
    await refreshSnapshot();
    playSound('notification');
    pushToast({
      type: 'info',
      title: 'Simulador WhatsApp executado',
      message: `${res.sentCount} enviada(s), ${res.skippedCount} cancelada(s) por pagamento/opt-out, ${res.failedCount} falha(s).`,
    });
  };

  const handleToggleConsent = async (clientId: string, currentGranted: boolean) => {
    if (!activeOrg) return;
    await demoBillingService.toggleClientConsent(
      activeOrg.id,
      clientId,
      !currentGranted,
      'Alterado pelo profissional na central de mensagens'
    );
    await refreshSnapshot();
    playSound('tap');
    pushToast({
      type: 'info',
      title: !currentGranted ? 'Recebimento autorizado (Opt-in)' : 'Recebimento cancelado (Opt-out)',
    });
  };

  const previewSample = tplContent
    .replace(/\{nome\}/g, 'Mariana Alencar')
    .replace(/\{valor\}/g, formatBRL(68000))
    .replace(/\{vencimento\}/g, '15/11/2026')
    .replace(/\{link\}/g, 'https://goldenbilling.demo/#/pagar/gb-9f4k2m8x');

  if (!activeOrg) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#E2BE72]">
            Simulador WhatsApp Business · Franquia mensal:{' '}
            <span className="tabular-nums">
              {activeSubscription?.messagesUsedThisMonth ?? 0} / {activePlan?.monthlyMessageQuota ?? 20}
            </span>{' '}
            envios
          </p>
          <h1 className="text-2xl font-display font-bold text-[#F6F1E8] mt-0.5">
            Mensagens e Lembretes
          </h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button size="sm" variant="secondary" onClick={handleRunPending}>
            <Send className="w-4 h-4 text-[#33C994]" />
            Executar envios pendentes (Demo)
          </Button>
          <Button size="sm" onClick={() => openTemplateModal()}>
            <Plus className="w-4 h-4" />
            Novo modelo
          </Button>
        </div>
      </div>

      {/* Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {orgTemplates.length === 0 ? (
          <div className="lg:col-span-3">
            <EmptyState
              title="Nenhum modelo configurado"
              description="Crie modelos com variáveis automáticas para lembrar seus clientes antes e após o vencimento."
              actionLabel="Criar primeiro modelo"
              onAction={() => openTemplateModal()}
            />
          </div>
        ) : (
          orgTemplates.map((tpl) => (
            <Card key={tpl.id} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#E2BE72] font-medium">
                    {getReminderTriggerLabel(tpl.triggerType)} ({tpl.offsetDays >= 0 ? `+${tpl.offsetDays}` : tpl.offsetDays}d)
                  </span>
                  <span className={tpl.active ? 'text-[#33C994]' : 'text-[#9EA7BA]'}>
                    {tpl.active ? 'Ativo' : 'Pausado'}
                  </span>
                </div>
                <h2 className="text-base font-display font-semibold text-[#F6F1E8]">{tpl.name}</h2>
                <p className="text-xs text-[#B8BFCD] rounded-xl bg-[#0B0D12] border border-white/8 p-3 leading-relaxed">
                  {tpl.content}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#9EA7BA] pt-2 border-t border-white/8">
                <span>
                  Horário: {tpl.quietHoursEnd}–{tpl.quietHoursStart} · Máx {tpl.maxPerClientPerWeek}/sem
                </span>
                <button
                  type="button"
                  onClick={() => openTemplateModal(tpl)}
                  className="text-xs font-medium text-[#E2BE72] hover:underline cursor-pointer"
                >
                  Editar
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Scheduled & Delivery History + LGPD Consent */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
              Fila e histórico de entregas (Simulador)
            </h2>
            <MessageSquare className="w-4 h-4 text-[#E2BE72]" />
          </div>
          {orgJobs.length === 0 ? (
            <p className="text-sm text-[#9EA7BA]">Nenhum agendamento gerado ainda.</p>
          ) : (
            <div className="divide-y divide-white/8 max-h-96 overflow-y-auto pr-1">
              {orgJobs.map((job) => (
                <div key={job.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#F6F1E8]">
                      {job.clientName} · {getReminderTriggerLabel(job.triggerType)}
                    </span>
                    <span
                      className={`font-semibold ${
                        job.status === 'enviada'
                          ? 'text-[#33C994]'
                          : job.status === 'pendente'
                            ? 'text-[#E2BE72]'
                            : job.status === 'falha'
                              ? 'text-[#F16C79]'
                              : 'text-[#9EA7BA]'
                      }`}
                    >
                      {getMessageStatusLabel(job.status)}
                    </span>
                  </div>
                  <p className="text-xs text-[#B8BFCD]">{job.renderedText}</p>
                  <p className="text-[11px] text-[#9EA7BA]">
                    Agendada: {formatDateBR(job.scheduledFor)}
                    {job.reason ? ` · ${job.reason}` : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
              Consentimento LGPD por cliente
            </h2>
            <ShieldCheck className="w-4 h-4 text-[#33C994]" />
          </div>
          <p className="text-xs text-[#9EA7BA]">
            Clientes com recebimento cancelado têm lembretes bloqueados e pendentes cancelados automaticamente.
          </p>
          <div className="divide-y divide-white/8 max-h-80 overflow-y-auto">
            {orgClients.map((cli) => (
              <div key={cli.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-medium text-[#F6F1E8] truncate">{cli.name}</p>
                  <p className="text-[#9EA7BA]">{cli.phoneDdi}</p>
                </div>
                <Button
                  size="sm"
                  variant={cli.whatsappOptIn ? 'secondary' : 'ghost'}
                  onClick={() => handleToggleConsent(cli.id, cli.whatsappOptIn)}
                >
                  {cli.whatsappOptIn ? 'Autorizado' : 'Cancelado'}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Edit Template Modal */}
      <Modal
        open={editingTpl !== null}
        onClose={() => setEditingTpl(null)}
        title="Configurar modelo de lembrete"
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleSaveTemplate} className="space-y-4">
          <Input label="Nome do modelo" value={tplName} onChange={(e) => setTplName(e.target.value)} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Momento do disparo"
              value={tplTrigger}
              onChange={(e) => {
                const v = e.target.value as ReminderTriggerType;
                setTplTrigger(v);
                const defaults: Record<ReminderTriggerType, string> = {
                  antes_3_dias: '-3',
                  antes_1_dia: '-1',
                  no_vencimento: '0',
                  depois_1_dia: '1',
                  depois_3_dias: '3',
                  personalizado: '5',
                };
                setTplOffset(defaults[v]);
              }}
            >
              <option value="antes_3_dias">3 dias antes</option>
              <option value="antes_1_dia">1 dia antes</option>
              <option value="no_vencimento">No vencimento</option>
              <option value="depois_1_dia">1 dia depois</option>
              <option value="depois_3_dias">3 dias depois</option>
              <option value="personalizado">Personalizado</option>
            </Select>
            <Input
              label="Deslocamento em dias"
              type="number"
              value={tplOffset}
              onChange={(e) => setTplOffset(e.target.value)}
            />
          </div>
          <Textarea
            label="Texto do modelo"
            rows={3}
            value={tplContent}
            onChange={(e) => setTplContent(e.target.value)}
            hint="Variáveis disponíveis: {nome}, {valor}, {vencimento}, {link}"
            required
          />

          <div className="rounded-xl bg-[#0B0D12] border border-[#E2BE72]/25 p-3 space-y-1">
            <p className="text-[11px] font-medium text-[#E2BE72]">Prévia renderizada</p>
            <p className="text-xs text-[#F6F1E8] leading-relaxed">{previewSample}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Início silêncio"
              value={tplQuietStart}
              onChange={(e) => setTplQuietStart(e.target.value)}
            />
            <Input
              label="Fim silêncio"
              value={tplQuietEnd}
              onChange={(e) => setTplQuietEnd(e.target.value)}
            />
            <Input
              label="Máx/semana"
              type="number"
              min={1}
              value={tplMaxWeek}
              onChange={(e) => setTplMaxWeek(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 text-xs text-[#B8BFCD]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tplSuspend}
                onChange={(e) => setTplSuspend(e.target.checked)}
                className="w-4 h-4 accent-[#E2BE72]"
              />
              Suspender automaticamente lembretes pendentes após pagamento confirmado
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tplActive}
                onChange={(e) => setTplActive(e.target.checked)}
                className="w-4 h-4 accent-[#E2BE72]"
              />
              Modelo ativo para novas cobranças
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditingTpl(null)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar modelo</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
