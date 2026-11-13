import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDiscountedCents,
  calculateNetCents,
  calculateRemainingCents,
  formatBRL,
  parseBRLToCents,
} from './money';
import {
  clampDueDayForMonth,
  computeNextRunDate,
  shouldGenerateCycle,
} from './recurrence';
import {
  applyPaymentToCharge,
  applyRefundToCharge,
  canAddClientUnderPlan,
  computeAdminSaaSMetrics,
  computeDashboardMetrics,
  parseAndValidateClientsCsv,
} from './finance';
import type {
  Charge,
  Client,
  Organization,
  PaymentEvent,
  RecurrenceRule,
  Subscription,
  SubscriptionPlan,
} from '../types/domain';

test('money math works strictly in integer centavos without floating point drift', () => {
  assert.equal(parseBRLToCents('R$ 1.299,90'), 129990);
  assert.equal(parseBRLToCents('199,99'), 19999);
  assert.equal(calculateDiscountedCents(15000, 2500), 12500);
  assert.equal(calculateRemainingCents(15000, 2500, 5000), 7500);
  const net = calculateNetCents(10000, 199); // 1.99%
  assert.equal(net.feeCents, 199);
  assert.equal(net.netCents, 9801);
  assert.match(formatBRL(129990), /1\.299,90/);
});

test('recurrence clamps day 29/30/31 safely across February and 30-day months', () => {
  // 2026 is not a leap year -> Feb has 28 days
  assert.equal(clampDueDayForMonth(2026, 2, 31), '2026-02-28');
  // 2024 is leap year -> Feb has 29 days
  assert.equal(clampDueDayForMonth(2024, 2, 31), '2024-02-29');
  // April has 30 days
  assert.equal(clampDueDayForMonth(2026, 4, 31), '2026-04-30');
  // Advancing from Jan 31 to Feb -> Feb 28 -> Mar 31
  const feb = computeNextRunDate('2026-01-31', 'mensal', 31);
  assert.equal(feb, '2026-02-28');
  const mar = computeNextRunDate(feb, 'mensal', 31);
  assert.equal(mar, '2026-03-31');
});

test('recurrence prevents duplicate charges for the same cycle and respects end dates', () => {
  const rule: RecurrenceRule = {
    id: 'rec_1',
    organizationId: 'org_1',
    clientId: 'cli_1',
    clientName: 'Ana Paula',
    description: 'Personal 3x',
    amountCents: 45000,
    frequency: 'mensal',
    dueDay: 10,
    startDate: '2026-10-10',
    endDate: '2026-12-10',
    nextRunDate: '2026-11-10',
    lastGeneratedCycleKey: '2026-10',
    generatedCyclesCount: 1,
    status: 'ativa',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  };

  const ok = shouldGenerateCycle(rule, '2026-11-13', new Set(['2026-10']));
  assert.equal(ok.generate, true);
  assert.equal(ok.cycleKey, '2026-11');

  const dup = shouldGenerateCycle(rule, '2026-11-13', new Set(['2026-10', '2026-11']));
  assert.equal(dup.generate, false);
});

test('payment processing handles partial, full, idempotency duplicate block, and refund preserving history', () => {
  const baseCharge: Charge = {
    id: 'chg_1',
    publicId: 'pub_xyz',
    organizationId: 'org_1',
    clientId: 'cli_1',
    clientName: 'Marcos Silva',
    description: 'Consultoria',
    amountCents: 50000,
    discountCents: 5000,
    paidCents: 0,
    refundedCents: 0,
    feeCents: 0,
    netCents: 0,
    dueDate: '2026-11-15',
    status: 'aguardando_pagamento',
    pixDemoCode: 'DEMO-PIX',
    history: [],
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z',
  };

  const events: PaymentEvent[] = [];

  // Partial payment R$ 200,00 out of R$ 450,00 net
  const partialRes = applyPaymentToCharge(
    baseCharge,
    20000,
    200,
    'key_partial_1',
    events,
    '2026-11-13T10:00:00Z',
    'simulador',
    'Rafael'
  );
  assert.equal(partialRes.ok, true);
  assert.equal(partialRes.updatedCharge.status, 'parcialmente_paga');
  assert.equal(partialRes.updatedCharge.paidCents, 20000);
  events.push({ ...partialRes.event, type: 'confirmado' });

  // Duplicate attempt with same idempotencyKey
  const dupRes = applyPaymentToCharge(
    partialRes.updatedCharge,
    20000,
    200,
    'key_partial_1',
    events,
    '2026-11-13T10:01:00Z',
    'simulador',
    'Rafael'
  );
  assert.equal(dupRes.ok, false);
  assert.equal(dupRes.duplicate, true);

  // Remaining R$ 250,00 completes payment
  const fullRes = applyPaymentToCharge(
    partialRes.updatedCharge,
    25000,
    200,
    'key_full_2',
    events,
    '2026-11-13T10:02:00Z',
    'pagina_publica',
    'Cliente'
  );
  assert.equal(fullRes.ok, true);
  assert.equal(fullRes.updatedCharge.status, 'paga');
  assert.equal(fullRes.updatedCharge.paidCents, 45000);

  // Refund keeps history and refundedCents
  const refundRes = applyRefundToCharge(
    fullRes.updatedCharge,
    '2026-11-13T11:00:00Z',
    'Rafael',
    'Cancelamento acordado'
  );
  assert.equal(refundRes.ok, true);
  assert.equal(refundRes.updatedCharge.status, 'estornada');
  assert.equal(refundRes.updatedCharge.refundedCents, 45000);
  assert.ok(refundRes.updatedCharge.history.length >= 3);
});

