import type { JsonStatistics } from '../lib/json/jsonTypes';
import { formatByteSize } from '../lib/json/limits';

type StatisticsRowProps = {
  statistics: JsonStatistics | null;
  stale?: boolean;
};

export function StatisticsRow({ statistics, stale = false }: StatisticsRowProps) {
  if (!statistics) {
    return null;
  }

  const items = [
    { label: 'Size', value: formatByteSize(statistics.byteLength) },
    { label: 'Lines', value: String(statistics.lineCount) },
    { label: 'Object keys', value: String(statistics.objectKeyCount) },
    { label: 'Max depth', value: String(statistics.maxDepth) },
  ];

  return (
    <dl
      className={`grid grid-cols-2 gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-4 dark:border-slate-700 dark:bg-slate-900/60 ${stale ? 'opacity-60' : ''}`}
    >
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {item.label}
          </dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
