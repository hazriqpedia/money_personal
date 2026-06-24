import type { SpendingItem } from './spendingPlan';

export interface CreditCardSpending {
  cardId: string;
  items: SpendingItem[];
}
