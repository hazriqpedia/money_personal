import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAppData } from '../store/useAppData';
import { ageForYear } from '../utils/age';
import { cn } from '../utils/cn';
import { BackupControls } from './BackupControls';
import { FormattedNumberInput } from './FormattedNumberInput';
import type { SavingsAccountCategory } from '../types';

const labelClass = 'block text-xs font-medium text-zinc-500 uppercase tracking-wider';
const inputBoxClass =
  'bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none focus:border-zinc-600 transition-colors';

const ACCOUNT_CATEGORIES: SavingsAccountCategory[] = ['savings', 'investment'];

export function ProfilePage() {
  const { appData, setProfile, setSavingsAccounts, setBills } = useAppData();
  const { profile, savingsAccounts, bills } = appData;
  const { dateOfBirth, currencySymbol, budgetSplit, creditCards } = profile;
  const currentAge = dateOfBirth ? ageForYear(dateOfBirth, new Date().getFullYear()) : null;
  const budgetTotal = budgetSplit.needs + budgetSplit.wants + budgetSplit.savings;

  const updateBudgetSplit = (key: keyof typeof budgetSplit, value: number) => {
    setProfile({ ...profile, budgetSplit: { ...budgetSplit, [key]: value } });
  };

  const addAccount = () => {
    setSavingsAccounts([...savingsAccounts, { id: uuidv4(), name: '', category: 'savings' }]);
  };
  const updateAccountName = (id: string, name: string) => {
    setSavingsAccounts(savingsAccounts.map((a) => (a.id === id ? { ...a, name } : a)));
  };
  const updateAccountCategory = (id: string, category: SavingsAccountCategory) => {
    setSavingsAccounts(savingsAccounts.map((a) => (a.id === id ? { ...a, category } : a)));
  };
  const removeAccount = (id: string) => {
    setSavingsAccounts(savingsAccounts.filter((a) => a.id !== id));
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

  const addBill = () => {
    setBills([...bills, { id: uuidv4(), name: '', defaultAmount: 0 }]);
  };
  const updateBillName = (id: string, name: string) => {
    setBills(bills.map((b) => (b.id === id ? { ...b, name } : b)));
  };
  const updateBillDefault = (id: string, defaultAmount: number) => {
    setBills(bills.map((b) => (b.id === id ? { ...b, defaultAmount } : b)));
  };
  const removeBill = (id: string) => {
    setBills(bills.filter((b) => b.id !== id));
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
          <p className={labelClass}>Bank accounts</p>
          <p className="text-zinc-500 text-sm">
            Each account appears as a column in the Savings tab. Tag it as savings or investment to control how totals are split.
          </p>
          <div className="space-y-1">
            {savingsAccounts.map((account) => (
              <div key={account.id} className="flex items-center gap-2 group/item">
                <input
                  value={account.name}
                  onChange={(e) => updateAccountName(account.id, e.target.value)}
                  placeholder="e.g. ASB"
                  className="bg-transparent outline-none w-full text-sm text-zinc-300 placeholder-zinc-700 border-b border-zinc-800 focus:border-zinc-600 transition-colors py-1"
                />
                <div className="shrink-0 flex items-center gap-1">
                  {ACCOUNT_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => updateAccountCategory(account.id, category)}
                      className={cn(
                        'px-2 py-1 rounded-md text-xs capitalize transition-colors',
                        account.category === category ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => removeAccount(account.id)}
                  aria-label="Remove account"
                  className="shrink-0 opacity-0 group-hover/item:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addAccount}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <Plus size={12} /> Add account
          </button>
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
          <p className={labelClass}>Bills</p>
          <p className="text-zinc-500 text-sm">
            Each bill appears as a column in the Bills tab for monthly tracking.
          </p>
          <div className="space-y-1">
            {bills.map((bill) => (
              <div key={bill.id} className="flex items-center gap-2 group/item">
                <input
                  value={bill.name}
                  onChange={(e) => updateBillName(bill.id, e.target.value)}
                  placeholder="e.g. TNB"
                  className="bg-transparent outline-none flex-1 text-sm text-zinc-300 placeholder-zinc-700 border-b border-zinc-800 focus:border-zinc-600 transition-colors py-1"
                />
                <FormattedNumberInput
                  value={bill.defaultAmount}
                  onChange={(v) => updateBillDefault(bill.id, v)}
                  className="bg-transparent outline-none w-24 text-sm text-zinc-500 border-b border-zinc-800 focus:border-zinc-600 transition-colors py-1 text-right"
                />
                <button
                  type="button"
                  onClick={() => removeBill(bill.id)}
                  aria-label="Remove bill"
                  className="shrink-0 opacity-0 group-hover/item:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addBill}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <Plus size={12} /> Add bill
          </button>
        </div>

        <hr className="border-zinc-800" />

        <div className="space-y-3">
          <p className={labelClass}>Custom tax categories</p>
          <p className="text-zinc-500 text-sm">
            Added alongside the built-in categories (EPF, PRS, Zakat, Donation, Insurance, Medical,
            Education, Lifestyle, Other) in the Tax tab's dropdown.
          </p>
          <div className="space-y-1">
            {profile.customTaxCategories.map((cat, i) => (
              <div key={i} className="flex items-center gap-2 group/item">
                <input
                  value={cat}
                  onChange={(e) => {
                    const updated = [...profile.customTaxCategories];
                    updated[i] = e.target.value;
                    setProfile({ ...profile, customTaxCategories: updated });
                  }}
                  placeholder="e.g. Childcare"
                  className="bg-transparent outline-none w-full text-sm text-zinc-300 placeholder-zinc-700 border-b border-zinc-800 focus:border-zinc-600 transition-colors py-1"
                />
                <button
                  type="button"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      customTaxCategories: profile.customTaxCategories.filter((_, j) => j !== i),
                    })
                  }
                  aria-label="Remove category"
                  className="shrink-0 opacity-0 group-hover/item:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setProfile({ ...profile, customTaxCategories: [...profile.customTaxCategories, ''] })
            }
            className="text-xs font-medium text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <Plus size={12} /> Add category
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
