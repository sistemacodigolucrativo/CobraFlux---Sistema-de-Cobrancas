import {
  applyPaymentToCharge,
  applyRefundToCharge,
  canAddClientUnderPlan,
  canCancelCharge,
  canEditCharge,
} from '../domain/finance';
import { calculateNetCents } from '../domain/money';
import {
  addDaysISO,
  clampDueDayForMonth,
  computeCycleKey,
  computeNextRunDate,
  formatDateBR,
  shouldGenerateCycle,
} from '../domain/recurrence';
import type {
  AccountStatus,
  AuditLog,
  Charge,
  Client,
  DemoDatabaseSnapshot,
  ExportRecord,
  GlobalSettings,
  MessageJob,
  MessageTemplate,
  Organization,
  Payment,
  PlanTier,
  ProviderConnection,
  RecurrenceRule,
  Service,
  SubscriptionPlan,
  SupportTicket,
  User,
  UserPreferences,
} from '../types/domain';
import type { IGoldenBillingService } from './contracts';
import {
  loadDatabaseSnapshot,
  resetDatabaseSnapshot,
  saveDatabaseSnapshot,
} from './db';

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function publicToken(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let out = 'gb-';
  for (let i = 0; i < 9; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function nowIsoFromSimulated(simulatedDate: string): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${simulatedDate}T${hh}:${mm}:${ss}-03:00`;
}

function formatBRLInline(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

class DemoGoldenBillingService implements IGoldenBillingService {
  private async read(): Promise<DemoDatabaseSnapshot> {
    return loadDatabaseSnapshot();
  }

  private async write(snapshot: DemoDatabaseSnapshot): Promise<DemoDatabaseSnapshot> {
    await saveDatabaseSnapshot(snapshot);
    return snapshot;
  }

  private appendAudit(
    snap: DemoDatabaseSnapshot,
    orgId: string,
    actorName: string,
    actorRole: 'admin' | 'professional',
    action: string,
    entityType: string,
    entityId: string,
    details: string
  ) {
    const entry: AuditLog = {
      id: uid('aud'),
      organizationId: orgId,
      actorName,
      actorRole,
      action,
      entityType,
      entityId,
      details,
      createdAt: nowIsoFromSimulated(snap.simulatedDate),
    };
    snap.auditLogs = [entry, ...snap.auditLogs].slice(0, 200);
  }

  async getSnapshot(): Promise<DemoDatabaseSnapshot> {
    return this.read();
  }

  async switchDemoUser(userId: string): Promise<DemoDatabaseSnapshot> {
    const snap = await this.read();
    const exists = snap.users.some((u) => u.id === userId);
    if (exists) {
      snap.activeUserId = userId;
      await this.write(snap);
    }
    return snap;
  }

  async registerDemoProfessional(input: {
    name: string;
    businessName: string;
    category: string;
    email: string;
    phone: string;
    planId: PlanTier;
  }): Promise<{ ok: boolean; user?: User; error?: string }> {
    const snap = await this.read();
    const normalizedEmail = input.email.trim().toLowerCase();
    if (snap.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { ok: false, error: 'Já existe uma conta demonstrativa com este e-mail.' };
    }
    const nowISO = nowIsoFromSimulated(snap.simulatedDate);
    const orgId = uid('org');
    const userId = uid('usr');
    const plan = snap.subscriptionPlans.find((p) => p.id === input.planId) ?? snap.subscriptionPlans[0];

    const newOrg: Organization = {
      id: orgId,
      name: input.name.trim(),
      businessName: input.businessName.trim(),
      category: input.category.trim(),
      documentMasked: '***.000.000-**',
      phone: input.phone.trim(),
      email: normalizedEmail,
      supportWhatsApp: input.phone.trim(),
      status: 'ativo',
      estimatedFeeBps: 199,
      createdAt: nowISO,
    };

    const newUser: User = {
      id: userId,
      organizationId: orgId,
      name: input.name.trim(),
      email: normalizedEmail,
      role: 'professional',
      demoLabel: `Profissional · Plano ${plan.name}`,
      createdAt: nowISO,
    };

    snap.organizations.push(newOrg);
    snap.users.push(newUser);
    snap.subscriptions.push({
      id: uid('sub'),
      organizationId: orgId,
      planId: plan.id,
      status: 'ativa',
      currentPeriodStart: snap.simulatedDate,
      currentPeriodEnd: addDaysISO(snap.simulatedDate, 30),
      discountPercent: 0,
      messagesUsedThisMonth: 0,
      invoices:
        plan.monthlyPriceCents > 0
          ? [
              {
                id: uid('inv'),
                date: snap.simulatedDate,
                planName: plan.name,
                amountCents: plan.monthlyPriceCents,
                discountCents: 0,
                status: 'paga',
                description: `Adesão demonstrativa ${plan.name}`,
              },
            ]
          : [],
      updatedAt: nowISO,
    });

    snap.messageTemplates.push({
      id: uid('tpl'),
      organizationId: orgId,
      name: 'Dia do Vencimento (0 dias)',
      triggerType: 'no_vencimento',
      offsetDays: 0,
      content: 'Olá, {nome}! Sua cobrança de {valor} vence em {vencimento}. Acesse: {link}',
      active: true,
      suspendOnPayment: true,
      quietHoursStart: '21:00',
      quietHoursEnd: '08:00',
      maxPerClientPerWeek: 2,
    });

    snap.notifications.unshift({
      id: uid('not'),
      organizationId: orgId,
      category: 'sistema',
      title: 'Conta demonstrativa criada',
      message: `Bem-vindo(a) ao CobraFlux, ${newUser.name}. Seu ambiente já está pronto para testes.`,
      read: false,
      targetSection: 'inicio',
      createdAt: nowISO,
    });

    snap.activeUserId = userId;
    await this.write(snap);
    return { ok: true, user: newUser };
  }

  async resetDemoData(): Promise<DemoDatabaseSnapshot> {
    return resetDatabaseSnapshot();
  }

  async importDemoSnapshot(jsonText: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const parsed = JSON.parse(jsonText) as DemoDatabaseSnapshot;
      if (!parsed || !Array.isArray(parsed.users) || !Array.isArray(parsed.charges)) {
        return { ok: false, error: 'Arquivo JSON incompatível com o modelo CobraFlux.' };
      }
      await this.write(parsed);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Não foi possível interpretar o arquivo JSON.' };
    }
  }

  async advanceSimulatedDate(days: number): Promise<DemoDatabaseSnapshot> {
    const snap = await this.read();
    const newDate = addDaysISO(snap.simulatedDate, days);
    snap.simulatedDate = newDate;
    const nowISO = nowIsoFromSimulated(newDate);

    // Update overdue charges automatically
    for (const charge of snap.charges) {
      if (
        (charge.status === 'aguardando_pagamento' || charge.status === 'agendada') &&
        charge.dueDate < newDate
      ) {
        charge.status = 'vencida';
        charge.updatedAt = nowISO;
        charge.history.unshift({
          id: uid('his'),
          at: nowISO,
          actor: 'Simulador Temporal',
          origin: 'simulador',
          action: 'Cobrança vencida automaticamente',
          detail: `Data simulada avançou para ${formatDateBR(newDate)}`,
        });

        const client = snap.clients.find((c) => c.id === charge.clientId);
        if (client && client.status === 'ativo') {
          client.status = 'inadimplente';
          client.updatedAt = nowISO;
        }
      }
    }

    // Run recurrences across all orgs
    await this.write(snap);
    await this.runRecurrenceEngine();
    return this.read();
  }

  async createClient(
    orgId: string,
    input: Omit<Client, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'internalCode'>
  ): Promise<{ ok: boolean; client?: Client; error?: string }> {
    const snap = await this.read();
    const org = snap.organizations.find((o) => o.id === orgId);
    if (!org || org.status !== 'ativo') {
      return { ok: false, error: 'Organização suspensa ou bloqueada para novos cadastros.' };
    }

    const orgClients = snap.clients.filter((c) => c.organizationId === orgId && c.status !== 'arquivado');
    const sub = snap.subscriptions.find((s) => s.organizationId === orgId);
    const plan = snap.subscriptionPlans.find((p) => p.id === (sub?.planId ?? 'free')) ?? snap.subscriptionPlans[0];

    if (sub) {
      const check = canAddClientUnderPlan(orgClients.length, plan, sub);
      if (!check.allowed) {
        return { ok: false, error: check.reason };
      }
    }

    const nowISO = nowIsoFromSimulated(snap.simulatedDate);
    const client: Client = {
      ...input,
      id: uid('cli'),
      organizationId: orgId,
      internalCode: `CL-${String(snap.clients.filter((c) => c.organizationId === orgId).length + 1).padStart(3, '0')}`,
      createdAt: snap.simulatedDate,
      updatedAt: nowISO,
    };

    snap.clients.unshift(client);
    snap.consentRecords.unshift({
      id: uid('con'),
      organizationId: orgId,
      clientId: client.id,
      clientName: client.name,
      channel: 'whatsapp',
      granted: client.whatsappOptIn,
      source: 'Cadastro no painel profissional',
      updatedAt: nowISO,
    });

    this.appendAudit(snap, orgId, org.name, 'professional', 'CLIENTE_CRIADO', 'Client', client.id, `Cliente ${client.name} cadastrado.`);
    await this.write(snap);
    return { ok: true, client };
  }

  async updateClient(
    orgId: string,
    clientId: string,
    patch: Partial<Client>
  ): Promise<{ ok: boolean; error?: string }> {
    const snap = await this.read();
    const client = snap.clients.find((c) => c.id === clientId && c.organizationId === orgId);
    if (!client) return { ok: false, error: 'Cliente não encontrado nesta organização.' };

    // If reactivating an archived client, enforce plan cap
    if (client.status === 'arquivado' && patch.status && patch.status !== 'arquivado') {
      const activeCount = snap.clients.filter((c) => c.organizationId === orgId && c.status !== 'arquivado').length;
      const sub = snap.subscriptions.find((s) => s.organizationId === orgId);
      const plan = snap.subscriptionPlans.find((p) => p.id === (sub?.planId ?? 'free')) ?? snap.subscriptionPlans[0];
      if (sub) {
        const check = canAddClientUnderPlan(activeCount, plan, sub);
        if (!check.allowed) return { ok: false, error: check.reason };
      }
    }

    Object.assign(client, patch, { updatedAt: nowIsoFromSimulated(snap.simulatedDate) });
    await this.write(snap);
    return { ok: true };
  }

  async importClientsBatch(
    orgId: string,
    rows: Array<{
      name: string;
      phoneDdi: string;
      email: string;
      serviceName: string;
      monthlyFeeCents: number;
      preferredDueDay: number;
    }>
  ): Promise<{ ok: boolean; importedCount: number; error?: string }> {
    const snap = await this.read();
    const sub = snap.subscriptions.find((s) => s.organizationId === orgId);
    const plan = snap.subscriptionPlans.find((p) => p.id === (sub?.planId ?? 'free')) ?? snap.subscriptionPlans[0];

    if (!plan.allowCsvImport) {
      return {
        ok: false,
        importedCount: 0,
        error: 'A importação em lote via CSV está disponível a partir do plano Essencial.',
      };
    }

    const activeCount = snap.clients.filter((c) => c.organizationId === orgId && c.status !== 'arquivado').length;
    if (plan.maxClients !== null && activeCount + rows.length > plan.maxClients) {
      return {
        ok: false,
        importedCount: 0,
        error: `A importação excederia o limite de ${plan.maxClients} clientes do seu plano.`,
      };
    }

    const nowISO = nowIsoFromSimulated(snap.simulatedDate);
    let idx = snap.clients.filter((c) => c.organizationId === orgId).length;
    for (const row of rows) {
      idx += 1;
      const cliId = uid('cli');
      snap.clients.unshift({
        id: cliId,
        organizationId: orgId,
        internalCode: `CSV-${String(idx).padStart(3, '0')}`,
        name: row.name,
        phoneDdi: row.phoneDdi,
        email: row.email || undefined,
        serviceName: row.serviceName,
        monthlyFeeCents: row.monthlyFeeCents,
        preferredDueDay: row.preferredDueDay,
        status: 'ativo',
        notes: 'Importado via CSV',
        whatsappOptIn: true,
        createdAt: snap.simulatedDate,
        updatedAt: nowISO,
      });
    }

    this.appendAudit(snap, orgId, 'Importação CSV', 'professional', 'IMPORTACAO_CSV', 'Client', 'batch', `${rows.length} clientes importados.`);
    await this.write(snap);
    return { ok: true, importedCount: rows.length };
  }

  async createService(
    orgId: string,
    input: Omit<Service, 'id' | 'organizationId' | 'createdAt'>
  ): Promise<Service> {
    const snap = await this.read();
    const srv: Service = {
      ...input,
      id: uid('srv'),
      organizationId: orgId,
      createdAt: snap.simulatedDate,
    };
    snap.services.unshift(srv);
    await this.write(snap);
    return srv;
  }

  private scheduleRemindersForCharge(snap: DemoDatabaseSnapshot, charge: Charge, client: Client | undefined) {
    if (!client || !client.whatsappOptIn) return;
    if (charge.status !== 'aguardando_pagamento' && charge.status !== 'agendada' && charge.status !== 'vencida') return;

    const templates = snap.messageTemplates.filter((t) => t.organizationId === charge.organizationId && t.active);
    const nowISO = nowIsoFromSimulated(snap.simulatedDate);

    for (const tpl of templates) {
      const scheduledFor = addDaysISO(charge.dueDate, tpl.offsetDays);
      // Avoid duplicate jobs for same charge + template
      const exists = snap.messageJobs.some((j) => j.chargeId === charge.id && j.templateId === tpl.id);
      if (exists) continue;

      const rendered = tpl.content
        .replace(/\{nome\}/g, charge.clientName)
        .replace(/\{valor\}/g, formatBRLInline(charge.amountCents - charge.discountCents))
        .replace(/\{vencimento\}/g, formatDateBR(charge.dueDate))
        .replace(/\{link\}/g, `${window.location.origin}/#/pagar/${charge.publicId}`);

      const job: MessageJob = {
        id: uid('job'),
        organizationId: charge.organizationId,
        clientId: charge.clientId,
        clientName: charge.clientName,
        chargeId: charge.id,
        templateId: tpl.id,
        triggerType: tpl.triggerType,
        scheduledFor,
        renderedText: rendered,
        status: 'pendente',
        createdAt: nowISO,
        updatedAt: nowISO,
      };
      snap.messageJobs.unshift(job);
    }
  }

  async createCharge(
    orgId: string,
    input: {
      clientId: string;
      serviceId?: string;
      description: string;
      amountCents: number;
      discountCents?: number;
      dueDate: string;
      status?: 'rascunho' | 'aguardando_pagamento' | 'agendada';
    },
    actorName: string
  ): Promise<{ ok: boolean; charge?: Charge; error?: string }> {
    const snap = await this.read();
    const org = snap.organizations.find((o) => o.id === orgId);
    if (!org || org.status !== 'ativo') {
      return { ok: false, error: 'Conta suspensa ou bloqueada para emitir cobranças.' };
    }
    const sub = snap.subscriptions.find((s) => s.organizationId === orgId);
    if (sub && (sub.status === 'vencida' || sub.status === 'cancelada')) {
      return { ok: false, error: 'Assinatura vencida ou cancelada. Regularize em Minha Assinatura para emitir novas cobranças.' };
    }

    const client = snap.clients.find((c) => c.id === input.clientId && c.organizationId === orgId);
    if (!client) return { ok: false, error: 'Cliente inválido para esta organização.' };

    const nowISO = nowIsoFromSimulated(snap.simulatedDate);
    const pubId = publicToken();
    const initialStatus =
      input.status ?? (input.dueDate > snap.simulatedDate ? 'aguardando_pagamento' : 'aguardando_pagamento');

    const charge: Charge = {
      id: uid('chg'),
      publicId: pubId,
      organizationId: orgId,
      clientId: client.id,
      clientName: client.name,
      serviceId: input.serviceId,
      description: input.description.trim(),
      amountCents: Math.max(100, Math.round(input.amountCents)),
      discountCents: Math.max(0, Math.round(input.discountCents ?? 0)),
      paidCents: 0,
      refundedCents: 0,
      feeCents: 0,
      netCents: 0,
      dueDate: input.dueDate,
      status: initialStatus,
      pixDemoCode: `00020101021226830014br.gov.bcb.pix.demo2561goldenbilling.demo/pix/${pubId}5204000053039865802BR5925GOLDEN BILLING DEMO LTDA6009SAO PAULO62070503***6304DEMO`,
      history: [
        {
          id: uid('his'),
          at: nowISO,
          actor: actorName,
          origin: 'painel',
          action: 'Cobrança criada (Demo)',
          detail: `Valor ${formatBRLInline(input.amountCents)} · Vencimento ${formatDateBR(input.dueDate)}`,
        },
      ],
      createdAt: nowISO,
      updatedAt: nowISO,
    };

    snap.charges.unshift(charge);
    this.scheduleRemindersForCharge(snap, charge, client);
    this.appendAudit(snap, orgId, actorName, 'professional', 'COBRANCA_CRIADA', 'Charge', charge.id, charge.description);

    await this.write(snap);
    return { ok: true, charge };
  }

  async updateCharge(
    orgId: string,
    chargeId: string,
    patch: { description?: string; amountCents?: number; discountCents?: number; dueDate?: string },
    actorName: string
  ): Promise<{ ok: boolean; error?: string }> {
    const snap = await this.read();
    const charge = snap.charges.find((c) => c.id === chargeId && c.organizationId === orgId);
    if (!charge) return { ok: false, error: 'Cobrança não encontrada.' };
    if (!canEditCharge(charge.status)) {
      return { ok: false, error: `Cobranças em situação "${charge.status}" não podem ser editadas.` };
    }

    const nowISO = nowIsoFromSimulated(snap.simulatedDate);
    if (patch.description !== undefined) charge.description = patch.description.trim();
    if (patch.amountCents !== undefined) charge.amountCents = Math.max(100, Math.round(patch.amountCents));
    if (patch.discountCents !== undefined) {
      charge.discountCents = Math.max(0, Math.min(charge.amountCents, Math.round(patch.discountCents)));
    }
    if (patch.dueDate !== undefined) {
      charge.dueDate = patch.dueDate;
      if (charge.status === 'vencida' && patch.dueDate >= snap.simulatedDate) {
        charge.status = 'aguardando_pagamento';
      }
    }
    charge.updatedAt = nowISO;
    charge.history.unshift({
      id: uid('his'),
      at: nowISO,
      actor: actorName,
      origin: 'painel',
      action: 'Cobrança editada',
      detail: `Novo valor ${formatBRLInline(charge.amountCents)} (desc. ${formatBRLInline(charge.discountCents)}) · Venc. ${formatDateBR(charge.dueDate)}`,
    });

    await this.write(snap);
    return { ok: true };
  }

  async duplicateCharge(
    orgId: string,
    chargeId: string,
    newDueDate: string,
    actorName: string
  ): Promise<Charge | null> {
    const snap = await this.read();
    const orig = snap.charges.find((c) => c.id === chargeId && c.organizationId === orgId);
    if (!orig) return null;
    const res = await this.createCharge(
      orgId,
      {
        clientId: orig.clientId,
        serviceId: orig.serviceId,
        description: `${orig.description} (Cópia)`,
        amountCents: orig.amountCents,
        discountCents: orig.discountCents,
        dueDate: newDueDate,
        status: 'aguardando_pagamento',
      },
      actorName
    );
    return res.charge ?? null;
  }

  async cancelCharge(
    orgId: string,
    chargeId: string,
    reason: string,
    actorName: string
  ): Promise<{ ok: boolean; error?: string }> {
    const snap = await this.read();
    const charge = snap.charges.find((c) => c.id === chargeId && c.organizationId === orgId);
    if (!charge) return { ok: false, error: 'Cobrança não encontrada.' };
    if (!canCancelCharge(charge.status)) {
      return { ok: false, error: 'Cobrança já liquidada, cancelada ou estornada.' };
    }

    const nowISO = nowIsoFromSimulated(snap.simulatedDate);
    charge.status = 'cancelada';
    charge.updatedAt = nowISO;
    charge.history.unshift({
      id: uid('his'),
      at: nowISO,
      actor: actorName,
      origin: 'painel',
      action: 'Cobrança cancelada',
      detail: reason || 'Cancelada pelo profissional.',
    });

    // Cancel pending message jobs for this charge
    for (const job of snap.messageJobs) {
      if (job.chargeId === charge.id && job.status === 'pendente') {
        job.status = 'cancelada';
        job.reason = 'Cobrança cancelada.';
        job.updatedAt = nowISO;
      }
    }

    await this.write(snap);
    return { ok: true };
  }

  async getPublicCharge(publicId: string): Promise<{ charge: Charge; organization: Organization } | null> {
    const snap = await this.read();
    const charge = snap.charges.find((c) => c.publicId === publicId);
    if (!charge) return null;
    const org = snap.organizations.find((o) => o.id === charge.organizationId);
    if (!org) return null;
    return { charge, organization: org };
  }

  async simulatePayment(input: {
    chargeId: string;
    amountCents: number;
    method: Payment['method'];
    mode: 'confirmado' | 'parcial' | 'pendente' | 'duplicado' | 'erro';
    source: 'simulador' | 'pagina_publica' | 'manual' | 'admin';
    actorName: string;
    customIdempotencyKey?: string;
  }): Promise<{ ok: boolean; message: string }> {
    const snap = await this.read();
    const idx = snap.charges.findIndex((c) => c.id === input.chargeId);
    if (idx === -1) return { ok: false, message: 'Cobrança não encontrada.' };

    const charge = snap.charges[idx];
    const org = snap.organizations.find((o) => o.id === charge.organizationId);
    const nowISO = nowIsoFromSimulated(snap.simulatedDate);

    if (input.mode === 'pendente') {
      charge.status = 'em_analise';
      charge.updatedAt = nowISO;
      charge.history.unshift({
        id: uid('his'),
        at: nowISO,
        actor: input.actorName,
        origin: input.source === 'manual' ? 'painel' : input.source,
        action: 'Pagamento pendente em processamento (Demo)',
        detail: 'Aguardando liquidação compensada no simulador.',
      });
      snap.paymentEvents.unshift({
        id: uid('pev'),
        organizationId: charge.organizationId,
        chargeId: charge.id,
        type: 'pendente',
        amountCents: input.amountCents,
        idempotencyKey: uid('pend'),
        message: 'Pagamento Pix demonstrativo colocado em análise/pendente.',
        source: input.source,
        createdAt: nowISO,
      });
      await this.write(snap);
      return { ok: true, message: 'Pagamento colocado em análise (simulação pendente).' };
    }

    if (input.mode === 'erro') {
      snap.paymentEvents.unshift({
        id: uid('pev'),
        organizationId: charge.organizationId,
        chargeId: charge.id,
        type: 'erro_processamento',
        amountCents: input.amountCents,
        idempotencyKey: uid('err'),
        message: 'Falha simulada de comunicação com o provedor Pix.',
        source: input.source,
        createdAt: nowISO,
      });
      snap.notifications.unshift({
        id: uid('not'),
        organizationId: charge.organizationId,
        category: 'pagamento',
        title: 'Falha simulada no processamento',
        message: `Erro demonstrativo ao processar pagamento de ${charge.clientName}.`,
        read: false,
        targetSection: 'pagamentos',
        createdAt: nowISO,
      });
      await this.write(snap);
      return { ok: false, message: 'Erro simulado de processamento registrado no histórico.' };
    }

    // Duplicate simulation: reuse existing idempotencyKey if present
    const existingConfirmEvent = snap.paymentEvents.find(
      (ev) => ev.chargeId === charge.id && ev.type === 'confirmado'
    );
    const idempKey =
      input.mode === 'duplicado'
        ? existingConfirmEvent?.idempotencyKey ?? `dup_key_${charge.id}`
        : input.customIdempotencyKey ?? uid('idemp');

    if (input.mode === 'duplicado' && !existingConfirmEvent) {
      // Seed one first or block directly on already-paid
      if (charge.status !== 'paga') {
        snap.paymentEvents.unshift({
          id: uid('pev'),
          organizationId: charge.organizationId,
          chargeId: charge.id,
          type: 'duplicidade_bloqueada',
          amountCents: input.amountCents,
          idempotencyKey: idempKey,
          message: 'Simulação de tentativa duplicada interceptada com segurança.',
          source: input.source,
          createdAt: nowISO,
        });
        await this.write(snap);
        return { ok: false, message: 'Tentativa duplicada bloqueada pela trava de idempotência.' };
      }
    }

    const feeBps = org?.estimatedFeeBps ?? 199;
    const result = applyPaymentToCharge(
      charge,
      input.amountCents,
      feeBps,
      idempKey,
      snap.paymentEvents,
      nowISO,
      input.source,
      input.actorName
    );

    snap.paymentEvents.unshift(result.event);

    if (!result.ok) {
      await this.write(snap);
      return { ok: false, message: result.error ?? 'Pagamento não processado.' };
    }

    snap.charges[idx] = result.updatedCharge;
    const { feeCents, netCents } = calculateNetCents(result.event.amountCents, feeBps);

    const payment: Payment = {
      id: uid('pay'),
      organizationId: charge.organizationId,
      chargeId: charge.id,
      clientId: charge.clientId,
      clientName: charge.clientName,
      amountCents: result.event.amountCents,
      feeCents,
      netCents,
      method: input.method,
      status: 'confirmado',
      idempotencyKey: idempKey,
      isDemo: true,
      createdAt: nowISO,
    };
    snap.payments.unshift(payment);

    // If fully paid, suspend pending WhatsApp reminders & update client status if no more overdue charges
    if (result.updatedCharge.status === 'paga') {
      for (const job of snap.messageJobs) {
        if (job.chargeId === charge.id && job.status === 'pendente') {
          job.status = 'cancelada';
          job.reason = 'Suspenso automaticamente após confirmação do pagamento.';
          job.updatedAt = nowISO;
          snap.messageEvents.unshift({
            id: uid('mev'),
            organizationId: charge.organizationId,
            jobId: job.id,
            clientId: charge.clientId,
            clientName: charge.clientName,
            chargeId: charge.id,
            status: 'cancelada',
            summary: 'Lembrete suspenso automaticamente após pagamento confirmado.',
            isDemo: true,
            createdAt: nowISO,
          });
        }
      }

      const clientStillOverdue = snap.charges.some(
        (c) => c.clientId === charge.clientId && c.id !== charge.id && c.status === 'vencida'
      );
      if (!clientStillOverdue) {
        const cli = snap.clients.find((c) => c.id === charge.clientId);
        if (cli && cli.status === 'inadimplente') {
          cli.status = 'ativo';
          cli.updatedAt = nowISO;
        }
      }
    }

    snap.notifications.unshift({
      id: uid('not'),
      organizationId: charge.organizationId,
      category: 'pagamento',
      title:
        result.updatedCharge.status === 'paga'
          ? 'Pagamento confirmado (Demo)'
          : 'Pagamento parcial confirmado (Demo)',
      message: `${charge.clientName} · ${formatBRLInline(result.event.amountCents)} recebido em ambiente demonstrativo.`,
      read: false,
      targetSection: 'pagamentos',
      createdAt: nowISO,
    });

    this.appendAudit(
      snap,
      charge.organizationId,
      input.actorName,
      input.source === 'admin' ? 'admin' : 'professional',
      'PAGAMENTO_DEMO',
      'Charge',
      charge.id,
      `${result.event.type}: ${formatBRLInline(result.event.amountCents)}`
    );

    await this.write(snap);
    return {
      ok: true,
      message:
        result.updatedCharge.status === 'paga'
          ? 'Pagamento demonstrativo confirmado e painel atualizado.'
          : 'Pagamento parcial registrado. Saldo restante atualizado.',
    };
  }

  async simulateRefund(chargeId: string, reason: string, actorName: string): Promise<{ ok: boolean; message: string }> {
    const snap = await this.read();
    const idx = snap.charges.findIndex((c) => c.id === chargeId);
    if (idx === -1) return { ok: false, message: 'Cobrança não encontrada.' };

    const nowISO = nowIsoFromSimulated(snap.simulatedDate);
    const res = applyRefundToCharge(snap.charges[idx], nowISO, actorName, reason);
    snap.paymentEvents.unshift(res.event);

    if (!res.ok) {
      await this.write(snap);
      return { ok: false, message: res.error ?? 'Estorno não permitido.' };
    }

    snap.charges[idx] = res.updatedCharge;
    for (const p of snap.payments) {
      if (p.chargeId === chargeId && p.status === 'confirmado') {
        p.status = 'estornado';
      }
    }

    snap.notifications.unshift({
      id: uid('not'),
      organizationId: res.updatedCharge.organizationId,
      category: 'pagamento',
      title: 'Estorno demonstrativo registrado',
      message: `Estorno de ${formatBRLInline(res.event.amountCents)} para ${res.updatedCharge.clientName}. Histórico preservado.`,
      read: false,
      targetSection: 'pagamentos',
      createdAt: nowISO,
    });

    this.appendAudit(
      snap,
      res.updatedCharge.organizationId,
      actorName,
      'professional',
      'ESTORNO_DEMO',
      'Charge',
      chargeId,
      reason || 'Estorno demonstrativo'
    );

    await this.write(snap);
    return { ok: true, message: 'Estorno demonstrativo concluído mantendo histórico integral.' };
  }

  async createRecurrence(
    orgId: string,
    input: Omit<
      RecurrenceRule,
      'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'generatedCyclesCount' | 'nextRunDate'
    >,
    actorName: string
  ): Promise<{ ok: boolean; rule?: RecurrenceRule; error?: string }> {
    const snap = await this.read();
    const sub = snap.subscriptions.find((s) => s.organizationId === orgId);
    if (sub && (sub.status === 'vencida' || sub.status === 'cancelada')) {
      return { ok: false, error: 'Assinatura inativa. Regularize para criar novas recorrências.' };
    }

    const nowISO = nowIsoFromSimulated(snap.simulatedDate);
    const startParts = input.startDate.split('-').map((n) => Number.parseInt(n, 10));
    const initialNextRun =
      input.frequency === 'mensal'
        ? clampDueDayForMonth(startParts[0], startParts[1], input.dueDay)
        : input.startDate;

    const rule: RecurrenceRule = {
      ...input,
      id: uid('rec'),
      organizationId: orgId,
      nextRunDate: initialNextRun,
      generatedCyclesCount: 0,
      createdAt: snap.simulatedDate,
      updatedAt: nowISO,
    };

    snap.recurrenceRules.unshift(rule);
    this.appendAudit(snap, orgId, actorName, 'professional', 'RECORRENCIA_CRIADA', 'RecurrenceRule', rule.id, `${rule.description} (${rule.frequency})`);
    await this.write(snap);

    // Auto-run if nextRunDate <= simulatedDate
    await this.runRecurrenceEngine(orgId);
    return { ok: true, rule };
  }

  async updateRecurrence(
    orgId: string,
    ruleId: string,
    patch: Partial<Pick<RecurrenceRule, 'amountCents' | 'status' | 'dueDay' | 'endDate'>>,
    actorName: string
  ): Promise<void> {
    const snap = await this.read();
    const rule = snap.recurrenceRules.find((r) => r.id === ruleId && r.organizationId === orgId);
    if (!rule) return;
    Object.assign(rule, patch, { updatedAt: nowIsoFromSimulated(snap.simulatedDate) });
    this.appendAudit(snap, orgId, actorName, 'professional', 'RECORRENCIA_ATUALIZADA', 'RecurrenceRule', ruleId, `Status: ${rule.status}, Valor: ${formatBRLInline(rule.amountCents)}`);
    await this.write(snap);
  }

  async runRecurrenceEngine(orgId?: string): Promise<{ generatedCount: number; closedCount: number }> {
    const snap = await this.read();
    const nowISO = nowIsoFromSimulated(snap.simulatedDate);
    let generatedCount = 0;
    let closedCount = 0;

    for (const rule of snap.recurrenceRules) {
      if (orgId && rule.organizationId !== orgId) continue;
      if (rule.status !== 'ativa') continue;

      if (rule.endDate && rule.nextRunDate > rule.endDate) {
        rule.status = 'encerrada';
        rule.updatedAt = nowISO;
        closedCount += 1;
        continue;
      }

      const existingCycles = new Set(
        snap.charges
          .filter((c) => c.recurrenceRuleId === rule.id && c.cycleKey)
          .map((c) => c.cycleKey as string)
      );

      const check = shouldGenerateCycle(rule, snap.simulatedDate, existingCycles);
      if (check.generate) {
        const pubId = publicToken();
        const client = snap.clients.find((c) => c.id === rule.clientId);
        const newCharge: Charge = {
          id: uid('chg'),
          publicId: pubId,
          organizationId: rule.organizationId,
          clientId: rule.clientId,
          clientName: rule.clientName,
          serviceId: rule.serviceId,
          recurrenceRuleId: rule.id,
          cycleKey: check.cycleKey,
          description: `${rule.description} · Ciclo ${check.cycleKey}`,
          amountCents: rule.amountCents,
          discountCents: 0,
          paidCents: 0,
          refundedCents: 0,
          feeCents: 0,
          netCents: 0,
          dueDate: rule.nextRunDate,
          status: rule.nextRunDate < snap.simulatedDate ? 'vencida' : 'aguardando_pagamento',
          pixDemoCode: `00020101021226830014br.gov.bcb.pix.demo2561goldenbilling.demo/pix/${pubId}5204000053039865802BR5925GOLDEN BILLING DEMO LTDA6009SAO PAULO62070503***6304DEMO`,
          history: [
            {
              id: uid('his'),
              at: nowISO,
              actor: 'Motor de Recorrências',
              origin: 'recorrencia',
              action: 'Cobrança gerada automaticamente (Demo)',
              detail: `Ciclo ${check.cycleKey} · Vencimento ${formatDateBR(rule.nextRunDate)}`,
            },
          ],
          createdAt: nowISO,
          updatedAt: nowISO,
        };

        snap.charges.unshift(newCharge);
        this.scheduleRemindersForCharge(snap, newCharge, client);

        rule.lastGeneratedCycleKey = check.cycleKey;
        rule.generatedCyclesCount += 1;
        generatedCount += 1;

        if (rule.frequency === 'unica' || (rule.maxCycles && rule.generatedCyclesCount >= rule.maxCycles)) {
          rule.status = 'encerrada';
          closedCount += 1;
        } else {
          const next = computeNextRunDate(
            rule.nextRunDate,
            rule.frequency,
            rule.dueDay,
            rule.customIntervalDays
          );
          rule.nextRunDate = next;
          if (rule.endDate && next > rule.endDate) {
            rule.status = 'encerrada';
            closedCount += 1;
          }
        }
        rule.updatedAt = nowISO;
      }
    }

    if (generatedCount > 0 || closedCount > 0) {
      await this.write(snap);
    }
    return { generatedCount, closedCount };
  }

  async saveMessageTemplate(orgId: string, template: MessageTemplate): Promise<void> {
    const snap = await this.read();
    const idx = snap.messageTemplates.findIndex((t) => t.id === template.id && t.organizationId === orgId);
    if (idx >= 0) {
      snap.messageTemplates[idx] = template;
    } else {
      snap.messageTemplates.unshift({ ...template, id: uid('tpl'), organizationId: orgId });
    }
    await this.write(snap);
  }

  async runPendingReminders(orgId?: string): Promise<{ sentCount: number; failedCount: number; skippedCount: number }> {
    const snap = await this.read();
    const nowISO = nowIsoFromSimulated(snap.simulatedDate);
    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const job of snap.messageJobs) {
      if (orgId && job.organizationId !== orgId) continue;
      if (job.status !== 'pendente') continue;
      if (job.scheduledFor > snap.simulatedDate) continue;

      const charge = snap.charges.find((c) => c.id === job.chargeId);
      const client = snap.clients.find((c) => c.id === job.clientId);
      const sub = snap.subscriptions.find((s) => s.organizationId === job.organizationId);
      const plan = snap.subscriptionPlans.find((p) => p.id === (sub?.planId ?? 'free'));

      if (charge && (charge.status === 'paga' || charge.status === 'cancelada' || charge.status === 'estornada')) {
        job.status = 'cancelada';
        job.reason = 'Cobrança já finalizada.';
        job.updatedAt = nowISO;
        skippedCount += 1;
        continue;
      }

      if (client && !client.whatsappOptIn) {
        job.status = 'cancelada';
        job.reason = 'Cliente optou por não receber lembretes.';
        job.updatedAt = nowISO;
        skippedCount += 1;
        continue;
      }

      if (sub && plan && sub.messagesUsedThisMonth >= plan.monthlyMessageQuota) {
        job.status = 'falha';
        job.reason = `Franquia mensal de ${plan.monthlyMessageQuota} mensagens atingida.`;
        job.updatedAt = nowISO;
        failedCount += 1;
        snap.messageEvents.unshift({
          id: uid('mev'),
          organizationId: job.organizationId,
          jobId: job.id,
          clientId: job.clientId,
          clientName: job.clientName,
          chargeId: job.chargeId,
          status: 'falha',
          summary: job.reason,
          isDemo: true,
          createdAt: nowISO,
        });
        continue;
      }

      job.status = 'enviada';
      job.updatedAt = nowISO;
      sentCount += 1;
      if (sub) sub.messagesUsedThisMonth += 1;

      snap.messageEvents.unshift({
        id: uid('mev'),
        organizationId: job.organizationId,
        jobId: job.id,
        clientId: job.clientId,
        clientName: job.clientName,
        chargeId: job.chargeId,
        status: 'enviada',
        summary: `Lembrete (${job.triggerType}) enviado no simulador WhatsApp.`,
        isDemo: true,
        createdAt: nowISO,
      });
    }

    await this.write(snap);
    return { sentCount, failedCount, skippedCount };
  }

  async toggleClientConsent(orgId: string, clientId: string, granted: boolean, source: string): Promise<void> {
    const snap = await this.read();
    const client = snap.clients.find((c) => c.id === clientId && c.organizationId === orgId);
    if (!client) return;
    const nowISO = nowIsoFromSimulated(snap.simulatedDate);
    client.whatsappOptIn = granted;
    client.updatedAt = nowISO;

    snap.consentRecords.unshift({
      id: uid('con'),
      organizationId: orgId,
      clientId,
      clientName: client.name,
      channel: 'whatsapp',
      granted,
      source,
      updatedAt: nowISO,
    });

    if (!granted) {
      for (const job of snap.messageJobs) {
        if (job.clientId === clientId && job.status === 'pendente') {
          job.status = 'cancelada';
          job.reason = 'Cancelado por revogação de consentimento do cliente.';
          job.updatedAt = nowISO;
        }
      }
    }
    await this.write(snap);
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const snap = await this.read();
    const n = snap.notifications.find((item) => item.id === notificationId);
    if (n) n.read = true;
    await this.write(snap);
  }

  async markAllNotificationsRead(orgId: string): Promise<void> {
    const snap = await this.read();
    for (const n of snap.notifications) {
      if (n.organizationId === orgId) n.read = true;
    }
    await this.write(snap);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const snap = await this.read();
    snap.notifications = snap.notifications.filter((n) => n.id !== notificationId);
    await this.write(snap);
  }

  async saveUserPreferences(prefs: UserPreferences): Promise<void> {
    const snap = await this.read();
    const idx = snap.userPreferences.findIndex((p) => p.userId === prefs.userId);
    if (idx >= 0) {
      snap.userPreferences[idx] = prefs;
    } else {
      snap.userPreferences.push(prefs);
    }
    await this.write(snap);
  }

  async savePushPermission(
    orgId: string,
    permission: 'default' | 'granted' | 'denied' | 'unsupported',
    enabled: boolean
  ): Promise<void> {
    const snap = await this.read();
    const nowISO = nowIsoFromSimulated(snap.simulatedDate);
    const existing = snap.pushSubscriptions.find((p) => p.organizationId === orgId);
    if (existing) {
      existing.permission = permission;
      existing.enabled = enabled;
      existing.updatedAt = nowISO;
    } else {
      snap.pushSubscriptions.push({
        id: uid('push'),
        organizationId: orgId,
        permission,
        enabled,
        updatedAt: nowISO,
      });
    }
    await this.write(snap);
  }

  async updateOrganization(orgId: string, patch: Partial<Organization>): Promise<void> {
    const snap = await this.read();
    const org = snap.organizations.find((o) => o.id === orgId);
    if (org) {
      Object.assign(org, patch);
      await this.write(snap);
    }
  }

  async updateProviderConnection(conn: ProviderConnection): Promise<void> {
    const snap = await this.read();
    const idx = snap.providerConnections.findIndex((p) => p.id === conn.id);
    if (idx >= 0) {
      snap.providerConnections[idx] = { ...conn, updatedAt: nowIsoFromSimulated(snap.simulatedDate) };
    } else {
      snap.providerConnections.push({ ...conn, updatedAt: nowIsoFromSimulated(snap.simulatedDate) });
    }
    await this.write(snap);
  }

  async recordExport(
    orgId: string,
    format: 'CSV' | 'PDF',
    reportName: string,
    rowCount: number
  ): Promise<ExportRecord> {
    const snap = await this.read();
    const rec: ExportRecord = {
      id: uid('exp'),
      organizationId: orgId,
      format,
      reportName,
      rowCount,
      createdAt: nowIsoFromSimulated(snap.simulatedDate),
    };
    snap.exportRecords.unshift(rec);
    await this.write(snap);
    return rec;
  }

  async changeSubscriptionPlan(
    orgId: string,
    targetPlan: PlanTier,
    couponCode?: string
  ): Promise<{ ok: boolean; message: string }> {
    const snap = await this.read();
    const sub = snap.subscriptions.find((s) => s.organizationId === orgId);
    const plan = snap.subscriptionPlans.find((p) => p.id === targetPlan);
    if (!sub || !plan) return { ok: false, message: 'Assinatura ou plano não localizado.' };

    const nowISO = nowIsoFromSimulated(snap.simulatedDate);
    const normalizedCoupon = couponCode?.trim().toUpperCase();
    const discountPercent =
      normalizedCoupon === 'GOLDEN20' ? 20 : normalizedCoupon === 'BOASVINDAS' ? 15 : 0;

    const discountedPrice = Math.round(plan.monthlyPriceCents * (1 - discountPercent / 100));

    sub.planId = plan.id;
    sub.status = 'ativa';
    sub.currentPeriodStart = snap.simulatedDate;
    sub.currentPeriodEnd = addDaysISO(snap.simulatedDate, 30);
    sub.toleranceEndDate = undefined;
    sub.couponCode = discountPercent > 0 ? normalizedCoupon : undefined;
    sub.discountPercent = discountPercent;
    sub.updatedAt = nowISO;

    if (discountedPrice > 0) {
      sub.invoices.unshift({
        id: uid('inv'),
        date: snap.simulatedDate,
        planName: plan.name,
        amountCents: discountedPrice,
        discountCents: plan.monthlyPriceCents - discountedPrice,
        status: 'paga',
        description: `Migração para ${plan.name} (Demo)${discountPercent > 0 ? ` · Cupom ${normalizedCoupon}` : ''}`,
      });
    }

    // Important business rule: downgrade NEVER deletes existing clients.
    const activeCount = snap.clients.filter((c) => c.organizationId === orgId && c.status !== 'arquivado').length;
    const downgradeNote =
      plan.maxClients !== null && activeCount > plan.maxClients
        ? ` Seus ${activeCount} clientes existentes foram preservados, mas novos cadastros ficarão bloqueados até estar dentro do limite de ${plan.maxClients}.`
        : '';

    snap.notifications.unshift({
      id: uid('not'),
      organizationId: orgId,
      category: 'assinatura',
      title: `Plano atualizado para ${plan.name}`,
      message: `Mudança de plano concluída em modo demonstrativo.${downgradeNote}`,
      read: false,
      targetSection: 'assinatura',
      createdAt: nowISO,
    });

    this.appendAudit(snap, orgId, 'Assinatura SaaS', 'professional', 'MUDANCA_PLANO', 'Subscription', sub.id, `Novo plano: ${plan.name}`);
    await this.write(snap);
    return {
      ok: true,
      message: `Plano alterado para ${plan.name} com sucesso.${downgradeNote}`,
    };
  }

  async renewOrPaySubscription(orgId: string): Promise<{ ok: boolean; message: string }> {
    const snap = await this.read();
    const sub = snap.subscriptions.find((s) => s.organizationId === orgId);
    if (!sub) return { ok: false, message: 'Assinatura não encontrada.' };
    const plan = snap.subscriptionPlans.find((p) => p.id === sub.planId);
    const nowISO = nowIsoFromSimulated(snap.simulatedDate);

    sub.status = 'ativa';
    sub.currentPeriodStart = snap.simulatedDate;
    sub.currentPeriodEnd = addDaysISO(snap.simulatedDate, 30);
    sub.toleranceEndDate = undefined;
    sub.updatedAt = nowISO;

    for (const inv of sub.invoices) {
      if (inv.status === 'vencida' || inv.status === 'pendente') {
        inv.status = 'paga';
      }
    }

    if (plan && plan.monthlyPriceCents > 0) {
      sub.invoices.unshift({
        id: uid('inv'),
        date: snap.simulatedDate,
        planName: plan.name,
        amountCents: Math.round(plan.monthlyPriceCents * (1 - sub.discountPercent / 100)),
        discountCents: 0,
        status: 'paga',
        description: `Renovação demonstrativa ${plan.name}`,
      });
    }

    await this.write(snap);
    return { ok: true, message: 'Assinatura renovada e regularizada (Demo).' };
  }

  async cancelSubscription(orgId: string): Promise<{ ok: boolean; message: string }> {
    const snap = await this.read();
    const sub = snap.subscriptions.find((s) => s.organizationId === orgId);
    if (!sub) return { ok: false, message: 'Assinatura não encontrada.' };
    sub.status = 'cancelada';
    sub.updatedAt = nowIsoFromSimulated(snap.simulatedDate);
    await this.write(snap);
    return { ok: true, message: 'Assinatura marcada como cancelada no ambiente demonstrativo.' };
  }

  async adminSetOrganizationStatus(orgId: string, status: AccountStatus, reason: string): Promise<void> {
    const snap = await this.read();
    const org = snap.organizations.find((o) => o.id === orgId);
    if (!org) return;
    org.status = status;
    const nowISO = nowIsoFromSimulated(snap.simulatedDate);

    snap.notifications.unshift({
      id: uid('not'),
      organizationId: orgId,
      category: 'sistema',
      title: `Status da conta alterado para ${status}`,
      message: reason || 'Alteração efetuada pela Administração Geral.',
      read: false,
      targetSection: 'configuracoes',
      createdAt: nowISO,
    });

    this.appendAudit(snap, 'org_platform', 'Administrador Geral', 'admin', 'STATUS_CONTA', 'Organization', orgId, `${org.businessName} -> ${status}. ${reason}`);
    await this.write(snap);
  }

  async adminExpireSubscription(orgId: string): Promise<void> {
    const snap = await this.read();
    const sub = snap.subscriptions.find((s) => s.organizationId === orgId);
    if (!sub) return;
    const nowISO = nowIsoFromSimulated(snap.simulatedDate);
    sub.status = 'vencida';
    sub.currentPeriodEnd = addDaysISO(snap.simulatedDate, -3);
    sub.updatedAt = nowISO;

    const plan = snap.subscriptionPlans.find((p) => p.id === sub.planId);
    sub.invoices.unshift({
      id: uid('inv'),
      date: snap.simulatedDate,
      planName: plan?.name ?? sub.planId,
      amountCents: plan?.monthlyPriceCents ?? 0,
      discountCents: 0,
      status: 'vencida',
      description: 'Vencimento simulado pela Administração',
    });

    snap.notifications.unshift({
      id: uid('not'),
      organizationId: orgId,
      category: 'assinatura',
      title: 'Assinatura vencida (Simulação)',
      message: 'Sua assinatura foi marcada como vencida no simulador administrativo.',
      read: false,
      targetSection: 'assinatura',
      createdAt: nowISO,
    });

    this.appendAudit(snap, 'org_platform', 'Administrador Geral', 'admin', 'VENCER_ASSINATURA_DEMO', 'Subscription', sub.id, `Organização ${orgId}`);
    await this.write(snap);
  }

  async adminUpdatePlanConfig(plan: SubscriptionPlan): Promise<void> {
    const snap = await this.read();
    const idx = snap.subscriptionPlans.findIndex((p) => p.id === plan.id);
    if (idx >= 0) {
      snap.subscriptionPlans[idx] = plan;
      this.appendAudit(snap, 'org_platform', 'Administrador Geral', 'admin', 'CONFIG_PLANO', 'SubscriptionPlan', plan.id, `Preço ${formatBRLInline(plan.monthlyPriceCents)}, Limite clientes: ${plan.maxClients ?? 'Ilimitado'}`);
      await this.write(snap);
    }
  }

  async adminUpdateGlobalSettings(settings: GlobalSettings): Promise<void> {
    const snap = await this.read();
    snap.globalSettings = {
      ...settings,
      updatedAt: nowIsoFromSimulated(snap.simulatedDate),
    };
    this.appendAudit(snap, 'org_platform', 'Administrador Geral', 'admin', 'CONFIG_GLOBAL', 'GlobalSettings', 'global', 'Parâmetros globais e identidade atualizados.');
    await this.write(snap);
  }

  async adminBroadcastNotice(title: string, message: string): Promise<void> {
    const snap = await this.read();
    const nowISO = nowIsoFromSimulated(snap.simulatedDate);
    for (const org of snap.organizations) {
      if (org.id === 'org_platform') continue;
      snap.notifications.unshift({
        id: uid('not'),
        organizationId: org.id,
        category: 'sistema',
        title,
        message,
        read: false,
        targetSection: 'notificacoes',
        createdAt: nowISO,
      });
    }
    this.appendAudit(snap, 'org_platform', 'Administrador Geral', 'admin', 'COMUNICADO_GLOBAL', 'Notification', 'broadcast', title);
    await this.write(snap);
  }

  async createSupportTicket(
    orgId: string,
    orgName: string,
    subject: string,
    message: string
  ): Promise<SupportTicket> {
    const snap = await this.read();
    const tkt: SupportTicket = {
      id: uid('tkt'),
      organizationId: orgId,
      organizationName: orgName,
      subject: subject.trim(),
      message: message.trim(),
      status: 'aberto',
      createdAt: nowIsoFromSimulated(snap.simulatedDate),
    };
    snap.supportTickets.unshift(tkt);
    await this.write(snap);
    return tkt;
  }

  async adminUpdateTicketStatus(ticketId: string, status: SupportTicket['status']): Promise<void> {
    const snap = await this.read();
    const tkt = snap.supportTickets.find((t) => t.id === ticketId);
    if (tkt) {
      tkt.status = status;
      await this.write(snap);
    }
  }
}

export const demoBillingService: IGoldenBillingService = new DemoGoldenBillingService();
