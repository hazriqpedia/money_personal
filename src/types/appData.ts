import type { AgePlanEntry } from './agePlan';
import type { IncomeEntry } from './income';
import type { SpendingItem } from './spendingPlan';
import type { CreditCardSpending } from './creditCard';
import type { SavingsAccountConfig, SavingsSnapshot } from './savings';
import type { EpfEntry } from './epf';
import type { GoldEntry } from './gold';
import type { Loan } from './loan';
import type { Bill, BillSnapshot, BillPaymentEntry, CcPaymentEntry } from './bills';
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
  billSnapshots: BillSnapshot[];
  subscriptions: Subscription[];
  taxRecords: TaxRecord[];
}

export const EMPTY_APP_DATA: AppData = {
  profile: {
    dateOfBirth: null,
    currencySymbol: '$',
    budgetSplit: { needs: 50, wants: 30, savings: 20 },
    creditCards: [],
    customTaxCategories: [],
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
  billSnapshots: [],
  subscriptions: [],
  taxRecords: [],
};

// Merges any partial/older-schema object over the defaults, so a missing
// domain key (or a non-object input) never crashes a downstream .length read.
// `profile` gets a deeper, field-by-field merge (instead of the shallow
// top-level replace every other key gets) so an older saved profile missing
// newer settings (currencySymbol, budgetSplit) backfills those defaults
// instead of losing them outright.
function migrateBill(raw: Record<string, unknown>): Bill {
  return {
    id: (raw.id as string) ?? '',
    name: (raw.name as string) ?? '',
    defaultAmount:
      (raw.defaultAmount as number | undefined) ??
      (raw.amount as number | undefined) ??
      0,
  };
}

function migrateBillSnapshot(raw: Record<string, unknown>): BillSnapshot {
  return {
    id: (raw.id as string) ?? '',
    yearMonth: (raw.yearMonth as string) ?? '',
    entries: Array.isArray(raw.entries) ? (raw.entries as BillPaymentEntry[]) : [],
    ccEntries: Array.isArray(raw.ccEntries) ? (raw.ccEntries as CcPaymentEntry[]) : [],
  };
}

function migrateSubscription(raw: Record<string, unknown>): Subscription {
  return {
    id: (raw.id as string) ?? '',
    category: (raw.category as 'subscription' | 'insurance') ?? 'subscription',
    name: (raw.name as string) ?? '',
    billingDate: (raw.billingDate as string) ?? '',
    monthly: (raw.monthly as number | undefined) ?? (raw.amount as number | undefined) ?? 0,
    annually: (raw.annually as number) ?? 0,
    cardId: (raw.cardId as string | null) ?? null,
    paymentMethod: (raw.paymentMethod as string) ?? '',
    insuranceType: (raw.insuranceType as string) ?? '',
  };
}

function migrateTaxRecord(raw: Record<string, unknown>): TaxRecord {
  return {
    id: (raw.id as string) ?? '',
    year: (raw.year as number) ?? new Date().getFullYear(),
    category: (raw.category as string) ?? 'Other',
    item: (raw.item as string) ?? '',
    date: (raw.date as string) ?? '',
    amount: (raw.amount as number | undefined) ?? (raw.amountPaid as number | undefined) ?? 0,
  };
}

function migrateLoan(raw: Record<string, unknown>): Loan {
  const totalLoan = (raw.totalLoan as number | undefined) ?? (raw.principal as number | undefined) ?? 0;
  const tenure = (raw.tenure as number | undefined) ?? 12;
  const monthly = (raw.monthly as number | undefined) ?? (tenure > 0 ? totalLoan / tenure : 0);
  return {
    id: (raw.id as string) ?? '',
    name: (raw.name as string) ?? '',
    dateBought: (raw.dateBought as string) ?? '',
    tenure,
    totalLoan,
    monthly,
    cardId: (raw.cardId as string | null) ?? null,
    isCompleted: (raw.isCompleted as boolean) ?? false,
  };
}

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
      customTaxCategories: partial.profile?.customTaxCategories ?? [],
    },
    bills: Array.isArray(partial.bills)
      ? partial.bills.map((b) => migrateBill(b as unknown as Record<string, unknown>))
      : [],
    billSnapshots: Array.isArray(partial.billSnapshots)
      ? partial.billSnapshots.map((s) => migrateBillSnapshot(s as unknown as Record<string, unknown>))
      : [],
    loans: Array.isArray(partial.loans)
      ? partial.loans.map((l) => migrateLoan(l as unknown as Record<string, unknown>))
      : [],
    subscriptions: Array.isArray(partial.subscriptions)
      ? partial.subscriptions.map((s) => migrateSubscription(s as unknown as Record<string, unknown>))
      : [],
    taxRecords: Array.isArray(partial.taxRecords)
      ? partial.taxRecords.map((r) => migrateTaxRecord(r as unknown as Record<string, unknown>))
      : [],
  };
}
