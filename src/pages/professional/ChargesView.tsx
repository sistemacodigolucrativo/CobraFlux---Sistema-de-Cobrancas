import React, { useMemo, useState } from 'react';
import {
  Ban,
  Copy,
  ExternalLink,
  FileText,
  History,
  Pencil,
  Plus,
  Search,
  Wallet,
} from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
} from '../../components/ui/Primitives';
import { useApp } from '../../context/AppContext';
import { canCancelCharge, canEditCharge } from '../../domain/finance';
import { calculateRemainingCents, formatBRL, parseBRLToCents } from '../../domain/money';
import { formatDateBR } from '../../domain/recurrence';
import { demoBillingService } from '../../services/demoService';
import type { Charge, ChargeStatus, Payment } from '../../types/domain';
import { getChargeStatusColor, getChargeStatusLabel } from '../../utils/labels';

export const ChargesView: React.FC = () => {
  const { snapshot, activeUser, activeOrg, openPublicPayment, refreshSnapshot, pushToast, playSound } =
    useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | ChargeStatus>('todas');

  // Create / Edit Charge Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCharge, setEditingCharge] = useState<Charge | null>(null);
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('450,00');
  const [discountStr, setDiscountStr] = useState('0,00');
  const [dueDate, setDueDate] = useState(snapshot?.simulatedDate ?? '2026-11-18');

  // Manual / Partial Payment Modal
  const [payModalCharge, setPayModalCharge] = useState<Charge | null>(null);
  const [payAmountStr, setPayAmountStr] = useState('');
  const [payMethod, setPayMethod] = useState<Payment['method']>('pix_simulado');

  // History / Receipt Modals
  const [historyCharge, setHistoryCharge] = useState<Charge | null>(null);
  const [receiptCharge, setReceiptCharge] = useState<Charge | null>(null);

  const orgClients = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.clients.filter((c) => c.organizationId === activeOrg.id && c.status !== 'arquivado');
  }, [snapshot, activeOrg]);

  const orgCharges = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.charges
      .filter((c) => c.organizationId === activeOrg.id)
      .filter((c) => {
        if (statusFilter !== 'todas' && c.status !== statusFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            c.clientName.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.publicId.toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [snapshot, activeOrg, statusFilter, search]);

  const openNewChargeModal = () => {
    const firstClient = orgClients[0];
    setEditingCharge(null);
    setClientId(firstClient?.id ?? '');
    setDescription(firstClient ? `${firstClient.serviceName} · Novembro/2026` : 'Mensalidade');
    setAmountStr(
      firstClient ? (firstClient.monthlyFeeCents / 100).toFixed(2).replace('.', ',') : '350,00'
    );
    setDiscountStr('0,00');
    setDueDate(snapshot?.simulatedDate ?? '2026-11-18');
    setShowCreateModal(true);
  };

  const openEditChargeModal = (ch: Charge) => {
    setEditingCharge(ch);
    setClientId(ch.clientId);
    setDescription(ch.description);
    setAmountStr((ch.amountCents / 100).toFixed(2).replace('.', ','));
    setDiscountStr((ch.discountCents / 100).toFixed(2).replace('.', ','));
    setDueDate(ch.dueDate);
    setShowCreateModal(true);
  };

  const handleSaveCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !activeUser) return;
    const amountCents = parseBRLToCents(amountStr);
    const discountCents = parseBRLToCents(discountStr);

    if (amountCents < 100 || !description.trim()) {
      playSound('error');
      pushToast({ type: 'error', title: 'Informe descrição e valor mínimo de R$ 1,00' });
      return;
    }

    if (editingCharge) {
      const res = await demoBillingService.updateCharge(
        activeOrg.id,
        editingCharge.id,
        { description, amountCents, discountCents, dueDate },
        activeUser.name
      );
      if (!res.ok) {
        playSound('error');
        pushToast({ type: 'error', title: 'Edição não permitida', message: res.error });
        return;
      }
      pushToast({ type: 'success', title: 'Cobrança atualizada' });
    } else {
      const res = await demoBillingService.createCharge(
        activeOrg.id,
        { clientId, description, amountCents, discountCents, dueDate },
        activeUser.name
      );
      if (!res.ok) {
        playSound('error');
        pushToast({ type: 'error', title: 'Não foi possível criar', message: res.error });
        return;
      }
      pushToast({
        type: 'success',
        title: 'Cobrança criada',
        message: 'Link público e lembretes agendados no simulador.',
      });
    }

    playSound('signup_success');
    await refreshSnapshot();
    setShowCreateModal(false);
  };

  const handleDuplicate = async (ch: Charge) => {
    if (!activeOrg || !activeUser) return;
    const dup = await demoBillingService.duplicateCharge(
      activeOrg.id,
      ch.id,
      snapshot?.simulatedDate ?? ch.dueDate,
      activeUser.name
    );
    if (dup) {
      await refreshSnapshot();
      playSound('tap');
      pushToast({ type: 'success', title: 'Cobrança duplicada (2ª via gerada)' });
    }
  };

  const handleCancelCharge = async (ch: Charge) => {
    if (!activeOrg || !activeUser) return;
    const res = await demoBillingService.cancelCharge(
      activeOrg.id,
      ch.id,
      'Cancelada pelo painel profissional.',
      activeUser.name
    );
    if (!res.ok) {
      playSound('error');
      pushToast({ type: 'error', title: res.error ?? 'Erro ao cancelar' });
      return;
    }
    await refreshSnapshot();
    playSound('cancel');
    pushToast({ type: 'info', title: 'Cobrança cancelada e lembretes pendentes suspensos' });
  };

  const openPaymentModal = (ch: Charge) => {
    const rem = calculateRemainingCents(ch.amountCents, ch.discountCents, ch.paidCents);
    setPayModalCharge(ch);
    setPayAmountStr((rem / 100).toFixed(2).replace('.', ','));
    setPayMethod('pix_simulado');
  };

  const handleManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalCharge || !activeUser) return;
    const cents = parseBRLToCents(payAmountStr);
    const rem = calculateRemainingCents(
      payModalCharge.amountCents,
      payModalCharge.discountCents,
      payModalCharge.paidCents
    );
    const mode = cents < rem ? 'parcial' : 'confirmado';

    const res = await demoBillingService.simulatePayment({
      chargeId: payModalCharge.id,
      amountCents: cents,
      method: payMethod,
      mode,
      source: payMethod === 'pix_simulado' ? 'simulador' : 'manual',
      actorName: activeUser.name,
    });

    await refreshSnapshot();
    setPayModalCharge(null);
    if (res.ok) {
      playSound('payment_success');
      pushToast({ type: 'success', title: 'Recebimento registrado (Demo)', message: res.message });
    } else {
      playSound('error');
      pushToast({ type: 'error', title: 'Pagamento bloqueado', message: res.message });
    }
  };

  const handleCopyShareLink = async (ch: Charge) => {
    const link = `${window.location.origin}/#/pagar/${ch.publicId}`;
    try {
      await navigator.clipboard.writeText(link);
      playSound('tap');
      pushToast({ type: 'success', title: 'Link público copiado', message: link });
    } catch {
      openPublicPayment(ch.publicId);
    }
  };

  if (!activeOrg) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#E2BE72]">Gestão individual de recebíveis · Ambiente Demonstrativo</p>
          <h1 className="text-2xl font-display font-bold text-[#F6F1E8] mt-0.5">Cobranças</h1>
        </div>
        <Button size="sm" onClick={openNewChargeModal} disabled={orgClients.length === 0}>
          <Plus className="w-4 h-4" />
          Nova cobrança
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9EA7BA] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Pesquisar cobranças"
            placeholder="Filtrar por cliente, descrição ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[42px] rounded-xl bg-[#0B0D12] border border-white/10 pl-10 pr-4 text-sm text-[#F6F1E8] placeholder:text-[#9EA7BA]/60 focus:outline-none focus:border-[#E2BE72]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B0D12] border border-white/8 overflow-x-auto">
          {(
            [
              'todas',
              'aguardando_pagamento',
              'vencida',
              'parcialmente_paga',
              'paga',
              'agendada',
              'cancelada',
              'estornada',
            ] as const
          ).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                statusFilter === st ? 'bg-[#E2BE72] text-[#0B0D12]' : 'text-[#B8BFCD] hover:text-[#F6F1E8]'
              }`}
            >
              {st === 'todas' ? 'Todas' : getChargeStatusLabel(st)}
            </button>
          ))}
        </div>
      </Card>

      {orgCharges.length === 0 ? (
        <EmptyState
          title="Nenhuma cobrança encontrada"
          description="Crie uma cobrança avulsa ou ajuste o filtro de situação."
          actionLabel={orgClients.length > 0 ? 'Criar primeira cobrança' : undefined}
          onAction={orgClients.length > 0 ? openNewChargeModal : undefined}
        />
      ) : (
        <div className="space-y-3">
          {orgCharges.map((ch) => {
            const remaining = calculateRemainingCents(ch.amountCents, ch.discountCents, ch.paidCents);
            return (
              <Card key={ch.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-[#9EA7BA]">{ch.publicId}</span>
                    <span aria-hidden="true">·</span>
                    <span className={`font-semibold ${getChargeStatusColor(ch.status)}`}>
                      {getChargeStatusLabel(ch.status)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#9EA7BA]">Venc. {formatDateBR(ch.dueDate)}</span>
                  </div>
                  <p className="text-base font-semibold text-[#F6F1E8] truncate">
                    {ch.clientName} — <span className="font-normal text-[#B8BFCD]">{ch.description}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#9EA7BA] tabular-nums">
                    <span>Valor: {formatBRL(ch.amountCents)}</span>
                    {ch.discountCents > 0 && <span className="text-[#33C994]">Desc.: {formatBRL(ch.discountCents)}</span>}
                    {ch.paidCents > 0 && <span>Pago: {formatBRL(ch.paidCents)}</span>}
                    {remaining > 0 && ch.status !== 'cancelada' && ch.status !== 'estornada' && (
                      <span className="text-[#F5D491]">Restante: {formatBRL(remaining)}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openPublicPayment(ch.publicId)}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir link
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleCopyShareLink(ch)}>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar link
                  </Button>
                  {remaining > 0 && ch.status !== 'cancelada' && ch.status !== 'estornada' && (
                    <Button size="sm" variant="emerald" onClick={() => openPaymentModal(ch)}>
                      <Wallet className="w-3.5 h-3.5" />
                      Registrar pagamento
                    </Button>
                  )}
                  {(ch.status === 'paga' || ch.status === 'parcialmente_paga') && (
                    <Button size="sm" variant="secondary" onClick={() => setReceiptCharge(ch)}>
                      <FileText className="w-3.5 h-3.5" />
                      Recibo
                    </Button>
                  )}
                  {canEditCharge(ch.status) && (
                    <button
                      type="button"
                      onClick={() => openEditChargeModal(ch)}
                      aria-label={`Editar cobrança ${ch.publicId}`}
                      className="p-2 rounded-lg text-[#9EA7BA] hover:text-[#F6F1E8] hover:bg-white/5 cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDuplicate(ch)}
                    aria-label={`Gerar segunda via de ${ch.publicId}`}
                    className="p-2 rounded-lg text-[#9EA7BA] hover:text-[#E2BE72] hover:bg-white/5 cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryCharge(ch)}
                    aria-label={`Histórico da cobrança ${ch.publicId}`}
                    className="p-2 rounded-lg text-[#9EA7BA] hover:text-[#E2BE72] hover:bg-white/5 cursor-pointer"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  {canCancelCharge(ch.status) && (
                    <button
                      type="button"
                      onClick={() => handleCancelCharge(ch)}
                      aria-label={`Cancelar cobrança ${ch.publicId}`}
                      className="p-2 rounded-lg text-[#9EA7BA] hover:text-[#F16C79] hover:bg-white/5 cursor-pointer"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={editingCharge ? 'Editar cobrança' : 'Emitir nova cobrança (Demo)'}
      >
        <form onSubmit={handleSaveCharge} className="space-y-4">
          {!editingCharge && (
            <Select
              label="Cliente"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                const cli = orgClients.find((c) => c.id === e.target.value);
                if (cli) {
                  setDescription(`${cli.serviceName} · Mensalidade`);
                  setAmountStr((cli.monthlyFeeCents / 100).toFixed(2).replace('.', ','));
                }
              }}
            >
              {orgClients.map((cli) => (
                <option key={cli.id} value={cli.id}>
                  {cli.name} ({cli.serviceName})
                </option>
              ))}
            </Select>
          )}
          <Input
            label="Descrição do serviço"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Valor bruto (R$)"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              required
            />
            <Input
              label="Desconto (R$)"
              value={discountStr}
              onChange={(e) => setDiscountStr(e.target.value)}
            />
            <Input
              label="Vencimento"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editingCharge ? 'Salvar alterações' : 'Gerar cobrança'}</Button>
          </div>
        </form>
      </Modal>

      {/* Manual / Partial Payment Modal */}
      <Modal
        open={payModalCharge !== null}
        onClose={() => setPayModalCharge(null)}
        title="Registrar recebimento (Simulação / Manual)"
      >
        {payModalCharge && (
          <form onSubmit={handleManualPayment} className="space-y-4">
            <p className="text-xs text-[#B8BFCD]">
              Cobrança de <strong>{payModalCharge.clientName}</strong> · Saldo restante:{' '}
              <strong className="text-[#F6F1E8] tabular-nums">
                {formatBRL(
                  calculateRemainingCents(
                    payModalCharge.amountCents,
                    payModalCharge.discountCents,
                    payModalCharge.paidCents
                  )
                )}
              </strong>
            </p>
            <Input
              label="Valor recebido (R$)"
              value={payAmountStr}
              onChange={(e) => setPayAmountStr(e.target.value)}
              hint="Informe um valor menor para registrar pagamento parcial."
              required
            />
            <Select
              label="Meio de recebimento"
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as Payment['method'])}
            >
              <option value="pix_simulado">Pix Demonstrativo</option>
              <option value="manual_transferencia">Transferência Manual</option>
              <option value="manual_dinheiro">Dinheiro em espécie</option>
              <option value="manual_cartao">Maquininha / Cartão presencial</option>
            </Select>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setPayModalCharge(null)}>
                Cancelar
              </Button>
              <Button type="submit" variant="emerald">
                Confirmar recebimento
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Charge Audit History Modal */}
      <Modal
        open={historyCharge !== null}
        onClose={() => setHistoryCharge(null)}
        title={historyCharge ? `Histórico · ${historyCharge.publicId}` : 'Histórico'}
      >
        {historyCharge && (
          <div className="space-y-3 divide-y divide-white/8">
            {historyCharge.history.map((h) => (
              <div key={h.id} className="pt-3 first:pt-0 text-xs space-y-0.5">
                <p className="font-semibold text-[#F6F1E8]">{h.action}</p>
                <p className="text-[#B8BFCD]">{h.detail}</p>
                <p className="text-[#9EA7BA]">
                  {h.at.slice(0, 16).replace('T', ' ')} · Origem: {h.origin} · Responsável: {h.actor}
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Demonstrative Receipt Modal */}
      <Modal
        open={receiptCharge !== null}
        onClose={() => setReceiptCharge(null)}
        title="Recibo Demonstrativo"
      >
        {receiptCharge && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#E2BE72]/35 bg-[#0B0D12] p-4 space-y-2 text-xs">
              <p className="text-center font-semibold text-[#E2BE72]">
                RECIBO DEMONSTRATIVO · NÃO POSSUI VALIDADE BANCÁRIA OU FISCAL
              </p>
              <div className="border-t border-white/10 pt-2 space-y-1 text-[#B8BFCD]">
                <p>Emitente: {activeOrg.businessName}</p>
                <p>Pagador: {receiptCharge.clientName}</p>
                <p>Descrição: {receiptCharge.description}</p>
                <p className="tabular-nums">
                  Valor pago: <strong className="text-[#33C994]">{formatBRL(receiptCharge.paidCents)}</strong>
                </p>
                <p>Referência: {receiptCharge.publicId}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => window.print()}>
                Imprimir
              </Button>
              <Button onClick={() => setReceiptCharge(null)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
