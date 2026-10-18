import { Check, Sparkles, X } from 'lucide-react';
import { ConfettiCelebration } from '../../components/visual/ConfettiCelebration';
import { getStickerById } from './stickerData';
import type { StickerId } from './stickerTypes';

type StickerModalProps = {
  stickerId: StickerId;
  onClose: () => void;
};

export function StickerModal({ stickerId, onClose }: StickerModalProps) {
  const sticker = getStickerById(stickerId);
  if (!sticker) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sticker-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <ConfettiCelebration />

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card Content */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-2xl border border-amber-300/60 bg-white p-6 text-center shadow-xl dark:border-amber-500/30 dark:bg-slate-900 sm:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Close dialog"
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Achievement Unlocked!
        </span>

        {/* Sticker Badge */}
        <div className="my-5 flex size-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-5xl shadow-lg ring-4 ring-amber-200 dark:ring-amber-900/60 sm:size-28 sm:text-6xl">
          {sticker.emoji}
        </div>

        <h3 id="sticker-dialog-title" className="text-xl font-extrabold text-slate-900 dark:text-white">
          {sticker.name}
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
          {sticker.description}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="btn-primary mt-6 w-full justify-center bg-blue-600 hover:bg-blue-700 text-sm font-bold"
        >
          <Check className="size-4" aria-hidden="true" />
          Continue Learning
        </button>
      </div>
    </div>
  );
}
