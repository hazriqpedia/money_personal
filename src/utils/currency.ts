export function formatCurrency(value: number, symbol: string): string {
  return `${symbol}${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}
