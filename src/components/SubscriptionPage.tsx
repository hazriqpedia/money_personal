import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAppData } from '../store/useAppData';
import { computeTotalMonthly } from '../utils/subscription';
import { formatCurrency } from '../utils/currency';
import { cn } from '../utils/cn';
import { FormattedNumberInput } from './FormattedNumberInput';
import type { Subscription } from '../types';

const cardClass = 'bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50';
const thClass =
  'px-3 py-2 bg-zinc-900 text-zinc-500 font-medium border-b border-zinc-800 text-xs uppercase tracking-wider';
const inputClass = 'bg-transparent outline-none w-full text-sm text-zinc-300 placeholder-zinc-700';
const tdClass = 'px-3 py-2 align-top';

export function SubscriptionPage() {
  const { appData, setSubscriptions } = useAppData();
  const { subscriptions, profile } = appData;
  const { currencySymbol, creditCards } = profile;

  const regularSubs = subscriptions.filter((s) => s.category === 'subscription');
  const insuranceSubs = subscriptions.filter((s) => s.category === 'insurance');

  const totalMonthly = computeTotalMonthly(subscriptions);

  const update = (id: string, updates: Partial<Subscription>) =>
    setSubscriptions(subscriptions.map((s) => (s.id === id ? { ...s, ...updates } : s)));

  const remove = (id: string) =>
    setSubscriptions(subscriptions.filter((s) => s.id !== id));

  const add = (category: 'subscription' | 'insurance') =>
    setSubscriptions([
      ...subscriptions,
      {
        id: uuidv4(),
        category,
        name: '',
        billingDate: '',
        monthly: 0,
        annually: 0,
        cardId: null,
        paymentMethod: '',
        insuranceType: '',
      },
    ]);

  const subAnnualTotal = regularSubs.reduce((s, r) => s + r.monthly * 12 + r.annually, 0);
  const insAnnualTotal = insuranceSubs.reduce((s, r) => s + r.monthly * 12 + r.annually, 0);

  const cardDropdown = (sub: Subscription) => (
    <select
      value={sub.cardId ?? ''}
      onChange={(e) => update(sub.id, { cardId: e.target.value || null })}
      className="bg-transparent outline-none text-sm text-zinc-400 w-full"
    >
      <option value="">None</option>
      {creditCards.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );

  return (
    <div className="max-w-5xl mx-auto px-10 pt-10 pb-10 w-full">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Subscriptions</h1>
          <p className="text-zinc-500 text-sm">
            Recurring subscriptions and insurance, with annual cost breakdown.
          </p>
        </div>
        {subscriptions.length > 0 && (
          <div className={cn(cardClass, 'text-right shrink-0 ml-6')}>
            <p className="text-xs text-zinc-500 mb-0.5">Monthly</p>
            <p className="text-lg font-medium text-zinc-100">
              {formatCurrency(totalMonthly, currencySymbol)}
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">
              {formatCurrency(totalMonthly * 12, currencySymbol)} / year
            </p>
          </div>
        )}
      </div>

      {/* Subscriptions table */}
      <div className="mb-10">
        <h2 className="text-base font-medium text-zinc-200 mb-3">Subscriptions</h2>
        <div className="overflow-auto">
          <table className="text-left border-collapse w-full">
            <thead>
              <tr>
                <th className={cn(thClass, 'w-44')}>Name</th>
                <th className={cn(thClass, 'w-20')}>Date</th>
                <th className={thClass}>Monthly</th>
                <th className={thClass}>Annually</th>
                <th className={cn(thClass, 'text-right')}>Annual $</th>
                <th className={thClass}>Card</th>
                <th className="w-8 bg-zinc-900 border-b border-zinc-800" />
              </tr>
            </thead>
            <tbody>
              {regularSubs.map((sub) => {
                const annual = sub.monthly * 12 + sub.annually;
                return (
                  <tr
                    key={sub.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group"
                  >
                    <td className={tdClass}>
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => update(sub.id, { name: e.target.value })}
                        placeholder="e.g. Netflix"
                        className={inputClass}
                      />
                    </td>
                    <td className={tdClass}>
                      <input
                        type="text"
                        value={sub.billingDate}
                        onChange={(e) => update(sub.id, { billingDate: e.target.value })}
                        placeholder="16/7"
                        className={inputClass}
                      />
                    </td>
                    <td className={tdClass}>
                      <FormattedNumberInput
                        value={sub.monthly}
                        onChange={(v) => update(sub.id, { monthly: v })}
                        className={inputClass}
                      />
                    </td>
                    <td className={tdClass}>
                      <FormattedNumberInput
                        value={sub.annually}
                        onChange={(v) => update(sub.id, { annually: v })}
                        className={inputClass}
                      />
                    </td>
                    <td className={cn(tdClass, 'text-right')}>
                      <span className="text-sm text-zinc-400">
                        {formatCurrency(annual, currencySymbol)}
                      </span>
                    </td>
                    <td className={tdClass}>{cardDropdown(sub)}</td>
                    <td className="px-3 py-2 align-top relative">
                      <button
                        onClick={() => remove(sub.id)}
                        aria-label="Delete subscription"
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {regularSubs.length > 0 && (
              <tfoot>
                <tr className="border-t border-zinc-700">
                  <td className={cn(tdClass, 'text-xs text-zinc-500 font-medium')} colSpan={2}>
                    TOTAL
                  </td>
                  <td className={tdClass}>
                    <span className="text-xs text-zinc-400">
                      {formatCurrency(
                        regularSubs.reduce((s, r) => s + r.monthly, 0),
                        currencySymbol,
                      )}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <span className="text-xs text-zinc-400">
                      {formatCurrency(
                        regularSubs.reduce((s, r) => s + r.annually, 0),
                        currencySymbol,
                      )}
                    </span>
                  </td>
                  <td className={cn(tdClass, 'text-right')}>
                    <span className="text-xs text-zinc-300 font-medium">
                      {formatCurrency(subAnnualTotal, currencySymbol)}
                    </span>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <button
          onClick={() => add('subscription')}
          className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-3 transition-colors"
        >
          <Plus size={14} /> Add subscription
        </button>
      </div>

      {/* Insurance table */}
      <div>
        <h2 className="text-base font-medium text-zinc-200 mb-3">Insurance</h2>
        <div className="overflow-auto">
          <table className="text-left border-collapse w-full">
            <thead>
              <tr>
                <th className={cn(thClass, 'w-44')}>Name</th>
                <th className={cn(thClass, 'w-20')}>Date</th>
                <th className={thClass}>Monthly</th>
                <th className={thClass}>Annually</th>
                <th className={cn(thClass, 'text-right')}>Annual $</th>
                <th className={thClass}>Payment</th>
                <th className={thClass}>Type</th>
                <th className={thClass}>Card</th>
                <th className="w-8 bg-zinc-900 border-b border-zinc-800" />
              </tr>
            </thead>
            <tbody>
              {insuranceSubs.map((sub) => {
                const annual = sub.monthly * 12 + sub.annually;
                return (
                  <tr
                    key={sub.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group"
                  >
                    <td className={tdClass}>
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => update(sub.id, { name: e.target.value })}
                        placeholder="e.g. Takaful"
                        className={inputClass}
                      />
                    </td>
                    <td className={tdClass}>
                      <input
                        type="text"
                        value={sub.billingDate}
                        onChange={(e) => update(sub.id, { billingDate: e.target.value })}
                        placeholder="15/7"
                        className={inputClass}
                      />
                    </td>
                    <td className={tdClass}>
                      <FormattedNumberInput
                        value={sub.monthly}
                        onChange={(v) => update(sub.id, { monthly: v })}
                        className={inputClass}
                      />
                    </td>
                    <td className={tdClass}>
                      <FormattedNumberInput
                        value={sub.annually}
                        onChange={(v) => update(sub.id, { annually: v })}
                        className={inputClass}
                      />
                    </td>
                    <td className={cn(tdClass, 'text-right')}>
                      <span className="text-sm text-zinc-400">
                        {formatCurrency(annual, currencySymbol)}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <input
                        type="text"
                        value={sub.paymentMethod}
                        onChange={(e) => update(sub.id, { paymentMethod: e.target.value })}
                        placeholder="Maybank"
                        className={inputClass}
                      />
                    </td>
                    <td className={tdClass}>
                      <input
                        type="text"
                        value={sub.insuranceType}
                        onChange={(e) => update(sub.id, { insuranceType: e.target.value })}
                        placeholder="Perubatan"
                        className={inputClass}
                      />
                    </td>
                    <td className={tdClass}>{cardDropdown(sub)}</td>
                    <td className="px-3 py-2 align-top relative">
                      <button
                        onClick={() => remove(sub.id)}
                        aria-label="Delete insurance"
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {insuranceSubs.length > 0 && (
              <tfoot>
                <tr className="border-t border-zinc-700">
                  <td className={cn(tdClass, 'text-xs text-zinc-500 font-medium')} colSpan={2}>
                    TOTAL
                  </td>
                  <td className={tdClass}>
                    <span className="text-xs text-zinc-400">
                      {formatCurrency(
                        insuranceSubs.reduce((s, r) => s + r.monthly, 0),
                        currencySymbol,
                      )}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <span className="text-xs text-zinc-400">
                      {formatCurrency(
                        insuranceSubs.reduce((s, r) => s + r.annually, 0),
                        currencySymbol,
                      )}
                    </span>
                  </td>
                  <td className={cn(tdClass, 'text-right')}>
                    <span className="text-xs text-zinc-300 font-medium">
                      {formatCurrency(insAnnualTotal, currencySymbol)}
                    </span>
                  </td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <button
          onClick={() => add('insurance')}
          className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-3 transition-colors"
        >
          <Plus size={14} /> Add insurance
        </button>
      </div>
    </div>
  );
}
