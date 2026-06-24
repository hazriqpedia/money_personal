import { createContext } from 'react';
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
  Subscription,
  TaxRecord,
  Profile,
} from '../types';

export interface AppDataContextType {
  appData: AppData;
  updateAppData: (data: AppData) => void;
  setProfile: (profile: Profile) => void;
  setAgePlan: (entries: AgePlanEntry[]) => void;
  setIncome: (entries: IncomeEntry[]) => void;
  setSavingsAccounts: (accounts: SavingsAccountConfig[]) => void;
  setSavingsSnapshots: (snapshots: SavingsSnapshot[]) => void;
  setEpfEntries: (entries: EpfEntry[]) => void;
  setGoldEntries: (entries: GoldEntry[]) => void;
  setLoans: (loans: Loan[]) => void;
  setBills: (bills: Bill[]) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setTaxRecords: (records: TaxRecord[]) => void;
  setSpendingPlan: (items: SpendingItem[]) => void;
  setSavingsPlan: (items: SpendingItem[]) => void;
  setCreditCardSpending: (entries: CreditCardSpending[]) => void;
}

export const AppDataContext = createContext<AppDataContextType | undefined>(undefined);
