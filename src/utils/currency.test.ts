import { describe, it, expect } from 'vitest';
import { formatCurrency } from './currency';

describe('formatCurrency', () => {
  it('formats a positive number with thousands separators and the given symbol', () => {
    expect(formatCurrency(1234.5, '$')).toBe('$1,234.5');
  });

  it('formats zero', () => {
    expect(formatCurrency(0, '$')).toBe('$0');
  });

  it('formats with a multi-character symbol', () => {
    expect(formatCurrency(1000, 'RM')).toBe('RM1,000');
  });

  it('formats a negative number', () => {
    expect(formatCurrency(-50, '$')).toBe('$-50');
  });
});
