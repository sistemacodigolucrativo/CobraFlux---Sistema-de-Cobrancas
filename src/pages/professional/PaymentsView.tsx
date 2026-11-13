import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  QrCode,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Button, Card, EmptyState, Select } from '../../components/ui/Primitives';
import { useApp } from '../../context/AppContext';
import { calculateRemainingCents, formatBRL } from '../../domain/money';
import { formatDateBR } from '../../domain/recurrence';
import { demoBillingService } from '../../services/demoService';
import { generateQrMatrix } from '../../utils/qr';

export const PaymentsView: React.FC = () => {
  const { snapshot, activeOrg, activeUser, openPublicPayment, refreshSnapshot, pushToast, playSound } =
    useApp();

  const orgCharges = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.charges.filter((c) => c.organizationId === activeOrg.id);
  }, [snapshot, activeOrg]);

  const [selectedChargeId, setSelectedChargeId] = useState<string>(() => orgCharges[0]?.id ?? '');

  const selectedCharge = useMemo(
    () => orgCharges.find((c) => c.id === selectedChargeId) ?? orgCharges[0] ?? null,
    [orgCharges, selectedChargeId]
  );

  const orgPayments = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.payments.filter((p) => p.organizationId === activeOrg.id);
  }, [snapshot, activeOrg]);

  const orgEvents = useMemo(() => {
    if (!snapshot || !activeOrg) return [];
    return snapshot.paymentEvents.filter((e) => e.organizationId === activeOrg.id);
  }, [snapshot, activeOrg]);

  const qrMatrix = useMemo(() => {
    if (!selectedCharge) return [];
    return generateQrMatrix(selectedCharge.pixDemoCode, 21);
  }, [selectedCharge]);

  const handleSimulate = async (mode: 'confirmado' | 'parcial' | 'pendente' | 'duplicado' | 'erro') => {
    if (!selectedCharge || !activeUser) return;
    const rem = calculateRemainingCents(
      selectedCharge.amountCents,
      selectedCharge.discountCents,
      selectedCharge.paidCents
    );
    const amountCents = mode === 'parcial' ? Math.max(100, Math.round((rem || selectedCharge.amountCents) / 2)) : rem || selectedCharge.amountCents;

    const res = await demoBillingService.simulatePayment({
      chargeId: selectedCharge.id,
      amountCents,
      method: 'pix_simulado',
      mode,
      source: 'simulador',
      actorName: activeUser.name,
    });
    await refreshSnapshot();
    if (res.ok) {
      playSound(mode === 'pendente' ? 'notification' : 'payment_success');
      pushToast({ type: 'success', title: 'Evento processado (Demo)', message: res.message });
    } else {
      playSound('error');
      pushToast({ type: 'warning', title: 'Evento bloqueado / erro', message: res.message });
    }
  };

  const handleRefund = async () => {
    if (!selectedCharge || !activeUser) return;
    const res = await demoBillingService.simulateRefund(
      selectedCharge.id,
      'Estorno demonstrativo acionado no painel de pagamentos.',
      activeUser.name
    );
    await refreshSnapshot();
    if (res.ok) {
      playSound('cancel');
      pushToast({ type: 'info', title: 'Estorno registrado', message: res.message });
    } else {
      playSound('error');
      pushToast({ type: 'error', title: 'Estorno indisponível', message: res.message });
    }
  };

  if (!activeOrg) return null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-[#E2BE72]">
          Simulador Pix demonstrativo · Valores brutos, taxas estimadas e líquido separados
        </p>
        <h1 className="text-2xl font-display font-bold text-[#F6F1E8] mt-0.5">Pagamentos & Pix Demo</h1>
      </div>

      {/* Pix Simulator Panel */}
      <Card className="p-5 sm:p-6 space-y-5 golden-sheen">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
              Laboratório de Eventos Pix (Demonstrativo)
            </h2>
            <p className="text-xs text-[#B8BFCD]">
              Teste liquidação total, parcial, pendência, proteção contra duplicidade, falha e estorno sem
              movimentar dinheiro real.
            </p>
          </div>
          {selectedCharge && (
            <Button size="sm" variant="secondary" onClick={() => openPublicPayment(selectedCharge.publicId)}>
              <QrCode className="w-4 h-4 text-[#E2BE72]" />
              Abrir página pública do pagador
            </Button>
          )}
        </div>

        {orgCharges.length === 0 ? (
          <EmptyState
            title="Sem cobranças disponíveis"
            description="Crie uma cobrança primeiro para testar os eventos de pagamento Pix."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-4">
              <Select
                label="Selecione a cobrança para simular"
                value={selectedCharge?.id ?? ''}
                onChange={(e) => setSelectedChargeId(e.target.value)}
              >
                {orgCharges.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.clientName} · {ch.description} ({formatBRL(ch.amountCents)} — {ch.status})
                  </option>
                ))}
              </Select>

              {selectedCharge && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <Button size="sm" variant="emerald" onClick={() => handleSimulate('confirmado')}>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar Pix
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleSimulate('parcial')}>
                    Pagamento parcial
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleSimulate('pendente')}>
                    <RefreshCw className="w-4 h-4" />
                    Simular pendente
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleSimulate('duplicado')}>
                    <ShieldCheck className="w-4 h-4 text-[#E2BE72]" />
                    Simular duplicado
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleSimulate('erro')}>
                    <AlertTriangle className="w-4 h-4" />
                    Simular erro
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleRefund}>
                    <RotateCcw className="w-4 h-4 text-[#F16C79]" />
                    Estornar
                  </Button>
                </div>
              )}
            </div>

            {selectedCharge && (
              <div className="lg:col-span-4 flex flex-col items-center justify-center rounded-2xl bg-[#0B0D12] border border-white/10 p-4 space-y-2">
                <div className="p-2.5 rounded-xl bg-[#F6F1E8]">
                  <svg
                    width="112"
                    height="112"
                    viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                    aria-label="QR Code demonstrativo"
                  >
                    <rect width={qrMatrix.length} height={qrMatrix.length} fill="#F6F1E8" />
                    {qrMatrix.map((row, r) =>
                      row.map((cell, c) =>
                        cell ? <rect key={`${r}_${c}`} x={c} y={r} width={1} height={1} fill="#0B0D12" /> : null
                      )
                    )}
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-[#9EA7BA]">
                  QR Ilustrativo · {selectedCharge.publicId}
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Confirmed Payments + Events Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7 p-5 space-y-4">
          <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
            Pagamentos registrados (Demo)
          </h2>
          {orgPayments.length === 0 ? (
            <p className="text-sm text-[#9EA7BA]">Nenhum pagamento processado ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#9EA7BA]">
                    <th className="py-2 pr-3 font-medium">Cliente</th>
                    <th className="py-2 pr-3 font-medium">Data</th>
                    <th className="py-2 pr-3 font-medium text-right">Bruto</th>
                    <th className="py-2 pr-3 font-medium text-right">Taxa est.</th>
                    <th className="py-2 pr-3 font-medium text-right">Líquido est.</th>
                    <th className="py-2 text-right font-medium">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {orgPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 pr-3 font-medium text-[#F6F1E8]">{p.clientName}</td>
                      <td className="py-2.5 pr-3 text-[#9EA7BA] tabular-nums">
                        {formatDateBR(p.createdAt.slice(0, 10))}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-[#F6F1E8] tabular-nums">
                        {formatBRL(p.amountCents)}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-[#9EA7BA] tabular-nums">
                        -{formatBRL(p.feeCents)}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-semibold text-[#33C994] tabular-nums">
                        {formatBRL(p.netCents)}
                      </td>
                      <td className="py-2.5 text-right text-[#B8BFCD]">
                        {p.status === 'estornado' ? (
                          <span className="text-[#F16C79]">Estornado</span>
                        ) : (
                          <span className="text-[#33C994]">Confirmado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-5 p-5 space-y-4">
          <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
            Linha do tempo de eventos
          </h2>
          {orgEvents.length === 0 ? (
            <p className="text-sm text-[#9EA7BA]">Sem eventos recentes.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 divide-y divide-white/8">
              {orgEvents.slice(0, 15).map((ev) => (
                <div key={ev.id} className="pt-2.5 first:pt-0 text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#E2BE72]">{ev.type}</span>
                    <span className="font-mono text-[#9EA7BA] tabular-nums">
                      {formatBRL(ev.amountCents)}
                    </span>
                  </div>
                  <p className="text-[#B8BFCD]">{ev.message}</p>
                  <p className="text-[11px] text-[#9EA7BA]">
                    {ev.createdAt.slice(0, 16).replace('T', ' ')} · Origem: {ev.source}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
