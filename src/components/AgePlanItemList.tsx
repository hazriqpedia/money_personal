import { useRef } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../utils/cn';

export interface AgePlanListItem {
  id: string;
  text: string;
  done?: boolean;
}

interface AgePlanItemListProps {
  items: AgePlanListItem[];
  onChange: (items: AgePlanListItem[]) => void;
  showDoneToggle?: boolean;
}

export function AgePlanItemList({ items, onChange, showDoneToggle = false }: AgePlanItemListProps) {
  const pendingFocusId = useRef<string | null>(null);

  const addItem = () => {
    const id = uuidv4();
    const newItem: AgePlanListItem = showDoneToggle ? { id, text: '', done: false } : { id, text: '' };
    onChange([...items, newItem]);
    pendingFocusId.current = id;
  };

  const updateText = (id: string, text: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const toggleDone = (id: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-1 min-w-[200px]">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 group/item">
          {showDoneToggle && (
            <button
              type="button"
              onClick={() => toggleDone(item.id)}
              aria-label={item.done ? 'Mark as not done' : 'Mark as done'}
              className={cn(
                'shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-colors',
                item.done ? 'bg-zinc-100 border-zinc-100' : 'border-zinc-700 hover:border-zinc-500'
              )}
            >
              {item.done && <Check size={10} className="text-zinc-900" />}
            </button>
          )}
          {!showDoneToggle && (
            <span className="shrink-0 text-zinc-600 text-sm" aria-hidden="true">
              •
            </span>
          )}
          <input
            value={item.text}
            onChange={(e) => updateText(item.id, e.target.value)}
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
            className={cn(
              'bg-transparent outline-none w-full text-sm text-zinc-300 placeholder-zinc-700',
              item.done && 'line-through text-zinc-600'
            )}
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
