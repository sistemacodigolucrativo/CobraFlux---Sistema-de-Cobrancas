export type UserRole = 'admin' | 'professional';

export type AccountStatus = 'ativo' | 'suspenso' | 'bloqueado';

export type PlanTier = 'free' | 'essencial' | 'premium';

export type ClientStatus = 'ativo' | 'inadimplente' | 'arquivado';

export type ChargeStatus =
  | 'rascunho'
  | 'aguardando_pagamento'
  | 'agendada'
  | 'paga'
  | 'parcialmente_paga'
  | 'vencida'
  | 'cancelada'
  | 'estornada'
  | 'em_analise';

export type RecurrenceFrequency = 'semanal' | 'mensal' | 'personalizada' | 'unica';

export type RecurrenceStatus = 'ativa' | 'pausada' | 'encerrada';

export type PaymentMethod = 'pix_simulado' | 'manual_dinheiro' | 'manual_transferencia' | 'manual_cartao';

export type PaymentEventType =
  | 'criacao'
  | 'confirmado'
  | 'pendente'
  | 'parcial'
  | 'duplicidade_bloqueada'
  | 'erro_processamento'
  | 'estorno'
  | 'cancelamento'
  | 'vencimento_automatico'
  | 'edicao';

export type SubscriptionStatus = 'ativa' | 'tolerancia' | 'vencida' | 'cancelada';

export type MessageStatus = 'enviada' | 'pendente' | 'falha' | 'cancelada';

export type ReminderTriggerType =
  | 'antes_3_dias'
  | 'antes_1_dia'
  | 'no_vencimento'
  | 'depois_1_dia'
  | 'depois_3_dias'
  | 'personalizado';

export type NotificationCategory =
  | 'pagamento'
  | 'cobranca'
  | 'assinatura'
  | 'mensagem'
  | 'sistema';

// 1. Users
export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  demoLabel: string;
  createdAt: string;
}

// 2. Organizations
export interface Organization {
  id: string;
  name: string;
  businessName: string;
  category: string; // Personal trainer, Nutricionista, Consultor, Estética, etc.
  documentMasked: string; // CPF/CNPJ mascarado demonstrativo
  phone: string;
  email: string;
  supportWhatsApp: string;
  status: AccountStatus;
  estimatedFeeBps: number; // e.g., 199 = 1.99% taxa estimada de provedor futuro
  createdAt: string;
}

