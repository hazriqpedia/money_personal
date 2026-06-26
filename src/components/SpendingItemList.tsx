import { useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { FormattedNumberInput } from './FormattedNumberInput';
import type { SpendingItem } from '../types';

interface SpendingItemListProps {
  items: SpendingItem[];
  onChange: (items: SpendingItem[]) => void;
  currencySymbol?: string;
}

export function SpendingItemList({ items, onChange, currencySymbol }: SpendingItemListProps) {
  const pendingFocusId = useRef<string | null>(null);

  const addItem = () => {
    const id = uuidv4();
    onChange([...items, { id, name: '', amount: 0 }]);
    pendingFocusId.current = id;
  };

  const updateName = (id: string, name: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, name } : item)));
  };

  const updateAmount = (id: string, amount: number) => {
    onChange(items.map((item) => (item.id === id ? { ...item, amount } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 group/item">
          <span className="shrink-0 text-zinc-600 text-sm" aria-hidden="true">
            •
          </span>
          <input
            value={item.name}
            onChange={(e) => updateName(item.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
              }
            }}
            ref={(el) => {
              if (el && pendingFocusId.current === item.id) {
                el.focus();
                pendingFocusId.current = null;
              }
            }}
            placeholder="…"
            className="bg-transparent outline-none w-full text-sm text-zinc-300 placeholder-zinc-700"
          />
          {currencySymbol && (
            <span className="shrink-0 text-zinc-500 text-sm">{currencySymbol}</span>
          )}
          <FormattedNumberInput
            value={item.amount}
            onChange={(amount) => updateAmount(item.id, amount)}
            className="shrink-0 bg-transparent outline-none w-24 text-right text-sm text-zinc-300"
          />
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            aria-label="Delete"
            className="shrink-0 opacity-0 group-hover/item:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="text-xs font-medium text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
      >
        <Plus size={12} /> Add
      </button>
    </div>
  );
}
