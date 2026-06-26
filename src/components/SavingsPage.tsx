import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';
import { useAppData } from '../store/useAppData';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/currency';
import { formatDifference } from '../utils/income';
import {
  getBalance,
  computeRowTotal,
  computeSavingsOnlyTotal,
  computeSavingsOnlyDifference,
  isWithdrawal,
} from '../utils/savings';
import { computeTotalWeight, computeGapWeight, computeGapAverage } from '../utils/gold';
import { FormattedNumberInput } from './FormattedNumberInput';
import { DonutChart } from './DonutChart';
import type {
  SavingsSnapshot,
  SavingsBalanceEntry,
  EpfEntry,
  GoldEntry,
  GoldMode,
} from '../types';

const cardClass = 'bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50';
const thClass =
  'px-3 py-2 bg-zinc-900 text-zinc-500 font-medium border-b border-zinc-800 text-xs uppercase tracking-wider';
const inputClass = 'bg-transparent outline-none w-full text-sm text-zinc-300';
const selectClass =
  'bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-sm text-zinc-300 outline-none focus:border-zinc-600 transition-colors';
const addButtonClass =
  'mt-3 w-full flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-3 transition-colors';
const rowClass = 'border-b border-zinc-800/50 bg-[#09090b] hover:bg-zinc-900/40 transition-colors group';
const deleteButtonClass =
  'absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity';

const GOLD_MODES: GoldMode[] = ['GAP', 'Normal', 'Wealth Card'];

