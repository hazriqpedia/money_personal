import { CalendarClock } from 'lucide-react';
import { EmptyTabPlaceholder } from './EmptyTabPlaceholder';

export const AgePlanPage = () => (
  <EmptyTabPlaceholder
    icon={CalendarClock}
    label="Age & Plan"
    description="Record your age, year, and life events — past and planned — on a personal timeline."
  />
);
