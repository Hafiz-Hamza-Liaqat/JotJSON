import { ArrowLeft, Lock, Sparkles, Trophy } from 'lucide-react';
import type { LearningProgressState } from '../progress/progressStorage';
import { STARTER_STICKERS } from './stickerData';

type StickerBookProps = {
  progress: LearningProgressState;
  onBackToHome: () => void;
};

export function StickerBook({ progress, onBackToHome }: StickerBookProps) {
  const unlockedIds = new Set(progress.unlockedStickerIds);
  const unlockedCount = STARTER_STICKERS.filter((s) => unlockedIds.has(s.id)).length;
  const percentage = Math.round((unlockedCount / STARTER_STICKERS.length) * 100);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 py-2">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Learn & Play
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
            <Trophy className="size-3.5" aria-hidden="true" />
            {unlockedCount} of {STARTER_STICKERS.length} Stickers ({percentage}%)
          </span>
        </div>
      </div>

      {/* Banner */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-amber-500/10 p-5 dark:border-slate-800 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-amber-950/20 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
              Sticker Book & Achievements
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
              Collect interactive badges as you progress through lessons and solve syntax puzzles.
            </p>
          </div>
          <span className="hidden text-4xl sm:inline-block select-none" aria-hidden="true">
            📖
          </span>
        </div>
      </div>

      {/* Sticker Grid */}
      <div
        role="region"
        aria-label="Stickers Collection"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {STARTER_STICKERS.map((sticker) => {
          const isUnlocked = unlockedIds.has(sticker.id);

          return (
            <div
              key={sticker.id}
              data-testid={`sticker-card-${sticker.id}`}
              className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                isUnlocked
                  ? 'border-amber-300/80 bg-white shadow-sm dark:border-amber-500/40 dark:bg-slate-900'
                  : 'border-slate-200/90 bg-slate-50/70 opacity-75 dark:border-slate-800/80 dark:bg-slate-900/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`flex size-14 items-center justify-center rounded-2xl text-3xl shadow-xs transition-transform ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-amber-400 to-amber-500 shadow-md ring-2 ring-amber-200 dark:ring-amber-900/60'
                        : 'bg-slate-200 text-2xl grayscale dark:bg-slate-800'
                    }`}
                  >
                    {isUnlocked ? sticker.emoji : '🔒'}
                  </div>

                  <span
                    data-testid={`sticker-status-${sticker.id}`}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isUnlocked
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>

                <h4 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                  {sticker.name}
                </h4>

                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {sticker.description}
                </p>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                {isUnlocked ? (
                  <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                    <Sparkles className="size-3" aria-hidden="true" />
                    Badge Earned
                  </span>
                ) : (
                  <span className="flex items-start gap-1 text-slate-500 dark:text-slate-400">
                    <Lock className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                    Requirement: {sticker.unlockRequirement}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
