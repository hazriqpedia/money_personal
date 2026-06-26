export interface Subscription {
  id: string;
  category: 'subscription' | 'insurance';
  name: string;
  billingDate: string;    // free text "day/month", e.g. "16/7"
  monthly: number;        // amount paid monthly
  annually: number;       // amount paid as one-time annual lump sum
  cardId: string | null;  // profile.creditCards id — drives Income tab auto-integration
  paymentMethod: string;  // free text display label, e.g. "Maybank", "EPF"
  insuranceType: string;  // e.g. "Perubatan", "Nyawa" — empty for regular subs
}
