export interface Bill {
  id: string;
  name: string;
  defaultAmount: number;
}

export interface BillPaymentEntry {
  billId: string;
  amount: number;
  paid: boolean;
}

export interface CcPaymentEntry {
  cardId: string;
  amount: number;
  paid: boolean;
}

export interface BillSnapshot {
  id: string;
  yearMonth: string; // "YYYY-MM"
  entries: BillPaymentEntry[];
  ccEntries: CcPaymentEntry[];
}
