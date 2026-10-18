import { Braces, ShieldCheck } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';
import { WorkspaceTabs, type WorkspaceId } from './WorkspaceTabs';

type AppHeaderProps = {
  workspace: WorkspaceId;
  onWorkspaceChange: (workspace: WorkspaceId) => void;
  theme: Theme;
  onToggleTheme: () => void;
};

export function AppHeader({
  workspace,
  onWorkspaceChange,
  theme,
  onToggleTheme,
}: AppHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Braces className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              JotJSON
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Format. Inspect. Compare.</p>
          </div>
        </div>
        <WorkspaceTabs current={workspace} onChange={onWorkspaceChange} />
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
            <ShieldCheck className="size-3.5 text-blue-600" aria-hidden="true" />
            Processed locally
          </span>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
