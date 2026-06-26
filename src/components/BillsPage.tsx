import { Plus, Trash2, Check, Receipt } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAppData } from '../store/useAppData';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/currency';
import {
  getEntry,
  computeSnapshotTotal,
  getCcEntry,
  computeCcSnapshotTotal,
  isAllBillsPaid,
  isAllCcPaid,
  formatMonthShort,
  nextYearMonth,
} from '../utils/bills';
import { FormattedNumberInput } from './FormattedNumberInput';
import type { BillSnapshot, BillPaymentEntry, CcPaymentEntry } from '../types';

const PALETTE = [
  '#5b7fa0',
  '#5a7c65',
  '#8a5a5a',
  '#7a6a92',
  '#8a7a50',
  '#4a7a88',
];

const cardClass = 'bg-zinc-900/50 rounded-xl border border-zinc-800/50';
const thClass =
  'px-3 py-1.5 bg-zinc-900 text-zinc-500 font-medium border-b border-zinc-800 text-xs uppercase tracking-wider whitespace-nowrap';
const inputClass = 'bg-transparent outline-none w-full text-sm text-zinc-300';
const rowClass = 'border-b border-zinc-800/40 hover:bg-zinc-900/40 transition-colors group';
const addRowClass =
  'w-full flex items-center justify-center gap-2 text-sm text-zinc-600 hover:text-zinc-300 border-t border-dashed border-zinc-800 hover:border-zinc-600 py-2.5 transition-colors';
const deleteButtonClass =
  'opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-opacity';

// ── Trend chart ──────────────────────────────────────────────────────────────

interface TrendChartProps {
  snapshots: BillSnapshot[];
  labels: string[];
  getTotals: (s: BillSnapshot) => number;
  getSeriesValue: (s: BillSnapshot, i: number) => number | null;
  seriesNames: string[];
  currencySymbol: string;
}

