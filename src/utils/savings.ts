import type { SavingsAccountConfig, SavingsSnapshot } from '../types';

export function getBalance(snapshot: SavingsSnapshot, accountId: string): number | null {
  return snapshot.balances.find((b) => b.accountId === accountId)?.balance ?? null;
}

export function computeRowTotal(snapshot: SavingsSnapshot): number {
  return snapshot.balances.reduce((sum, b) => sum + b.balance, 0);
}

export function computeSavingsOnlyTotal(snapshot: SavingsSnapshot, accounts: SavingsAccountConfig[]): number {
  const savingsIds = new Set(accounts.filter((a) => a.category === 'savings').map((a) => a.id));
  return snapshot.balances.filter((b) => savingsIds.has(b.accountId)).reduce((sum, b) => sum + b.balance, 0);
}

// Mirrors computeDifference's sorted-array-plus-index signature — null for the first row.
export function computeSavingsOnlyDifference(
  sortedSnapshots: SavingsSnapshot[],
  index: number,
  accounts: SavingsAccountConfig[]
): number | null {
  if (index <= 0) return null;
  const current = computeSavingsOnlyTotal(sortedSnapshots[index], accounts);
  const previous = computeSavingsOnlyTotal(sortedSnapshots[index - 1], accounts);
  return current - previous;
}

// True when this row's balance for accountId is strictly less than the same
// account's balance in the previous date-row (i.e. a withdrawal happened). A
// missing balance on either row (sparse data) never counts as a withdrawal.
export function isWithdrawal(sortedSnapshots: SavingsSnapshot[], index: number, accountId: string): boolean {
  if (index <= 0) return false;
  const current = getBalance(sortedSnapshots[index], accountId);
  const previous = getBalance(sortedSnapshots[index - 1], accountId);
  if (current === null || previous === null) return false;
  return current < previous;
}
