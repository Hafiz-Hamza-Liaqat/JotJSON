import { Download, Eraser, FileJson, Minimize2, ShieldCheck, WandSparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { CopyButton } from '../../components/CopyButton';
import { EditorToolbar } from '../../components/EditorToolbar';
import { EmptyState } from '../../components/EmptyState';
import { JsonEditor } from '../../components/JsonEditor';
import { StatisticsRow } from '../../components/StatisticsRow';
import { StatusMessage } from '../../components/StatusMessage';
import { SAMPLE_JSON } from '../../data/sampleJson';
import type { Theme } from '../../hooks/useTheme';
import { readJsonFile } from '../../lib/browser/readJsonFile';
import { downloadText } from '../../lib/browser/download';
import { formatJson } from '../../lib/json/formatJson';
import type { JsonIndent, JsonStatistics, ValidationError } from '../../lib/json/jsonTypes';
import { minifyJson } from '../../lib/json/minifyJson';
import { computeStatistics } from '../../lib/json/jsonStatistics';
import { errorLineNumber, validateJson } from '../../lib/json/validateJson';

type FormatWorkspaceProps = {
  theme: Theme;
  input: string;
  onInputChange: (value: string) => void;
};

type Status = { tone: 'neutral' | 'success' | 'error' | 'warning'; message: string };

export function FormatWorkspace({ theme, input, onInputChange }: FormatWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [indent, setIndent] = useState<JsonIndent>('2');
  const [output, setOutput] = useState('');
  const [outputKind, setOutputKind] = useState<'formatted' | 'minified' | null>(null);
  const [stale, setStale] = useState(false);
  const [statistics, setStatistics] = useState<JsonStatistics | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({
    tone: 'neutral',
    message: 'Paste JSON, upload a file, or load the sample, then validate or format.',
  });

  function setInput(next: string) {
    onInputChange(next);
    setStale(output.length > 0);
    setErrorLine(null);
  }

  function applyError(error: ValidationError) {
    setErrorLine(errorLineNumber(error));
    setStatus({ tone: 'error', message: error.message });
    if (error.kind !== 'empty') {
      setStatistics(null);
    }
  }

  function handleValidate() {
    const result = validateJson(input);
    if (!result.ok) {
      applyError(result.error);
      return;
    }
    setErrorLine(null);
    setStatistics(computeStatistics(input, result.value));
    setStatus({ tone: 'success', message: 'JSON is valid.' });
  }

  function handleFormat() {
    const result = formatJson(input, indent);
    if (!result.ok) {
      applyError(result.error);
      return;
    }
    setErrorLine(null);
    setOutput(result.output);
    setOutputKind('formatted');
    setStale(false);
    setStatistics(result.statistics);
    setStatus({ tone: 'success', message: 'Formatted with source-preserving edits.' });
  }

  function handleMinify() {
    const result = minifyJson(input);
    if (!result.ok) {
      applyError(result.error);
      return;
    }
    setErrorLine(null);
    setOutput(result.output);
    setOutputKind('minified');
    setStale(false);
    setStatistics(result.statistics);
    setStatus({ tone: 'success', message: 'Minified while preserving string and number tokens.' });
  }

  async function handleUpload(file: File) {
    const result = await readJsonFile(file);
    if (!result.ok) {
      setStatus({ tone: 'error', message: result.message });
      return;
    }
    setInput(result.text);
    setOutput('');
    setOutputKind(null);
    setStatistics(null);
    setStatus({ tone: 'neutral', message: `Loaded ${result.name}. Run validate, format, or minify.` });
  }

  function handleClear() {
    setInput('');
    setOutput('');
    setOutputKind(null);
    setStatistics(null);
    setStale(false);
    setErrorLine(null);
    setStatus({ tone: 'neutral', message: 'Input cleared. JSON is not stored after you leave this session.' });
  }

  const downloadName = outputKind === 'minified' ? 'minified.json' : 'formatted.json';

  return (
    <section
      id="panel-format"
      role="tabpanel"
      aria-labelledby="tab-format"
      className="flex min-h-0 flex-1 flex-col gap-4"
    >
      <EditorToolbar fileInputRef={fileInputRef} onUpload={(file) => void handleUpload(file)}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            onInputChange(SAMPLE_JSON);
            setOutput('');
            setOutputKind(null);
            setStatistics(null);
            setStale(false);
            setErrorLine(null);
            setStatus({
              tone: 'neutral',
              message: 'Sample JSON loaded. Format, minify, or validate it.',
            });
          }}
        >
          <FileJson className="size-4" aria-hidden="true" />
          Load sample
        </button>
        <button type="button" className="btn-secondary" onClick={handleClear}>
          <Eraser className="size-4" aria-hidden="true" />
          Clear
        </button>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Indent
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
            value={indent}
            onChange={(event) => setIndent(event.target.value as JsonIndent)}
            aria-label="Indentation"
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tabs</option>
          </select>
        </label>
        <button type="button" className="btn-secondary" onClick={handleValidate}>
          <ShieldCheck className="size-4" aria-hidden="true" />
          Validate
        </button>
        <button type="button" className="btn-primary" onClick={handleFormat}>
          <WandSparkles className="size-4" aria-hidden="true" />
          Format
        </button>
        <button type="button" className="btn-secondary" onClick={handleMinify}>
          <Minimize2 className="size-4" aria-hidden="true" />
          Minify
        </button>
      </EditorToolbar>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <JsonEditor
          id="format-input"
          label="Input"
          value={input}
          onChange={setInput}
          theme={theme}
          errorLine={errorLine}
          placeholder="Paste JSON here"
        />
        <div className="flex min-h-0 flex-col gap-2">
          <JsonEditor
            id="format-output"
            label="Output"
            value={output}
            readOnly
            theme={theme}
            placeholder="Formatted or minified JSON appears here"
          />
          {!output ? (
            <EmptyState title="No output yet">
              Format or minify valid JSON to generate output. Validation reports errors without inventing a result.
            </EmptyState>
          ) : null}
        </div>
      </div>

      <StatusMessage tone={status.tone}>{status.message}</StatusMessage>
      {stale && output ? (
        <StatusMessage tone="warning">
          Input changed after this output was generated. Run format or minify again for a current result.
        </StatusMessage>
      ) : null}
      <StatisticsRow statistics={statistics} stale={stale} />

      <div className="flex flex-wrap gap-2">
        <CopyButton
          text={output}
          label="Copy output"
          disabled={!output || stale}
          disabledReason={stale ? 'Output is stale. Format or minify again.' : 'No output to copy.'}
          onStatus={(message, ok) => setStatus({ tone: ok ? 'success' : 'error', message })}
        />
        <button
          type="button"
          className="btn-secondary"
          disabled={!output || stale}
          title={!output ? 'No output to download.' : stale ? 'Output is stale. Format or minify again.' : undefined}
          onClick={() => downloadText(downloadName, output)}
        >
          <Download className="size-4" aria-hidden="true" />
          Download
        </button>
      </div>
    </section>
  );
}
