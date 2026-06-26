import React, { useState, useEffect } from 'react';
import { AppDataContext } from './context';
import { EMPTY_APP_DATA, hydrateAppData } from '../types';
import type {
  AppData,
  AgePlanEntry,
  IncomeEntry,
  SpendingItem,
  CreditCardSpending,
  SavingsAccountConfig,
  SavingsSnapshot,
  EpfEntry,
  GoldEntry,
  Loan,
  Bill,
  BillSnapshot,
  Subscription,
  TaxRecord,
  Profile,
} from '../types';

const STORAGE_KEY = 'moneyPersonal_appData';

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appData, setAppData] = useState<AppData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? hydrateAppData(JSON.parse(saved)) : EMPTY_APP_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  }, [appData]);

  const updateAppData = (data: AppData) => setAppData(data);
  const setProfile = (profile: Profile) => setAppData(prev => ({ ...prev, profile }));
  const setAgePlan = (entries: AgePlanEntry[]) => setAppData(prev => ({ ...prev, agePlan: entries }));
  const setIncome = (entries: IncomeEntry[]) => setAppData(prev => ({ ...prev, income: entries }));
  const setSavingsAccounts = (accounts: SavingsAccountConfig[]) =>
    setAppData(prev => ({ ...prev, savingsAccounts: accounts }));
  const setSavingsSnapshots = (snapshots: SavingsSnapshot[]) =>
    setAppData(prev => ({ ...prev, savingsSnapshots: snapshots }));
  const setEpfEntries = (entries: EpfEntry[]) => setAppData(prev => ({ ...prev, epfEntries: entries }));
  const setGoldEntries = (entries: GoldEntry[]) => setAppData(prev => ({ ...prev, goldEntries: entries }));
  const setLoans = (loans: Loan[]) => setAppData(prev => ({ ...prev, loans }));
  const setBills = (bills: Bill[]) => setAppData(prev => ({ ...prev, bills }));
  const setBillSnapshots = (billSnapshots: BillSnapshot[]) =>
    setAppData(prev => ({ ...prev, billSnapshots }));
  const setSubscriptions = (subscriptions: Subscription[]) => setAppData(prev => ({ ...prev, subscriptions }));
  const setTaxRecords = (taxRecords: TaxRecord[]) => setAppData(prev => ({ ...prev, taxRecords }));
  const setSpendingPlan = (items: SpendingItem[]) => setAppData(prev => ({ ...prev, spendingPlan: items }));
  const setSavingsPlan = (items: SpendingItem[]) => setAppData(prev => ({ ...prev, savingsPlan: items }));
  const setCreditCardSpending = (entries: CreditCardSpending[]) =>
    setAppData(prev => ({ ...prev, creditCardSpending: entries }));

  return (
    <AppDataContext.Provider value={{
      appData,
      updateAppData,
      setProfile,
      setAgePlan,
      setIncome,
      setSavingsAccounts,
      setSavingsSnapshots,
      setEpfEntries,
      setGoldEntries,
      setLoans,
      setBills,
      setBillSnapshots,
      setSubscriptions,
      setTaxRecords,
      setSpendingPlan,
      setSavingsPlan,
      setCreditCardSpending,
    }}>
      {children}
    </AppDataContext.Provider>
  );
};
