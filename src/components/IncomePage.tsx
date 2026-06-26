import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAppData } from '../store/useAppData';
import {
  computeIncrement,
  formatIncrement,
  computeDifference,
  formatDifference,
  pickPrimaryEntry,
} from '../utils/income';
import { computeMonthlyForCard } from '../utils/loan';
import { computeMonthlyForCard as computeSubMonthlyForCard } from '../utils/subscription';
import { formatCurrency } from '../utils/currency';
import { cn } from '../utils/cn';
import { SpendingItemList } from './SpendingItemList';
import { DonutChart } from './DonutChart';
import { FormattedNumberInput } from './FormattedNumberInput';
import type { IncomeEntry, SpendingItem } from '../types';

const cardClass = 'bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50';
const thClass =
  'px-3 py-2 bg-zinc-900 text-zinc-500 font-medium border-b border-zinc-800 text-xs uppercase tracking-wider';
const inputClass = 'bg-transparent outline-none w-full text-sm text-zinc-300';

export function IncomePage() {
  const { appData, setIncome, setSpendingPlan, setSavingsPlan, setCreditCardSpending } = useAppData();
  const { income, spendingPlan, savingsPlan, creditCardSpending, profile } = appData;
  const currentYear = new Date().getFullYear();
  const sortedEntries = [...income].sort((a, b) => a.year - b.year);

  const updateEntry = (id: string, updates: Partial<IncomeEntry>) => {
    setIncome(income.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)));
  };

  const removeEntry = (id: string) => {
    setIncome(income.filter((entry) => entry.id !== id));
  };

  const addEntry = () => {
    const latest = sortedEntries[sortedEntries.length - 1];
    const year = sortedEntries.length > 0 ? Math.max(...income.map((e) => e.year)) + 1 : currentYear;
    const newEntry: IncomeEntry = {
      id: uuidv4(),
      year,
      label: '',
      monthly: latest?.monthly ?? 0,
      annually: latest?.annually ?? 0,
      gross: latest?.gross ?? 0,
      isPrimary: false,
    };
    setIncome([...income, newEntry]);
  };

  // Editing Year onto a value another row already has (e.g. a mid-year raise added
  // as its own row, then retargeted to the same year) makes a year ambiguous — the
  // just-edited row becomes the one used for Balance/Dashboard by default, since
  // it's the one the user just touched; the other can still be picked via the
  // Active column below.
  const handleYearChange = (entry: IncomeEntry, year: number) => {
    const collides = income.some((e) => e.id !== entry.id && e.year === year);
    if (!collides) {
      updateEntry(entry.id, { year });
      return;
    }
    setIncome(
      income.map((e) => {
        if (e.id === entry.id) return { ...e, year, isPrimary: true };
        if (e.year === year) return { ...e, isPrimary: false };
        return e;
      })
    );
  };

  const setPrimaryForYear = (id: string, year: number) => {
    setIncome(income.map((e) => (e.year === year ? { ...e, isPrimary: e.id === id } : e)));
  };

  const handleMonthlyChange = (entry: IncomeEntry, monthly: number) =>
    updateEntry(entry.id, { monthly, annually: monthly * 12 });

  const handleAnnuallyChange = (entry: IncomeEntry, annually: number) =>
    updateEntry(entry.id, { annually, monthly: annually / 12 });

  const showActiveColumn = income.filter((e) => e.year === currentYear).length > 1;
  const activeEntryId = pickPrimaryEntry(income, currentYear)?.id;

  const cardTotals = profile.creditCards.map((card) => {
    const items = creditCardSpending.find((c) => c.cardId === card.id)?.items ?? [];
    const manualTotal = items.reduce((sum, i) => sum + i.amount, 0);
    const loanTotal = computeMonthlyForCard(appData.loans, card.id);
    const subscriptionTotal = computeSubMonthlyForCard(appData.subscriptions, card.id);
    return { id: card.id, name: card.name, total: manualTotal + loanTotal + subscriptionTotal, loanTotal, subscriptionTotal };
  });
  const totalCC = cardTotals.reduce((sum, c) => sum + c.total, 0);
  const savingsTotal = savingsPlan.reduce((sum, i) => sum + i.amount, 0);
  const manualSpendingTotal = spendingPlan.reduce((sum, i) => sum + i.amount, 0);
  const totalMonthlySpending = manualSpendingTotal + totalCC + savingsTotal;
  const currentYearEntry = pickPrimaryEntry(income, currentYear);
  const balance = currentYearEntry ? currentYearEntry.gross - totalMonthlySpending : null;

  const updateCardItems = (cardId: string, items: SpendingItem[]) => {
    const exists = creditCardSpending.some((c) => c.cardId === cardId);
    setCreditCardSpending(
      exists
        ? creditCardSpending.map((c) => (c.cardId === cardId ? { ...c, items } : c))
        : [...creditCardSpending, { cardId, items }]
    );
  };

  const mainChartData = [
    ...spendingPlan.map((item) => ({ label: item.name || 'Untitled', value: item.amount })),
    ...cardTotals.map((c) => ({ label: c.name || 'Untitled card', value: c.total })),
    { label: 'Savings', value: savingsTotal },
  ];

  return (
    <div className="max-w-5xl mx-auto px-10 pt-10 pb-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Income</h1>
        <p className="text-zinc-500 text-sm">Your income, year by year — and where it goes every month.</p>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="py-16 text-center mb-12">
          <p className="text-zinc-500 text-sm mb-3">No entries yet.</p>
          <button
            onClick={addEntry}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg px-4 py-2 transition-colors"
          >
            <Plus size={14} /> Add year
          </button>
        </div>
      ) : (
        <div className="mb-12">
          <div className="overflow-auto">
            <table className="text-left border-collapse w-full">
              <thead>
                <tr>
                  <th className={cn(thClass, 'w-20')}>Year</th>
                  {showActiveColumn && <th className={cn(thClass, 'w-16')}>Active</th>}
                  <th className={thClass}>Label</th>
                  <th className={thClass}>Monthly</th>
                  <th className={thClass}>Annually</th>
                  <th className={thClass}>Increment</th>
                  <th className={thClass}>Gross</th>
                  <th className={thClass}>Difference</th>
                  <th className="w-8 bg-zinc-900 border-b border-zinc-800" />
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className={cn(
                      'border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group',
                      entry.year === currentYear ? 'bg-zinc-800/30' : 'bg-[#09090b]'
                    )}
                  >
                    <td className="px-3 py-2 align-top">
                      <input
                        type="number"
                        value={entry.year}
                        onChange={(e) => handleYearChange(entry, Number(e.target.value))}
                        className={inputClass}
                      />
                    </td>
                    {showActiveColumn && (
                      <td className="px-3 py-2 align-top">
                        {entry.year === currentYear && (
                          <button
                            type="button"
                            onClick={() => setPrimaryForYear(entry.id, entry.year)}
                            aria-pressed={activeEntryId === entry.id}
                            aria-label="Use this entry for the current year's Balance and Dashboard"
                            className={cn(
                              'h-4 w-4 rounded-full border flex items-center justify-center transition-colors',
                              activeEntryId === entry.id ? 'border-zinc-100' : 'border-zinc-700 hover:border-zinc-500'
                            )}
                          >
                            {activeEntryId === entry.id && <span className="h-2 w-2 rounded-full bg-zinc-100" />}
                          </button>
                        )}
                      </td>
                    )}
                    <td className="px-3 py-2 align-top">
                      <input
                        type="text"
                        value={entry.label}
                        onChange={(e) => updateEntry(entry.id, { label: e.target.value })}
                        placeholder="e.g. DHL"
                        className={cn(inputClass, 'placeholder-zinc-700')}
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <FormattedNumberInput
                        value={entry.monthly}
                        onChange={(monthly) => handleMonthlyChange(entry, monthly)}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <FormattedNumberInput
                        value={entry.annually}
                        onChange={(annually) => handleAnnuallyChange(entry, annually)}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <span className="text-sm text-zinc-400">
                        {formatIncrement(computeIncrement(sortedEntries, index))}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <FormattedNumberInput
                        value={entry.gross}
                        onChange={(gross) => updateEntry(entry.id, { gross })}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <span className="text-sm text-zinc-400">
                        {formatDifference(computeDifference(sortedEntries, index), profile.currencySymbol)}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top relative">
                      <button
                        onClick={() => removeEntry(entry.id)}
                        aria-label="Delete year"
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={addEntry}
            className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-3 transition-colors"
          >
            <Plus size={14} /> Add year
          </button>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-medium text-zinc-100 mb-1">Planning for income</h2>
        <p className="text-zinc-500 text-sm">Where your money goes every month, and what&apos;s left over.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className={cardClass}>
          <h3 className="text-zinc-200 font-medium mb-4">Monthly Spending</h3>
          <DonutChart data={mainChartData} currencySymbol={profile.currencySymbol} />
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Total</span>
              <span className="text-zinc-300">{formatCurrency(manualSpendingTotal, profile.currencySymbol)}</span>
            </div>
            {totalCC > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">Total CC</span>
                <span className="text-zinc-500">{formatCurrency(totalCC, profile.currencySymbol)}</span>
              </div>
            )}
            {currentYearEntry ? (
              <div className="flex items-center justify-between text-sm pt-2 border-t border-zinc-800/50">
                <span className="text-zinc-400">Balance</span>
                <span className="text-zinc-100 font-medium">
                  {formatCurrency(balance ?? 0, profile.currencySymbol)}
                </span>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-800/50">
                Add an entry for {currentYear} to see your balance.
              </p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800/50">
            <SpendingItemList items={spendingPlan} onChange={setSpendingPlan} currencySymbol={profile.currencySymbol} />
          </div>
        </div>

        <div className={cardClass}>
          <h3 className="text-zinc-200 font-medium mb-4">Savings</h3>
          <DonutChart
            data={savingsPlan.map((i) => ({ label: i.name || 'Untitled', value: i.amount }))}
            currencySymbol={profile.currencySymbol}
          />
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Total</span>
              <span className="text-zinc-300">{formatCurrency(savingsTotal, profile.currencySymbol)}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800/50">
            <SpendingItemList items={savingsPlan} onChange={setSavingsPlan} currencySymbol={profile.currencySymbol} />
          </div>
        </div>
      </div>

      {profile.creditCards.length === 0 ? (
        <Link
          to="/profile"
          className="block text-center text-sm text-zinc-500 hover:text-zinc-300 border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-6 transition-colors"
        >
          Add a credit card in your Profile to start tracking its spending.
        </Link>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.creditCards.map((card) => {
            const cardItems = creditCardSpending.find((c) => c.cardId === card.id)?.items ?? [];
            const cardEntry = cardTotals.find((c) => c.id === card.id);
            const loanTotal = cardEntry?.loanTotal ?? 0;
            const subscriptionTotal = cardEntry?.subscriptionTotal ?? 0;
            const cardTotal = cardEntry?.total ?? 0;
            return (
              <div key={card.id} className={cardClass}>
                <h3 className="text-zinc-200 font-medium mb-4">{card.name || 'Untitled Card'} Breakdown</h3>
                <DonutChart
                  data={[
                    ...cardItems.map((i) => ({ label: i.name || 'Untitled', value: i.amount })),
                    ...(loanTotal > 0 ? [{ label: 'Loan Installments', value: loanTotal }] : []),
                    ...(subscriptionTotal > 0 ? [{ label: 'Subscriptions', value: subscriptionTotal }] : []),
                  ]}
                  currencySymbol={profile.currencySymbol}
                />
                <div className="mt-4 space-y-1.5">
                  {loanTotal > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600">Loan Installments</span>
                      <span className="text-zinc-500">{formatCurrency(loanTotal, profile.currencySymbol)}</span>
                    </div>
                  )}
                  {subscriptionTotal > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600">Subscriptions</span>
                      <span className="text-zinc-500">{formatCurrency(subscriptionTotal, profile.currencySymbol)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Total</span>
                    <span className="text-zinc-300">{formatCurrency(cardTotal, profile.currencySymbol)}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800/50">
                  <SpendingItemList items={cardItems} onChange={(items) => updateCardItems(card.id, items)} currencySymbol={profile.currencySymbol} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
