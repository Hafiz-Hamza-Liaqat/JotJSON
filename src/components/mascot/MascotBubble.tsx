import type { ReactNode } from 'react';
import type { MascotExpression } from '../../features/learning/learningTypes';
import { ByteMascot } from './ByteMascot';

type MascotBubbleProps = {
  expression?: MascotExpression;
  message: ReactNode;
  subtitle?: string;
  size?: 'sm' | 'md';
  className?: string;
};

export function MascotBubble({
  expression = 'idle',
  message,
  subtitle,
  size = 'md',
  className = '',
}: MascotBubbleProps) {
  return (
    <div className={`flex items-start gap-3 sm:gap-4 ${className}`}>
      <ByteMascot expression={expression} size={size} />
      <div className="relative min-w-0 flex-1 rounded-2xl border border-blue-200/80 bg-white p-3.5 shadow-sm dark:border-blue-900/50 dark:bg-slate-900 sm:p-4">
        {/* Speech bubble pointer notch */}
        <div
          aria-hidden="true"
          className="absolute -left-2 top-5 h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-b border-l border-blue-200/80 bg-white dark:border-blue-900/50 dark:bg-slate-900"
        />
        <div className="relative z-10">
          <div className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-100 sm:text-base">
            {message}
          </div>
          {subtitle ? (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
