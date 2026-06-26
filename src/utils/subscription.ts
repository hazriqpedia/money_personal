import type { Subscription } from '../types';

export function computeMonthlyEquivalent(sub: Subscription): number {
  return (sub.monthly * 12 + sub.annually) / 12;
}

export function computeMonthlyForCard(subscriptions: Subscription[], cardId: string): number {
  return subscriptions
    .filter((s) => s.cardId === cardId)
    .reduce((sum, s) => sum + computeMonthlyEquivalent(s), 0);
}

export function computeTotalMonthly(subscriptions: Subscription[]): number {
  return subscriptions.reduce((sum, s) => sum + computeMonthlyEquivalent(s), 0);
}
