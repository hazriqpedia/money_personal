import { useState } from 'react';

interface FormattedNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function FormattedNumberInput({ value, onChange, className }: FormattedNumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={draft ?? value.toLocaleString('en-US')}
      onFocus={() => setDraft(String(value))}
      onChange={(e) => {
        const raw = e.target.value;
        setDraft(raw);
        const parsed = Number(raw.replace(/,/g, ''));
        if (!Number.isNaN(parsed)) onChange(parsed);
      }}
      onBlur={() => setDraft(null)}
      className={className}
    />
  );
}
