import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  FileText,
  PhoneCall,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { Button, Card, ErrorState, GoldenLogo, Modal, SkeletonBlock } from '../../components/ui/Primitives';
import { useApp } from '../../context/AppContext';
import { calculateDiscountedCents, calculateRemainingCents, formatBRL } from '../../domain/money';
import { formatDateBR } from '../../domain/recurrence';
import { demoBillingService } from '../../services/demoService';
import type { Charge, Organization } from '../../types/domain';
import { getChargeStatusColor, getChargeStatusLabel } from '../../utils/labels';
import { generateQrMatrix } from '../../utils/qr';

export const PublicPaymentPage: React.FC = () => {
  const { publicPaymentId, setEnvironment, refreshSnapshot, pushToast, playSound } = useApp();
  const [data, setData] = useState<{ charge: Charge; organization: Organization } | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadCharge = async () => {
    if (!publicPaymentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await demoBillingService.getPublicCharge(publicPaymentId);
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadCharge();
  }, [publicPaymentId]);

  const qrMatrix = useMemo(() => {
    if (!data) return [];
    return generateQrMatrix(data.charge.pixDemoCode, 21);
  }, [data]);

  const handleCopyCode = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.charge.pixDemoCode);
      setCopied(true);
      playSound('tap');
      pushToast({ type: 'success', title: 'Código demonstrativo copiado' });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      pushToast({ type: 'info', title: 'Selecione e copie o código manualmente' });
    }
  };

  const handleSimulate = async (mode: 'confirmado' | 'parcial' | 'pendente' | 'duplicado' | 'erro') => {
    if (!data) return;
    setProcessing(true);
    const remaining = calculateRemainingCents(
      data.charge.amountCents,
      data.charge.discountCents,
      data.charge.paidCents
    );
    const amount = mode === 'parcial' ? Math.max(100, Math.round(remaining / 2)) : remaining;

    const res = await demoBillingService.simulatePayment({
      chargeId: data.charge.id,
      amountCents: amount,
      method: 'pix_simulado',
      mode,
      source: 'pagina_publica',
      actorName: `Pagador (${data.charge.clientName})`,
    });

    await refreshSnapshot();
    await loadCharge();
    setProcessing(false);

    if (res.ok) {
      playSound(mode === 'pendente' ? 'notification' : 'payment_success');
      pushToast({ type: 'success', title: 'Simulação executada', message: res.message });
    } else {
      playSound('error');
      pushToast({ type: 'error', title: 'Evento bloqueado / erro simulado', message: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F6F1E8] pb-16">
      <header className="border-b border-white/8 bg-[#0B0D12]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setEnvironment('professional')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B8BFCD] hover:text-[#F6F1E8] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao painel
          </button>
          <GoldenLogo compact />
          <span className="text-[11px] text-[#E2BE72]">Link Público</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-6 space-y-5">
        {/* Explicit Demo Disclaimer */}
        <div className="rounded-xl border border-[#E2BE72]/35 bg-[#E2BE72]/10 px-4 py-3 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#E2BE72] shrink-0 mt-0.5" />
          <p className="text-xs text-[#F5D491] leading-relaxed">
            <strong>Ambiente Demonstrativo:</strong> Este QR Code e os botões abaixo simulam a jornada do
            pagador sem realizar transações bancárias ou Pix reais.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-36" />
            <SkeletonBlock className="h-72" />
          </div>
        ) : !data ? (
          <ErrorState
            title="Cobrança não encontrada"
            message="O identificador público informado não corresponde a nenhuma cobrança ativa nesta demonstração."
            onRetry={() => setEnvironment('site')}
          />
        ) : (
          <>
            {/* Charge Summary Card */}
            <Card className="p-5 sm:p-6 space-y-4 golden-sheen">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-[#E2BE72]">{data.organization.businessName}</p>
                  <h1 className="text-lg font-display font-bold text-[#F6F1E8] mt-0.5">
                    {data.charge.description}
                  </h1>
                  <p className="text-xs text-[#9EA7BA] mt-1">
                    Pagador: {data.charge.clientName} · ID: <span className="font-mono">{data.charge.publicId}</span>
                  </p>
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap ${getChargeStatusColor(data.charge.status)}`}>
                  {getChargeStatusLabel(data.charge.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
                <div>
                  <p className="text-xs text-[#9EA7BA]">
                    {data.charge.paidCents > 0 && data.charge.status !== 'paga'
                      ? 'Saldo restante'
                      : 'Valor da cobrança'}
                  </p>
                  <p className="text-2xl sm:text-3xl font-display font-bold text-[#F6F1E8] tabular-nums mt-0.5">
                    {formatBRL(
                      data.charge.status === 'paga' || data.charge.status === 'estornada'
                        ? calculateDiscountedCents(data.charge.amountCents, data.charge.discountCents)
                        : calculateRemainingCents(
                            data.charge.amountCents,
                            data.charge.discountCents,
                            data.charge.paidCents
                          )
                    )}
                  </p>
                  {data.charge.discountCents > 0 && (
                    <p className="text-[11px] text-[#33C994] mt-0.5">
                      Desconto aplicado: {formatBRL(data.charge.discountCents)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#9EA7BA]">Vencimento</p>
                  <p className="text-base font-semibold text-[#F6F1E8] tabular-nums mt-1">
                    {formatDateBR(data.charge.dueDate)}
                  </p>
                  {data.charge.paidCents > 0 && (
                    <p className="text-[11px] text-[#33C994] tabular-nums mt-0.5">
                      Já pago: {formatBRL(data.charge.paidCents)}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Paid State / Receipt */}
            {data.charge.status === 'paga' ? (
              <Card className="p-6 text-center space-y-4 border-[#33C994]/40">
                <CheckCircle2 className="w-12 h-12 text-[#33C994] mx-auto" />
                <div className="space-y-1">
                  <h2 className="text-xl font-display font-bold text-[#F6F1E8]">
                    Pagamento demonstrativo confirmado
                  </h2>
                  <p className="text-sm text-[#B8BFCD]">
                    Liquidado em {formatDateBR(data.charge.paidAt ?? data.charge.updatedAt.slice(0, 10))} ·{' '}
                    {formatBRL(data.charge.paidCents)}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setShowReceipt(true)}>
                    <FileText className="w-4 h-4" />
                    Visualizar comprovante demonstrativo
                  </Button>
                </div>
              </Card>
            ) : data.charge.status === 'cancelada' || data.charge.status === 'estornada' ? (
              <Card className="p-6 text-center space-y-3 border-[#F16C79]/30">
                <AlertTriangle className="w-9 h-9 text-[#F16C79] mx-auto" />
                <h2 className="text-lg font-display font-bold text-[#F6F1E8]">
                  Cobrança {getChargeStatusLabel(data.charge.status).toLowerCase()}
                </h2>
                <p className="text-sm text-[#B8BFCD]">
                  Esta cobrança não está mais disponível para pagamento. Em caso de dúvida, contate o
                  profissional responsável.
                </p>
              </Card>
            ) : (
              /* Demonstrative Pix QR Code & Copy Code */
              <Card className="p-5 sm:p-6 space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="text-base font-display font-semibold text-[#F6F1E8]">
                    QR Code Pix Demonstrativo
                  </h2>
                  <p className="text-xs text-[#9EA7BA]">
                    Representação visual ilustrativa · Sem validade bancária
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="p-3 rounded-2xl bg-[#F6F1E8] border-2 border-[#E2BE72]">
                    <svg
                      width="148"
                      height="148"
                      viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                      role="img"
                      aria-label="QR Code demonstrativo da cobrança"
                    >
                      <rect width={qrMatrix.length} height={qrMatrix.length} fill="#F6F1E8" />
                      {qrMatrix.map((row, r) =>
                        row.map((cell, c) =>
                          cell ? (
                            <rect key={`${r}_${c}`} x={c} y={r} width={1} height={1} fill="#0B0D12" />
                          ) : null
                        )
                      )}
                    </svg>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#B8BFCD]">Código Pix Copia e Cola (Demonstrativo)</p>
                  <div className="rounded-xl bg-[#0B0D12] border border-white/10 p-3 flex items-center justify-between gap-3">
                    <code className="text-[11px] font-mono text-[#B8BFCD] truncate">
                      {data.charge.pixDemoCode}
                    </code>
                    <Button size="sm" variant="secondary" onClick={handleCopyCode}>
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                </div>

                {/* Simulator Controls for Testing */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <p className="text-xs font-medium text-[#E2BE72]">Simulador de Eventos do Pagamento</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Button
                      variant="emerald"
                      loading={processing}
                      onClick={() => handleSimulate('confirmado')}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Simular pagamento confirmado
                    </Button>
                    <Button
                      variant="secondary"
                      loading={processing}
                      onClick={() => handleSimulate('parcial')}
                    >
                      Simular pagamento parcial (50%)
                    </Button>
                    <Button
                      variant="secondary"
                      loading={processing}
                      onClick={() => handleSimulate('pendente')}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Simular em análise
                    </Button>
                    <Button
                      variant="danger"
                      loading={processing}
                      onClick={() => handleSimulate('erro')}
                    >
                      Simular falha de processamento
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Support Footer */}
            <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#B8BFCD]">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-[#E2BE72] shrink-0" />
                <span>
                  Dúvidas sobre esta cobrança? Suporte de {data.organization.name}:{' '}
                  <strong className="text-[#F6F1E8]">{data.organization.supportWhatsApp}</strong>
                </span>
              </div>
              <span className="text-[#9EA7BA]">{data.organization.email}</span>
            </Card>
          </>
        )}
      </main>

      <Modal
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        title="Comprovante Demonstrativo (Sem valor bancário)"
      >
        {data && (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-[#E2BE72]/30 bg-[#0B0D12] p-4 space-y-2">
              <p className="text-xs font-semibold text-[#E2BE72] text-center">
                DOCUMENTO DEMONSTRATIVO · NÃO É COMPROVANTE BANCÁRIO OFICIAL
              </p>
              <div className="border-t border-white/10 pt-2 space-y-1.5 text-xs text-[#B8BFCD]">
                <p>
                  Recebedor: <strong className="text-[#F6F1E8]">{data.organization.businessName}</strong>
                </p>
                <p>
                  Pagador: <strong className="text-[#F6F1E8]">{data.charge.clientName}</strong>
                </p>
                <p>
                  Referência: <strong className="text-[#F6F1E8]">{data.charge.description}</strong>
                </p>
                <p>
                  Valor liquidado (Demo):{' '}
                  <strong className="text-[#33C994] tabular-nums">{formatBRL(data.charge.paidCents)}</strong>
                </p>
                <p>
                  Identificador público: <span className="font-mono">{data.charge.publicId}</span>
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => window.print()}>
                Imprimir comprovante
              </Button>
              <Button onClick={() => setShowReceipt(false)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
