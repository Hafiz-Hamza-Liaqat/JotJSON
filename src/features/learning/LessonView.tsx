import { ArrowLeft, ArrowRight, Award, CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MascotBubble } from '../../components/mascot/MascotBubble';
import { ConfettiCelebration } from '../../components/visual/ConfettiCelebration';
import { ProgressDots } from '../../components/visual/ProgressDots';
import type { Theme } from '../../hooks/useTheme';
import type { LearningProgressState } from '../progress/progressStorage';
import type { Lesson, MascotExpression } from './learningTypes';
import { QuizWidget } from './QuizWidget';

type LessonViewProps = {
  lesson: Lesson;
  progress: LearningProgressState;
  onCompleteStep: (lessonId: string, stepId: string, nextIndex?: number) => void;
  onCompleteLesson: (lessonId: string, xpReward: number) => void;
  onBackToHome: () => void;
  theme: Theme;
};

export function LessonView({
  lesson,
  progress,
  onCompleteStep,
  onCompleteLesson,
  onBackToHome,
}: LessonViewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    // Resume at the saved step or first step
    return Math.min(progress.currentStepIndex || 0, lesson.steps.length - 1);
  });

  const [stepSolved, setStepSolved] = useState<Record<string, boolean>>(() => {
    const solved: Record<string, boolean> = {};
    const completed = progress.completedStepIds[lesson.id] ?? [];
    for (const stepId of completed) {
      solved[stepId] = true;
    }
    return solved;
  });

  const [mascotMood, setMascotMood] = useState<MascotExpression>('idle');
  const [showCelebration, setShowCelebration] = useState(false);

  const step = lesson.steps[currentStepIndex] ?? lesson.steps[0]!;

  const isCurrentStepSolved = Boolean(stepSolved[step.id]);

  const completedIndices = useMemo(() => {
    return lesson.steps
      .map((s, idx) => (stepSolved[s.id] ? idx : -1))
      .filter((idx) => idx !== -1);
  }, [lesson.steps, stepSolved]);

  const isLastStep = currentStepIndex === lesson.steps.length - 1;
  const isLessonFinished = progress.completedLessonIds.includes(lesson.id);

  function handleCorrectAnswer() {
    setStepSolved((prev) => ({ ...prev, [step.id]: true }));
    setMascotMood('happy');
    onCompleteStep(lesson.id, step.id, currentStepIndex);

    // If step 5 was completed, structure explorer is unlocked
    if (step.id === 'step-5-arrays-and-nested-data') {
      // Notified via hook
    }
  }

  function handleNext() {
    if (isLastStep) {
      setShowCelebration(true);
      setMascotMood('champion');
      onCompleteLesson(lesson.id, lesson.xpReward);
    } else {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setMascotMood('idle');
      onCompleteStep(lesson.id, step.id, nextIdx);
    }
  }

  function handlePrev() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setMascotMood('idle');
    }
  }

  function handleSelectStep(index: number) {
    setCurrentStepIndex(index);
    setMascotMood('idle');
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 py-2">
      {showCelebration && <ConfettiCelebration onComplete={() => setShowCelebration(false)} />}

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
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100/70 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <Award className="size-3.5" aria-hidden="true" />
            +{lesson.xpReward} XP Reward
          </span>
          {isLessonFinished && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Progress Dots */}
      <ProgressDots
        total={lesson.steps.length}
        current={currentStepIndex}
        completedIndices={completedIndices}
        onSelectIndex={handleSelectStep}
        labelPrefix="Step"
      />

      {/* Mascot Guidance */}
      <MascotBubble
        expression={mascotMood}
        message={
          isCurrentStepSolved
            ? step.mascotMessages.success
            : mascotMood === 'thinking' && step.mascotMessages.thinking
              ? step.mascotMessages.thinking
              : step.mascotMessages.intro
        }
        subtitle={step.title}
        size="md"
      />

      {/* Main Step Content: Grid with Concept & Interactive Exercise */}
      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-2">
        {/* Left Column: Lesson Concept & Code Viewer */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Step {currentStepIndex + 1} of {lesson.steps.length}
            </span>
            <h3 className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
              {step.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              {step.subtitle}
            </p>
          </div>

          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {step.explanation}
          </div>

          {/* Code preview block */}
          <div className="mt-2 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>JSON Snippet</span>
              <span>RFC 8259</span>
            </div>
            <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-[#0B1220] p-3.5 font-mono text-xs leading-relaxed text-emerald-400 dark:border-slate-700 dark:bg-[#070D18] sm:text-sm">
              <code>{step.codeSnippet}</code>
            </pre>
          </div>
        </div>

        {/* Right Column: Quiz Activity Widget */}
        <div className="flex flex-col gap-4">
          <QuizWidget
            key={step.id}
            step={step}
            onCorrectAnswer={handleCorrectAnswer}
            onRequestHint={() => setMascotMood('thinking')}
            isCompleted={isCurrentStepSolved}
          />

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 dark:border-slate-800">
            <button
              type="button"
              disabled={currentStepIndex === 0}
              onClick={handlePrev}
              className="btn-secondary text-xs sm:text-sm"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Previous Step
            </button>

            {isLastStep && isCurrentStepSolved ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm"
              >
                <Award className="size-4" aria-hidden="true" />
                Finish Lesson & Claim XP
              </button>
            ) : (
              <button
                type="button"
                disabled={!isCurrentStepSolved}
                onClick={handleNext}
                className="btn-primary text-xs sm:text-sm"
              >
                Next Step
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
