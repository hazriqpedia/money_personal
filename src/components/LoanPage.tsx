import { Link } from 'react-router-dom';
import { Plus, Trash2, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAppData } from '../store/useAppData';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/currency';
import {
  computeDateDone,
  isLoanActive,
  computeTotalMonthly,
  computeMonthlyForCard,
  computeRemainingBalance,
  computeEndingByYear,
} from '../utils/loan';
import { FormattedNumberInput } from './FormattedNumberInput';
import type { Loan } from '../types';

const cardClass = 'bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50';
const thClass =
  'px-3 py-2 bg-zinc-900 text-zinc-500 font-medium border-b border-zinc-800 text-xs uppercase tracking-wider';
const inputClass = 'bg-transparent outline-none w-full text-sm text-zinc-300';
const selectClass =
  'bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-sm text-zinc-300 outline-none focus:border-zinc-600 transition-colors w-full';

function formatDateDone(dateStr: string): string {
  if (!dateStr) return '—';
  const [year, month] = dateStr.split('-').map(Number);
  return new Date(year, month - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

export function LoanPage() {
  const { appData, setLoans } = useAppData();
  const { loans, profile } = appData;
  const { creditCards, currencySymbol } = profile;

  const sortedLoans = [...loans].sort((a, b) => a.dateBought.localeCompare(b.dateBought));

  const updateLoan = (id: string, updates: Partial<Loan>) => {
    setLoans(loans.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const handleMonthlyChange = (loan: Loan, monthly: number) =>
    updateLoan(loan.id, { monthly, totalLoan: monthly * loan.tenure });

  const handleTotalLoanChange = (loan: Loan, totalLoan: number) =>
    updateLoan(loan.id, { totalLoan, monthly: loan.tenure > 0 ? totalLoan / loan.tenure : 0 });

  const handleTenureChange = (loan: Loan, tenure: number) =>
    updateLoan(loan.id, { tenure, monthly: tenure > 0 ? loan.totalLoan / tenure : 0 });

  const removeLoan = (id: string) => {
    setLoans(loans.filter((l) => l.id !== id));
  };

  const addLoan = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const newLoan: Loan = {
      id: uuidv4(),
      name: '',
      dateBought: todayStr,
      tenure: 12,
      totalLoan: 0,
      monthly: 0,
      cardId: creditCards.length > 0 ? creditCards[0].id : null,
      isCompleted: false,
    };
    setLoans([...loans, newLoan]);
  };

  const totalMonthly = computeTotalMonthly(loans);
  const totalRemaining = loans.reduce((sum, l) => sum + computeRemainingBalance(l), 0);
  const activeCount = loans.filter(isLoanActive).length;
  const endingByYear = computeEndingByYear(loans);

  const cardBreakdown = creditCards
    .map((card) => {
      const monthly = computeMonthlyForCard(loans, card.id);
      const pct = totalMonthly > 0 ? (monthly / totalMonthly) * 100 : 0;
      return { card, monthly, pct };
    })
    .filter(({ monthly }) => monthly > 0);

  return (
    <div className="max-w-5xl mx-auto px-10 pt-10 pb-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Loans</h1>
        <p className="text-zinc-500 text-sm">Track instalment plans and see how much you owe every month.</p>
      </div>

      {/* Summary cards — always visible at top */}
      {loans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className={cardClass}>
            <h3 className="text-zinc-200 font-medium mb-3">Monthly installments</h3>
            <div className="mb-4">
              <p className="text-xs text-zinc-500 mb-0.5">Total active</p>
              <p className="text-zinc-100 font-semibold text-2xl">{formatCurrency(totalMonthly, currencySymbol)}</p>
            </div>
            {cardBreakdown.length > 0 ? (
              <div className="space-y-2 pt-3 border-t border-zinc-800/50">
                {cardBreakdown.map(({ card, monthly, pct }) => (
                  <div key={card.id} className="flex items-center justify-between text-xs gap-2">
                    <span className="text-zinc-400 shrink-0">{card.name || 'Untitled card'}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-zinc-500">{pct.toFixed(1)}%</span>
                      <span className="text-zinc-300">{formatCurrency(monthly, currencySymbol)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              creditCards.length === 0 && (
                <p className="text-xs text-zinc-600 mt-2">
                  <Link to="/profile" className="underline underline-offset-2 hover:text-zinc-400 transition-colors">
                    Add credit cards in Profile
                  </Link>{' '}
                  to see per-card breakdown.
                </p>
              )
            )}
          </div>

          <div className={cardClass}>
            <h3 className="text-zinc-200 font-medium mb-3">Loan overview</h3>
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div>
                <p className="text-zinc-500 mb-0.5">Active loans</p>
                <p className="text-zinc-200">{activeCount} / {loans.length}</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-0.5">Total remaining</p>
                <p className="text-zinc-200">{formatCurrency(totalRemaining, currencySymbol)}</p>
              </div>
            </div>
            {endingByYear.length > 0 && (
              <div className="pt-3 border-t border-zinc-800/50">
                <p className="text-xs text-zinc-500 mb-2">Ending by year (active only)</p>
                <div className="space-y-1.5">
                  {endingByYear.map(({ year, count }) => (
                    <div key={year} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">{year}</span>
                      <span className="text-zinc-300">{count} loan{count !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {sortedLoans.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-zinc-500 text-sm mb-3">No loans yet.</p>
          <button
            onClick={addLoan}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg px-4 py-2 transition-colors"
          >
            <Plus size={14} /> Add loan
          </button>
        </div>
      ) : (
        <div>
          <div className="overflow-auto">
            <table className="text-left border-collapse w-full">
              <thead>
                <tr>
                  <th className={cn(thClass, 'w-8')} aria-label="Done" />
                  <th className={cn(thClass, 'min-w-32')}>Item</th>
                  <th className={cn(thClass, 'w-36')}>Date Bought</th>
                  <th className={cn(thClass, 'w-24')}>Tenure (mo)</th>
                  <th className={cn(thClass, 'w-32')}>Monthly</th>
                  <th className={cn(thClass, 'w-32')}>Total Loan</th>
                  <th className={cn(thClass, 'w-28')}>Date Done</th>
                  <th className={cn(thClass, 'min-w-36')}>Card</th>
                  <th className="w-8 bg-zinc-900 border-b border-zinc-800" />
                </tr>
              </thead>
              <tbody>
                {sortedLoans.map((loan) => {
                  const active = isLoanActive(loan);
                  const dateDone = computeDateDone(loan);
                  return (
                    <tr
                      key={loan.id}
                      className={cn(
                        'border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group',
                        active ? 'bg-[#09090b]' : 'bg-zinc-900/30'
                      )}
                    >
                      {/* Done checkbox */}
                      <td className="px-3 py-2 align-middle">
                        <button
                          type="button"
                          onClick={() => updateLoan(loan.id, { isCompleted: !loan.isCompleted })}
                          aria-label={loan.isCompleted ? 'Mark as active' : 'Mark as completed'}
                          className={cn(
                            'h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0',
                            loan.isCompleted
                              ? 'border-zinc-600 bg-zinc-800 text-zinc-400'
                              : 'border-zinc-700 hover:border-zinc-500'
                          )}
                        >
                          {loan.isCompleted && <Check size={10} />}
                        </button>
                      </td>

                      {/* Item */}
                      <td className="px-3 py-2 align-middle">
                        <input
                          type="text"
                          value={loan.name}
                          onChange={(e) => updateLoan(loan.id, { name: e.target.value })}
                          placeholder="e.g. iPhone 15"
                          className={cn(
                            inputClass,
                            'placeholder-zinc-700',
                            loan.isCompleted && 'line-through text-zinc-600'
                          )}
                        />
                      </td>

                      {/* Date bought */}
                      <td className="px-3 py-2 align-middle">
                        <input
                          type="date"
                          value={loan.dateBought}
                          onChange={(e) => updateLoan(loan.id, { dateBought: e.target.value })}
                          className={cn(inputClass, active ? 'text-zinc-300' : 'text-zinc-600')}
                        />
                      </td>

                      {/* Tenure */}
                      <td className="px-3 py-2 align-middle">
                        <input
                          type="number"
                          value={loan.tenure}
                          min={1}
                          onChange={(e) => handleTenureChange(loan, Math.max(1, Number(e.target.value)))}
                          className={cn(inputClass, active ? '' : 'text-zinc-600')}
                        />
                      </td>

                      {/* Monthly — editable, syncs totalLoan */}
                      <td className="px-3 py-2 align-middle">
                        <FormattedNumberInput
                          value={loan.monthly}
                          onChange={(monthly) => handleMonthlyChange(loan, monthly)}
                          className={cn(inputClass, active ? '' : 'text-zinc-600')}
                        />
                      </td>

                      {/* Total loan — editable, syncs monthly */}
                      <td className="px-3 py-2 align-middle">
                        <FormattedNumberInput
                          value={loan.totalLoan}
                          onChange={(totalLoan) => handleTotalLoanChange(loan, totalLoan)}
                          className={cn(inputClass, active ? '' : 'text-zinc-600')}
                        />
                      </td>

                      {/* Date done — computed */}
                      <td className="px-3 py-2 align-middle">
                        <span className={cn('text-sm', active ? 'text-zinc-400' : 'text-zinc-600')}>
                          {formatDateDone(dateDone)}
                        </span>
                      </td>

                      {/* Card */}
                      <td className="px-3 py-2 align-middle">
                        {creditCards.length === 0 ? (
                          <Link
                            to="/profile"
                            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors underline underline-offset-2"
                          >
                            Add cards in Profile
                          </Link>
                        ) : (
                          <select
                            value={loan.cardId ?? ''}
                            onChange={(e) => updateLoan(loan.id, { cardId: e.target.value || null })}
                            className={cn(selectClass, !active && 'opacity-50')}
                          >
                            <option value="">No card</option>
                            {creditCards.map((card) => (
                              <option key={card.id} value={card.id}>
                                {card.name || 'Untitled card'}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="px-3 py-2 align-middle relative">
                        <button
                          onClick={() => removeLoan(loan.id)}
                          aria-label="Delete loan"
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button
            onClick={addLoan}
            className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-3 transition-colors"
          >
            <Plus size={14} /> Add loan
          </button>
        </div>
      )}
    </div>
  );
}
