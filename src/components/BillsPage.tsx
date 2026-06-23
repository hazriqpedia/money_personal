import { Receipt } from 'lucide-react';
import { EmptyTabPlaceholder } from './EmptyTabPlaceholder';

export const BillsPage = () => (
  <EmptyTabPlaceholder
    icon={Receipt}
    label="Bills"
    description="Stay on top of recurring bills so nothing slips through the cracks."
  />
);
