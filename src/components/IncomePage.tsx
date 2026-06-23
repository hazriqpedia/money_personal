import { Wallet } from 'lucide-react';
import { EmptyTabPlaceholder } from './EmptyTabPlaceholder';

export const IncomePage = () => (
  <EmptyTabPlaceholder
    icon={Wallet}
    label="Income"
    description="Track every source of income — salary, freelance, side gigs — in one place."
  />
);
