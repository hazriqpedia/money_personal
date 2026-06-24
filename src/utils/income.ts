import type { IncomeEntry } from '../types';
import { formatCurrency } from './currency';

export function computeIncrement(sortedEntries: IncomeEntry[], index: number): number | null {
  if (index <= 0) return null;
  const previous = sortedEntries[index - 1];
  const current = sortedEntries[index];
  if (previous.annually === 0) return null;
  return ((current.annually - previous.annually) / previous.annually) * 100;
}

export function formatIncrement(increment: number | null): string {
  if (increment === null) return '—';
  return `${increment > 0 ? '+' : ''}${increment.toFixed(1)}%`;
}

// Year-over-year dollar change in Gross — the dollar-amount counterpart to
// computeIncrement's percentage, so a raise shows up both ways.
export function computeDifference(sortedEntries: IncomeEntry[], index: number): number | null {
  if (index <= 0) return null;
  return sortedEntries[index].gross - sortedEntries[index - 1].gross;
}

export function formatDifference(difference: number | null, symbol: string): string {
  if (difference === null) return '—';
  return formatCurrency(difference, symbol);
}

// A year can have 2+ entries (e.g. a mid-year raise). Prefer the one flagged
// isPrimary; fall back to the first match so a lone entry needs no flag at all.
export function pickPrimaryEntry(entries: IncomeEntry[], year: number): IncomeEntry | undefined {
  const matches = entries.filter((e) => e.year === year);
  return matches.find((e) => e.isPrimary) ?? matches[0];
}
