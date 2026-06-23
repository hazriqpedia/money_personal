import { Repeat } from 'lucide-react';
import { EmptyTabPlaceholder } from './EmptyTabPlaceholder';

export const SubscriptionPage = () => (
  <EmptyTabPlaceholder
    icon={Repeat}
    label="Subscription"
    description="See every subscription in one list, with renewal dates and costs."
  />
);
