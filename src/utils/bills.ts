import type { Bill, BillSnapshot, BillPaymentEntry, CcPaymentEntry } from '../types';

export function getEntry(snapshot: BillSnapshot, billId: string): BillPaymentEntry | null {
  return snapshot.entries.find((e) => e.billId === billId) ?? null;
}

export function computeSnapshotTotal(snapshot: BillSnapshot): number {
  return snapshot.entries.reduce((sum, e) => sum + e.amount, 0);
}

export function computeSnapshotPaidTotal(snapshot: BillSnapshot): number {
  return snapshot.entries.filter((e) => e.paid).reduce((sum, e) => sum + e.amount, 0);
}

export function isAllBillsPaid(snapshot: BillSnapshot, bills: Bill[]): boolean {
  if (bills.length === 0) return false;
  return bills.every((b) => snapshot.entries.find((e) => e.billId === b.id)?.paid === true);
}

export function getCcEntry(snapshot: BillSnapshot, cardId: string): CcPaymentEntry | null {
  return snapshot.ccEntries.find((e) => e.cardId === cardId) ?? null;
}

export function computeCcSnapshotTotal(snapshot: BillSnapshot): number {
  return snapshot.ccEntries.reduce((sum, e) => sum + e.amount, 0);
}

export function isAllCcPaid(
  snapshot: BillSnapshot,
  cards: { id: string }[],
): boolean {
  if (cards.length === 0) return false;
  return cards.every((c) => snapshot.ccEntries.find((e) => e.cardId === c.id)?.paid === true);
}

export function formatYearMonth(yearMonth: string): string {
  if (!yearMonth) return '—';
  const [y, m] = yearMonth.split('-').map(Number);
  return new Date(y, m - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

export function formatMonthShort(yearMonth: string): string {
  if (!yearMonth) return '?';
  const [y, m] = yearMonth.split('-').map(Number);
  return new Date(y, m - 1).toLocaleString('en-US', { month: 'short' });
}

export function nextYearMonth(yearMonth: string): string {
  if (!yearMonth) return '';
  const [y, m] = yearMonth.split('-').map(Number);
  const next = new Date(y, m); // m is 1-indexed; Date takes 0-indexed so this advances one month
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
}
