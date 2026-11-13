/**
 * Pure monetary arithmetic in integer centavos (no floating-point drift).
 */

export function formatBRL(cents: number): string {
  const safeCents = Math.round(Number.isFinite(cents) ? cents : 0);
  const reais = safeCents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(reais);
}

export function parseBRLToCents(input: string | number): number {
  if (typeof input === 'number') {
    return Math.max(0, Math.round(input * 100));
  }
  const cleaned = input
    .replace(/R\$/gi, '')
    .replace(/\s+/g, '')
    .trim();
  if (!cleaned) return 0;

  // Brazilian format: "1.250,50" or "250,00" or "250.50"
  const hasComma = cleaned.includes(',');
  const normalized = hasComma
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned;

  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

export function calculateDiscountedCents(amountCents: number, discountCents: number): number {
  const safeAmount = Math.max(0, Math.round(amountCents));
  const safeDiscount = Math.max(0, Math.min(safeAmount, Math.round(discountCents)));
  return safeAmount - safeDiscount;
}

export function calculateRemainingCents(
  amountCents: number,
  discountCents: number,
  paidCents: number
): number {
  const netTarget = calculateDiscountedCents(amountCents, discountCents);
  const safePaid = Math.max(0, Math.round(paidCents));
  return Math.max(0, netTarget - safePaid);
}

export function calculateEstimatedFeeCents(grossCents: number, feeBps: number): number {
  if (grossCents <= 0 || feeBps <= 0) return 0;
  return Math.round((grossCents * feeBps) / 10000);
}

export function calculateNetCents(grossCents: number, feeBps: number): {
  grossCents: number;
  feeCents: number;
  netCents: number;
} {
  const safeGross = Math.max(0, Math.round(grossCents));
  const feeCents = calculateEstimatedFeeCents(safeGross, feeBps);
  const netCents = Math.max(0, safeGross - feeCents);
  return { grossCents: safeGross, feeCents, netCents };
}
