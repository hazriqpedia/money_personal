export const DEFAULT_TAX_CATEGORIES = [
  'EPF',
  'PRS',
  'Zakat',
  'Donation',
  'Insurance',
  'Medical',
  'Education',
  'Lifestyle',
  'Other',
] as const;

export interface TaxRecord {
  id: string;
  year: number;
  category: string;  // string so custom categories from Profile work alongside DEFAULT_TAX_CATEGORIES
  item: string;      // e.g. "Self Contribute", "Fitrah", "Hospis"
  date: string;      // free text, e.g. "Feb 25, 26"
  amount: number;
}
