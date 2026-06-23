import { describe, it, expect } from 'vitest';
import { hydrateAppData, EMPTY_APP_DATA } from './appData';

describe('hydrateAppData', () => {
  it('returns EMPTY_APP_DATA for null input', () => {
    expect(hydrateAppData(null)).toEqual(EMPTY_APP_DATA);
  });

  it('returns EMPTY_APP_DATA for non-object input', () => {
    expect(hydrateAppData('not an object')).toEqual(EMPTY_APP_DATA);
    expect(hydrateAppData(42)).toEqual(EMPTY_APP_DATA);
  });

  it('merges a partial object over the defaults', () => {
    const partial = { income: [{ id: '1', source: 'Job', amount: 5000 }] };
    const result = hydrateAppData(partial);
    expect(result.income).toHaveLength(1);
    expect(result.loans).toEqual([]);
    expect(result.taxRecords).toEqual([]);
  });

  it('preserves a full AppData object as-is', () => {
    const full = { ...EMPTY_APP_DATA, savings: [{ id: '1', name: 'Fund', balance: 100 }] };
    expect(hydrateAppData(full)).toEqual(full);
  });
});
