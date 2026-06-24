import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AppDataProvider } from './AppDataProvider';
import { useAppData } from './useAppData';
import { EMPTY_APP_DATA } from '../types';
import type { AppData } from '../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppDataProvider>{children}</AppDataProvider>
);

beforeEach(() => {
  localStorage.clear();
});

describe('domain setters', () => {
  it('setIncome updates only the income slice', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => {
      result.current.setIncome([
        { id: '1', year: 2026, label: '', monthly: 5000, annually: 60000, gross: 6000, isPrimary: false },
      ]);
    });
    expect(result.current.appData.income).toHaveLength(1);
    expect(result.current.appData.savingsAccounts).toEqual([]);
    expect(result.current.appData.loans).toEqual([]);
  });

  it('setSpendingPlan updates only the spendingPlan slice', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => { result.current.setSpendingPlan([{ id: '1', name: 'Rent', amount: 1500 }]); });
    expect(result.current.appData.spendingPlan).toHaveLength(1);
    expect(result.current.appData.income).toEqual([]);
  });

  it('setSavingsPlan updates only the savingsPlan slice', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => { result.current.setSavingsPlan([{ id: '1', name: 'ASB', amount: 200 }]); });
    expect(result.current.appData.savingsPlan).toHaveLength(1);
    expect(result.current.appData.spendingPlan).toEqual([]);
  });

  it('setCreditCardSpending updates only the creditCardSpending slice', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => {
      result.current.setCreditCardSpending([{ cardId: 'cc1', items: [{ id: '1', name: 'Groceries', amount: 150 }] }]);
    });
    expect(result.current.appData.creditCardSpending).toHaveLength(1);
    expect(result.current.appData.savingsPlan).toEqual([]);
  });

  it('setSavingsAccounts updates only the savingsAccounts slice', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => {
      result.current.setSavingsAccounts([{ id: '1', name: 'Emergency Fund', category: 'savings' }]);
    });
    expect(result.current.appData.savingsAccounts).toHaveLength(1);
    expect(result.current.appData.income).toEqual([]);
  });

  it('setSavingsSnapshots updates only the savingsSnapshots slice', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => {
      result.current.setSavingsSnapshots([{ id: '1', date: '2026-01-01', balances: [{ accountId: 'a1', balance: 100 }] }]);
    });
    expect(result.current.appData.savingsSnapshots).toHaveLength(1);
    expect(result.current.appData.savingsAccounts).toEqual([]);
  });

  it('setEpfEntries updates only the epfEntries slice', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => {
      result.current.setEpfEntries([
        { id: '1', date: '2026-01-01', account1: 100, account2: 200, account3: 50, monthlySavings: 300 },
      ]);
    });
    expect(result.current.appData.epfEntries).toHaveLength(1);
    expect(result.current.appData.goldEntries).toEqual([]);
  });

  it('setGoldEntries updates only the goldEntries slice', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => {
      result.current.setGoldEntries([
        { id: '1', dateBought: '2026-01-01', mode: 'GAP', weight: 1, price: 270 },
      ]);
    });
    expect(result.current.appData.goldEntries).toHaveLength(1);
    expect(result.current.appData.epfEntries).toEqual([]);
  });

  it('setLoans updates only the loans slice', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => { result.current.setLoans([{ id: '1', name: 'Car Loan', principal: 20000 }]); });
    expect(result.current.appData.loans).toHaveLength(1);
    expect(result.current.appData.bills).toEqual([]);
  });

  it('setBills updates only the bills slice', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => { result.current.setBills([{ id: '1', name: 'Electricity', amount: 80 }]); });
    expect(result.current.appData.bills).toHaveLength(1);
    expect(result.current.appData.subscriptions).toEqual([]);
  });

  it('setSubscriptions updates only the subscriptions slice', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => { result.current.setSubscriptions([{ id: '1', name: 'Streaming', amount: 15 }]); });
    expect(result.current.appData.subscriptions).toHaveLength(1);
    expect(result.current.appData.taxRecords).toEqual([]);
  });

  it('setTaxRecords updates only the taxRecords slice', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => { result.current.setTaxRecords([{ id: '1', year: 2026, amountPaid: 3000 }]); });
    expect(result.current.appData.taxRecords).toHaveLength(1);
    expect(result.current.appData.agePlan).toEqual([]);
  });

  it('setAgePlan updates only the agePlan slice', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => {
      result.current.setAgePlan([
        { id: '1', year: 2026, age: 30, happened: [{ id: 'h1', text: 'Started new job' }], plans: [] },
      ]);
    });
    expect(result.current.appData.agePlan).toHaveLength(1);
    expect(result.current.appData.income).toEqual([]);
  });

  it('setProfile updates only the profile slice', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    const profile = {
      dateOfBirth: '1992-06-15',
      currencySymbol: '$',
      budgetSplit: { needs: 50, wants: 30, savings: 20 },
      creditCards: [],
    };
    act(() => { result.current.setProfile(profile); });
    expect(result.current.appData.profile).toEqual(profile);
    expect(result.current.appData.agePlan).toEqual([]);
  });
});

describe('updateAppData', () => {
  it('replaces the whole tree atomically', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    const next: AppData = {
      ...EMPTY_APP_DATA,
      income: [
        { id: '1', year: 2026, label: 'Freelance', monthly: 1200, annually: 14400, gross: 1500, isPrimary: false },
      ],
      savingsAccounts: [{ id: '1', name: 'Travel Fund', category: 'savings' }],
    };
    act(() => { result.current.updateAppData(next); });
    expect(result.current.appData).toEqual(next);
  });
});

describe('localStorage persistence', () => {
  it('persists appData on change', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => {
      result.current.setIncome([
        { id: '1', year: 2026, label: '', monthly: 5000, annually: 60000, gross: 6000, isPrimary: false },
      ]);
    });
    const stored = JSON.parse(localStorage.getItem('moneyPersonal_appData') ?? '{}');
    expect(stored.income[0].monthly).toBe(5000);
  });

  it('restores appData from localStorage on mount', () => {
    const saved: AppData = {
      ...EMPTY_APP_DATA,
      savingsAccounts: [{ id: 's1', name: 'From Storage', category: 'savings' }],
    };
    localStorage.setItem('moneyPersonal_appData', JSON.stringify(saved));
    const { result } = renderHook(() => useAppData(), { wrapper });
    expect(result.current.appData.savingsAccounts[0].name).toBe('From Storage');
  });

  it('defaults a missing key from an older/partial saved blob to an empty array', () => {
    const partial = {
      income: [{ id: '1', year: 2026, label: '', monthly: 5000, annually: 60000, gross: 6000, isPrimary: false }],
    };
    localStorage.setItem('moneyPersonal_appData', JSON.stringify(partial));
    const { result } = renderHook(() => useAppData(), { wrapper });
    expect(result.current.appData.income).toHaveLength(1);
    expect(result.current.appData.loans).toEqual([]);
    expect(result.current.appData.taxRecords).toEqual([]);
  });
});

describe('useAppData', () => {
  it('throws when used outside an AppDataProvider', () => {
    expect(() => renderHook(() => useAppData())).toThrow(
      'useAppData must be used within an AppDataProvider'
    );
  });
});
