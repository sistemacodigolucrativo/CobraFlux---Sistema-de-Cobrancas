import { jsPDF } from 'jspdf';
import { formatBRL } from '../domain/money';
import { formatDateBR } from '../domain/recurrence';
import type { Charge, Organization } from '../types/domain';
import { getChargeStatusLabel } from './labels';

export function exportChargesToCsv(charges: Charge[], filenamePrefix = 'relatorio-golden-billing'): void {
  const header = [
    'ID Publico',
    'Cliente',
    'Descricao',
    'Vencimento',
    'Situacao',
    'Valor Bruto (BRL)',
    'Desconto (BRL)',
    'Valor Pago (BRL)',
    'Taxa Estimada (BRL)',
    'Liquido Estimado (BRL)',
  ];

  const rows = charges.map((c) => [
    c.publicId,
    `"${c.clientName.replace(/"/g, '""')}"`,
    `"${c.description.replace(/"/g, '""')}"`,
    formatDateBR(c.dueDate),
    getChargeStatusLabel(c.status),
    formatBRL(c.amountCents),
    formatBRL(c.discountCents),
    formatBRL(c.paidCents),
    formatBRL(c.feeCents),
    formatBRL(c.netCents),
  ]);

  const csvContent = '\uFEFF' + [header.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportChargesToPdf(
  charges: Charge[],
  organization: Organization,
  summary: {
    periodLabel: string;
    grossPaidCents: number;
    netEstimatedCents: number;
    overdueCents: number;
    partialCount: number;
  }
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFillColor(11, 13, 18);
  doc.rect(0, 0, 210, 34, 'F');
  doc.setTextColor(226, 190, 114);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GOLDEN BILLING SAAS — RELATÓRIO FINANCEIRO (DEMO)', 14, 15);

  doc.setTextColor(246, 241, 232);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${organization.businessName} · Período: ${summary.periodLabel}`, 14, 24);
  doc.text('Documento demonstrativo sem validade fiscal ou bancária', 14, 29);

  doc.setTextColor(20, 24, 32);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Receita Bruta Recebida: ${formatBRL(summary.grossPaidCents)}`, 14, 44);
  doc.text(`Receita Líquida Estimada: ${formatBRL(summary.netEstimatedCents)}`, 82, 44);
  doc.text(`Em Atraso: ${formatBRL(summary.overdueCents)}`, 152, 44);

  let y = 55;
  doc.setDrawColor(167, 137, 82);
  doc.line(14, y - 3, 196, y - 3);
  doc.setFontSize(8.5);
  doc.text('Cliente', 14, y);
  doc.text('Vencimento', 74, y);
  doc.text('Situação', 102, y);
  doc.text('Valor Bruto', 138, y);
  doc.text('Pago', 172, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  for (const ch of charges.slice(0, 32)) {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(ch.clientName.slice(0, 30), 14, y);
    doc.text(formatDateBR(ch.dueDate), 74, y);
    doc.text(getChargeStatusLabel(ch.status), 102, y);
    doc.text(formatBRL(ch.amountCents), 138, y);
    doc.text(formatBRL(ch.paidCents), 172, y);
    y += 6.2;
  }

  doc.save(`relatorio-${organization.id}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
