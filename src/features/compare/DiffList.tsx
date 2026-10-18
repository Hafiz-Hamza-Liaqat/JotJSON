import { useState } from 'react';
import { CopyButton } from '../../components/CopyButton';
import { EmptyState } from '../../components/EmptyState';
import type { JsonDiff } from '../../lib/json/jsonTypes';

type DiffListProps = {
  diffs: JsonDiff[];
  stale: boolean;
  onStatus: (message: string, ok: boolean) => void;
};

export function DiffList({ diffs, stale, onStatus }: DiffListProps) {
  if (diffs.length === 0) {
    return (
      <EmptyState title="No differences found.">
        The documents are equivalent under structural comparison. Object key order and insignificant whitespace are ignored.
      </EmptyState>
    );
  }

  return (
    <ul className="space-y-2">
      {diffs.map((diff) => (
        <li key={`${diff.kind}-${diff.path}`}>
          <DiffItem diff={diff} disabled={stale} onStatus={onStatus} />
        </li>
      ))}
    </ul>
  );
}

function DiffItem({
  diff,
  disabled,
  onStatus,
}: {
  diff: JsonDiff;
  disabled: boolean;
  onStatus: (message: string, ok: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const badgeClass =
    diff.kind === 'added'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
      : diff.kind === 'removed'
        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
        : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100';

  return (
    <article className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${badgeClass}`}>
          {diff.kind}
        </span>
        <code className="break-all text-sm text-slate-800 dark:text-slate-100">{diff.path}</code>
      </div>
      <dl className="mt-2 grid gap-2 text-sm md:grid-cols-2">
        {diff.originalValue !== undefined ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Original {diff.originalType ? `(${diff.originalType})` : ''}
            </dt>
            <dd>
              <ValuePreview text={diff.originalValue} expanded={expanded} />
            </dd>
          </div>
        ) : null}
        {diff.modifiedValue !== undefined ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Modified {diff.modifiedType ? `(${diff.modifiedType})` : ''}
            </dt>
            <dd>
              <ValuePreview text={diff.modifiedValue} expanded={expanded} />
            </dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-2 flex flex-wrap gap-2">
        {(diff.originalValue?.length ?? 0) > 180 || (diff.modifiedValue?.length ?? 0) > 180 ? (
          <button type="button" className="btn-ghost" onClick={() => setExpanded((value) => !value)}>
            {expanded ? 'Collapse values' : 'Expand values'}
          </button>
        ) : null}
        <CopyButton text={diff.path} label="Copy path" disabled={disabled} onStatus={onStatus} />
        {diff.originalValue !== undefined ? (
          <CopyButton
            text={diff.originalValue}
            label="Copy original"
            disabled={disabled}
            onStatus={onStatus}
          />
        ) : null}
        {diff.modifiedValue !== undefined ? (
          <CopyButton
            text={diff.modifiedValue}
            label="Copy modified"
            disabled={disabled}
            onStatus={onStatus}
          />
        ) : null}
      </div>
    </article>
  );
}

function ValuePreview({ text, expanded }: { text: string; expanded: boolean }) {
  const display = !expanded && text.length > 180 ? `${text.slice(0, 180)}…` : text;
  return (
    <pre className="mt-1 max-h-48 overflow-auto rounded bg-slate-50 p-2 font-mono text-xs text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {display}
    </pre>
  );
}
