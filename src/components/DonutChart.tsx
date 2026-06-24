import { formatCurrency } from '../utils/currency';

interface DonutDatum {
  label: string;
  value: number;
}

interface DonutChartProps {
  data: DonutDatum[];
  currencySymbol: string;
  size?: number;
}

const PALETTE = [
  '#3b82f6', // --color-primary
  '#22c55e', // --color-success
  '#ef4444', // --color-danger
  '#a78bfa', // --color-chart-violet
  '#f59e0b', // --color-chart-amber
  '#06b6d4', // --color-chart-cyan
];

export function DonutChart({ data, currencySymbol, size = 160 }: DonutChartProps) {
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const visible = data.filter((d) => d.value > 0);
  const total = visible.reduce((sum, d) => sum + d.value, 0);

  const segments = visible.reduce<{
    list: (DonutDatum & { color: string; dashArray: string; dashOffset: number; percentage: number })[];
    offset: number;
  }>(
    (acc, d, i) => {
      const fraction = total > 0 ? d.value / total : 0;
      const dash = fraction * circumference;
      const segment = {
        ...d,
        color: PALETTE[i % PALETTE.length],
        dashArray: `${dash} ${circumference - dash}`,
        dashOffset: -acc.offset,
        percentage: fraction * 100,
      };
      return { list: [...acc.list, segment], offset: acc.offset + dash };
    },
    { list: [], offset: 0 }
  ).list;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {total === 0 ? (
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#27272a" strokeWidth={strokeWidth} />
          ) : (
            segments.map((s) => (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={strokeWidth}
                strokeDasharray={s.dashArray}
                strokeDashoffset={s.dashOffset}
              />
            ))
          )}
        </g>
      </svg>
      {total === 0 ? (
        <p className="text-zinc-500 text-sm">No items yet.</p>
      ) : (
        <ul className="w-full space-y-1.5">
          {segments.map((s) => (
            <li key={s.label} className="flex items-center gap-2 text-xs text-zinc-400">
              <span
                className="shrink-0 h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              <span className="flex-1 truncate">{s.label}</span>
              <span className="text-zinc-500">{Math.round(s.percentage)}%</span>
              <span className="text-zinc-300">{formatCurrency(s.value, currencySymbol)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
