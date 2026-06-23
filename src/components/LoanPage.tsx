import { Landmark } from 'lucide-react';
import { EmptyTabPlaceholder } from './EmptyTabPlaceholder';

export const LoanPage = () => (
  <EmptyTabPlaceholder
    icon={Landmark}
    label="Loan"
    description="Track outstanding loans, balances, and repayment progress."
  />
);
