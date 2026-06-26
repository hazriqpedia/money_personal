import type { Loan } from '../types';

export function computeDateDone(loan: Loan): string {
  if (!loan.dateBought) return '';
  const [year, month, day] = loan.dateBought.split('-').map(Number);
  const date = new Date(year, month - 1 + loan.tenure, day);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isLoanActive(loan: Loan): boolean {
  return !loan.isCompleted;
}

export function computeTotalMonthly(loans: Loan[]): number {
  return loans.filter(isLoanActive).reduce((sum, l) => sum + l.monthly, 0);
}

export function computeMonthlyForCard(loans: Loan[], cardId: string): number {
  return loans
    .filter((l) => l.cardId === cardId && isLoanActive(l))
    .reduce((sum, l) => sum + l.monthly, 0);
}

export function computeRemainingBalance(loan: Loan): number {
  if (!isLoanActive(loan)) return 0;
  const done = computeDateDone(loan);
  if (!done) return 0;
  const now = new Date();
  const [doneYear, doneMonth] = done.split('-').map(Number);
  const remainingMonths = (doneYear - now.getFullYear()) * 12 + (doneMonth - 1 - now.getMonth());
  return loan.monthly * Math.max(0, remainingMonths);
}

export function computeEndingByYear(loans: Loan[]): { year: number; count: number }[] {
  const map = new Map<number, number>();
  for (const loan of loans) {
    if (!isLoanActive(loan)) continue;
    const done = computeDateDone(loan);
    if (!done) continue;
    const year = Number(done.split('-')[0]);
    map.set(year, (map.get(year) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, count]) => ({ year, count }));
}
