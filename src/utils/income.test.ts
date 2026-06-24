import { describe, it, expect } from 'vitest';
import { computeIncrement, formatIncrement, computeDifference, formatDifference, pickPrimaryEntry } from './income';
import type { IncomeEntry } from '../types';

function entry(overrides: Partial<IncomeEntry>): IncomeEntry {
  return { id: '1', year: 2026, label: '', monthly: 0, annually: 0, gross: 0, isPrimary: false, ...overrides };
}

describe('computeIncrement', () => {
  it('returns null for the first/only entry', () => {
    const entries = [entry({ annually: 60000 })];
    expect(computeIncrement(entries, 0)).toBeNull();
  });

  it('computes a positive increment percentage correctly', () => {
    const entries = [entry({ annually: 60000 }), entry({ annually: 66000 })];
    expect(computeIncrement(entries, 1)).toBe(10);
  });

  it('computes a negative increment percentage correctly', () => {
    const entries = [entry({ annually: 60000 }), entry({ annually: 54000 })];
    expect(computeIncrement(entries, 1)).toBe(-10);
  });

  it('returns null when the previous annually is 0', () => {
    const entries = [entry({ annually: 0 }), entry({ annually: 50000 })];
    expect(computeIncrement(entries, 1)).toBeNull();
  });
});

describe('formatIncrement', () => {
  it('renders "—" for null', () => {
    expect(formatIncrement(null)).toBe('—');
  });

  it('renders a signed percentage string for a positive number', () => {
    expect(formatIncrement(10)).toBe('+10.0%');
  });

  it('renders a percentage string for a negative number', () => {
    expect(formatIncrement(-10)).toBe('-10.0%');
  });
});

describe('computeDifference', () => {
  it('returns null for the first/only entry', () => {
    const entries = [entry({ gross: 8000 })];
    expect(computeDifference(entries, 0)).toBeNull();
  });

  it('returns this year\'s gross minus last year\'s gross', () => {
    const entries = [entry({ gross: 8000 }), entry({ gross: 9000 })];
    expect(computeDifference(entries, 1)).toBe(1000);
  });

  it('handles a negative year-over-year gross change', () => {
    const entries = [entry({ gross: 9000 }), entry({ gross: 8000 })];
    expect(computeDifference(entries, 1)).toBe(-1000);
  });
});

describe('formatDifference', () => {
  it('renders "—" for null', () => {
    expect(formatDifference(null, '$')).toBe('—');
  });

  it('renders a formatted currency string for a number', () => {
    expect(formatDifference(1000, '$')).toBe('$1,000');
  });

  it('renders a negative formatted currency string', () => {
    expect(formatDifference(-1000, '$')).toBe('$-1,000');
  });
});

describe('pickPrimaryEntry', () => {
  it('returns undefined when no entries match the year', () => {
    const entries = [entry({ id: '1', year: 2025 })];
    expect(pickPrimaryEntry(entries, 2026)).toBeUndefined();
  });

  it('returns the sole entry for a year with no ambiguity', () => {
    const entries = [entry({ id: '1', year: 2026, gross: 9000 })];
    expect(pickPrimaryEntry(entries, 2026)?.id).toBe('1');
  });

  it('prefers the entry flagged isPrimary among same-year entries', () => {
    const entries = [
      entry({ id: '1', year: 2026, gross: 9000, isPrimary: false }),
      entry({ id: '2', year: 2026, gross: 9800, isPrimary: true }),
    ];
    expect(pickPrimaryEntry(entries, 2026)?.id).toBe('2');
  });

  it('falls back to the first match when none are flagged isPrimary', () => {
    const entries = [
      entry({ id: '1', year: 2026, gross: 9000 }),
      entry({ id: '2', year: 2026, gross: 9800 }),
    ];
    expect(pickPrimaryEntry(entries, 2026)?.id).toBe('1');
  });
});
