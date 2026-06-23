import type { LucideIcon } from 'lucide-react';

interface EmptyTabPlaceholderProps {
  icon: LucideIcon;
  label: string;
  description: string;
}

export const EmptyTabPlaceholder = ({ icon: Icon, label, description }: EmptyTabPlaceholderProps) => {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center max-w-md bg-zinc-900/50 rounded-2xl p-10 border border-zinc-800/50">
        <Icon size={28} className="mx-auto mb-4 text-zinc-500" />
        <h2 className="text-lg font-medium text-zinc-100 mb-2">{label}</h2>
        <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
        <p className="mt-4 text-xs uppercase tracking-wider text-zinc-600">Coming soon</p>
      </div>
    </div>
  );
};
