import { z } from 'zod';
import type {
  Charge,
  ChargeStatus,
  Client,
  Organization,
  PaymentEvent,
  PlanTier,
  Subscription,
  SubscriptionPlan,
} from '../types/domain';
import {
  calculateDiscountedCents,
  calculateNetCents,
  calculateRemainingCents,
  parseBRLToCents,
} from './money';
import { diffDaysISO } from './recurrence';

export interface DashboardMetrics {
  receivedMonthCents: number;
  receivedPreviousMonthCents: number;
  monthGrowthPercent: number;
  expectedCents: number;
  overdueCents: number;
  activeClientsCount: number;
  overdueClientsCount: number;
  defaultRatePercent: number;
  upcomingCharges: Charge[];
  recentPaidCharges: Charge[];
  monthlySeries: Array<{
    month: string;
    recebido: number;
    previsto: number;
    atraso: number;
  }>;
}

export function canEditCharge(status: ChargeStatus): boolean {
  return status === 'rascunho' || status === 'aguardando_pagamento' || status === 'agendada' || status === 'vencida';
}

export function canCancelCharge(status: ChargeStatus): boolean {
  return status !== 'paga' && status !== 'cancelada' && status !== 'estornada';
}

export function applyPaymentToCharge(
  charge: Charge,
  paymentAmountCents: number,
  feeBps: number,
  idempotencyKey: string,
  existingEvents: PaymentEvent[],
  nowISO: string,
  source: 'simulador' | 'pagina_publica' | 'manual' | 'admin',
  actorName: string
): {
  ok: boolean;
  duplicate?: boolean;
  error?: string;
  updatedCharge: Charge;
  event: PaymentEvent;
} {
  if (existingEvents.some((ev) => ev.idempotencyKey === idempotencyKey && ev.type === 'confirmado')) {
    const dupEvent: PaymentEvent = {
      id: `pev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      organizationId: charge.organizationId,
      chargeId: charge.id,
      type: 'duplicidade_bloqueada',
      amountCents: paymentAmountCents,
      idempotencyKey,
      message: 'Tentativa de pagamento duplicado bloqueada pela chave de idempotência.',
      source,
      createdAt: nowISO,
    };
    return {
      ok: false,
      duplicate: true,
      error: 'Pagamento duplicado detectado e bloqueado.',
      updatedCharge: charge,
      event: dupEvent,
    };
  }

  if (charge.status === 'cancelada' || charge.status === 'estornada') {
    const errEvent: PaymentEvent = {
      id: `pev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      organizationId: charge.organizationId,
      chargeId: charge.id,
      type: 'erro_processamento',
      amountCents: paymentAmountCents,
      idempotencyKey,
      message: `Cobrança em situação "${charge.status}" não aceita novos pagamentos.`,
      source,
      createdAt: nowISO,
    };
    return {
      ok: false,
      error: errEvent.message,
      updatedCharge: charge,
      event: errEvent,
    };
  }

  const remainingBefore = calculateRemainingCents(
    charge.amountCents,
    charge.discountCents,
    charge.paidCents
  );

  if (remainingBefore <= 0 || charge.status === 'paga') {
    const dupEvent: PaymentEvent = {
      id: `pev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      organizationId: charge.organizationId,
      chargeId: charge.id,
      type: 'duplicidade_bloqueada',
      amountCents: paymentAmountCents,
      idempotencyKey,
      message: 'Cobrança já quitada integralmente. Liquidação duplicada evitada.',
      source,
      createdAt: nowISO,
    };
    return {
      ok: false,
      duplicate: true,
      error: dupEvent.message,
      updatedCharge: charge,
      event: dupEvent,
    };
  }

  const safePayment = Math.max(1, Math.min(paymentAmountCents, remainingBefore));
  const newPaidCents = charge.paidCents + safePayment;
  const totalPayable = calculateDiscountedCents(charge.amountCents, charge.discountCents);
  const isFullPaid = newPaidCents >= totalPayable;
  const newStatus: ChargeStatus = isFullPaid ? 'paga' : 'parcialmente_paga';

  const { feeCents, netCents } = calculateNetCents(newPaidCents, feeBps);

  const updatedCharge: Charge = {
    ...charge,
    paidCents: newPaidCents,
    feeCents,
    netCents,
    status: newStatus,
    paidAt: isFullPaid ? nowISO.slice(0, 10) : charge.paidAt,
    updatedAt: nowISO,
    history: [
      {
        id: `his_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        at: nowISO,
        actor: actorName,
        origin: source === 'manual' ? 'painel' : source,
        action: isFullPaid ? 'Pagamento confirmado (Demo)' : 'Pagamento parcial registrado (Demo)',
        detail: `Valor recebido: ${(safePayment / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      },
      ...charge.history,
    ],
  };

  const event: PaymentEvent = {
    id: `pev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    organizationId: charge.organizationId,
    chargeId: charge.id,
    type: isFullPaid ? 'confirmado' : 'parcial',
    amountCents: safePayment,
    idempotencyKey,
    message: isFullPaid
      ? 'Pagamento demonstrativo liquidado integralmente.'
      : 'Pagamento parcial demonstrativo abatido do saldo.',
    source,
    createdAt: nowISO,
  };

  return { ok: true, updatedCharge, event };
}

export function applyRefundToCharge(
  charge: Charge,
  nowISO: string,
  actorName: string,
  reason: string
): {
  ok: boolean;
  error?: string;
  updatedCharge: Charge;
  event: PaymentEvent;
} {
  if (charge.paidCents <= 0 || (charge.status !== 'paga' && charge.status !== 'parcialmente_paga')) {
    const errEvent: PaymentEvent = {
      id: `pev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      organizationId: charge.organizationId,
      chargeId: charge.id,
      type: 'erro_processamento',
      amountCents: 0,
      idempotencyKey: `refund_err_${charge.id}_${Date.now()}`,
      message: 'Apenas cobranças pagas ou parcialmente pagas podem ser estornadas.',
      source: 'simulador',
      createdAt: nowISO,
    };
    return { ok: false, error: errEvent.message, updatedCharge: charge, event: errEvent };
  }

  const refundedAmount = charge.paidCents;
  const updatedCharge: Charge = {
    ...charge,
    status: 'estornada',
    refundedCents: charge.refundedCents + refundedAmount,
    netCents: 0,
    updatedAt: nowISO,
    history: [
      {
        id: `his_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        at: nowISO,
        actor: actorName,
        origin: 'simulador',
        action: 'Estorno demonstrativo realizado',
        detail: reason || 'Estorno solicitado no simulador sem apagar o histórico original.',
      },
      ...charge.history,
    ],
  };

  const event: PaymentEvent = {
    id: `pev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    organizationId: charge.organizationId,
    chargeId: charge.id,
    type: 'estorno',
    amountCents: refundedAmount,
    idempotencyKey: `refund_${charge.id}_${Date.now()}`,
    message: `Estorno demonstrativo de ${(refundedAmount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrado preservando histórico.`,
    source: 'simulador',
    createdAt: nowISO,
  };

  return { ok: true, updatedCharge, event };
}

export function canAddClientUnderPlan(
  currentClientsCount: number,
  plan: SubscriptionPlan,
  subscription: Subscription
): { allowed: boolean; reason?: string } {
  if (subscription.status === 'vencida' || subscription.status === 'cancelada') {
    return {
      allowed: false,
      reason: 'Assinatura vencida ou cancelada. Regularize o plano para cadastrar novos clientes.',
    };
  }
  if (plan.maxClients !== null && currentClientsCount >= plan.maxClients) {
    return {
      allowed: false,
      reason: `Limite de ${plan.maxClients} clientes do plano ${plan.name} atingido. Seus clientes existentes permanecem preservados; faça upgrade para adicionar mais.`,
    };
  }
  return { allowed: true };
}

export function computeDashboardMetrics(
  charges: Charge[],
  clients: Client[],
  simulatedDate: string
): DashboardMetrics {
  const currentMonthPrefix = simulatedDate.slice(0, 7); // YYYY-MM
  const [yStr, mStr] = currentMonthPrefix.split('-');
  const y = Number.parseInt(yStr, 10);
  const m = Number.parseInt(mStr, 10);
  const prevMonth = m === 1 ? 12 : m - 1;
  const prevYear = m === 1 ? y - 1 : y;
  const prevMonthPrefix = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

  let receivedMonthCents = 0;
  let receivedPreviousMonthCents = 0;
  let expectedCents = 0;
  let overdueCents = 0;
  let totalBillableCents = 0;

  for (const ch of charges) {
    const netTarget = calculateDiscountedCents(ch.amountCents, ch.discountCents);
    const remaining = calculateRemainingCents(ch.amountCents, ch.discountCents, ch.paidCents);

    if (ch.status === 'paga' || ch.status === 'parcialmente_paga') {
      const refMonth = (ch.paidAt ?? ch.updatedAt).slice(0, 7);
      if (refMonth === currentMonthPrefix) {
        receivedMonthCents += ch.paidCents;
      } else if (refMonth === prevMonthPrefix) {
        receivedPreviousMonthCents += ch.paidCents;
      }
    }

    if (
      ch.status === 'aguardando_pagamento' ||
      ch.status === 'agendada' ||
      ch.status === 'parcialmente_paga' ||
      ch.status === 'em_analise'
    ) {
      expectedCents += remaining;
    }

    if (ch.status === 'vencida') {
      overdueCents += remaining;
    }

    if (ch.status !== 'cancelada' && ch.status !== 'rascunho' && ch.status !== 'estornada') {
      totalBillableCents += netTarget;
    }
  }

  const monthGrowthPercent =
    receivedPreviousMonthCents > 0
      ? Math.round(((receivedMonthCents - receivedPreviousMonthCents) / receivedPreviousMonthCents) * 100)
      : receivedMonthCents > 0
        ? 100
        : 0;

  const activeClientsCount = clients.filter((c) => c.status !== 'arquivado').length;
  const overdueClientsCount = clients.filter((c) => c.status === 'inadimplente').length;
  const defaultRatePercent =
    totalBillableCents > 0 ? Number(((overdueCents / totalBillableCents) * 100).toFixed(1)) : 0;

  const upcomingCharges = charges
    .filter(
      (c) =>
        (c.status === 'aguardando_pagamento' || c.status === 'agendada' || c.status === 'parcialmente_paga') &&
        diffDaysISO(simulatedDate, c.dueDate) >= -1 &&
        diffDaysISO(simulatedDate, c.dueDate) <= 14
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const recentPaidCharges = charges
    .filter((c) => c.status === 'paga' || c.status === 'parcialmente_paga')
    .sort((a, b) => (b.paidAt ?? b.updatedAt).localeCompare(a.paidAt ?? a.updatedAt))
    .slice(0, 5);

  // Build deterministic 6-month series ending at simulatedDate month
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthlySeries: DashboardMetrics['monthlySeries'] = [];
  for (let offset = 5; offset >= 0; offset--) {
    let targetMonth = m - offset;
    let targetYear = y;
    while (targetMonth <= 0) {
      targetMonth += 12;
      targetYear -= 1;
    }
    const prefix = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
    let rec = 0;
    let prev = 0;
    let atr = 0;
    for (const c of charges) {
      const duePrefix = c.dueDate.slice(0, 7);
      const paidPrefix = (c.paidAt ?? c.dueDate).slice(0, 7);
      if ((c.status === 'paga' || c.status === 'parcialmente_paga') && paidPrefix === prefix) {
        rec += c.paidCents;
      }
      if (
        (c.status === 'aguardando_pagamento' || c.status === 'agendada' || c.status === 'parcialmente_paga') &&
        duePrefix === prefix
      ) {
        prev += calculateRemainingCents(c.amountCents, c.discountCents, c.paidCents);
      }
      if (c.status === 'vencida' && duePrefix === prefix) {
        atr += calculateRemainingCents(c.amountCents, c.discountCents, c.paidCents);
      }
    }
    monthlySeries.push({
      month: `${monthNames[targetMonth - 1]}/${String(targetYear).slice(2)}`,
      recebido: Number((rec / 100).toFixed(2)),
      previsto: Number((prev / 100).toFixed(2)),
      atraso: Number((atr / 100).toFixed(2)),
    });
  }

  return {
    receivedMonthCents,
    receivedPreviousMonthCents,
    monthGrowthPercent,
    expectedCents,
    overdueCents,
    activeClientsCount,
    overdueClientsCount,
    defaultRatePercent,
    upcomingCharges,
    recentPaidCharges,
    monthlySeries,
  };
}

export function computeAdminSaaSMetrics(
  organizations: Organization[],
  subscriptions: Subscription[],
  plans: SubscriptionPlan[],
  charges: Charge[],
  sentMessagesCount: number,
  estimatedMsgCostCents: number,
  estimatedInfraCostPerOrgCents: number
) {
  const planMap = new Map<PlanTier, SubscriptionPlan>(plans.map((p) => [p.id, p]));
  let mrrCents = 0;
  let activePaidSubs = 0;
  let freeSubs = 0;
  let overdueOrCanceledSubs = 0;

  for (const sub of subscriptions) {
    const plan = planMap.get(sub.planId);
    if (!plan) continue;
    if (sub.status === 'ativa' || sub.status === 'tolerancia') {
      if (plan.monthlyPriceCents > 0) {
        const discounted = Math.round(plan.monthlyPriceCents * (1 - sub.discountPercent / 100));
        mrrCents += discounted;
        activePaidSubs += 1;
      } else {
        freeSubs += 1;
      }
    } else {
      overdueOrCanceledSubs += 1;
    }
  }

  const totalOrgs = organizations.length;
  const conversionRate =
    activePaidSubs + freeSubs > 0
      ? Number(((activePaidSubs / (activePaidSubs + freeSubs)) * 100).toFixed(1))
      : 0;

  // Strictly separate Professional GPV from Platform SaaS Revenue
  const managedGpvCents = charges
    .filter((c) => c.status === 'paga' || c.status === 'parcialmente_paga')
    .reduce((acc, c) => acc + c.paidCents, 0);

  const estimatedPlatformCostCents =
    totalOrgs * estimatedInfraCostPerOrgCents + sentMessagesCount * estimatedMsgCostCents;

  return {
    mrrCents,
    activePaidSubs,
    freeSubs,
    overdueOrCanceledSubs,
    conversionRate,
    managedGpvCents,
    estimatedPlatformCostCents,
    estimatedMarginCents: mrrCents - estimatedPlatformCostCents,
  };
}

export const clientSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome completo do cliente.'),
  phoneDdi: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, 'Informe o telefone com DDI (ex: +5511999998888).'),
  email: z.string().trim().email('E-mail inválido.').optional().or(z.literal('')),
  serviceName: z.string().trim().min(2, 'Informe o serviço contratado.'),
  monthlyFeeCents: z.number().int().min(100, 'Valor mínimo de R$ 1,00.'),
  preferredDueDay: z.number().int().min(1).max(31),
});

export interface CsvImportRowPreview {
  rowNumber: number;
  name: string;
  phoneDdi: string;
  email: string;
  serviceName: string;
  monthlyFeeCents: number;
  preferredDueDay: number;
  valid: boolean;
  errors: string[];
}

export function parseAndValidateClientsCsv(csvText: string): CsvImportRowPreview[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const firstLower = lines[0].toLowerCase();
  const startIdx =
    firstLower.includes('nome') || firstLower.includes('name') || firstLower.includes('telefone')
      ? 1
      : 0;

  const results: CsvImportRowPreview[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const separator = lines[i].includes(';') ? ';' : ',';
    const cols = lines[i].split(separator).map((c) => c.trim().replace(/^"|"$/g, ''));

    const name = cols[0] ?? '';
    const phoneRaw = (cols[1] ?? '').replace(/[\s()-]/g, '');
    const phoneDdi = phoneRaw.startsWith('+') ? phoneRaw : phoneRaw ? `+55${phoneRaw}` : '';
    const email = cols[2] ?? '';
    const serviceName = cols[3] ?? 'Plano Mensal';
    const monthlyFeeCents = parseBRLToCents(cols[4] ?? '0');
    const preferredDueDay = Number.parseInt(cols[5] ?? '10', 10) || 10;

    const validation = clientSchema.safeParse({
      name,
      phoneDdi,
      email,
      serviceName,
      monthlyFeeCents,
      preferredDueDay,
    });

    results.push({
      rowNumber: i + 1,
      name,
      phoneDdi,
      email,
      serviceName,
      monthlyFeeCents,
      preferredDueDay,
      valid: validation.success,
      errors: validation.success ? [] : validation.error.issues.map((iss) => iss.message),
    });
  }

  return results;
}