// 3. Clients
export interface Client {
  id: string;
  organizationId: string;
  internalCode: string;
  name: string;
  phoneDdi: string; // e.g., +5511999998888
  email?: string;
  serviceId?: string;
  serviceName: string;
  monthlyFeeCents: number;
  preferredDueDay: number; // 1..31
  status: ClientStatus;
  notes: string;
  whatsappOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

// 4. Services
export interface Service {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  defaultPriceCents: number;
  defaultFrequency: RecurrenceFrequency;
  active: boolean;
  createdAt: string;
}

// 5. Charges
export interface ChargeHistoryEntry {
  id: string;
  at: string;
  actor: string;
  origin: 'painel' | 'simulador' | 'recorrencia' | 'pagina_publica' | 'admin';
  action: string;
  detail: string;
}

export interface Charge {
  id: string;
  publicId: string; // Non-predictable token for public link
  organizationId: string;
  clientId: string;
  clientName: string;
  serviceId?: string;
  recurrenceRuleId?: string;
  cycleKey?: string; // e.g. "2026-11" to prevent duplicate recurrence generation
  description: string;
  amountCents: number;
  discountCents: number;
  paidCents: number;
  refundedCents: number;
  feeCents: number;
  netCents: number;
  dueDate: string; // YYYY-MM-DD (America/Sao_Paulo)
  paidAt?: string;
  status: ChargeStatus;
  pixDemoCode: string;
  history: ChargeHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

// 6. RecurrenceRules
export interface RecurrenceRule {
  id: string;
  organizationId: string;
  clientId: string;
  clientName: string;
  serviceId?: string;
  description: string;
  amountCents: number;
  frequency: RecurrenceFrequency;
  customIntervalDays?: number;
  dueDay: number; // 1..31
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  nextRunDate: string; // YYYY-MM-DD
  lastGeneratedCycleKey?: string;
  generatedCyclesCount: number;
  maxCycles?: number;
  status: RecurrenceStatus;
  createdAt: string;
  updatedAt: string;
}

// 7. Payments
export interface Payment {
  id: string;
  organizationId: string;
  chargeId: string;
  clientId: string;
  clientName: string;
  amountCents: number;
  feeCents: number;
  netCents: number;
  method: PaymentMethod;
  status: 'confirmado' | 'pendente' | 'falha' | 'estornado';
  idempotencyKey: string;
  isDemo: true;
  createdAt: string;
}

// 8. PaymentEvents
export interface PaymentEvent {
  id: string;
  organizationId: string;
  chargeId: string;
  paymentId?: string;
  type: PaymentEventType;
  amountCents: number;
  idempotencyKey: string;
  message: string;
  source: 'simulador' | 'pagina_publica' | 'manual' | 'admin';
  createdAt: string;
}

// 9. Subscriptions
export interface SubscriptionInvoice {
  id: string;
  date: string;
  planName: string;
  amountCents: number;
  discountCents: number;
  status: 'paga' | 'pendente' | 'vencida' | 'cancelada';
  description: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId: PlanTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  toleranceEndDate?: string;
  couponCode?: string;
  discountPercent: number;
  messagesUsedThisMonth: number;
  invoices: SubscriptionInvoice[];
  updatedAt: string;
}

// 10. SubscriptionPlans
export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  tagline: string;
  monthlyPriceCents: number;
  maxClients: number | null; // null = ilimitado
  monthlyMessageQuota: number;
  allowCsvImport: boolean;
  allowAdvancedReports: boolean;
  allowCustomBranding: boolean;
  features: string[];
}

// 11. MessageTemplates
export interface MessageTemplate {
  id: string;
  organizationId: string;
  name: string;
  triggerType: ReminderTriggerType;
  offsetDays: number; // -3, -1, 0, 1, 3, or custom
  content: string; // Uses {nome}, {valor}, {vencimento}, {link}
  active: boolean;
  suspendOnPayment: boolean;
  quietHoursStart: string; // "21:00"
  quietHoursEnd: string; // "08:00"
  maxPerClientPerWeek: number;
}

// 12. MessageJobs
export interface MessageJob {
  id: string;
  organizationId: string;
  clientId: string;
  clientName: string;
  chargeId: string;
  templateId: string;
  triggerType: ReminderTriggerType;
  scheduledFor: string; // YYYY-MM-DD
  renderedText: string;
  status: MessageStatus;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

// 13. MessageEvents
export interface MessageEvent {
  id: string;
  organizationId: string;
  jobId: string;
  clientId: string;
  clientName: string;
  chargeId: string;
  status: MessageStatus;
  summary: string;
  isDemo: true;
  createdAt: string;
}

// 14. Notifications
export interface AppNotification {
  id: string;
  organizationId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  read: boolean;
  targetSection?: string;
  createdAt: string;
}

// 15. PushSubscriptions
export interface PushSubscriptionRecord {
  id: string;
  organizationId: string;
  permission: 'default' | 'granted' | 'denied' | 'unsupported';
  enabled: boolean;
  updatedAt: string;
}

// 16. ProviderConnections
export interface ProviderConnection {
  id: string;
  organizationId: string;
  provider: 'asaas' | 'mercado_pago' | 'efi' | 'whatsapp_business' | 'resend_email';
  label: string;
  status: 'nao_configurado' | 'homologacao_demo' | 'pronto_para_integracao';
  accountAlias?: string;
  webhookEndpointTemplate: string;
  updatedAt: string;
}

// 17. AuditLogs
export interface AuditLog {
  id: string;
  organizationId: string; // 'platform' for global admin actions
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

// 18. UserPreferences
export interface UserPreferences {
  userId: string;
  soundEnabled: boolean;
  soundVolume: number; // 0..1
  reduceMotion: boolean;
  browserNotificationsEnabled: boolean;
  compactTables: boolean;
}

// 19. ConsentRecords
export interface ConsentRecord {
  id: string;
  organizationId: string;
  clientId: string;
  clientName: string;
  channel: 'whatsapp' | 'email';
  granted: boolean;
  source: string;
  updatedAt: string;
}

// 20. GlobalSettings
export interface GlobalSettings {
  platformName: string;
  accentGoldHex: string;
  accentPinkHex: string;
  transactionFeeEnabled: boolean;
  transactionFeeBps: number;
  estimatedMsgCostCents: number; // Custo estimado por mensagem WhatsApp para análise SaaS
  estimatedInfraCostPerOrgCents: number;
  maintenanceBanner?: string;
  featureFlags: {
    csvImportEnabled: boolean;
    pdfExportEnabled: boolean;
    whatsappSimulatorEnabled: boolean;
    publicPaymentSimulatorEnabled: boolean;
  };
  supportEmail: string;
  supportPhone: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  organizationId: string;
  organizationName: string;
  subject: string;
  message: string;
  status: 'aberto' | 'em_atendimento' | 'resolvido';
  createdAt: string;
}

export interface ExportRecord {
  id: string;
  organizationId: string;
  format: 'CSV' | 'PDF';
  reportName: string;
  rowCount: number;
  createdAt: string;
}

export interface DemoDatabaseSnapshot {
  version: number;
  simulatedDate: string; // YYYY-MM-DD
  activeUserId: string;
  users: User[];
  organizations: Organization[];
  clients: Client[];
  services: Service[];
  charges: Charge[];
  recurrenceRules: RecurrenceRule[];
  payments: Payment[];
  paymentEvents: PaymentEvent[];
  subscriptions: Subscription[];
  subscriptionPlans: SubscriptionPlan[];
  messageTemplates: MessageTemplate[];
  messageJobs: MessageJob[];
  messageEvents: MessageEvent[];
  notifications: AppNotification[];
  pushSubscriptions: PushSubscriptionRecord[];
  providerConnections: ProviderConnection[];
  auditLogs: AuditLog[];
  userPreferences: UserPreferences[];
  consentRecords: ConsentRecord[];
  globalSettings: GlobalSettings;
  supportTickets: SupportTicket[];
  exportRecords: ExportRecord[];
}
