import { Eraser, FileJson, GitCompare } from 'lucide-react';
import { useState } from 'react';
import { EditorToolbar } from '../../components/EditorToolbar';
import { JsonEditor } from '../../components/JsonEditor';
import { StatusMessage } from '../../components/StatusMessage';
import { SAMPLE_COMPARE_MODIFIED, SAMPLE_COMPARE_ORIGINAL } from '../../data/sampleJson';
import type { Theme } from '../../hooks/useTheme';
import { compareJson } from './compareJson';
import type { JsonDiff } from '../../lib/json/jsonTypes';
import { errorLineNumber } from '../../lib/json/validateJson';
import { DiffList } from './DiffList';

type CompareWorkspaceProps = {
  theme: Theme;
  original: string;
  modified: string;
  onOriginalChange: (value: string) => void;
  onModifiedChange: (value: string) => void;
};

type Status = { tone: 'neutral' | 'success' | 'error' | 'warning'; message: string };

export function CompareWorkspace({
  theme,
  original,
  modified,
  onOriginalChange,
  onModifiedChange,
}: CompareWorkspaceProps) {
  const [diffs, setDiffs] = useState<JsonDiff[] | null>(null);
  const [counts, setCounts] = useState<{ total: number; added: number; removed: number; changed: number } | null>(
    null,
  );
  const [stale, setStale] = useState(false);
  const [originalErrorLine, setOriginalErrorLine] = useState<number | null>(null);
  const [modifiedErrorLine, setModifiedErrorLine] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({
    tone: 'neutral',
    message: 'Enter two JSON documents and run a comparison. Both must be valid.',
  });

  function markStale() {
    if (diffs !== null) {
      setStale(true);
    }
  }

  function handleCompare() {
    const result = compareJson(original, modified);
    if (!result.ok) {
      const line = errorLineNumber(result.error);
      if (result.target === 'original') {
        setOriginalErrorLine(line);
        setModifiedErrorLine(null);
      } else {
        setModifiedErrorLine(line);
        setOriginalErrorLine(null);
      }
      const prefix = result.target === 'original' ? 'Original JSON' : 'Modified JSON';
      setDiffs(null);
      setCounts(null);
      setStale(false);
      setStatus({ tone: 'error', message: `${prefix}: ${result.error.message}` });
      return;
    }

    setOriginalErrorLine(null);
    setModifiedErrorLine(null);
    setDiffs(result.diffs);
    setCounts(result.counts);
    setStale(false);
    setStatus({
      tone: 'success',
      message:
        result.counts.total === 0
          ? 'No differences found.'
          : `Found ${result.counts.total} difference${result.counts.total === 1 ? '' : 's'}.`,
    });
  }

  function handleClear() {
    onOriginalChange('');
    onModifiedChange('');
    setDiffs(null);
    setCounts(null);
    setStale(false);
    setOriginalErrorLine(null);
    setModifiedErrorLine(null);
    setStatus({ tone: 'neutral', message: 'Both documents cleared.' });
  }

  return (
    <section
      id="panel-compare"
      role="tabpanel"
      aria-labelledby="tab-compare"
      className="flex min-h-0 flex-1 flex-col gap-4"
    >
      <EditorToolbar>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            onOriginalChange(SAMPLE_COMPARE_ORIGINAL);
            onModifiedChange(SAMPLE_COMPARE_MODIFIED);
            markStale();
          }}
        >
          <FileJson className="size-4" aria-hidden="true" />
          Load sample
        </button>
        <button type="button" className="btn-secondary" onClick={handleClear}>
          <Eraser className="size-4" aria-hidden="true" />
          Clear
        </button>
        <button type="button" className="btn-primary" onClick={handleCompare}>
          <GitCompare className="size-4" aria-hidden="true" />
          Compare
        </button>
      </EditorToolbar>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <JsonEditor
          id="compare-original"
          label="Original"
          value={original}
          onChange={(value) => {
            onOriginalChange(value);
            markStale();
            setOriginalErrorLine(null);
          }}
          theme={theme}
          errorLine={originalErrorLine}
          placeholder="Original JSON"
        />
        <JsonEditor
          id="compare-modified"
          label="Modified"
          value={modified}
          onChange={(value) => {
            onModifiedChange(value);
            markStale();
            setModifiedErrorLine(null);
          }}
          theme={theme}
          errorLine={modifiedErrorLine}
          placeholder="Modified JSON"
        />
      </div>

      <StatusMessage tone={status.tone}>{status.message}</StatusMessage>
      {stale && diffs !== null ? (
        <StatusMessage tone="warning">
          A document changed after this comparison. Run compare again for a current result.
        </StatusMessage>
      ) : null}

      {counts ? (
        <p className="text-sm text-slate-600 dark:text-slate-300" role="status">
          {counts.total} total · {counts.added} added · {counts.removed} removed · {counts.changed} changed
        </p>
      ) : null}

      {diffs ? (
        <div className={stale ? 'opacity-60' : undefined}>
          <DiffList
            diffs={diffs}
            stale={stale}
            onStatus={(message, ok) => setStatus({ tone: ok ? 'success' : 'error', message })}
          />
        </div>
      ) : null}
    </section>
  );
}
