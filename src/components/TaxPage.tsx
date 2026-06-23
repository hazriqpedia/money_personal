import { FileText } from 'lucide-react';
import { EmptyTabPlaceholder } from './EmptyTabPlaceholder';

export const TaxPage = () => (
  <EmptyTabPlaceholder
    icon={FileText}
    label="Tax"
    description="Keep a record of tax filings and payments, year over year."
  />
);