function TrendChart({
  snapshots,
  labels,
  getTotals,
  getSeriesValue,
  seriesNames,
  currencySymbol,
}: TrendChartProps) {
  const W = 640;
  const H = 200;
  const PAD = { top: 16, right: 20, bottom: 36, left: 56 };
  const IW = W - PAD.left - PAD.right;
  const IH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...snapshots.map(getTotals), 1);
  const maxY = maxVal * 1.15;
  const xSlot = IW / snapshots.length;
  const xC = (i: number) => PAD.left + i * xSlot + xSlot / 2;
  const yC = (v: number) => PAD.top + IH - (v / maxY) * IH;
  const barW = xSlot * 0.5;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-label="Trend chart">
        {[0.25, 0.5, 0.75, 1].map((f) => {
          const y = yC(f * maxY);
          return (
            <g key={f}>
              <line x1={PAD.left} y1={y} x2={PAD.left + IW} y2={y} stroke="#27272a" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#71717a">
                {formatCurrency(Math.round(f * maxY), currencySymbol)}
              </text>
            </g>
          );
        })}

        {snapshots.map((s, i) => {
          const v = getTotals(s);
          const bh = (v / maxY) * IH;
          return (
            <rect
              key={s.id}
              x={PAD.left + i * xSlot + xSlot * 0.25}
              y={yC(v)}
              width={barW}
              height={bh}
              fill="#3f3f46"
              rx="2"
            />
          );
        })}

        {seriesNames.map((_, j) => {
          const pts = snapshots
            .map((s, i) => {
              const v = getSeriesValue(s, j);
              return v !== null ? `${xC(i)},${yC(v)}` : null;
            })
            .filter((p): p is string => p !== null)
            .join(' ');
          if (!pts) return null;
          return (
            <polyline
              key={j}
              points={pts}
              fill="none"
              stroke={PALETTE[j % PALETTE.length]}
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}

        {seriesNames.map((_, j) =>
          snapshots.map((s, i) => {
            const v = getSeriesValue(s, j);
            if (v === null) return null;
            return (
              <circle
                key={`${j}-${s.id}`}
                cx={xC(i)}
                cy={yC(v)}
                r={2.5}
                fill={PALETTE[j % PALETTE.length]}
              />
            );
          }),
        )}

        {labels.map((lbl, i) => (
          <text
            key={i}
            x={xC(i)}
            y={H - PAD.bottom + 14}
            textAnchor="middle"
            fontSize="9"
            fill="#71717a"
          >
            {lbl}
          </text>
        ))}
      </svg>

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {seriesNames.map((name, j) => (
          <li key={j} className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: PALETTE[j % PALETTE.length] }}
            />
            {name || 'Untitled'}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export const BillsPage = () => {
  const { appData, setBillSnapshots } = useAppData();
  const { bills, billSnapshots } = appData;
  const { creditCards, currencySymbol } = appData.profile;

  // newest first
  const sorted = [...billSnapshots].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));

  const addSnapshot = () => {
    const chronological = [...billSnapshots].sort((a, b) =>
      a.yearMonth.localeCompare(b.yearMonth),
    );
    const latest = chronological[chronological.length - 1]?.yearMonth ?? '';
    const yearMonth = latest ? nextYearMonth(latest) : '';
    const entries: BillPaymentEntry[] = bills.map((b) => ({
      billId: b.id,
      amount: b.defaultAmount,
      paid: false,
    }));
    const ccEntries: CcPaymentEntry[] = creditCards.map((c) => ({
      cardId: c.id,
      amount: 0,
      paid: false,
    }));
    setBillSnapshots([...billSnapshots, { id: uuidv4(), yearMonth, entries, ccEntries }]);
  };

  const removeSnapshot = (id: string) => {
    setBillSnapshots(billSnapshots.filter((s) => s.id !== id));
  };

  const updateSnapshotMonth = (id: string, yearMonth: string) => {
    setBillSnapshots(billSnapshots.map((s) => (s.id === id ? { ...s, yearMonth } : s)));
  };

  const updateEntry = (
    snapshotId: string,
    billId: string,
    updates: Partial<BillPaymentEntry>,
  ) => {
    setBillSnapshots(
      billSnapshots.map((s) => {
        if (s.id !== snapshotId) return s;
        const exists = s.entries.some((e) => e.billId === billId);
        const entries: BillPaymentEntry[] = exists
          ? s.entries.map((e) => (e.billId === billId ? { ...e, ...updates } : e))
          : [...s.entries, { billId, amount: 0, paid: false, ...updates }];
        return { ...s, entries };
      }),
    );
  };

  const updateCcEntry = (
    snapshotId: string,
    cardId: string,
    updates: Partial<CcPaymentEntry>,
  ) => {
    setBillSnapshots(
      billSnapshots.map((s) => {
        if (s.id !== snapshotId) return s;
        const exists = s.ccEntries.some((e) => e.cardId === cardId);
        const ccEntries: CcPaymentEntry[] = exists
          ? s.ccEntries.map((e) => (e.cardId === cardId ? { ...e, ...updates } : e))
          : [...s.ccEntries, { cardId, amount: 0, paid: false, ...updates }];
        return { ...s, ccEntries };
      }),
    );
  };

  // ── Not configured ─────────────────────────────────────────────────────────
  if (bills.length === 0 && creditCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center">
        <Receipt size={36} className="text-zinc-700 mb-4" />
        <p className="text-zinc-300 font-medium mb-1">Nothing configured yet</p>
        <p className="text-zinc-500 text-sm max-w-xs">
          Add your bills and credit cards in{' '}
          <span className="text-zinc-300">Profile</span> first, then come back here to
          track monthly payments.
        </p>
      </div>
    );
  }

  // ── Cell helpers ───────────────────────────────────────────────────────────
  const monthCellClass = cn(
    'px-3 py-1.5 align-top sticky left-0 z-10 bg-[#09090b] border-r border-zinc-800/40 min-w-28',
  );

  const renderMonthCell = (snapshot: BillSnapshot, hasAll: boolean) => (
    <td className={monthCellClass}>
      <input
        type="month"
        value={snapshot.yearMonth}
        onChange={(e) => updateSnapshotMonth(snapshot.id, e.target.value)}
        className="bg-transparent outline-none text-sm text-zinc-300 w-full"
      />
      {hasAll && (
        <span className="text-xs italic text-green-500/70 block leading-tight">All paid</span>
      )}
    </td>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-8 pt-6 pb-10 w-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Bills</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Track actual amounts and payment status month by month.
        </p>
      </div>

      {/* ── Bills table ──────────────────────────────────────────────────── */}
      {bills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Utility bills
          </h2>
          <div className={cn(cardClass, 'overflow-x-auto')}>
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr>
                  <th className={cn(thClass, 'sticky left-0 z-20 bg-zinc-900 border-r border-zinc-800/40 text-left')}>
                    Month
                  </th>
                  {bills.map((b) => (
                    <th key={b.id} className={cn(thClass, 'text-left min-w-28')}>
                      {b.name || '—'}
                    </th>
                  ))}
                  <th className={cn(thClass, 'text-left w-24')}>Total</th>
                  <th className={cn(thClass, 'w-8')} />
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={bills.length + 3} className="text-center py-8 text-zinc-600 text-sm">
                      No months yet — add one below.
                    </td>
                  </tr>
                ) : (
                  sorted.map((snapshot) => {
                    const allPaid = isAllBillsPaid(snapshot, bills);
                    return (
                      <tr key={snapshot.id} className={rowClass}>
                        {renderMonthCell(snapshot, allPaid)}
                        {bills.map((bill) => {
                          const entry = getEntry(snapshot, bill.id);
                          const isPaid = entry?.paid ?? false;
                          return (
                            <td
                              key={bill.id}
                              className={cn(
                                'px-3 py-1.5 align-top transition-colors',
                                isPaid && 'bg-green-500/10',
                              )}
                            >
                              <FormattedNumberInput
                                value={entry?.amount ?? bill.defaultAmount}
                                onChange={(amount) =>
                                  updateEntry(snapshot.id, bill.id, { amount })
                                }
                                className={inputClass}
                              />
                              <button
                                onClick={() =>
                                  updateEntry(snapshot.id, bill.id, {
                                    paid: !isPaid,
                                    amount: entry?.amount ?? bill.defaultAmount,
                                  })
                                }
                                className={cn(
                                  'mt-0.5 flex items-center gap-1 text-xs transition-colors',
                                  isPaid
                                    ? 'text-green-400'
                                    : 'text-zinc-700 hover:text-zinc-500',
                                )}
                              >
                                <Check size={9} /> {isPaid ? 'Paid' : 'Unpaid'}
                              </button>
                            </td>
                          );
                        })}
                        <td className="px-3 py-1.5 align-top">
                          <span className="text-sm text-zinc-400">
                            {formatCurrency(computeSnapshotTotal(snapshot), currencySymbol)}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 align-top text-right pr-2">
                          <button
                            onClick={() => removeSnapshot(snapshot.id)}
                            className={deleteButtonClass}
                            aria-label="Delete month"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <button onClick={addSnapshot} className={addRowClass}>
              <Plus size={13} /> Add month
            </button>
          </div>
        </div>
      )}

      {/* ── Bills trend ──────────────────────────────────────────────────── */}
      {sorted.length >= 2 && bills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Bills trend
          </h2>
          <div className={cn(cardClass, 'p-4')}>
            <TrendChart
              snapshots={[...sorted].reverse()}
              labels={[...sorted].reverse().map((s) => formatMonthShort(s.yearMonth))}
              getTotals={(s) => computeSnapshotTotal(s)}
              getSeriesValue={(s, j) => getEntry(s, bills[j].id)?.amount ?? null}
              seriesNames={bills.map((b) => b.name)}
              currencySymbol={currencySymbol}
            />
          </div>
        </div>
      )}

      {/* ── Credit cards table ───────────────────────────────────────────── */}
      {creditCards.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Credit cards
          </h2>
          {billSnapshots.length === 0 ? (
            <p className="text-zinc-600 text-sm py-4">
              Add a month above to start tracking credit card payments.
            </p>
          ) : (
            <div className={cn(cardClass, 'overflow-x-auto')}>
              <table className="w-full border-collapse min-w-max">
                <thead>
                  <tr>
                    <th className={cn(thClass, 'sticky left-0 z-20 bg-zinc-900 border-r border-zinc-800/40 text-left')}>
                      Month
                    </th>
                    {creditCards.map((c) => (
                      <th key={c.id} className={cn(thClass, 'text-left min-w-28')}>
                        {c.name || '—'}
                      </th>
                    ))}
                    <th className={cn(thClass, 'text-left w-24')}>Total CC</th>
                    <th className={cn(thClass, 'w-8')} />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((snapshot) => {
                    const allPaid = isAllCcPaid(snapshot, creditCards);
                    return (
                      <tr key={snapshot.id} className={rowClass}>
                        {renderMonthCell(snapshot, allPaid)}
                        {creditCards.map((card) => {
                          const entry = getCcEntry(snapshot, card.id);
                          const isPaid = entry?.paid ?? false;
                          return (
                            <td
                              key={card.id}
                              className={cn(
                                'px-3 py-1.5 align-top transition-colors',
                                isPaid && 'bg-green-500/10',
                              )}
                            >
                              <FormattedNumberInput
                                value={entry?.amount ?? 0}
                                onChange={(amount) =>
                                  updateCcEntry(snapshot.id, card.id, { amount })
                                }
                                className={inputClass}
                              />
                              <button
                                onClick={() =>
                                  updateCcEntry(snapshot.id, card.id, {
                                    paid: !isPaid,
                                    amount: entry?.amount ?? 0,
                                  })
                                }
                                className={cn(
                                  'mt-0.5 flex items-center gap-1 text-xs transition-colors',
                                  isPaid
                                    ? 'text-green-400'
                                    : 'text-zinc-700 hover:text-zinc-500',
                                )}
                              >
                                <Check size={9} /> {isPaid ? 'Paid' : 'Unpaid'}
                              </button>
                            </td>
                          );
                        })}
                        <td className="px-3 py-1.5 align-top">
                          <span className="text-sm text-zinc-400">
                            {formatCurrency(computeCcSnapshotTotal(snapshot), currencySymbol)}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 align-top pr-2" />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {bills.length === 0 && (
                <button onClick={addSnapshot} className={addRowClass}>
                  <Plus size={13} /> Add month
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── CC trend ─────────────────────────────────────────────────────── */}
      {sorted.length >= 2 && creditCards.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Credit card trend
          </h2>
          <div className={cn(cardClass, 'p-4')}>
            <TrendChart
              snapshots={[...sorted].reverse()}
              labels={[...sorted].reverse().map((s) => formatMonthShort(s.yearMonth))}
              getTotals={(s) => computeCcSnapshotTotal(s)}
              getSeriesValue={(s, j) => getCcEntry(s, creditCards[j].id)?.amount ?? null}
              seriesNames={creditCards.map((c) => c.name)}
              currencySymbol={currencySymbol}
            />
          </div>
        </div>
      )}
    </div>
  );
};
