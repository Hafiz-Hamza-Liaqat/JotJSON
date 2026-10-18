import { Eraser, FileJson, Search } from 'lucide-react';
import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { CopyButton } from '../../components/CopyButton';
import { EditorToolbar } from '../../components/EditorToolbar';
import { EmptyState } from '../../components/EmptyState';
import { JsonEditor } from '../../components/JsonEditor';
import { StatusMessage } from '../../components/StatusMessage';
import { SAMPLE_JSON } from '../../data/sampleJson';
import type { Theme } from '../../hooks/useTheme';
import { readJsonFile } from '../../lib/browser/readJsonFile';
import type { SearchMatch, SearchScope } from '../../lib/json/jsonTypes';
import { SEARCH_DISPLAY_LIMIT, searchJson } from '../../lib/json/searchJson';
import { errorLineNumber } from '../../lib/json/validateJson';

type SearchWorkspaceProps = {
  theme: Theme;
  input: string;
  onInputChange: (value: string) => void;
};

type Status = { tone: 'neutral' | 'success' | 'error' | 'warning'; message: string };

export function SearchWorkspace({ theme, input, onInputChange }: SearchWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('both');
  const [matches, setMatches] = useState<SearchMatch[] | null>(null);
  const [total, setTotal] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [stale, setStale] = useState(false);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({
    tone: 'neutral',
    message: 'Search object keys and primitive values. An empty query is not executed.',
  });

  function markStale() {
    if (matches !== null) {
      setStale(true);
    }
  }

  function handleSearch(event?: FormEvent) {
    event?.preventDefault();
    const result = searchJson(input, query, scope);
    if (!result.ok) {
      if (result.error.kind === 'syntax' || result.error.kind === 'empty' || result.error.kind === 'too-large') {
        setErrorLine(errorLineNumber(result.error));
      } else {
        setErrorLine(null);
      }
      setMatches(null);
      setTotal(0);
      setTruncated(false);
      setStale(false);
      setStatus({ tone: 'error', message: result.error.message });
      return;
    }

    setErrorLine(null);
    setMatches(result.matches);
    setTotal(result.total);
    setTruncated(result.truncated);
    setStale(false);
    setStatus({
      tone: result.total === 0 ? 'neutral' : 'success',
      message:
        result.total === 0
          ? 'No matches found.'
          : `Found ${result.total} match${result.total === 1 ? '' : 'es'}${result.truncated ? ` (showing first ${SEARCH_DISPLAY_LIMIT})` : ''}.`,
    });
  }

  async function handleUpload(file: File) {
    const result = await readJsonFile(file);
    if (!result.ok) {
      setStatus({ tone: 'error', message: result.message });
      return;
    }
    onInputChange(result.text);
    markStale();
    setErrorLine(null);
    setStatus({ tone: 'neutral', message: `Loaded ${result.name}.` });
  }

  function handleLoadSample() {
    onInputChange(SAMPLE_JSON);
    markStale();
    setErrorLine(null);
    setStatus({
      tone: 'neutral',
      message: 'Sample JSON loaded. Enter a query and run search.',
    });
  }

  function handleQueryKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  }

  return (
    <section
      id="panel-search"
      role="tabpanel"
      aria-labelledby="tab-search"
      className="flex min-h-0 flex-1 flex-col gap-4"
    >
      <EditorToolbar fileInputRef={fileInputRef} onUpload={(file) => void handleUpload(file)}>
        <button type="button" className="btn-secondary" onClick={handleLoadSample}>
          <FileJson className="size-4" aria-hidden="true" />
          Load sample
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            onInputChange('');
            setQuery('');
            setMatches(null);
            setStale(false);
            setErrorLine(null);
            setStatus({ tone: 'neutral', message: 'Search input cleared.' });
          }}
        >
          <Eraser className="size-4" aria-hidden="true" />
          Clear
        </button>
      </EditorToolbar>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <JsonEditor
          id="search-input"
          label="JSON document"
          value={input}
          onChange={(value) => {
            onInputChange(value);
            markStale();
            setErrorLine(null);
          }}
          theme={theme}
          errorLine={errorLine}
          placeholder="Paste JSON to search"
        />

        <div className="flex min-h-0 flex-col gap-3">
          <form className="flex flex-col gap-2" onSubmit={handleSearch}>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="search-query">
              Query
            </label>
            <input
              id="search-query"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                markStale();
              }}
              onKeyDown={handleQueryKey}
              placeholder="Search keys or values"
              autoComplete="off"
            />
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="search-scope">
              Scope
            </label>
            <select
              id="search-scope"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
              value={scope}
              onChange={(event) => {
                setScope(event.target.value as SearchScope);
                markStale();
              }}
            >
              <option value="both">Keys and values</option>
              <option value="keys">Keys only</option>
              <option value="values">Values only</option>
            </select>
            <button type="submit" className="btn-primary">
              <Search className="size-4" aria-hidden="true" />
              Search
            </button>
          </form>

          <StatusMessage tone={status.tone}>{status.message}</StatusMessage>
          {stale && matches !== null ? (
            <StatusMessage tone="warning">
              The document or query changed after this search. Run search again for current matches.
            </StatusMessage>
          ) : null}

          <div className={`min-h-0 flex-1 overflow-auto ${stale ? 'opacity-60' : ''}`}>
            {matches === null ? (
              <EmptyState title="No search yet">
                Enter a query and run search. Matching uses decoded string values and exact JSON tokens for numbers, booleans, and null.
              </EmptyState>
            ) : matches.length === 0 ? (
              <EmptyState title="No matches">
                Nothing in this document matched “{query.trim()}”.
              </EmptyState>
            ) : (
              <ul className="space-y-2">
                {matches.map((match) => (
                  <li
                    key={`${match.kind}-${match.path}-${match.matchedText}`}
                    className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-500">{match.kind}</p>
                    <code className="break-all text-sm">{match.path}</code>
                    <pre className="mt-2 overflow-auto rounded bg-slate-50 p-2 font-mono text-xs dark:bg-slate-950">
                      {match.valueText}
                    </pre>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <CopyButton
                        text={match.path}
                        label="Copy path"
                        disabled={stale}
                        onStatus={(message, ok) => setStatus({ tone: ok ? 'success' : 'error', message })}
                      />
                      <CopyButton
                        text={match.valueText}
                        label="Copy value"
                        disabled={stale}
                        onStatus={(message, ok) => setStatus({ tone: ok ? 'success' : 'error', message })}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {truncated ? (
              <p className="mt-2 text-xs text-slate-500">
                Showing {SEARCH_DISPLAY_LIMIT} of {total} matches.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
