import { useState } from 'react';
import { useAppData } from '../store/useAppData';
import { BackupControls } from './BackupControls';
import { ageForYear } from '../utils/age';
import { formatCurrency } from '../utils/currency';
import { pickPrimaryEntry } from '../utils/income';
import { cn } from '../utils/cn';
import { computeRowTotal, computeSavingsOnlyTotal } from '../utils/savings';
import { computeTotalWeight, computeGapWeight, computeTotalCost } from '../utils/gold';

const cardClass = 'bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50';

function formatCount(count: number, scope?: string) {
  if (count === 0) return scope ? `No entries for ${scope}.` : 'No entries yet.';
  const noun = count === 1 ? 'entry' : 'entries';
  return scope ? `${count} ${noun} in ${scope}.` : `${count} ${noun}.`;
}

export const DashboardPage = () => {
  const { appData } = useAppData();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const availableYears = Array.from(new Set([
    currentYear,
    ...appData.agePlan.map(e => e.year),
    ...appData.taxRecords.map(e => e.year),
    ...appData.income.map(e => e.year),
  ])).sort((a, b) => b - a);

  const agePlanCount = appData.agePlan.filter(e => e.year === selectedYear).length;
  const taxCount = appData.taxRecords.filter(e => e.year === selectedYear).length;
  const selectedYearAge = appData.profile.dateOfBirth
    ? ageForYear(appData.profile.dateOfBirth, selectedYear)
    : null;
  const incomeEntry = pickPrimaryEntry(appData.income, selectedYear);
  const { needs, wants, savings } = appData.profile.budgetSplit;
  const { currencySymbol } = appData.profile;
  const savingsActual = appData.savingsPlan.reduce((sum, item) => sum + item.amount, 0);
  const savingsTarget = incomeEntry ? (incomeEntry.gross * savings) / 100 : 0;
  const savingsShort = incomeEntry !== undefined && savingsActual < savingsTarget;

  const sortedSnapshots = [...appData.savingsSnapshots].sort((a, b) => a.date.localeCompare(b.date));
  const latestSnapshot = sortedSnapshots[sortedSnapshots.length - 1];

  const sortedEpf = [...appData.epfEntries].sort((a, b) => a.date.localeCompare(b.date));
  const latestEpf = sortedEpf[sortedEpf.length - 1];

  const goldTotalWeight = computeTotalWeight(appData.goldEntries);
  const goldGapWeight = computeGapWeight(appData.goldEntries);
  const goldTotalCost = computeTotalCost(appData.goldEntries);

  const sections = [
    { label: 'Age & Plan', text: formatCount(agePlanCount, String(selectedYear)) },
    { label: 'Loans', text: formatCount(appData.loans.length) },
    { label: 'Bills', text: formatCount(appData.bills.length) },
    { label: 'Subscriptions', text: formatCount(appData.subscriptions.length) },
    { label: 'Tax Records', text: formatCount(taxCount, String(selectedYear)) },
  ];

  return (
    <div className="max-w-6xl mx-auto px-10 pt-10 pb-10 w-full">
      <div className="text-center mb-8">
        <p className="text-zinc-500 text-sm">Your financial picture, all in one place.</p>
      </div>

      <div className="flex justify-between items-end mb-4 border-b border-zinc-800/50 pb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="dashboard-year" className="text-xs uppercase tracking-wider text-zinc-500">
            Year
          </label>
          <select
            id="dashboard-year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-sm text-zinc-300 outline-none focus:border-zinc-600 transition-colors"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {selectedYearAge !== null && (
            <>
              <span className="text-zinc-700 select-none" aria-hidden="true">|</span>
              <span className="text-sm text-zinc-400">{selectedYearAge} years old</span>
            </>
          )}
        </div>
        <BackupControls />
      </div>

      <div className={cn(cardClass, 'mb-3')}>
        <h3 className="text-zinc-200 font-medium leading-tight mb-2">Income</h3>
        {incomeEntry ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-zinc-500 mb-0.5">Gross</p>
              <p className="text-zinc-200">{formatCurrency(incomeEntry.gross, currencySymbol)}</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-0.5">Needs ({needs}%)</p>
              <p className="text-zinc-200">{formatCurrency((incomeEntry.gross * needs) / 100, currencySymbol)}</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-0.5">Wants ({wants}%)</p>
              <p className="text-zinc-200">{formatCurrency((incomeEntry.gross * wants) / 100, currencySymbol)}</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-0.5">Savings ({savings}%)</p>
              <p className={cn(savingsShort ? 'text-red-400' : 'text-zinc-200')}>
                {formatCurrency(savingsActual, currencySymbol)}
              </p>
              <p className="text-zinc-600 text-[10px] mt-0.5">
                Target {formatCurrency(savingsTarget, currencySymbol)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-zinc-500 text-xs">No income entry for {selectedYear}.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div className={cardClass}>
          <h3 className="text-zinc-200 font-medium leading-tight mb-2">Savings Accounts</h3>
          {latestSnapshot ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-zinc-500 mb-0.5">Total</p>
                <p className="text-zinc-200">{formatCurrency(computeRowTotal(latestSnapshot), currencySymbol)}</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-0.5">Total (Savings Only)</p>
                <p className="text-zinc-200">
                  {formatCurrency(computeSavingsOnlyTotal(latestSnapshot, appData.savingsAccounts), currencySymbol)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-xs">No savings check-ins yet.</p>
          )}
        </div>

        <div className={cardClass}>
          <h3 className="text-zinc-200 font-medium leading-tight mb-2">EPF</h3>
          {latestEpf ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-zinc-500 mb-0.5">Total</p>
                <p className="text-zinc-200">
                  {formatCurrency(latestEpf.account1 + latestEpf.account2 + latestEpf.account3, currencySymbol)}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 mb-0.5">Monthly savings</p>
                <p className="text-zinc-200">{formatCurrency(latestEpf.monthlySavings, currencySymbol)}</p>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-xs">No EPF entries yet.</p>
          )}
        </div>

        <div className={cardClass}>
          <h3 className="text-zinc-200 font-medium leading-tight mb-2">Gold</h3>
          {appData.goldEntries.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-zinc-500 mb-0.5">Total Weight</p>
                <p className="text-zinc-200">{goldTotalWeight.toLocaleString('en-US')} g</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-0.5">GAP Weight</p>
                <p className="text-zinc-200">{goldGapWeight.toLocaleString('en-US')} g</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-0.5">Total Spent</p>
                <p className="text-zinc-200">{formatCurrency(goldTotalCost, currencySymbol)}</p>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-xs">No gold entries yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map(({ label, text }) => (
          <div key={label} className={cardClass}>
            <h3 className="text-zinc-200 font-medium leading-tight mb-1">{label}</h3>
            <p className="text-zinc-500 text-xs">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
