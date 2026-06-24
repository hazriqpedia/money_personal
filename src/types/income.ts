export interface IncomeEntry {
  id: string;
  year: number;
  label: string;
  monthly: number;
  annually: number;
  gross: number;
  // When a year has 2+ entries (e.g. a mid-year raise), this flags which one is
  // "current" for that year — used for Balance and the Dashboard's Gross lookup.
  // Irrelevant for a year with a single entry; see pickPrimaryEntry in utils/income.ts.
  isPrimary: boolean;
}
