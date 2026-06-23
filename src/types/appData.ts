import type { AgePlanEntry } from './agePlan';
import type { IncomeEntry } from './income';
import type { SavingsAccount } from './savings';
import type { Loan } from './loan';
import type { Bill } from './bills';
import type { Subscription } from './subscription';
import type { TaxRecord } from './tax';

export interface AppData {
  agePlan: AgePlanEntry[];
  income: IncomeEntry[];
  savings: SavingsAccount[];
  loans: Loan[];
  bills: Bill[];
  subscriptions: Subscription[];
  taxRecords: TaxRecord[];
}

export const EMPTY_APP_DATA: AppData = {
  agePlan: [],
  income: [],
  savings: [],
  loans: [],
  bills: [],
  subscriptions: [],
  taxRecords: [],
};

// Merges any partial/older-schema object over the defaults, so a missing
// domain key (or a non-object input) never crashes a downstream .length read.
export function hydrateAppData(raw: unknown): AppData {
  if (typeof raw !== 'object' || raw === null) return EMPTY_APP_DATA;
  return { ...EMPTY_APP_DATA, ...(raw as Partial<AppData>) };
}
