import { createContext } from 'react';
import type {
  AppData,
  AgePlanEntry,
  IncomeEntry,
  SavingsAccount,
  Loan,
  Bill,
  Subscription,
  TaxRecord,
} from '../types';

export interface AppDataContextType {
  appData: AppData;
  updateAppData: (data: AppData) => void;
  setAgePlan: (entries: AgePlanEntry[]) => void;
  setIncome: (entries: IncomeEntry[]) => void;
  setSavings: (accounts: SavingsAccount[]) => void;
  setLoans: (loans: Loan[]) => void;
  setBills: (bills: Bill[]) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setTaxRecords: (records: TaxRecord[]) => void;
}

export const AppDataContext = createContext<AppDataContextType | undefined>(undefined);
