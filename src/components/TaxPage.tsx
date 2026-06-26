import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAppData } from '../store/useAppData';
import { DEFAULT_TAX_CATEGORIES } from '../types/tax';
import { formatCurrency } from '../utils/currency';
import { cn } from '../utils/cn';
import { FormattedNumberInput } from './FormattedNumberInput';
import type { TaxRecord } from '../types';

const thClass =
  'px-3 py-2 bg-zinc-900 text-zinc-500 font-medium border-b border-zinc-800 text-xs uppercase tracking-wider';
const inputClass = 'bg-transparent outline-none w-full text-sm text-zinc-300 placeholder-zinc-700';
const tdClass = 'px-3 py-2 align-top';

export function TaxPage() {
  const { appData, setTaxRecords } = useAppData();
  const { taxRecords, profile } = appData;
  const currentYear = new Date().getFullYear();

  const allYears = Array.from(new Set([currentYear, ...taxRecords.map((r) => r.year)])).sort(
    (a, b) => b - a,
  );
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const yearEntries = taxRecords.filter((r) => r.year === selectedYear);
  const allCategories = [...DEFAULT_TAX_CATEGORIES, ...profile.customTaxCategories];

  const summary = allCategories.map((cat) => ({
    category: cat,
    total: yearEntries.filter((r) => r.category === cat).reduce((sum, r) => sum + r.amount, 0),
  }));
  const grandTotal = yearEntries.reduce((sum, r) => sum + r.amount, 0);

  const { currencySymbol } = profile;

  const addEntry = () =>
    setTaxRecords([
      ...taxRecords,
      {
        id: uuidv4(),
        year: selectedYear,
        category: DEFAULT_TAX_CATEGORIES[0],
        item: '',
        date: '',
        amount: 0,
      },
    ]);

  const updateEntry = (id: string, updates: Partial<TaxRecord>) =>
    setTaxRecords(taxRecords.map((r) => (r.id === id ? { ...r, ...updates } : r)));

  const removeEntry = (id: string) =>
    setTaxRecords(taxRecords.filter((r) => r.id !== id));

  return (
    <div className="max-w-5xl mx-auto px-10 pt-10 pb-10 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Tax</h1>
          <p className="text-zinc-500 text-sm">
            Record your tax exemptions year by year — switch years to see each year's entries and
            totals.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-6">
          <label htmlFor="tax-year" className="text-xs uppercase tracking-wider text-zinc-500">
            Year
          </label>
          <select
            id="tax-year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-sm text-zinc-300 outline-none focus:border-zinc-600 transition-colors"
          >
            {allYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Entries table */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-medium text-zinc-200 mb-3">
            Tax Exemptions {selectedYear}
          </h2>
          <div className="overflow-auto">
            <table className="text-left border-collapse w-full">
              <thead>
                <tr>
                  <th className={cn(thClass, 'w-32')}>Category</th>
                  <th className={thClass}>Item / Location</th>
                  <th className={cn(thClass, 'w-28')}>Date</th>
                  <th className={cn(thClass, 'w-28 text-right')}>Amount</th>
                  <th className="w-8 bg-zinc-900 border-b border-zinc-800" />
                </tr>
              </thead>
              <tbody>
                {yearEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group"
                  >
                    <td className={tdClass}>
                      <select
                        value={entry.category}
                        onChange={(e) => updateEntry(entry.id, { category: e.target.value })}
                        className="bg-transparent outline-none text-sm text-zinc-300 w-full"
                      >
                        {allCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={tdClass}>
                      <input
                        type="text"
                        value={entry.item}
                        onChange={(e) => updateEntry(entry.id, { item: e.target.value })}
                        placeholder="e.g. Self Contribute"
                        className={inputClass}
                      />
                    </td>
                    <td className={tdClass}>
                      <input
                        type="text"
                        value={entry.date}
                        onChange={(e) => updateEntry(entry.id, { date: e.target.value })}
                        placeholder="Feb 25, 26"
                        className={inputClass}
                      />
                    </td>
                    <td className={cn(tdClass, 'text-right')}>
                      <FormattedNumberInput
                        value={entry.amount}
                        onChange={(v) => updateEntry(entry.id, { amount: v })}
                        className="bg-transparent outline-none w-full text-sm text-zinc-300 text-right"
                      />
                    </td>
                    <td className="px-3 py-2 align-top relative">
                      <button
                        onClick={() => removeEntry(entry.id)}
                        aria-label="Delete entry"
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
            <Plus size={14} /> Add entry
          </button>
        </div>

        {/* Summary */}
        <div className="w-56 shrink-0">
          <h2 className="text-base font-medium text-zinc-200 mb-3">{selectedYear} Summary</h2>
          <table className="text-left border-collapse w-full">
            <thead>
              <tr>
                <th className={thClass}>Item</th>
                <th className={cn(thClass, 'text-right')}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(({ category, total }) => (
                <tr
                  key={category}
                  className={cn('border-b border-zinc-800/50', total === 0 && 'opacity-40')}
                >
                  <td className="px-3 py-2 text-sm text-zinc-400">{category}</td>
                  <td className="px-3 py-2 text-sm text-right text-zinc-300">
                    {total > 0 ? formatCurrency(total, currencySymbol) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-700">
                <td className="px-3 py-2 text-xs font-medium text-zinc-500">SUM</td>
                <td className="px-3 py-2 text-sm font-medium text-right text-zinc-200">
                  {formatCurrency(grandTotal, currencySymbol)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
