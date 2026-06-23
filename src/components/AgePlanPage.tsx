import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAppData } from '../store/useAppData';
import { ageForYear } from '../utils/age';
import { AgePlanItemList } from './AgePlanItemList';
import type { AgePlanEntry, PlanItem } from '../types';

export function AgePlanPage() {
  const { appData, setAgePlan } = useAppData();
  const { agePlan, profile } = appData;
  const hasProfile = Boolean(profile.dateOfBirth);
  const sortedEntries = [...agePlan].sort((a, b) => a.year - b.year);

  const updateEntry = (id: string, updates: Partial<AgePlanEntry>) => {
    setAgePlan(agePlan.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)));
  };

  const removeEntry = (id: string) => {
    setAgePlan(agePlan.filter((entry) => entry.id !== id));
  };

  const addEntry = () => {
    const year = agePlan.length > 0 ? Math.max(...agePlan.map((e) => e.year)) + 1 : new Date().getFullYear();
    const age = profile.dateOfBirth ? ageForYear(profile.dateOfBirth, year) : 0;
    const newEntry: AgePlanEntry = { id: uuidv4(), year, age, happened: [], plans: [] };
    setAgePlan([...agePlan, newEntry]);
  };

  const handleYearChange = (entry: AgePlanEntry, year: number) => {
    const age = profile.dateOfBirth ? ageForYear(profile.dateOfBirth, year) : entry.age;
    updateEntry(entry.id, { year, age });
  };

  const addButtonClass =
    'mt-3 w-full flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-3 transition-colors';

  const renderAddControl = (className: string) =>
    hasProfile ? (
      <button onClick={addEntry} className={className}>
        <Plus size={14} /> Add year
      </button>
    ) : (
      <Link to="/profile" className={className}>
        <Plus size={14} /> Set up your profile to add a year
      </Link>
    );

  return (
    <div className="max-w-5xl mx-auto px-10 pt-10 pb-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Age &amp; Plan</h1>
        <p className="text-zinc-500 text-sm">
          Your life, year by year — what happened, and what you&apos;re planning next.
        </p>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-zinc-500 text-sm mb-3">No entries yet.</p>
          {renderAddControl(
            'inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg px-4 py-2 transition-colors'
          )}
        </div>
      ) : (
        <>
          <div className="overflow-auto">
            <table className="text-left border-collapse w-full">
              <thead>
                <tr>
                  <th className="px-3 py-2 bg-zinc-900 text-zinc-500 font-medium border-b border-zinc-800 text-xs uppercase tracking-wider w-24">
                    Year
                  </th>
                  <th className="px-3 py-2 bg-zinc-900 text-zinc-500 font-medium border-b border-zinc-800 text-xs uppercase tracking-wider w-20">
                    Age
                  </th>
                  <th className="px-3 py-2 bg-zinc-900 text-zinc-500 font-medium border-b border-zinc-800 text-xs uppercase tracking-wider">
                    Happened
                  </th>
                  <th className="px-3 py-2 bg-zinc-900 text-zinc-500 font-medium border-b border-zinc-800 text-xs uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="w-8 bg-zinc-900 border-b border-zinc-800" />
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-zinc-800/50 bg-[#09090b] hover:bg-zinc-900/40 transition-colors group"
                  >
                    <td className="px-3 py-2 align-top">
                      <input
                        type="number"
                        value={entry.year}
                        onChange={(e) => handleYearChange(entry, Number(e.target.value))}
                        className="bg-transparent outline-none w-full text-sm text-zinc-300"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        type="number"
                        value={entry.age}
                        onChange={(e) => updateEntry(entry.id, { age: Number(e.target.value) })}
                        className="bg-transparent outline-none w-full text-sm text-zinc-300"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <AgePlanItemList
                        items={entry.happened}
                        onChange={(items) => updateEntry(entry.id, { happened: items })}
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <AgePlanItemList
                        items={entry.plans}
                        showDoneToggle
                        onChange={(items) => updateEntry(entry.id, { plans: items as PlanItem[] })}
                      />
                    </td>
                    <td className="px-3 py-2 align-top relative">
                      <button
                        onClick={() => removeEntry(entry.id)}
                        aria-label="Delete year"
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderAddControl(addButtonClass)}
        </>
      )}
    </div>
  );
}
