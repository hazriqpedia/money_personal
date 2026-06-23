import { useAppData } from '../store/useAppData';
import { ageForYear } from '../utils/age';
import { BackupControls } from './BackupControls';

export function ProfilePage() {
  const { appData, setProfile } = useAppData();
  const { dateOfBirth } = appData.profile;
  const currentAge = dateOfBirth ? ageForYear(dateOfBirth, new Date().getFullYear()) : null;

  return (
    <div className="flex-1 px-6 py-12 w-full max-w-2xl mx-auto">
      <div className="space-y-10">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 mb-3">Profile</h1>
          <p className="text-zinc-400 leading-relaxed text-sm">
            Set your date of birth so the Age &amp; Plan tab can calculate your age for each year
            automatically.
          </p>
        </div>

        <hr className="border-zinc-800" />

        <div className="space-y-3">
          <label
            htmlFor="profile-dob"
            className="block text-xs font-medium text-zinc-500 uppercase tracking-wider"
          >
            Date of birth
          </label>
          <input
            id="profile-dob"
            type="date"
            value={dateOfBirth ?? ''}
            onChange={(e) => setProfile({ dateOfBirth: e.target.value || null })}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none focus:border-zinc-600 transition-colors"
          />
          {currentAge !== null && (
            <p className="text-zinc-500 text-sm">You are currently {currentAge} years old.</p>
          )}
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
