import type {
  AccountStatus,
  ChargeStatus,
  ClientStatus,
  MessageStatus,
  RecurrenceFrequency,
  RecurrenceStatus,
  ReminderTriggerType,
  SubscriptionStatus,
} from '../types/domain';

export function getChargeStatusLabel(status: ChargeStatus): string {
  const map: Record<ChargeStatus, string> = {
    rascunho: 'Rascunho',
    aguardando_pagamento: 'Aguardando pagamento',
    agendada: 'Agendada',
    paga: 'Paga',
    parcialmente_paga: 'Parcialmente paga',
    vencida: 'Vencida',
    cancelada: 'Cancelada',
    estornada: 'Estornada',
    em_analise: 'Em análise',
  };
  return map[status];
}

export function getChargeStatusColor(status: ChargeStatus): string {
  switch (status) {
    case 'paga':
      return 'text-[#33C994]';
    case 'parcialmente_paga':
    case 'em_analise':
      return 'text-[#E2BE72]';
    case 'vencida':
      return 'text-[#F16C79]';
    case 'cancelada':
    case 'estornada':
      return 'text-[#9EA7BA]';
    default:
      return 'text-[#F5D491]';
  }
}

export function getClientStatusLabel(status: ClientStatus): string {
  const map: Record<ClientStatus, string> = {
    ativo: 'Ativo',
    inadimplente: 'Inadimplente',
    arquivado: 'Arquivado',
  };
  return map[status];
}

export function getRecurrenceFrequencyLabel(freq: RecurrenceFrequency): string {
  const map: Record<RecurrenceFrequency, string> = {
    semanal: 'Semanal',
    mensal: 'Mensal',
    personalizada: 'Personalizada',
    unica: 'Cobrança única',
  };
  return map[freq];
}

export function getRecurrenceStatusLabel(status: RecurrenceStatus): string {
  const map: Record<RecurrenceStatus, string> = {
    ativa: 'Ativa',
    pausada: 'Suspensa',
    encerrada: 'Encerrada',
  };
  return map[status];
}

export function getMessageStatusLabel(status: MessageStatus): string {
  const map: Record<MessageStatus, string> = {
    enviada: 'Enviada',
    pendente: 'Pendente',
    falha: 'Falha',
    cancelada: 'Cancelada',
  };
  return map[status];
}

export function getReminderTriggerLabel(trigger: ReminderTriggerType): string {
  const map: Record<ReminderTriggerType, string> = {
    antes_3_dias: '3 dias antes',
    antes_1_dia: '1 dia antes',
    no_vencimento: 'No vencimento',
    depois_1_dia: '1 dia depois',
    depois_3_dias: '3 dias depois',
    personalizado: 'Personalizado',
  };
  return map[trigger];
}

export function getSubscriptionStatusLabel(status: SubscriptionStatus): string {
  const map: Record<SubscriptionStatus, string> = {
    ativa: 'Ativa',
    tolerancia: 'Em tolerância',
    vencida: 'Vencida',
    cancelada: 'Cancelada',
  };
  return map[status];
}

export function getAccountStatusLabel(status: AccountStatus): string {
  const map: Record<AccountStatus, string> = {
    ativo: 'Ativa',
    suspenso: 'Suspensa',
    bloqueado: 'Bloqueada',
  };
  return map[status];
}
