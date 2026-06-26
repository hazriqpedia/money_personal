import { describe, it, expect } from 'vitest';
import {
  getEntry,
  getCcEntry,
  computeSnapshotTotal,
  computeSnapshotPaidTotal,
  computeCcSnapshotTotal,
  isAllBillsPaid,
  isAllCcPaid,
  formatYearMonth,
  formatMonthShort,
  nextYearMonth,
} from './bills';
import type { Bill, BillSnapshot } from '../types';

const snapshot: BillSnapshot = {
  id: 's1',
  yearMonth: '2026-01',
  entries: [
    { billId: 'b1', amount: 120, paid: true },
    { billId: 'b2', amount: 50, paid: false },
  ],
  ccEntries: [
    { cardId: 'c1', amount: 500, paid: true },
    { cardId: 'c2', amount: 300, paid: false },
  ],
};

const bills: Bill[] = [
  { id: 'b1', name: 'TNB', defaultAmount: 120 },
  { id: 'b2', name: 'UNIFI', defaultAmount: 170 },
];

describe('getEntry', () => {
  it('returns the entry for a present bill', () => {
    expect(getEntry(snapshot, 'b1')).toEqual({ billId: 'b1', amount: 120, paid: true });
  });

  it('returns null for an absent bill', () => {
    expect(getEntry(snapshot, 'b99')).toBeNull();
  });
});

describe('getCcEntry', () => {
  it('returns the entry for a present card', () => {
    expect(getCcEntry(snapshot, 'c1')).toEqual({ cardId: 'c1', amount: 500, paid: true });
  });

  it('returns null for an absent card', () => {
    expect(getCcEntry(snapshot, 'c99')).toBeNull();
  });
});

describe('computeSnapshotTotal', () => {
  it('sums all bill entry amounts regardless of paid status', () => {
    expect(computeSnapshotTotal(snapshot)).toBe(170);
  });

  it('returns 0 for an empty entries array', () => {
    expect(computeSnapshotTotal({ ...snapshot, entries: [] })).toBe(0);
  });
});

describe('computeSnapshotPaidTotal', () => {
  it('sums only paid bill entries', () => {
    expect(computeSnapshotPaidTotal(snapshot)).toBe(120);
  });

  it('returns 0 when no entries are paid', () => {
    expect(computeSnapshotPaidTotal({ ...snapshot, entries: [{ billId: 'b1', amount: 100, paid: false }] })).toBe(0);
  });
});

describe('computeCcSnapshotTotal', () => {
  it('sums all cc entry amounts', () => {
    expect(computeCcSnapshotTotal(snapshot)).toBe(800);
  });

  it('returns 0 for empty cc entries', () => {
    expect(computeCcSnapshotTotal({ ...snapshot, ccEntries: [] })).toBe(0);
  });
});

describe('isAllBillsPaid', () => {
  it('returns true when every bill has a paid entry', () => {
    const allPaid: BillSnapshot = {
      ...snapshot,
      entries: [
        { billId: 'b1', amount: 120, paid: true },
        { billId: 'b2', amount: 50, paid: true },
      ],
    };
    expect(isAllBillsPaid(allPaid, bills)).toBe(true);
  });

  it('returns false when at least one bill is unpaid', () => {
    expect(isAllBillsPaid(snapshot, bills)).toBe(false);
  });

  it('returns false for an empty bills array', () => {
    expect(isAllBillsPaid(snapshot, [])).toBe(false);
  });
});

describe('isAllCcPaid', () => {
  it('returns true when every card has a paid entry', () => {
    const allPaid: BillSnapshot = {
      ...snapshot,
      ccEntries: [
        { cardId: 'c1', amount: 500, paid: true },
        { cardId: 'c2', amount: 300, paid: true },
      ],
    };
    expect(isAllCcPaid(allPaid, [{ id: 'c1' }, { id: 'c2' }])).toBe(true);
  });

  it('returns false when at least one card is unpaid', () => {
    expect(isAllCcPaid(snapshot, [{ id: 'c1' }, { id: 'c2' }])).toBe(false);
  });
});

describe('formatYearMonth', () => {
  it('formats YYYY-MM as "Mon YYYY"', () => {
    expect(formatYearMonth('2026-01')).toBe('Jan 2026');
  });

  it('returns — for an empty string', () => {
    expect(formatYearMonth('')).toBe('—');
  });
});

describe('formatMonthShort', () => {
  it('formats YYYY-MM as a short month name', () => {
    expect(formatMonthShort('2026-06')).toBe('Jun');
  });

  it('returns ? for an empty string', () => {
    expect(formatMonthShort('')).toBe('?');
  });
});

describe('nextYearMonth', () => {
  it('advances to the next month', () => {
    expect(nextYearMonth('2026-06')).toBe('2026-07');
  });

  it('wraps December to January of the next year', () => {
    expect(nextYearMonth('2026-12')).toBe('2027-01');
  });

  it('returns empty string for an empty input', () => {
    expect(nextYearMonth('')).toBe('');
  });
});
