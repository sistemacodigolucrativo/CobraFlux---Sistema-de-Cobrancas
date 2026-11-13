import type { RecurrenceFrequency, RecurrenceRule } from '../types/domain';

/**
 * All dates follow YYYY-MM-DD in Brazilian calendar semantics (America/Sao_Paulo).
 */
export function getTodaySaoPaulo(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === 'year')?.value ?? '2026';
  const m = parts.find((p) => p.type === 'month')?.value ?? '11';
  const d = parts.find((p) => p.type === 'day')?.value ?? '13';
  return `${y}-${m}-${d}`;
}

export function parseISODate(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map((n) => Number.parseInt(n, 10));
  return {
    year: Number.isFinite(y) ? y : 2026,
    month: Number.isFinite(m) ? m : 1,
    day: Number.isFinite(d) ? d : 1,
  };
}

export function formatISODate(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const { year, month, day } = parseISODate(dateStr.slice(0, 10));
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Clamps day 29/30/31 to the last valid day of shorter months (e.g., Feb 28/29, Apr 30).
 */
export function clampDueDayForMonth(year: number, month: number, preferredDay: number): string {
  const maxDay = getDaysInMonth(year, month);
  const clamped = Math.max(1, Math.min(preferredDay, maxDay));
  return formatISODate(year, month, clamped);
}

export function addDaysISO(dateStr: string, days: number): string {
  const { year, month, day } = parseISODate(dateStr);
  const dt = new Date(Date.UTC(year, month - 1, day + days));
  return formatISODate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function diffDaysISO(fromDateStr: string, toDateStr: string): number {
  const a = parseISODate(fromDateStr);
  const b = parseISODate(toDateStr);
  const msA = Date.UTC(a.year, a.month - 1, a.day);
  const msB = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((msB - msA) / 86400000);
}

export function computeCycleKey(dateStr: string, frequency: RecurrenceFrequency): string {
  const { year, month } = parseISODate(dateStr);
  if (frequency === 'mensal') {
    return `${year}-${String(month).padStart(2, '0')}`;
  }
  return dateStr;
}

export function computeNextRunDate(
  currentRunDate: string,
  frequency: RecurrenceFrequency,
  preferredDueDay: number,
  customIntervalDays = 15
): string {
  if (frequency === 'unica') {
    return currentRunDate;
  }
  if (frequency === 'semanal') {
    return addDaysISO(currentRunDate, 7);
  }
  if (frequency === 'personalizada') {
    const safeDays = Math.max(1, Math.round(customIntervalDays));
    return addDaysISO(currentRunDate, safeDays);
  }
  // Monthly: advance month by 1 and clamp preferredDueDay (handles 29/30/31 safely)
  const { year, month } = parseISODate(currentRunDate);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return clampDueDayForMonth(nextYear, nextMonth, preferredDueDay);
}

export function shouldGenerateCycle(
  rule: RecurrenceRule,
  referenceDate: string,
  existingCycleKeys: Set<string>
): { generate: boolean; reason?: string; cycleKey: string } {
  const cycleKey = computeCycleKey(rule.nextRunDate, rule.frequency);

  if (rule.status !== 'ativa') {
    return { generate: false, reason: 'Recorrência não está ativa', cycleKey };
  }
  if (rule.endDate && rule.nextRunDate > rule.endDate) {
    return { generate: false, reason: 'Recorrência atingiu data final', cycleKey };
  }
  if (rule.maxCycles && rule.generatedCyclesCount >= rule.maxCycles) {
    return { generate: false, reason: 'Limite de ciclos atingido', cycleKey };
  }
  if (existingCycleKeys.has(cycleKey) || rule.lastGeneratedCycleKey === cycleKey) {
    return { generate: false, reason: 'Ciclo já gerado (proteção contra duplicidade)', cycleKey };
  }
  if (rule.nextRunDate > referenceDate) {
    return { generate: false, reason: 'Próximo ciclo ainda não venceu a janela de geração', cycleKey };
  }
  return { generate: true, cycleKey };
}
