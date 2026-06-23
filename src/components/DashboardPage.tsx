import { Download, Upload } from 'lucide-react';
import { useState } from 'react';
import { useAppData } from '../store/useAppData';
import { hydrateAppData } from '../types';

function formatCount(count: number, scope?: string) {
  if (count === 0) return scope ? `No entries for ${scope}.` : 'No entries yet.';
  const noun = count === 1 ? 'entry' : 'entries';
  return scope ? `${count} ${noun} in ${scope}.` : `${count} ${noun}.`;
}

export const DashboardPage = () => {
  const { appData, updateAppData } = useAppData();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const availableYears = Array.from(new Set([
    currentYear,
    ...appData.agePlan.map(e => e.year),
    ...appData.taxRecords.map(e => e.year),
  ])).sort((a, b) => b - a);

  const agePlanCount = appData.agePlan.filter(e => e.year === selectedYear).length;
  const taxCount = appData.taxRecords.filter(e => e.year === selectedYear).length;

  const sections = [
    { label: 'Age & Plan', text: formatCount(agePlanCount, String(selectedYear)) },
    { label: 'Income', text: formatCount(appData.income.length) },
    { label: 'Savings', text: formatCount(appData.savings.length) },
    { label: 'Loans', text: formatCount(appData.loans.length) },
    { label: 'Bills', text: formatCount(appData.bills.length) },
    { label: 'Subscriptions', text: formatCount(appData.subscriptions.length) },
    { label: 'Tax Records', text: formatCount(taxCount, String(selectedYear)) },
  ];

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appData, null, 2));
    const date = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `moneyPersonal_appData_backup_${date}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!window.confirm('Import this backup? This will replace all current data.')) return;
        updateAppData(hydrateAppData(parsed));
      } catch {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="group cursor-pointer text-zinc-400 hover:text-zinc-200 text-sm flex items-center gap-0 transition-colors"
          >
            <Download size={16} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-32 group-hover:ml-2 transition-all duration-200 whitespace-nowrap">
              Export backup
            </span>
          </button>
          <label className="group cursor-pointer text-zinc-400 hover:text-zinc-200 text-sm flex items-center gap-0 transition-colors">
            <Upload size={16} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-32 group-hover:ml-2 transition-all duration-200 whitespace-nowrap">
              Import backup
            </span>
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
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
