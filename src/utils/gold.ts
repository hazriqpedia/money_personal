import type { GoldEntry } from '../types';

export function computeTotalWeight(entries: GoldEntry[]): number {
  return entries.reduce((sum, e) => sum + e.weight, 0);
}

export function computeGapWeight(entries: GoldEntry[]): number {
  return entries.filter((e) => e.mode === 'GAP').reduce((sum, e) => sum + e.weight, 0);
}

// Average price-per-gram across GAP entries — not a plain average of raw
// price, since that's meaningless once weight varies between entries.
export function computeGapAverage(entries: GoldEntry[]): number | null {
  const gapEntries = entries.filter((e) => e.mode === 'GAP' && e.weight > 0);
  if (gapEntries.length === 0) return null;
  const perGramSum = gapEntries.reduce((sum, e) => sum + e.price / e.weight, 0);
  return perGramSum / gapEntries.length;
}

export function computeTotalCost(entries: GoldEntry[]): number {
  return entries.reduce((sum, e) => sum + e.price, 0);
}
