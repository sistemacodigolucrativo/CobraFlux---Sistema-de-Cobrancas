import type {
  AccountStatus,
  AppNotification,
  AuditLog,
  Charge,
  Client,
  ConsentRecord,
  DemoDatabaseSnapshot,
  ExportRecord,
  GlobalSettings,
  MessageEvent,
  MessageJob,
  MessageTemplate,
  Organization,
  Payment,
  PaymentEvent,
  PlanTier,
  ProviderConnection,
  RecurrenceRule,
  Service,
  Subscription,
  SubscriptionPlan,
  SupportTicket,
  User,
  UserPreferences,
} from '../types/domain';

/**
 * Stable Service Layer Contracts.
 * Today backed by DemoService (IndexedDB).
 * Future production backend: swap DemoService with HttpApiService implementing these exact interfaces.
 */
export interface IGoldenBillingService {
  // Bootstrap & Demo Control
  getSnapshot(): Promise<DemoDatabaseSnapshot>;
  switchDemoUser(userId: string): Promise<DemoDatabaseSnapshot>;
  registerDemoProfessional(input: {
    name: string;
    businessName: string;
    category: string;
    email: string;
    phone: string;
    planId: PlanTier;
  }): Promise<{ ok: boolean; user?: User; error?: string }>;
  resetDemoData(): Promise<DemoDatabaseSnapshot>;
  importDemoSnapshot(jsonText: string): Promise<{ ok: boolean; error?: string }>;
  advanceSimulatedDate(days: number): Promise<DemoDatabaseSnapshot>;

  // Clients & Services (Organization-scoped)
  createClient(
    orgId: string,
    input: Omit<Client, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'internalCode'>
  ): Promise<{ ok: boolean; client?: Client; error?: string }>;
  updateClient(orgId: string, clientId: string, patch: Partial<Client>): Promise<{ ok: boolean; error?: string }>;
  importClientsBatch(
    orgId: string,
    rows: Array<{
      name: string;
      phoneDdi: string;
      email: string;
      serviceName: string;
      monthlyFeeCents: number;
      preferredDueDay: number;
    }>
  ): Promise<{ ok: boolean; importedCount: number; error?: string }>;
  createService(orgId: string, input: Omit<Service, 'id' | 'organizationId' | 'createdAt'>): Promise<Service>;

  // Charges & Public Links
  createCharge(
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
  ): Promise<{ ok: boolean; charge?: Charge; error?: string }>;
  updateCharge(
    orgId: string,
    chargeId: string,
    patch: { description?: string; amountCents?: number; discountCents?: number; dueDate?: string },
    actorName: string
  ): Promise<{ ok: boolean; error?: string }>;
  duplicateCharge(orgId: string, chargeId: string, newDueDate: string, actorName: string): Promise<Charge | null>;
  cancelCharge(orgId: string, chargeId: string, reason: string, actorName: string): Promise<{ ok: boolean; error?: string }>;
  getPublicCharge(publicId: string): Promise<{ charge: Charge; organization: Organization } | null>;

  // Payments Simulator (Demo Pix + Manual + Refunds)
  simulatePayment(input: {
    chargeId: string;
    amountCents: number;
    method: Payment['method'];
    mode: 'confirmado' | 'parcial' | 'pendente' | 'duplicado' | 'erro';
    source: 'simulador' | 'pagina_publica' | 'manual' | 'admin';
    actorName: string;
    customIdempotencyKey?: string;
  }): Promise<{ ok: boolean; message: string }>;
  simulateRefund(chargeId: string, reason: string, actorName: string): Promise<{ ok: boolean; message: string }>;

  // Recurrences
  createRecurrence(
    orgId: string,
    input: Omit<
      RecurrenceRule,
      'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'generatedCyclesCount' | 'nextRunDate'
    >,
    actorName: string
  ): Promise<{ ok: boolean; rule?: RecurrenceRule; error?: string }>;
  updateRecurrence(
    orgId: string,
    ruleId: string,
    patch: Partial<Pick<RecurrenceRule, 'amountCents' | 'status' | 'dueDay' | 'endDate'>>,
    actorName: string
  ): Promise<void>;
  runRecurrenceEngine(orgId?: string): Promise<{ generatedCount: number; closedCount: number }>;

  // WhatsApp Simulator & Consent
  saveMessageTemplate(orgId: string, template: MessageTemplate): Promise<void>;
  runPendingReminders(orgId?: string): Promise<{ sentCount: number; failedCount: number; skippedCount: number }>;
  toggleClientConsent(orgId: string, clientId: string, granted: boolean, source: string): Promise<void>;

  // Notifications & Preferences
  markNotificationRead(notificationId: string): Promise<void>;
  markAllNotificationsRead(orgId: string): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
  saveUserPreferences(prefs: UserPreferences): Promise<void>;
  savePushPermission(orgId: string, permission: 'default' | 'granted' | 'denied' | 'unsupported', enabled: boolean): Promise<void>;
  updateOrganization(orgId: string, patch: Partial<Organization>): Promise<void>;
  updateProviderConnection(conn: ProviderConnection): Promise<void>;
  recordExport(orgId: string, format: 'CSV' | 'PDF', reportName: string, rowCount: number): Promise<ExportRecord>;

  // Subscriptions (Professional)
  changeSubscriptionPlan(
    orgId: string,
    targetPlan: PlanTier,
    couponCode?: string
  ): Promise<{ ok: boolean; message: string }>;
  renewOrPaySubscription(orgId: string): Promise<{ ok: boolean; message: string }>;
  cancelSubscription(orgId: string): Promise<{ ok: boolean; message: string }>;

  // Admin Platform Management
  adminSetOrganizationStatus(orgId: string, status: AccountStatus, reason: string): Promise<void>;
  adminExpireSubscription(orgId: string): Promise<void>;
  adminUpdatePlanConfig(plan: SubscriptionPlan): Promise<void>;
  adminUpdateGlobalSettings(settings: GlobalSettings): Promise<void>;
  adminBroadcastNotice(title: string, message: string): Promise<void>;
  createSupportTicket(orgId: string, orgName: string, subject: string, message: string): Promise<SupportTicket>;
  adminUpdateTicketStatus(ticketId: string, status: SupportTicket['status']): Promise<void>;
}

export type ServiceRegistry = {
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
  providerConnections: ProviderConnection[];
  auditLogs: AuditLog[];
  consentRecords: ConsentRecord[];
};
