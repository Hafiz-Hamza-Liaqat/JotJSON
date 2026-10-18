import { Check } from 'lucide-react';

type ProgressDotsProps = {
  total: number;
  current: number; // 0-based
  completedIndices?: number[];
  onSelectIndex?: (index: number) => void;
  labelPrefix?: string; // "Step" or "Round"
  className?: string;
};

export function ProgressDots({
  total,
  current,
  completedIndices = [],
  onSelectIndex,
  labelPrefix = 'Step',
  className = '',
}: ProgressDotsProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
        <span>
          {labelPrefix} {current + 1} of {total}
        </span>
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {Math.round(((completedIndices.length) / total) * 100)}% complete
        </span>
      </div>

      <div
        role="tablist"
        aria-label={`${labelPrefix} progression`}
        className="flex items-center gap-1.5 sm:gap-2"
      >
        {Array.from({ length: total }, (_, i) => {
          const isCompleted = completedIndices.includes(i);
          const isActive = i === current;
          const isClickable = Boolean(onSelectIndex && (isCompleted || i <= current));

          return (
            <button
              key={i}
              type="button"
              disabled={!isClickable}
              onClick={() => onSelectIndex?.(i)}
              aria-label={`${labelPrefix} ${i + 1}${isCompleted ? ' (Completed)' : isActive ? ' (Current)' : ''}`}
              aria-current={isActive ? 'step' : undefined}
              className={`group relative flex h-7 flex-1 items-center justify-center rounded-full text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/50 dark:ring-blue-500/50'
                  : isCompleted
                    ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-slate-200/80 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
              } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {isCompleted ? (
                <Check className="size-3.5 stroke-[3]" aria-hidden="true" />
              ) : (
                <span>{i + 1}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