export function SavingsPage() {
  const { appData, setSavingsSnapshots, setEpfEntries, setGoldEntries } = useAppData();
  const { savingsAccounts, savingsSnapshots, epfEntries, goldEntries, profile } = appData;
  const { currencySymbol } = profile;

  const sortedSnapshots = [...savingsSnapshots].sort((a, b) => a.date.localeCompare(b.date));
  const sortedEpf = [...epfEntries].sort((a, b) => a.date.localeCompare(b.date));
  const sortedGold = [...goldEntries].sort((a, b) => a.dateBought.localeCompare(b.dateBought));
  const latestSnapshot = sortedSnapshots[sortedSnapshots.length - 1];

  const addSnapshot = () => {
    const newSnapshot: SavingsSnapshot = { id: uuidv4(), date: '', balances: [] };
    setSavingsSnapshots([...savingsSnapshots, newSnapshot]);
  };
  const removeSnapshot = (id: string) => {
    setSavingsSnapshots(savingsSnapshots.filter((s) => s.id !== id));
  };
  const updateSnapshotDate = (id: string, date: string) => {
    setSavingsSnapshots(savingsSnapshots.map((s) => (s.id === id ? { ...s, date } : s)));
  };
  const updateBalance = (snapshotId: string, accountId: string, balance: number) => {
    setSavingsSnapshots(
      savingsSnapshots.map((s) => {
        if (s.id !== snapshotId) return s;
        const exists = s.balances.some((b) => b.accountId === accountId);
        const balances: SavingsBalanceEntry[] = exists
          ? s.balances.map((b) => (b.accountId === accountId ? { ...b, balance } : b))
          : [...s.balances, { accountId, balance }];
        return { ...s, balances };
      })
    );
  };

  const addEpfEntry = () => {
    const newEntry: EpfEntry = { id: uuidv4(), date: '', account1: 0, account2: 0, account3: 0, monthlySavings: 0 };
    setEpfEntries([...epfEntries, newEntry]);
  };
  const updateEpfEntry = (id: string, updates: Partial<EpfEntry>) => {
    setEpfEntries(epfEntries.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };
  const removeEpfEntry = (id: string) => {
    setEpfEntries(epfEntries.filter((e) => e.id !== id));
  };

  const addGoldEntry = () => {
    const newEntry: GoldEntry = { id: uuidv4(), dateBought: '', mode: 'GAP', weight: 0, price: 0 };
    setGoldEntries([...goldEntries, newEntry]);
  };
  const updateGoldEntry = (id: string, updates: Partial<GoldEntry>) => {
    setGoldEntries(goldEntries.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };
  const removeGoldEntry = (id: string) => {
    setGoldEntries(goldEntries.filter((g) => g.id !== id));
  };

  const totalWeight = computeTotalWeight(goldEntries);
  const gapWeight = computeGapWeight(goldEntries);
  const gapAverage = computeGapAverage(goldEntries);

  return (
    <div className="max-w-5xl mx-auto px-10 pt-10 pb-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Savings</h1>
        <p className="text-zinc-500 text-sm">Every account, your EPF, and your gold — tracked in one place.</p>
      </div>

      <div className="mb-12">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-zinc-100 mb-1">Accounts</h2>
          <p className="text-zinc-500 text-sm">
            Check in balances over time. Configure which accounts to track in{' '}
            <Link to="/profile" className="text-zinc-400 underline underline-offset-2 hover:text-zinc-200 transition-colors">
              Profile
            </Link>
            .
          </p>
        </div>

        {savingsAccounts.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-400 text-sm font-medium mb-1">No bank accounts configured yet.</p>
            <p className="text-zinc-600 text-sm mb-4">Add your accounts in Profile to start tracking balances here.</p>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-500 rounded-lg px-4 py-2 transition-colors"
            >
              Go to Profile
            </Link>
          </div>
        ) : sortedSnapshots.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-zinc-500 text-sm mb-3">No check-ins yet.</p>
            <button
              onClick={addSnapshot}
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg px-4 py-2 transition-colors"
            >
              <Plus size={14} /> Add date
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-auto">
              <table className="text-left border-collapse w-full">
                <thead>
                  <tr>
                    <th className={cn(thClass, 'w-32')}>Date</th>
                    {savingsAccounts.map((account) => (
                      <th key={account.id} className={thClass}>
                        {account.name || 'Untitled'}
                      </th>
                    ))}
                    <th className={thClass}>Total</th>
                    <th className={thClass}>Total (Savings Only)</th>
                    <th className={thClass}>Difference (Savings Only)</th>
                    <th className="w-8 bg-zinc-900 border-b border-zinc-800" />
                  </tr>
                </thead>
                <tbody>
                  {sortedSnapshots.map((snapshot, index) => (
                    <tr key={snapshot.id} className={rowClass}>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="date"
                          value={snapshot.date}
                          onChange={(e) => updateSnapshotDate(snapshot.id, e.target.value)}
                          className={inputClass}
                        />
                      </td>
                      {savingsAccounts.map((account) => (
                        <td key={account.id} className="px-3 py-2 align-top">
                          <FormattedNumberInput
                            value={getBalance(snapshot, account.id) ?? 0}
                            onChange={(balance) => updateBalance(snapshot.id, account.id, balance)}
                            className={cn(
                              inputClass,
                              isWithdrawal(sortedSnapshots, index, account.id) && 'text-red-400'
                            )}
                          />
                        </td>
                      ))}
                      <td className="px-3 py-2 align-top">
                        <span className="text-sm text-zinc-400">
                          {formatCurrency(computeRowTotal(snapshot), currencySymbol)}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <span className="text-sm text-zinc-400">
                          {formatCurrency(computeSavingsOnlyTotal(snapshot, savingsAccounts), currencySymbol)}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <span className="text-sm text-zinc-400">
                          {formatDifference(
                            computeSavingsOnlyDifference(sortedSnapshots, index, savingsAccounts),
                            currencySymbol
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top relative">
                        <button onClick={() => removeSnapshot(snapshot.id)} aria-label="Delete check-in" className={deleteButtonClass}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addSnapshot} className={addButtonClass}>
              <Plus size={14} /> Add date
            </button>

            {latestSnapshot && (
              <div className={cn(cardClass, 'mt-4')}>
                <h3 className="text-zinc-200 font-medium mb-3">Latest balances</h3>
                <DonutChart
                  data={savingsAccounts.map((a) => ({
                    label: a.name || 'Untitled',
                    value: getBalance(latestSnapshot, a.id) ?? 0,
                  }))}
                  currencySymbol={currencySymbol}
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="mb-12">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-zinc-100 mb-1">EPF</h2>
          <p className="text-zinc-500 text-sm">
            Akaun 1/2/3 balances, summed automatically, plus your contribution each check-in.
          </p>
        </div>

        {sortedEpf.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-zinc-500 text-sm mb-3">No entries yet.</p>
            <button
              onClick={addEpfEntry}
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg px-4 py-2 transition-colors"
            >
              <Plus size={14} /> Add date
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-auto">
              <table className="text-left border-collapse w-full">
                <thead>
                  <tr>
                    <th className={cn(thClass, 'w-32')}>Date</th>
                    <th className={thClass}>Account 1</th>
                    <th className={thClass}>Account 2</th>
                    <th className={thClass}>Account 3</th>
                    <th className={thClass}>Total</th>
                    <th className={thClass}>Monthly savings</th>
                    <th className="w-8 bg-zinc-900 border-b border-zinc-800" />
                  </tr>
                </thead>
                <tbody>
                  {sortedEpf.map((entry) => (
                    <tr key={entry.id} className={rowClass}>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="date"
                          value={entry.date}
                          onChange={(e) => updateEpfEntry(entry.id, { date: e.target.value })}
                          className={inputClass}
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <FormattedNumberInput
                          value={entry.account1}
                          onChange={(account1) => updateEpfEntry(entry.id, { account1 })}
                          className={inputClass}
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <FormattedNumberInput
                          value={entry.account2}
                          onChange={(account2) => updateEpfEntry(entry.id, { account2 })}
                          className={inputClass}
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <FormattedNumberInput
                          value={entry.account3}
                          onChange={(account3) => updateEpfEntry(entry.id, { account3 })}
                          className={inputClass}
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <span className="text-sm text-zinc-400">
                          {formatCurrency(entry.account1 + entry.account2 + entry.account3, currencySymbol)}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <FormattedNumberInput
                          value={entry.monthlySavings}
                          onChange={(monthlySavings) => updateEpfEntry(entry.id, { monthlySavings })}
                          className={inputClass}
                        />
                      </td>
                      <td className="px-3 py-2 align-top relative">
                        <button onClick={() => removeEpfEntry(entry.id)} aria-label="Delete entry" className={deleteButtonClass}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addEpfEntry} className={addButtonClass}>
              <Plus size={14} /> Add date
            </button>
          </>
        )}
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-medium text-zinc-100 mb-1">Gold</h2>
          <p className="text-zinc-500 text-sm">
            Every purchase, physical or virtual — GAP is gold you own but don&apos;t hold.
          </p>
        </div>

        {sortedGold.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-zinc-500 text-sm mb-3">No entries yet.</p>
            <button
              onClick={addGoldEntry}
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg px-4 py-2 transition-colors"
            >
              <Plus size={14} /> Add purchase
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-auto">
              <table className="text-left border-collapse w-full">
                <thead>
                  <tr>
                    <th className={cn(thClass, 'w-32')}>Date bought</th>
                    <th className={thClass}>Mode</th>
                    <th className={thClass}>Weight (g)</th>
                    <th className={thClass}>Price</th>
                    <th className="w-8 bg-zinc-900 border-b border-zinc-800" />
                  </tr>
                </thead>
                <tbody>
                  {sortedGold.map((entry) => (
                    <tr key={entry.id} className={rowClass}>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="date"
                          value={entry.dateBought}
                          onChange={(e) => updateGoldEntry(entry.id, { dateBought: e.target.value })}
                          className={inputClass}
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <select
                          value={entry.mode}
                          onChange={(e) => updateGoldEntry(entry.id, { mode: e.target.value as GoldMode })}
                          className={selectClass}
                        >
                          {GOLD_MODES.map((mode) => (
                            <option key={mode} value={mode}>
                              {mode}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <FormattedNumberInput
                          value={entry.weight}
                          onChange={(weight) => updateGoldEntry(entry.id, { weight })}
                          className={inputClass}
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <FormattedNumberInput
                          value={entry.price}
                          onChange={(price) => updateGoldEntry(entry.id, { price })}
                          className={inputClass}
                        />
                      </td>
                      <td className="px-3 py-2 align-top relative">
                        <button onClick={() => removeGoldEntry(entry.id)} aria-label="Delete purchase" className={deleteButtonClass}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addGoldEntry} className={addButtonClass}>
              <Plus size={14} /> Add purchase
            </button>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className={cardClass}>
                <p className="text-zinc-500 text-xs mb-1">Total Weight</p>
                <p className="text-zinc-200 text-sm">{totalWeight.toLocaleString('en-US')} g</p>
              </div>
              <div className={cardClass}>
                <p className="text-zinc-500 text-xs mb-1">GAP Weight</p>
                <p className="text-zinc-200 text-sm">{gapWeight.toLocaleString('en-US')} g</p>
              </div>
              <div className={cardClass}>
                <p className="text-zinc-500 text-xs mb-1">GAP Average</p>
                <p className="text-zinc-200 text-sm">
                  {gapAverage === null ? '—' : `${formatCurrency(gapAverage, currencySymbol)}/g`}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
