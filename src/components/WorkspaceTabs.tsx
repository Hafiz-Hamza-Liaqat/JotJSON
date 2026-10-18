export type WorkspaceId = 'format' | 'compare' | 'search';

const TABS: Array<{ id: WorkspaceId; label: string }> = [
  { id: 'format', label: 'Format & Validate' },
  { id: 'compare', label: 'Compare JSON' },
  { id: 'search', label: 'Search JSON' },
];

type WorkspaceTabsProps = {
  current: WorkspaceId;
  onChange: (workspace: WorkspaceId) => void;
};

export function WorkspaceTabs({ current, onChange }: WorkspaceTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Workspaces"
      className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800/80"
    >
      {TABS.map((tab) => {
        const selected = tab.id === current;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              selected
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
                return;
              }
              event.preventDefault();
              const index = TABS.findIndex((item) => item.id === current);
              const delta = event.key === 'ArrowRight' ? 1 : -1;
              const next = TABS[(index + delta + TABS.length) % TABS.length];
              if (next) {
                onChange(next.id);
              }
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
