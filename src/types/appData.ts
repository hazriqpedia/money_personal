import type { AgePlanEntry } from './agePlan';
import type { IncomeEntry } from './income';
import type { SpendingItem } from './spendingPlan';
import type { CreditCardSpending } from './creditCard';
import type { SavingsAccountConfig, SavingsSnapshot } from './savings';
import type { EpfEntry } from './epf';
import type { GoldEntry } from './gold';
import type { Loan } from './loan';
import type { Bill } from './bills';
import type { Subscription } from './subscription';
import type { TaxRecord } from './tax';
import type { Profile } from './profile';

export interface AppData {
  profile: Profile;
  agePlan: AgePlanEntry[];
  income: IncomeEntry[];
  spendingPlan: SpendingItem[];
  savingsPlan: SpendingItem[];
  creditCardSpending: CreditCardSpending[];
  savingsAccounts: SavingsAccountConfig[];
  savingsSnapshots: SavingsSnapshot[];
  epfEntries: EpfEntry[];
  goldEntries: GoldEntry[];
  loans: Loan[];
  bills: Bill[];
  subscriptions: Subscription[];
  taxRecords: TaxRecord[];
}

export const EMPTY_APP_DATA: AppData = {
  profile: {
    dateOfBirth: null,
    currencySymbol: '$',
    budgetSplit: { needs: 50, wants: 30, savings: 20 },
    creditCards: [],
  },
  agePlan: [],
  income: [],
  spendingPlan: [],
  savingsPlan: [],
  creditCardSpending: [],
  savingsAccounts: [],
  savingsSnapshots: [],
  epfEntries: [],
  goldEntries: [],
  loans: [],
  bills: [],
  subscriptions: [],
  taxRecords: [],
};

// Merges any partial/older-schema object over the defaults, so a missing
// domain key (or a non-object input) never crashes a downstream .length read.
// `profile` gets a deeper, field-by-field merge (instead of the shallow
// top-level replace every other key gets) so an older saved profile missing
// newer settings (currencySymbol, budgetSplit) backfills those defaults
// instead of losing them outright.
export function hydrateAppData(raw: unknown): AppData {
  if (typeof raw !== 'object' || raw === null) return EMPTY_APP_DATA;
  const partial = raw as Partial<AppData>;
  return {
    ...EMPTY_APP_DATA,
    ...partial,
    profile: {
      ...EMPTY_APP_DATA.profile,
      ...partial.profile,
      budgetSplit: { ...EMPTY_APP_DATA.profile.budgetSplit, ...partial.profile?.budgetSplit },
    },
  };
}
