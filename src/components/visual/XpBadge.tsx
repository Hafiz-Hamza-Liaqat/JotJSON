import { Sparkles } from 'lucide-react';
import { useEffect } from 'react';

type XpBadgeProps = {
  totalXp: number;
  floatingAward?: { amount: number; key: number } | null;
  onDismissFloating?: () => void;
  size?: 'sm' | 'md';
  className?: string;
};

export function XpBadge({
  totalXp,
  floatingAward,
  onDismissFloating,
  size = 'md',
  className = '',
}: XpBadgeProps) {
  useEffect(() => {
    if (!floatingAward) {
      return;
    }
    const timer = setTimeout(() => {
      onDismissFloating?.();
    }, 2200);
    return () => clearTimeout(timer);
  }, [floatingAward, onDismissFloating]);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <span
        aria-label={`${totalXp} total experience points`}
        className={`inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-gradient-to-r from-amber-50 to-amber-100/60 font-bold text-amber-800 shadow-xs dark:border-amber-600/40 dark:from-amber-950/40 dark:to-amber-900/20 dark:text-amber-300 ${
          size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
        }`}
      >
        <Sparkles className="size-3.5 fill-amber-400 text-amber-500 dark:text-amber-400" aria-hidden="true" />
        <span>{totalXp} XP</span>
      </span>

      {/* Floating +XP Award Indicator */}
      {floatingAward && (
        <span
          key={floatingAward.key}
          aria-live="polite"
          className="pointer-events-none absolute -top-6 right-0 z-30 inline-flex items-center font-extrabold text-amber-600 dark:text-amber-400"
          style={{
            animation: 'float-up-fade 2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <style>{`
            @keyframes float-up-fade {
              0% {
                opacity: 0;
                transform: translateY(6px) scale(0.8);
              }
              25% {
                opacity: 1;
                transform: translateY(-4px) scale(1.15);
              }
              75% {
                opacity: 1;
                transform: translateY(-16px) scale(1);
              }
              100% {
                opacity: 0;
                transform: translateY(-26px) scale(0.9);
              }
            }
            @media (prefers-reduced-motion: reduce) {
              @keyframes float-up-fade {
                0% {
                  opacity: 0;
                  transform: none;
                }
                25% {
                  opacity: 1;
                  transform: none;
                }
                75% {
                  opacity: 1;
                  transform: none;
                }
                100% {
                  opacity: 0;
                  transform: none;
                }
              }
            }
          `}</style>
          +{floatingAward.amount} XP!
        </span>
      )}
    </div>
  );
}