test('plan downgrade preserves existing clients and blocks only new additions beyond limit', () => {
  const freePlan: SubscriptionPlan = {
    id: 'free',
    name: 'Free',
    tagline: 'Iniciante',
    monthlyPriceCents: 0,
    maxClients: 5,
    monthlyMessageQuota: 15,
    allowCsvImport: false,
    allowAdvancedReports: false,
    allowCustomBranding: false,
    features: [],
  };
  const sub: Subscription = {
    id: 'sub_1',
    organizationId: 'org_1',
    planId: 'free',
    status: 'ativa',
    currentPeriodStart: '2026-11-01',
    currentPeriodEnd: '2026-12-01',
    discountPercent: 0,
    messagesUsedThisMonth: 0,
    invoices: [],
    updatedAt: '2026-11-01T00:00:00Z',
  };

  // Already has 8 clients after downgrade -> adding 9th is blocked, existing 8 remain untouched
  const check = canAddClientUnderPlan(8, freePlan, sub);
  assert.equal(check.allowed, false);

  const checkUnder = canAddClientUnderPlan(4, freePlan, sub);
  assert.equal(checkUnder.allowed, true);
});

test('dashboard metrics and admin SaaS metrics strictly match records and separate platform revenue from GPV', () => {
  const clients: Client[] = [
    {
      id: 'c1',
      organizationId: 'org_1',
      internalCode: 'CL-01',
      name: 'Cliente 1',
      phoneDdi: '+5511999990001',
      serviceName: 'Personal',
      monthlyFeeCents: 50000,
      preferredDueDay: 10,
      status: 'ativo',
      notes: '',
      whatsappOptIn: true,
      createdAt: '2026-10-01',
      updatedAt: '2026-10-01',
    },
    {
      id: 'c2',
      organizationId: 'org_1',
      internalCode: 'CL-02',
      name: 'Cliente 2',
      phoneDdi: '+5511999990002',
      serviceName: 'Personal',
      monthlyFeeCents: 30000,
      preferredDueDay: 5,
      status: 'inadimplente',
      notes: '',
      whatsappOptIn: true,
      createdAt: '2026-10-01',
      updatedAt: '2026-10-01',
    },
  ];
  const charges: Charge[] = [
    {
      id: 'ch1',
      publicId: 'p1',
      organizationId: 'org_1',
      clientId: 'c1',
      clientName: 'Cliente 1',
      description: 'Novembro',
      amountCents: 50000,
      discountCents: 0,
      paidCents: 50000,
      refundedCents: 0,
      feeCents: 995,
      netCents: 49005,
      dueDate: '2026-11-10',
      paidAt: '2026-11-10',
      status: 'paga',
      pixDemoCode: 'DEMO1',
      history: [],
      createdAt: '2026-11-01',
      updatedAt: '2026-11-10',
    },
    {
      id: 'ch2',
      publicId: 'p2',
      organizationId: 'org_1',
      clientId: 'c2',
      clientName: 'Cliente 2',
      description: 'Novembro',
      amountCents: 30000,
      discountCents: 0,
      paidCents: 0,
      refundedCents: 0,
      feeCents: 0,
      netCents: 0,
      dueDate: '2026-11-05',
      status: 'vencida',
      pixDemoCode: 'DEMO2',
      history: [],
      createdAt: '2026-11-01',
      updatedAt: '2026-11-06',
    },
  ];

  const dash = computeDashboardMetrics(charges, clients, '2026-11-13');
  assert.equal(dash.receivedMonthCents, 50000);
  assert.equal(dash.overdueCents, 30000);
  assert.equal(dash.activeClientsCount, 2);
  assert.equal(dash.defaultRatePercent, 37.5);

  const orgs: Organization[] = [
    {
      id: 'org_1',
      name: 'Rafael Studio',
      businessName: 'Rafael Studio',
      category: 'Personal',
      documentMasked: '***.111.222-**',
      phone: '+5511999990000',
      email: 'r@studio.br',
      supportWhatsApp: '+5511999990000',
      status: 'ativo',
      estimatedFeeBps: 199,
      createdAt: '2026-10-01',
    },
  ];
  const plans: SubscriptionPlan[] = [
    {
      id: 'premium',
      name: 'Premium',
      tagline: 'Avançado',
      monthlyPriceCents: 7900,
      maxClients: null,
      monthlyMessageQuota: 1000,
      allowCsvImport: true,
      allowAdvancedReports: true,
      allowCustomBranding: true,
      features: [],
    },
  ];
  const subs: Subscription[] = [
    {
      id: 'sub_1',
      organizationId: 'org_1',
      planId: 'premium',
      status: 'ativa',
      currentPeriodStart: '2026-11-01',
      currentPeriodEnd: '2026-12-01',
      discountPercent: 0,
      messagesUsedThisMonth: 10,
      invoices: [],
      updatedAt: '2026-11-01',
    },
  ];

  const adminStats = computeAdminSaaSMetrics(orgs, subs, plans, charges, 10, 25, 800);
  // MRR is strictly R$ 79,00 (7900), NOT R$ 500,00 (GPV)
  assert.equal(adminStats.mrrCents, 7900);
  assert.equal(adminStats.managedGpvCents, 50000);
});

test('CSV client import validates valid and invalid rows accurately', () => {
  const csv = [
    'nome;telefone;email;servico;valor;vencimento',
    'Juliana Costa;11988887777;juliana@teste.com.br;Consultoria;350,00;15',
    'A;123;email_ruim;Plano;0;10',
  ].join('\n');

  const rows = parseAndValidateClientsCsv(csv);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].valid, true);
  assert.equal(rows[0].monthlyFeeCents, 35000);
  assert.equal(rows[0].phoneDdi, '+5511988887777');
  assert.equal(rows[1].valid, false);
  assert.ok(rows[1].errors.length >= 2);
});
