import { Braces, Code2, Gamepad2, ShieldCheck } from 'lucide-react';
import type { LearnViewMode, PrimaryNavMode } from '../features/learning/learningTypes';
import type { Theme } from '../hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';
import { WorkspaceTabs, type WorkspaceId } from './WorkspaceTabs';
import { XpBadge } from './visual/XpBadge';

type AppHeaderProps = {
  primaryMode: PrimaryNavMode;
  onPrimaryModeChange: (mode: PrimaryNavMode) => void;
  workspace: WorkspaceId;
  onWorkspaceChange: (workspace: WorkspaceId) => void;
  learnView: LearnViewMode;
  onLearnViewChange: (view: LearnViewMode) => void;
  totalXp: number;
  theme: Theme;
  onToggleTheme: () => void;
};

export function AppHeader({
  primaryMode,
  onPrimaryModeChange,
  workspace,
  onWorkspaceChange,
  learnView,
  onLearnViewChange,
  totalXp,
  theme,
  onToggleTheme,
}: AppHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-950/90 sm:py-3">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Brand Logo & Primary Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-start">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Braces className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                JotJSON
              </p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Format. Inspect. Compare.
              </p>
            </div>
          </div>

          {/* Primary Navigation: Playground vs Learn & Play */}
          <nav
            role="tablist"
            aria-label="Primary Navigation"
            className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800/80"
          >
            <button
              type="button"
              role="tab"
              aria-selected={primaryMode === 'playground'}
              onClick={() => onPrimaryModeChange('playground')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                primaryMode === 'playground'
                  ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Code2 className="size-3.5" aria-hidden="true" />
              Playground
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={primaryMode === 'learn'}
              onClick={() => onPrimaryModeChange('learn')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                primaryMode === 'learn'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Gamepad2 className="size-3.5" aria-hidden="true" />
              Learn &amp; Play
            </button>
          </nav>
        </div>

        {/* Secondary Navigation dependent on Primary Mode */}
        {primaryMode === 'playground' ? (
          <WorkspaceTabs current={workspace} onChange={onWorkspaceChange} />
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <nav
              role="tablist"
              aria-label="Learn Navigation"
              className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800/80"
            >
              <button
                type="button"
                role="tab"
                aria-selected={learnView === 'home'}
                onClick={() => onLearnViewChange('home')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  learnView === 'home'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={learnView === 'lesson'}
                onClick={() => onLearnViewChange('lesson')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  learnView === 'lesson'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Lesson 1
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={learnView === 'detective'}
                onClick={() => onLearnViewChange('detective')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  learnView === 'detective'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Syntax Detective
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={learnView === 'stickers'}
                onClick={() => onLearnViewChange('stickers')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  learnView === 'stickers'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Stickers
              </button>
            </nav>

            <XpBadge totalXp={totalXp} size="sm" />
          </div>
        )}

        {/* Action badges: Privacy status & Theme Toggle */}
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
