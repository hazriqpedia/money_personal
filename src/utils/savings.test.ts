import { describe, it, expect } from 'vitest';
import {
  getBalance,
  computeRowTotal,
  computeSavingsOnlyTotal,
  computeSavingsOnlyDifference,
  isWithdrawal,
} from './savings';
import type { SavingsAccountConfig, SavingsSnapshot } from '../types';

const accounts: SavingsAccountConfig[] = [
  { id: 'a1', name: 'ASB', category: 'savings' },
  { id: 'a2', name: 'Public Bank', category: 'savings' },
  { id: 'a3', name: 'Luno BTC', category: 'investment' },
];

function snapshot(date: string, balances: SavingsSnapshot['balances']): SavingsSnapshot {
  return { id: date, date, balances };
}

describe('getBalance', () => {
  it('returns the balance for a present account', () => {
    const s = snapshot('2026-01-01', [{ accountId: 'a1', balance: 100 }]);
    expect(getBalance(s, 'a1')).toBe(100);
  });

  it('returns null for a missing/sparse account', () => {
    const s = snapshot('2026-01-01', [{ accountId: 'a1', balance: 100 }]);
    expect(getBalance(s, 'a2')).toBeNull();
  });
});

describe('computeRowTotal', () => {
  it('sums all sparse balances', () => {
    const s = snapshot('2026-01-01', [
      { accountId: 'a1', balance: 100 },
      { accountId: 'a2', balance: 50 },
      { accountId: 'a3', balance: 25 },
    ]);
    expect(computeRowTotal(s)).toBe(175);
  });

  it('returns 0 for an empty balances array', () => {
    expect(computeRowTotal(snapshot('2026-01-01', []))).toBe(0);
  });
});

describe('computeSavingsOnlyTotal', () => {
  it('sums only category: savings accounts, ignoring investment accounts', () => {
    const s = snapshot('2026-01-01', [
      { accountId: 'a1', balance: 100 },
      { accountId: 'a2', balance: 50 },
      { accountId: 'a3', balance: 1000 },
    ]);
    expect(computeSavingsOnlyTotal(s, accounts)).toBe(150);
  });

  it('returns 0 when no balances match a savings account', () => {
    const s = snapshot('2026-01-01', [{ accountId: 'a3', balance: 1000 }]);
    expect(computeSavingsOnlyTotal(s, accounts)).toBe(0);
  });
});

describe('computeSavingsOnlyDifference', () => {
  it('returns null for the first row', () => {
    const snapshots = [snapshot('2026-01-01', [{ accountId: 'a1', balance: 100 }])];
    expect(computeSavingsOnlyDifference(snapshots, 0, accounts)).toBeNull();
  });

  it('computes the period-over-period delta of the savings-only total', () => {
    const snapshots = [
      snapshot('2026-01-01', [{ accountId: 'a1', balance: 100 }, { accountId: 'a2', balance: 50 }]),
      snapshot('2026-02-01', [{ accountId: 'a1', balance: 120 }, { accountId: 'a2', balance: 50 }]),
    ];
    expect(computeSavingsOnlyDifference(snapshots, 1, accounts)).toBe(20);
  });

  it('ignores investment-category changes entirely', () => {
    const snapshots = [
      snapshot('2026-01-01', [{ accountId: 'a1', balance: 100 }, { accountId: 'a3', balance: 1000 }]),
      snapshot('2026-02-01', [{ accountId: 'a1', balance: 100 }, { accountId: 'a3', balance: 2000 }]),
    ];
    expect(computeSavingsOnlyDifference(snapshots, 1, accounts)).toBe(0);
  });
});

describe('isWithdrawal', () => {
  it('returns false for the first row', () => {
    const snapshots = [snapshot('2026-01-01', [{ accountId: 'a1', balance: 100 }])];
    expect(isWithdrawal(snapshots, 0, 'a1')).toBe(false);
  });

  it('returns true when the balance dropped from the previous row', () => {
    const snapshots = [
      snapshot('2026-01-01', [{ accountId: 'a1', balance: 100 }]),
      snapshot('2026-02-01', [{ accountId: 'a1', balance: 80 }]),
    ];
    expect(isWithdrawal(snapshots, 1, 'a1')).toBe(true);
  });

  it('returns false when the balance increased or stayed the same', () => {
    const snapshots = [
      snapshot('2026-01-01', [{ accountId: 'a1', balance: 100 }]),
      snapshot('2026-02-01', [{ accountId: 'a1', balance: 100 }]),
    ];
    expect(isWithdrawal(snapshots, 1, 'a1')).toBe(false);
  });

  it('returns false when either row is missing a sparse balance for this account', () => {
    const snapshots = [
      snapshot('2026-01-01', []),
      snapshot('2026-02-01', [{ accountId: 'a1', balance: 80 }]),
    ];
    expect(isWithdrawal(snapshots, 1, 'a1')).toBe(false);
  });
});
