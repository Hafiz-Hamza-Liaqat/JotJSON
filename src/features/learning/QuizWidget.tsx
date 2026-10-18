import { CheckCircle2, HelpCircle, Lightbulb, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { ActivityOption, LessonStep } from './learningTypes';

type QuizWidgetProps = {
  step: LessonStep;
  onCorrectAnswer: () => void;
  onRequestHint?: () => void;
  isCompleted?: boolean;
};

export function QuizWidget({
  step,
  onCorrectAnswer,
  onRequestHint,
  isCompleted = false,
}: QuizWidgetProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'incorrect' | null;
    message: string;
  }>({
    status: isCompleted ? 'correct' : null,
    message: isCompleted ? step.successMessage : '',
  });

  const options: ActivityOption[] = step.options ?? [];

  function handleSelect(option: ActivityOption) {
    setSelectedOptionId(option.id);
    if (option.isCorrect) {
      setFeedback({ status: 'correct', message: option.explanation });
      onCorrectAnswer();
    } else {
      setFeedback({
        status: 'incorrect',
        message: `${option.explanation} Try again! Check the hint below if you get stuck.`,
      });
    }
  }

  function handleToggleHint() {
    setShowHint((prev) => !prev);
    onRequestHint?.();
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          <HelpCircle className="size-4" aria-hidden="true" />
          Interactive Exercise
        </h4>
        <button
          type="button"
          onClick={handleToggleHint}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100/60 dark:text-amber-300 dark:hover:bg-amber-950/40"
          aria-expanded={showHint}
        >
          <Lightbulb className="size-3.5" aria-hidden="true" />
          {showHint ? 'Hide Hint' : 'Need a Hint?'}
        </button>
      </div>

      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 sm:text-base">
        {step.prompt}
      </p>

      {/* Hint Banner */}
      {showHint && (
        <div
          role="region"
          aria-label="Hint"
          className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200"
        >
          💡 <strong>Byte’s Hint:</strong> {step.hint}
        </div>
      )}

      {/* Activity Options */}
      <div role="radiogroup" aria-label={step.prompt} className="flex flex-col gap-2.5">
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrectChoice = isSelected && option.isCorrect;
          const isWrongChoice = isSelected && !option.isCorrect;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(option)}
              className={`flex items-start gap-3 rounded-lg border p-3 text-left text-sm font-medium transition-all ${
                isCorrectChoice || (isCompleted && option.isCorrect)
                  ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 dark:border-emerald-500/60 dark:bg-emerald-950/30 dark:text-emerald-200'
                  : isWrongChoice
                    ? 'border-rose-400 bg-rose-50/80 text-rose-950 dark:border-rose-500/50 dark:bg-rose-950/30 dark:text-rose-200'
                    : isSelected
                      ? 'border-blue-500 bg-blue-50/60 text-blue-950 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-200'
                      : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70 dark:border-slate-700/70 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {isCorrectChoice || (isCompleted && option.isCorrect) ? (
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                ) : isWrongChoice ? (
                  <XCircle className="size-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                ) : (
                  <span className="inline-block size-4 rounded-full border border-slate-400 dark:border-slate-500" />
                )}
              </span>
              <span className="flex-1 leading-snug">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Immediate Feedback Banner */}
      {feedback.status && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start gap-2.5 rounded-lg border p-3 text-xs leading-relaxed sm:text-sm ${
            feedback.status === 'correct'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
          }`}
        >
          <span className="shrink-0 text-base">
            {feedback.status === 'correct' ? '🎉' : '🤔'}
          </span>
          <div className="flex-1 font-medium">{feedback.message}</div>
        </div>
      )}
    </div>
  );
}
