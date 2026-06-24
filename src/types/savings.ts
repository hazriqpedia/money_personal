export type SavingsAccountCategory = 'savings' | 'investment';

export interface SavingsAccountConfig {
  id: string;
  name: string;
  category: SavingsAccountCategory;
}

export interface SavingsBalanceEntry {
  accountId: string;
  balance: number;
}

export interface SavingsSnapshot {
  id: string;
  date: string;
  balances: SavingsBalanceEntry[];
}
