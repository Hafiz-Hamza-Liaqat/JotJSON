import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, RotateCcw, ShieldAlert, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { JsonEditor } from '../../components/JsonEditor';
import { MascotBubble } from '../../components/mascot/MascotBubble';
import { ConfettiCelebration } from '../../components/visual/ConfettiCelebration';
import { ProgressDots } from '../../components/visual/ProgressDots';
import type { Theme } from '../../hooks/useTheme';
import type { LearningProgressState } from '../progress/progressStorage';
import { SYNTAX_CHALLENGES } from './challengeData';
import { evaluateChallenge } from './challengeEvaluator';
import type { ChallengeRound, EvaluationResult } from './challengeTypes';

type SyntaxDetectiveProps = {
  challenges?: ChallengeRound[];
  progress: LearningProgressState;
  onCompleteChallenge: (challengeId: string, xpReward: number, nextIndex?: number) => void;
  onRecordHint: (challengeId: string) => void;
  onBackToHome: () => void;
  theme: Theme;
};

type ChallengeRoundViewProps = {
  challenge: ChallengeRound;
  theme: Theme;
  onSolve: () => void;
  onHintUsed: () => void;
  isCurrentRoundSolved: boolean;
  isLastRound: boolean;
  isGameFinished: boolean;
  onNextRound: () => void;
  onRestartGame: () => void;
};

