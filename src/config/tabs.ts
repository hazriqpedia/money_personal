import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  CalendarClock,
  Wallet,
  PiggyBank,
  Landmark,
  Receipt,
  Repeat,
  FileText,
} from 'lucide-react';
import { DashboardPage } from '../components/DashboardPage';
import { AgePlanPage } from '../components/AgePlanPage';
import { IncomePage } from '../components/IncomePage';
import { SavingsPage } from '../components/SavingsPage';
import { LoanPage } from '../components/LoanPage';
import { BillsPage } from '../components/BillsPage';
import { SubscriptionPage } from '../components/SubscriptionPage';
import { TaxPage } from '../components/TaxPage';

export interface TabConfig {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
  Component: ComponentType;
}

export const TABS: TabConfig[] = [
  { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard, Component: DashboardPage },
  { id: 'age-plan', path: '/age-plan', label: 'Age & Plan', icon: CalendarClock, Component: AgePlanPage },
  { id: 'income', path: '/income', label: 'Income', icon: Wallet, Component: IncomePage },
  { id: 'savings', path: '/savings', label: 'Savings', icon: PiggyBank, Component: SavingsPage },
  { id: 'loan', path: '/loan', label: 'Loan', icon: Landmark, Component: LoanPage },
  { id: 'bills', path: '/bills', label: 'Bills', icon: Receipt, Component: BillsPage },
  { id: 'subscription', path: '/subscription', label: 'Subscription', icon: Repeat, Component: SubscriptionPage },
  { id: 'tax', path: '/tax', label: 'Tax', icon: FileText, Component: TaxPage },
];
