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
    act(() => { result.current.setIncome([{ id: '1', source: 'Job', amount: 5000 }]); });
    expect(result.current.appData.income).toHaveLength(1);
    expect(result.current.appData.savings).toEqual([]);
    expect(result.current.appData.loans).toEqual([]);
  });

  it('setSavings updates only the savings slice', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => { result.current.setSavings([{ id: '1', name: 'Emergency Fund', balance: 1000 }]); });
    expect(result.current.appData.savings).toHaveLength(1);
    expect(result.current.appData.income).toEqual([]);
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
    act(() => { result.current.setAgePlan([{ id: '1', year: 2026, age: 30, title: 'Started new job' }]); });
    expect(result.current.appData.agePlan).toHaveLength(1);
    expect(result.current.appData.income).toEqual([]);
  });
});

describe('updateAppData', () => {
  it('replaces the whole tree atomically', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    const next: AppData = {
      ...EMPTY_APP_DATA,
      income: [{ id: '1', source: 'Freelance', amount: 1200 }],
      savings: [{ id: '1', name: 'Travel Fund', balance: 500 }],
    };
    act(() => { result.current.updateAppData(next); });
    expect(result.current.appData).toEqual(next);
  });
});

describe('localStorage persistence', () => {
  it('persists appData on change', () => {
    const { result } = renderHook(() => useAppData(), { wrapper });
    act(() => { result.current.setIncome([{ id: '1', source: 'Job', amount: 5000 }]); });
    const stored = JSON.parse(localStorage.getItem('moneyPersonal_appData') ?? '{}');
    expect(stored.income[0].source).toBe('Job');
  });

  it('restores appData from localStorage on mount', () => {
    const saved: AppData = { ...EMPTY_APP_DATA, savings: [{ id: 's1', name: 'From Storage', balance: 999 }] };
    localStorage.setItem('moneyPersonal_appData', JSON.stringify(saved));
    const { result } = renderHook(() => useAppData(), { wrapper });
    expect(result.current.appData.savings[0].name).toBe('From Storage');
  });

  it('defaults a missing key from an older/partial saved blob to an empty array', () => {
    const partial = { income: [{ id: '1', source: 'Job', amount: 5000 }] };
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
