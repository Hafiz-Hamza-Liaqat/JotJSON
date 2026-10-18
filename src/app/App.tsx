import { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import type { WorkspaceId } from '../components/WorkspaceTabs';
import { CompareWorkspace } from '../features/compare/CompareWorkspace';
import { FormatWorkspace } from '../features/format/FormatWorkspace';
import { SearchWorkspace } from '../features/search/SearchWorkspace';
import { useTheme } from '../hooks/useTheme';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [workspace, setWorkspace] = useState<WorkspaceId>('format');
  const [formatInput, setFormatInput] = useState('');
  const [compareOriginal, setCompareOriginal] = useState('');
  const [compareModified, setCompareModified] = useState('');
  const [searchInput, setSearchInput] = useState('');

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900 dark:bg-[#0B1220] dark:text-slate-100">
      <AppHeader
        workspace={workspace}
        onWorkspaceChange={setWorkspace}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="mx-auto flex w-full max-w-[1440px] min-h-0 flex-1 flex-col px-4 py-4">
        {workspace === 'format' ? (
          <FormatWorkspace theme={theme} input={formatInput} onInputChange={setFormatInput} />
        ) : null}
        {workspace === 'compare' ? (
          <CompareWorkspace
            theme={theme}
            original={compareOriginal}
            modified={compareModified}
            onOriginalChange={setCompareOriginal}
            onModifiedChange={setCompareModified}
          />
        ) : null}
        {workspace === 'search' ? (
          <SearchWorkspace theme={theme} input={searchInput} onInputChange={setSearchInput} />
        ) : null}
      </main>
      <footer className="border-t border-slate-200 px-4 py-3 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        JSON is processed in this browser. Documents are not uploaded, and they are not saved in localStorage.
      </footer>
    </div>
  );
}
