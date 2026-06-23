import { Download, Upload } from 'lucide-react';
import { useAppData } from '../store/useAppData';
import { hydrateAppData } from '../types';

export function BackupControls() {
  const { appData, updateAppData } = useAppData();

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appData, null, 2));
    const date = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `moneyPersonal_appData_backup_${date}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!window.confirm('Import this backup? This will replace all current data.')) return;
        updateAppData(hydrateAppData(parsed));
      } catch {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleExport}
        className="group cursor-pointer text-zinc-400 hover:text-zinc-200 text-sm flex items-center gap-0 transition-colors"
      >
        <Download size={16} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-32 group-hover:ml-2 transition-all duration-200 whitespace-nowrap">
          Export backup
        </span>
      </button>
      <label className="group cursor-pointer text-zinc-400 hover:text-zinc-200 text-sm flex items-center gap-0 transition-colors">
        <Upload size={16} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-32 group-hover:ml-2 transition-all duration-200 whitespace-nowrap">
          Import backup
        </span>
        <input type="file" accept=".json" className="hidden" onChange={handleImport} />
      </label>
    </div>
  );
}
