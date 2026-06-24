import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAppData } from '../store/useAppData';
import { ageForYear } from '../utils/age';
import { cn } from '../utils/cn';
import { BackupControls } from './BackupControls';

const labelClass = 'block text-xs font-medium text-zinc-500 uppercase tracking-wider';
const inputBoxClass =
  'bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none focus:border-zinc-600 transition-colors';

export function ProfilePage() {
  const { appData, setProfile } = useAppData();
  const { profile } = appData;
  const { dateOfBirth, currencySymbol, budgetSplit, creditCards } = profile;
  const currentAge = dateOfBirth ? ageForYear(dateOfBirth, new Date().getFullYear()) : null;
  const budgetTotal = budgetSplit.needs + budgetSplit.wants + budgetSplit.savings;

  const updateBudgetSplit = (key: keyof typeof budgetSplit, value: number) => {
    setProfile({ ...profile, budgetSplit: { ...budgetSplit, [key]: value } });
  };

  const addCard = () => {
    setProfile({ ...profile, creditCards: [...creditCards, { id: uuidv4(), name: '' }] });
  };

  const updateCardName = (id: string, name: string) => {
    setProfile({ ...profile, creditCards: creditCards.map((c) => (c.id === id ? { ...c, name } : c)) });
  };

  const removeCard = (id: string) => {
    setProfile({ ...profile, creditCards: creditCards.filter((c) => c.id !== id) });
  };

  return (
    <div className="flex-1 px-6 py-12 w-full max-w-2xl mx-auto">
      <div className="space-y-10">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 mb-3">Profile</h1>
          <p className="text-zinc-400 leading-relaxed text-sm">
            Settings used across the app — date of birth for Age &amp; Plan, and currency/budget defaults for
            Income.
          </p>
        </div>

        <hr className="border-zinc-800" />

        <div className="space-y-3">
          <label htmlFor="profile-dob" className={labelClass}>
            Date of birth
          </label>
          <input
            id="profile-dob"
            type="date"
            value={dateOfBirth ?? ''}
            onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value || null })}
            className={inputBoxClass}
          />
          {currentAge !== null && (
            <p className="text-zinc-500 text-sm">You are currently {currentAge} years old.</p>
          )}
        </div>

        <hr className="border-zinc-800" />

        <div className="space-y-3">
          <label htmlFor="profile-currency" className={labelClass}>
            Currency symbol
          </label>
          <input
            id="profile-currency"
            type="text"
            value={currencySymbol}
            onChange={(e) => setProfile({ ...profile, currencySymbol: e.target.value })}
            className={`${inputBoxClass} w-20`}
          />
        </div>

        <hr className="border-zinc-800" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className={labelClass}>Budget split (%)</p>
            <p className={cn('text-xs', budgetTotal === 100 ? 'text-zinc-500' : 'text-amber-500/80')}>
              Total: {budgetTotal}%
            </p>
          </div>
          <p className="text-zinc-500 text-sm">
            Used on the Dashboard to split your Income tab&apos;s Gross salary into Needs/Wants/Savings.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {(['needs', 'wants', 'savings'] as const).map((key) => (
              <div key={key} className="space-y-1">
                <label htmlFor={`profile-budget-${key}`} className="block text-xs text-zinc-500 capitalize">
                  {key}
                </label>
                <input
                  id={`profile-budget-${key}`}
                  type="number"
                  value={budgetSplit[key]}
                  onChange={(e) => updateBudgetSplit(key, Number(e.target.value))}
                  className={`${inputBoxClass} w-full`}
                />
              </div>
            ))}
          </div>
        </div>

        <hr className="border-zinc-800" />

        <div className="space-y-3">
          <p className={labelClass}>Credit cards</p>
          <p className="text-zinc-500 text-sm">
            Each card here gets its own spending breakdown on the Income tab.
          </p>
          <div className="space-y-1">
            {creditCards.map((card) => (
              <div key={card.id} className="flex items-center gap-2 group/item">
                <input
                  value={card.name}
                  onChange={(e) => updateCardName(card.id, e.target.value)}
                  placeholder="e.g. HSBC"
                  className="bg-transparent outline-none w-full text-sm text-zinc-300 placeholder-zinc-700 border-b border-zinc-800 focus:border-zinc-600 transition-colors py-1"
                />
                <button
                  type="button"
                  onClick={() => removeCard(card.id)}
                  aria-label="Remove credit card"
                  className="shrink-0 opacity-0 group-hover/item:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addCard}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <Plus size={12} /> Add credit card
          </button>
        </div>

        <hr className="border-zinc-800" />

        <div className="space-y-3">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Backup</p>
          <BackupControls />
        </div>
      </div>
    </div>
  );
}
