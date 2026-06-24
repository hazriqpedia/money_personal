export interface BudgetSplit {
  needs: number;
  wants: number;
  savings: number;
}

export interface CreditCardConfig {
  id: string;
  name: string;
}

export interface Profile {
  dateOfBirth: string | null;
  currencySymbol: string;
  budgetSplit: BudgetSplit;
  creditCards: CreditCardConfig[];
}
