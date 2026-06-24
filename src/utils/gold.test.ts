import { describe, it, expect } from 'vitest';
import { computeTotalWeight, computeGapWeight, computeGapAverage, computeTotalCost } from './gold';
import type { GoldEntry } from '../types';

function entry(overrides: Partial<GoldEntry>): GoldEntry {
  return { id: '1', dateBought: '2026-01-01', mode: 'GAP', weight: 1, price: 0, ...overrides };
}

describe('computeTotalWeight', () => {
  it('sums weight across mixed modes', () => {
    const entries = [entry({ mode: 'GAP', weight: 1 }), entry({ mode: 'Normal', weight: 4.25 })];
    expect(computeTotalWeight(entries)).toBe(5.25);
  });

  it('returns 0 for an empty array', () => {
    expect(computeTotalWeight([])).toBe(0);
  });
});

describe('computeGapWeight', () => {
  it('sums weight only for GAP entries, ignoring other modes', () => {
    const entries = [
      entry({ mode: 'GAP', weight: 1 }),
      entry({ mode: 'Normal', weight: 4.25 }),
      entry({ mode: 'Wealth Card', weight: 0.5 }),
      entry({ mode: 'GAP', weight: 2 }),
    ];
    expect(computeGapWeight(entries)).toBe(3);
  });

  it('returns 0 when there are no GAP entries', () => {
    expect(computeGapWeight([entry({ mode: 'Normal', weight: 4.25 })])).toBe(0);
  });
});

describe('computeGapAverage', () => {
  it('returns null when there are no GAP entries', () => {
    expect(computeGapAverage([entry({ mode: 'Normal', weight: 4.25, price: 1164 })])).toBeNull();
  });

  it('averages price-per-gram across GAP entries, not raw price', () => {
    // Two GAP lots with different weights — a plain average of price (255+550)/2=402.5
    // would be wrong; the correct figure averages each lot's own price/weight rate.
    const entries = [
      entry({ mode: 'GAP', weight: 1, price: 255 }),
      entry({ mode: 'GAP', weight: 2, price: 550 }),
    ];
    // per-gram rates: 255/1=255, 550/2=275 -> average 265
    expect(computeGapAverage(entries)).toBe(265);
  });

  it('ignores non-GAP entries when averaging', () => {
    const entries = [
      entry({ mode: 'GAP', weight: 1, price: 255 }),
      entry({ mode: 'Normal', weight: 4.25, price: 1164 }),
    ];
    expect(computeGapAverage(entries)).toBe(255);
  });
});

describe('computeTotalCost', () => {
  it('sums price across all entries regardless of mode', () => {
    const entries = [
      entry({ mode: 'GAP', price: 255 }),
      entry({ mode: 'Normal', price: 1164 }),
      entry({ mode: 'Wealth Card', price: 200 }),
    ];
    expect(computeTotalCost(entries)).toBe(1619);
  });

  it('returns 0 for an empty array', () => {
    expect(computeTotalCost([])).toBe(0);
  });
});