function ChallengeRoundView({
  challenge,
  theme,
  onSolve,
  onHintUsed,
  isCurrentRoundSolved,
  isLastRound,
  isGameFinished,
  onNextRound,
  onRestartGame,
}: ChallengeRoundViewProps) {
  const [code, setCode] = useState(challenge.brokenStarter);
  const [revealedHints, setRevealedHints] = useState(0);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  function handleCheck() {
    const result = evaluateChallenge(code, challenge);
    setEvaluation(result);

    if (result.status === 'success') {
      onSolve();
    }
  }

  function handleReset() {
    setCode(challenge.brokenStarter);
    setEvaluation(null);
  }

  function handleRevealHint() {
    setRevealedHints((prev) => {
      const next = prev === 0 ? 1 : prev === 1 && challenge.secondHint ? 2 : prev;
      if (next > prev) {
        onHintUsed();
      }
      return next;
    });
  }

  // Mascot expression
  const mascotMood =
    evaluation?.status === 'success'
      ? isLastRound
        ? 'champion'
        : 'happy'
      : revealedHints > 0
        ? 'thinking'
        : 'detective';

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Mascot Guidance */}
      <MascotBubble
        expression={mascotMood}
        message={
          evaluation?.status === 'success'
            ? challenge.explanationOnSuccess
            : revealedHints > 0
              ? `Hint: ${revealedHints === 1 ? challenge.firstHint : challenge.secondHint}`
              : `Detective Byte reporting! Case #${challenge.roundNumber}: ${challenge.title}. Can you spot the bug in this JSON document?`
        }
        subtitle={challenge.missionDescription}
        size="md"
      />

      {/* Editor & Controls Grid */}
      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Editor Area */}
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Repair Broken JSON
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reset Starter Code
            </button>
          </div>

          <JsonEditor
            id="challenge-editor"
            label="Broken JSON Code"
            value={code}
            onChange={(val) => {
              setCode(val);
              if (evaluation) {
                setEvaluation(null);
              }
            }}
            theme={theme}
            errorLine={evaluation?.status === 'invalid-syntax' ? evaluation.line : null}
            placeholder="Edit JSON here"
          />
        </div>

        {/* Action Panel & Clues */}
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
              Case Briefing: {challenge.title}
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {challenge.missionDescription}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCheck}
              className="btn-primary flex-1 justify-center text-xs sm:text-sm"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Check My JSON
            </button>

            <button
              type="button"
              onClick={handleRevealHint}
              disabled={revealedHints >= 2 || (revealedHints === 1 && !challenge.secondHint)}
              className="btn-secondary text-xs sm:text-sm"
            >
              <Lightbulb className="size-4 text-amber-500" aria-hidden="true" />
              {revealedHints === 0
                ? 'Get Hint'
                : revealedHints === 1 && challenge.secondHint
                  ? 'Get Next Hint'
                  : 'All Hints Revealed'}
            </button>
          </div>

          {/* Clues Box */}
          {revealedHints > 0 && (
            <div className="flex flex-col gap-2 rounded-lg border border-amber-300 bg-amber-50/90 p-3 text-xs text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
              <div>
                <strong>Clue 1:</strong> {challenge.firstHint}
              </div>
              {revealedHints >= 2 && challenge.secondHint && (
                <div className="border-t border-amber-200/80 pt-1.5 dark:border-amber-800/80">
                  <strong>Clue 2:</strong> {challenge.secondHint}
                </div>
              )}
            </div>
          )}

          {/* Evaluation Outcome Banner */}
          {evaluation && (
            <div
              role="alert"
              className={`rounded-lg border p-3 text-xs leading-relaxed sm:text-sm ${
                evaluation.status === 'success'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                  : evaluation.status === 'valid-wrong-structure'
                    ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                    : 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {evaluation.status === 'success' ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ShieldAlert className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                )}
                <div>
                  <p className="font-bold">
                    {evaluation.status === 'success'
                      ? 'Case Solved!'
                      : evaluation.status === 'valid-wrong-structure'
                        ? 'Valid Syntax, but Objective Incomplete'
                        : `Syntax Error${evaluation.line ? ` (Line ${evaluation.line})` : ''}`}
                  </p>
                  <p className="mt-0.5">{evaluation.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="mt-auto border-t border-slate-200 pt-3 dark:border-slate-800">
            {isLastRound && isGameFinished ? (
              <div className="flex flex-col gap-2">
                <div className="rounded-lg bg-emerald-500/15 p-2.5 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  🏆 All 5 Detective Cases Solved!
                </div>
                <button
                  type="button"
                  onClick={onRestartGame}
                  className="btn-secondary w-full justify-center text-xs sm:text-sm"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Replay Cases
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={!isCurrentRoundSolved || isLastRound}
                onClick={onNextRound}
                className="btn-primary w-full justify-center text-xs sm:text-sm"
              >
                Next Case
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SyntaxDetective({
  challenges = SYNTAX_CHALLENGES,
  progress,
  onCompleteChallenge,
  onRecordHint,
  onBackToHome,
  theme,
}: SyntaxDetectiveProps) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(() => {
    return Math.min(progress.currentChallengeIndex || 0, challenges.length - 1);
  });

  const challenge = challenges[currentRoundIndex] ?? challenges[0]!;

  const [showCelebration, setShowCelebration] = useState(false);
  const [solvedRounds, setSolvedRounds] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const id of progress.completedChallengeIds) {
      map[id] = true;
    }
    return map;
  });

  const isCurrentRoundSolved = Boolean(solvedRounds[challenge.id]);
  const isLastRound = currentRoundIndex === challenges.length - 1;
  const isGameFinished = challenges.every((c) => solvedRounds[c.id]);

  const completedIndices = useMemo(() => {
    return challenges
      .map((c, idx) => (solvedRounds[c.id] ? idx : -1))
      .filter((idx) => idx !== -1);
  }, [challenges, solvedRounds]);

  function handleSolve() {
    setSolvedRounds((prev) => ({ ...prev, [challenge.id]: true }));
    setShowCelebration(true);
    onCompleteChallenge(challenge.id, challenge.xpReward, currentRoundIndex);
  }

  function handleNextRound() {
    if (currentRoundIndex < challenges.length - 1) {
      const nextIdx = currentRoundIndex + 1;
      setCurrentRoundIndex(nextIdx);
      onCompleteChallenge(challenge.id, challenge.xpReward, nextIdx);
    }
  }

  function handleRestartGame() {
    setCurrentRoundIndex(0);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 py-2">
      {showCelebration && <ConfettiCelebration onComplete={() => setShowCelebration(false)} />}

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Learn &amp; Play
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-xs font-semibold text-cyan-900 dark:bg-cyan-950/60 dark:text-cyan-300">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Round {currentRoundIndex + 1} of {challenges.length} (+{challenge.xpReward} XP)
          </span>
          {isCurrentRoundSolved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Case Solved
            </span>
          )}
        </div>
      </div>

      {/* Progress Dots */}
      <ProgressDots
        total={challenges.length}
        current={currentRoundIndex}
        completedIndices={completedIndices}
        onSelectIndex={(idx) => setCurrentRoundIndex(idx)}
        labelPrefix="Case"
      />

      {/* Current Round View with key to auto-reset on round navigation */}
      <ChallengeRoundView
        key={challenge.id}
        challenge={challenge}
        theme={theme}
        onSolve={handleSolve}
        onHintUsed={() => onRecordHint(challenge.id)}
        isCurrentRoundSolved={isCurrentRoundSolved}
        isLastRound={isLastRound}
        isGameFinished={isGameFinished}
        onNextRound={handleNextRound}
        onRestartGame={handleRestartGame}
      />
    </div>
  );
}
