import type { ReactNode } from 'react';

export type StatusTone = 'neutral' | 'success' | 'error' | 'warning';

type StatusMessageProps = {
  tone?: StatusTone;
  children: ReactNode;
};

const TONE_CLASS: Record<StatusTone, string> = {
  neutral: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200',
  success:
    'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200',
  error: 'border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/70 dark:text-red-200',
  warning:
    'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-100',
};

export function StatusMessage({ tone = 'neutral', children }: StatusMessageProps) {
  const role = tone === 'error' ? 'alert' : 'status';
  return (
    <p
      role={role}
      className={`rounded-md border px-3 py-2 text-sm ${TONE_CLASS[tone]}`}
    >
      {children}
    </p>
  );
}
