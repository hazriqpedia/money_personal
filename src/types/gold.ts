export type GoldMode = 'GAP' | 'Normal' | 'Wealth Card';

export interface GoldEntry {
  id: string;
  dateBought: string;
  mode: GoldMode;
  weight: number;
  price: number;
}
