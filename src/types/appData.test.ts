import { describe, it, expect } from 'vitest';
import { hydrateAppData, EMPTY_APP_DATA } from './appData';

describe('hydrateAppData', () => {
  it('returns EMPTY_APP_DATA for null input', () => {
    expect(hydrateAppData(null)).toEqual(EMPTY_APP_DATA);
  });

  it('returns EMPTY_APP_DATA for non-object input', () => {
    expect(hydrateAppData('not an object')).toEqual(EMPTY_APP_DATA);
    expect(hydrateAppData(42)).toEqual(EMPTY_APP_DATA);
  });

  it('merges a partial object over the defaults', () => {
    const partial = {
      income: [{ id: '1', year: 2026, label: '', monthly: 5000, annually: 60000, gross: 6000, isPrimary: false }],
    };
    const result = hydrateAppData(partial);
    expect(result.income).toHaveLength(1);
    expect(result.loans).toEqual([]);
    expect(result.taxRecords).toEqual([]);
  });

  it('preserves a full AppData object as-is', () => {
    const full = { ...EMPTY_APP_DATA, savingsAccounts: [{ id: '1', name: 'Fund', category: 'savings' as const }] };
    expect(hydrateAppData(full)).toEqual(full);
  });

  it('defaults spendingPlan, savingsPlan, and creditCardSpending to empty arrays when missing', () => {
    const result = hydrateAppData({});
    expect(result.spendingPlan).toEqual([]);
    expect(result.savingsPlan).toEqual([]);
    expect(result.creditCardSpending).toEqual([]);
  });

  it('defaults savingsAccounts, savingsSnapshots, epfEntries, and goldEntries to empty arrays when missing', () => {
    const result = hydrateAppData({});
    expect(result.savingsAccounts).toEqual([]);
    expect(result.savingsSnapshots).toEqual([]);
    expect(result.epfEntries).toEqual([]);
    expect(result.goldEntries).toEqual([]);
  });

  it('round-trips a full spendingPlan/savingsPlan/creditCardSpending payload', () => {
    const partial = {
      spendingPlan: [{ id: '1', name: 'Car', amount: 1300 }],
      savingsPlan: [{ id: '2', name: 'ASB', amount: 200 }],
      creditCardSpending: [{ cardId: 'cc1', items: [{ id: '3', name: 'Groceries', amount: 150 }] }],
    };
    const result = hydrateAppData(partial);
    expect(result.spendingPlan).toEqual(partial.spendingPlan);
    expect(result.savingsPlan).toEqual(partial.savingsPlan);
    expect(result.creditCardSpending).toEqual(partial.creditCardSpending);
  });

  it('round-trips a full savingsAccounts/savingsSnapshots/epfEntries/goldEntries payload', () => {
    const partial = {
      savingsAccounts: [
        { id: 'a1', name: 'ASB', category: 'savings' as const },
        { id: 'a2', name: 'Luno BTC', category: 'investment' as const },
      ],
      savingsSnapshots: [{ id: 's1', date: '2026-01-01', balances: [{ accountId: 'a1', balance: 1000 }] }],
      epfEntries: [{ id: 'e1', date: '2026-01-01', account1: 100, account2: 200, account3: 50, monthlySavings: 300 }],
      goldEntries: [{ id: 'g1', dateBought: '2026-01-01', mode: 'GAP' as const, weight: 1, price: 270 }],
    };
    const result = hydrateAppData(partial);
    expect(result.savingsAccounts).toEqual(partial.savingsAccounts);
    expect(result.savingsSnapshots).toEqual(partial.savingsSnapshots);
    expect(result.epfEntries).toEqual(partial.epfEntries);
    expect(result.goldEntries).toEqual(partial.goldEntries);
  });

  it('backfills currencySymbol, budgetSplit, and creditCards on a partial profile missing them', () => {
    const result = hydrateAppData({ profile: { dateOfBirth: '1990-01-01' } });
    expect(result.profile).toEqual({
      dateOfBirth: '1990-01-01',
      currencySymbol: '$',
      budgetSplit: { needs: 50, wants: 30, savings: 20 },
      creditCards: [],
    });
  });

  it('merges a partially-specified budgetSplit field-by-field with defaults', () => {
    const result = hydrateAppData({
      profile: { dateOfBirth: null, currencySymbol: 'RM', budgetSplit: { needs: 70 } },
    });
    expect(result.profile.budgetSplit).toEqual({ needs: 70, wants: 30, savings: 20 });
    expect(result.profile.currencySymbol).toBe('RM');
  });
});
