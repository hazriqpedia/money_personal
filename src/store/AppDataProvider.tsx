import React, { useState, useEffect } from 'react';
import { AppDataContext } from './context';
import { EMPTY_APP_DATA, hydrateAppData } from '../types';
import type {
  AppData,
  AgePlanEntry,
  IncomeEntry,
  SavingsAccount,
  Loan,
  Bill,
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
  const setSavings = (accounts: SavingsAccount[]) => setAppData(prev => ({ ...prev, savings: accounts }));
  const setLoans = (loans: Loan[]) => setAppData(prev => ({ ...prev, loans }));
  const setBills = (bills: Bill[]) => setAppData(prev => ({ ...prev, bills }));
  const setSubscriptions = (subscriptions: Subscription[]) => setAppData(prev => ({ ...prev, subscriptions }));
  const setTaxRecords = (taxRecords: TaxRecord[]) => setAppData(prev => ({ ...prev, taxRecords }));

  return (
    <AppDataContext.Provider value={{
      appData,
      updateAppData,
      setProfile,
      setAgePlan,
      setIncome,
      setSavings,
      setLoans,
      setBills,
      setSubscriptions,
      setTaxRecords,
    }}>
      {children}
    </AppDataContext.Provider>
  );
};
