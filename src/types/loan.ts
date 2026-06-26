export interface Loan {
  id: string;
  name: string;
  dateBought: string;      // YYYY-MM-DD
  tenure: number;          // months
  totalLoan: number;
  monthly: number;         // stored; synced bidirectionally with totalLoan via tenure
  cardId: string | null;   // profile.creditCards id, or null = no card
  isCompleted: boolean;    // manually set by user (early settlement etc.)
}
