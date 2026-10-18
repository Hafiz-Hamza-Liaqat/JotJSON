import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  children: ReactNode;
};

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <div className="flex h-full min-h-40 flex-col justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
      <p className="font-medium text-slate-800 dark:text-slate-100">{title}</p>
      <div className="mt-1 leading-relaxed">{children}</div>
    </div>
  );
}
