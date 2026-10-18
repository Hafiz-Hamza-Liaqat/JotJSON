import { ArrowRight, BookOpen, CheckCircle2, RotateCcw, Search, Sparkles, Trophy } from 'lucide-react';
import { useState } from 'react';
import { MascotBubble } from '../../components/mascot/MascotBubble';
import { FloatingDots } from '../../components/visual/FloatingDots';
import { XpBadge } from '../../components/visual/XpBadge';
import { STARTER_STICKERS } from '../achievements/stickerData';
import type { LearningProgressState } from '../progress/progressStorage';
import { LESSON_1_JSON_BASICS } from './lessonData';

type LearningHomeProps = {
  progress: LearningProgressState;
  onStartLesson: (lessonId: string) => void;
  onStartDetective: () => void;
  onOpenStickerBook: () => void;
  onResetProgress: () => void;
};

export function LearningHome({
  progress,
  onStartLesson,
  onStartDetective,
  onOpenStickerBook,
  onResetProgress,
}: LearningHomeProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const isLessonComplete = progress.completedLessonIds.includes(LESSON_1_JSON_BASICS.id);
  const completedChallengesCount = progress.completedChallengeIds.length;
  const isDetectiveComplete = completedChallengesCount >= 5;
  const isFirstTime = progress.totalXp === 0 && !isLessonComplete && completedChallengesCount === 0;

  const unlockedCount = progress.unlockedStickerIds.length;
  const totalStickers = STARTER_STICKERS.length;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-6 py-2">
      <FloatingDots count={12} />

      {/* Top Welcome Mascot Greeting */}
      <div className="relative z-10">
        <MascotBubble
          expression={isLessonComplete && isDetectiveComplete ? 'champion' : isFirstTime ? 'idle' : 'happy'}
          message={
            isFirstTime
              ? 'Hey, coder! 👋 Welcome to JotJSON PlayLab. Ready to explore JSON through play and practice?'
              : isLessonComplete && isDetectiveComplete
                ? 'Incredible! You have conquered the initial lesson and all detective cases! You are a true JSON Champion! 🏆'
                : `Welcome back, coder! You have earned ${progress.totalXp} XP and unlocked ${unlockedCount} badges. Ready for the next adventure? 🚀`
          }
          subtitle="JotJSON PlayLab — Learn JSON through play, practice, and discovery."
          size="md"
        />
      </div>

      {/* Prominent Next Action Card */}
      <div className="relative z-10 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 text-white shadow-md dark:border-blue-800 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-200">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {isLessonComplete ? 'Next Mission' : 'Recommended Next Step'}
            </span>
            <h2 className="text-xl font-extrabold sm:text-2xl">
              {!isLessonComplete
                ? `Lesson 1: JSON Basics — Step ${(progress.currentStepIndex || 0) + 1} of 6`
                : !isDetectiveComplete
                  ? `Syntax Detective: Case #${(progress.currentChallengeIndex || 0) + 1} of 5`
                  : 'All Missions Complete — Replay or Inspect Badges!'}
            </h2>
            <p className="max-w-xl text-xs leading-relaxed text-blue-100 sm:text-sm">
              {!isLessonComplete
                ? 'Master objects, strings, numbers, booleans, and arrays through fast interactive exercises.'
                : !isDetectiveComplete
                  ? 'Put your skills to the test by hunting and repairing real syntax bugs in the laboratory.'
                  : 'Review your collected stickers or challenge yourself by replaying cases with zero clues.'}
            </p>
          </div>

          <div className="shrink-0">
            {!isLessonComplete ? (
              <button
                type="button"
                onClick={() => onStartLesson(LESSON_1_JSON_BASICS.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition-all hover:bg-blue-50 active:scale-98"
              >
                {progress.currentStepIndex > 0 ? 'Resume Lesson' : 'Start Lesson 1'}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            ) : !isDetectiveComplete ? (
              <button
                type="button"
                onClick={onStartDetective}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition-all hover:bg-blue-50 active:scale-98"
              >
                Enter Detective Lab
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenStickerBook}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition-all hover:bg-blue-50 active:scale-98"
              >
                View Sticker Book
                <Trophy className="size-4 text-amber-500" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Learning Activities Grid */}
      <div className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Activity Card 1: Guided Lesson */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
                <BookOpen className="size-5" aria-hidden="true" />
              </span>
              {isLessonComplete ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="size-3" aria-hidden="true" />
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                  +{LESSON_1_JSON_BASICS.xpReward} XP
                </span>
              )}
            </div>

            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              {LESSON_1_JSON_BASICS.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {LESSON_1_JSON_BASICS.description}
            </p>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onStartLesson(LESSON_1_JSON_BASICS.id)}
              className="btn-secondary w-full justify-between text-xs sm:text-sm font-semibold"
            >
              <span>{isLessonComplete ? 'Review Lesson' : 'Open Lesson'}</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Activity Card 2: Syntax Detective */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-950/80 dark:text-cyan-400">
                <Search className="size-5" aria-hidden="true" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300">
                {completedChallengesCount} / 5 Solved
              </span>
            </div>

            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              Syntax Detective Mini-Game
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Discover missing quotes, trailing commas, and mismatched braces across 5 authored debugging cases.
            </p>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              type="button"
              onClick={onStartDetective}
              className="btn-secondary w-full justify-between text-xs sm:text-sm font-semibold"
            >
              <span>{isDetectiveComplete ? 'Replay Detective' : 'Play Syntax Detective'}</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Activity Card 3: Sticker Book */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400">
                <Trophy className="size-5" aria-hidden="true" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                {unlockedCount} of {totalStickers} Badges
              </span>
            </div>

            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              Sticker Book & Achievements
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Collect 5 unique interactive badges and track your total XP as you conquer lessons and puzzles.
            </p>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              type="button"
              onClick={onOpenStickerBook}
              className="btn-secondary w-full justify-between text-xs sm:text-sm font-semibold"
            >
              <span>Explore Sticker Book</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Footer & Reset Option */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <XpBadge totalXp={progress.totalXp} size="sm" />
          <span>Progress saved locally in browser</span>
        </div>

        <div>
          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-rose-600 dark:text-rose-400 font-medium">Reset all learning progress?</span>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setShowResetConfirm(false);
                }}
                className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-700"
              >
                Yes, Reset
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <RotateCcw className="size-3" aria-hidden="true" />
              Reset Learning Progress
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
