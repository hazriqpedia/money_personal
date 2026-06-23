import { useState } from 'react';
import { useAppData } from '../store/useAppData';
import { BackupControls } from './BackupControls';
import { ageForYear } from '../utils/age';

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
  ])).sort((a, b) => b - a);

  const agePlanCount = appData.agePlan.filter(e => e.year === selectedYear).length;
  const taxCount = appData.taxRecords.filter(e => e.year === selectedYear).length;
  const currentAge = appData.profile.dateOfBirth
    ? ageForYear(appData.profile.dateOfBirth, currentYear)
    : null;

  const sections = [
    { label: 'Age & Plan', text: formatCount(agePlanCount, String(selectedYear)) },
    { label: 'Income', text: formatCount(appData.income.length) },
    { label: 'Savings', text: formatCount(appData.savings.length) },
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
          {currentAge !== null && (
            <>
              <span className="text-zinc-700 select-none" aria-hidden="true">|</span>
              <span className="text-sm text-zinc-400">{currentAge} years old</span>
            </>
          )}
        </div>
        <BackupControls />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map(({ label, text }) => (
          <div
            key={label}
            className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50"
          >
            <h3 className="text-zinc-200 font-medium leading-tight mb-1">{label}</h3>
            <p className="text-zinc-500 text-xs">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
