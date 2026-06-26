import { useState } from 'react';
import { useAppData } from '../store/useAppData';
import { BackupControls } from './BackupControls';
import { ageForYear } from '../utils/age';
import { formatCurrency } from '../utils/currency';
import { pickPrimaryEntry } from '../utils/income';
import { cn } from '../utils/cn';
import { computeRowTotal, computeSavingsOnlyTotal } from '../utils/savings';
import { computeTotalWeight, computeGapWeight, computeTotalCost } from '../utils/gold';
import { computeTotalMonthly, computeMonthlyForCard, isLoanActive, computeRemainingBalance } from '../utils/loan';
import { computeTotalMonthly as computeSubMonthlyTotal } from '../utils/subscription';
import { computeSnapshotTotal, formatYearMonth } from '../utils/bills';

const cardClass = 'bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50';

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

  const sortedBillSnapshots = [...appData.billSnapshots].sort((a, b) =>
    a.yearMonth.localeCompare(b.yearMonth),
  );
  const latestBillSnapshot = sortedBillSnapshots[sortedBillSnapshots.length - 1];
  const billMonthTotal = latestBillSnapshot
    ? computeSnapshotTotal(latestBillSnapshot)
    : null;
  const billPaidCount = latestBillSnapshot
    ? latestBillSnapshot.entries.filter((e) => e.paid).length
    : null;
  const billTotalCount = latestBillSnapshot ? appData.bills.length : null;

  const loanActiveCount = appData.loans.filter((l) => isLoanActive(l)).length;
  const loanTotalMonthly = computeTotalMonthly(appData.loans);
  const totalRemainingBalance = appData.loans.reduce((sum, l) => sum + computeRemainingBalance(l), 0);

  const subTotalMonthly = computeSubMonthlyTotal(appData.subscriptions);

  const spendingActual = appData.spendingPlan.reduce((sum, item) => sum + item.amount, 0);
  const needsTarget = incomeEntry ? (incomeEntry.gross * needs) / 100 : 0;
  const needsOver = incomeEntry !== undefined && spendingActual > needsTarget;

  const billsMonthly = billMonthTotal ?? 0;
  const totalCommitted = loanTotalMonthly + billsMonthly + subTotalMonthly;
  const netDiscretionary = incomeEntry ? incomeEntry.gross - totalCommitted : null;

  const taxYearEntries = appData.taxRecords.filter((r) => r.year === selectedYear);
  const taxYearTotal = taxYearEntries.reduce((sum, r) => sum + r.amount, 0);
  const loanCardBreakdown = appData.profile.creditCards
    .map((card) => ({ card, monthly: computeMonthlyForCard(appData.loans, card.id) }))
    .filter(({ monthly }) => monthly > 0);

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
              <p className={cn(needsOver ? 'text-red-400' : 'text-zinc-200')}>
                {formatCurrency(spendingActual, currencySymbol)}
              </p>
              <p className="text-zinc-600 text-[10px] mt-0.5">
                Target {formatCurrency(needsTarget, currencySymbol)}
              </p>
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

      <div className={cn(cardClass, 'mb-3')}>
        <h3 className="text-zinc-200 font-medium leading-tight mb-2">Monthly Cash Flow</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <p className="text-zinc-500 mb-0.5">Loans</p>
            <p className="text-zinc-200">{formatCurrency(loanTotalMonthly, currencySymbol)}</p>
          </div>
          <div>
            <p className="text-zinc-500 mb-0.5">Bills</p>
            <p className="text-zinc-200">{billMonthTotal !== null ? formatCurrency(billsMonthly, currencySymbol) : '—'}</p>
          </div>
          <div>
            <p className="text-zinc-500 mb-0.5">Subscriptions</p>
            <p className="text-zinc-200">{formatCurrency(subTotalMonthly, currencySymbol)}</p>
          </div>
          <div>
            <p className="text-zinc-500 mb-0.5">Total committed</p>
            <p className="text-zinc-200">{formatCurrency(totalCommitted, currencySymbol)}</p>
          </div>
          <div>
            <p className="text-zinc-500 mb-0.5">Net</p>
            <p className={cn(netDiscretionary !== null && netDiscretionary < 0 ? 'text-red-400' : 'text-zinc-200')}>
              {netDiscretionary !== null ? formatCurrency(netDiscretionary, currencySymbol) : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className={cn(cardClass, 'mb-3')}>
        <h3 className="text-zinc-200 font-medium leading-tight mb-2">Loans</h3>
        {appData.loans.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-zinc-500 mb-0.5">Active</p>
              <p className="text-zinc-200">{loanActiveCount} / {appData.loans.length}</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-0.5">Monthly installments</p>
              <p className="text-zinc-200">
                {formatCurrency(loanTotalMonthly, currencySymbol)}
                {loanCardBreakdown.length > 0 && (
                  <span className="text-zinc-500 ml-1">
                    ({loanCardBreakdown.map(({ monthly }) => formatCurrency(monthly, currencySymbol)).join(' / ')})
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-zinc-500 mb-0.5">Total remaining</p>
              <p className="text-zinc-200">{formatCurrency(totalRemainingBalance, currencySymbol)}</p>
            </div>
          </div>
        ) : (
          <p className="text-zinc-500 text-xs">No loans yet.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className={cardClass}>
          <h3 className="text-zinc-200 font-medium leading-tight mb-2">Bills</h3>
          {latestBillSnapshot ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-zinc-500 mb-0.5">Latest month</p>
                <p className="text-zinc-200">
                  {formatYearMonth(latestBillSnapshot.yearMonth)}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 mb-0.5">Total</p>
                <p className="text-zinc-200">
                  {formatCurrency(billMonthTotal!, currencySymbol)}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 mb-0.5">Paid</p>
                <p className="text-zinc-200">
                  {billPaidCount} / {billTotalCount}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-xs">No bills tracked yet.</p>
          )}
        </div>

        <div className={cardClass}>
          <h3 className="text-zinc-200 font-medium leading-tight mb-2">Subscriptions</h3>
          {appData.subscriptions.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-zinc-500 mb-0.5">Monthly</p>
                <p className="text-zinc-200">{formatCurrency(subTotalMonthly, currencySymbol)}</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-0.5">Annual</p>
                <p className="text-zinc-200">{formatCurrency(subTotalMonthly * 12, currencySymbol)}</p>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-xs">No subscriptions yet.</p>
          )}
        </div>

        <div className={cardClass}>
          <h3 className="text-zinc-200 font-medium leading-tight mb-2">Tax</h3>
          {taxYearEntries.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-zinc-500 mb-0.5">Total exemptions</p>
                <p className="text-zinc-200">{formatCurrency(taxYearTotal, currencySymbol)}</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-0.5">Entries</p>
                <p className="text-zinc-200">{taxYearEntries.length}</p>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-xs">No tax records for {selectedYear}.</p>
          )}
        </div>
      </div>
    </div>
  );
};
