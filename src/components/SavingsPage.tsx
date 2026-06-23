import { PiggyBank } from 'lucide-react';
import { EmptyTabPlaceholder } from './EmptyTabPlaceholder';

export const SavingsPage = () => (
  <EmptyTabPlaceholder
    icon={PiggyBank}
    label="Savings"
    description="Keep tabs on every savings account and how each balance is growing."
  />
);
