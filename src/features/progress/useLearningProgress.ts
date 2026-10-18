import { useCallback, useEffect, useState } from 'react';
import type { StickerId } from '../achievements/stickerTypes';
import {
  loadLearningProgress,
  resetLearningProgress,
  saveLearningProgress,
  type LearningProgressState,
} from './progressStorage';

export function useLearningProgress() {
  const [progress, setProgress] = useState<LearningProgressState>(() => loadLearningProgress());
  const [newlyUnlockedSticker, setNewlyUnlockedSticker] = useState<StickerId | null>(null);
  const [floatingXp, setFloatingXp] = useState<{ amount: number; key: number } | null>(null);

  // Sync to localStorage whenever progress updates
  useEffect(() => {
    saveLearningProgress(progress);
  }, [progress]);

  const awardXp = useCallback((eventId: string, amount: number): boolean => {
    let awarded = false;
    setProgress((prev) => {
      if (prev.earnedXpEvents.includes(eventId)) {
        return prev;
      }
      awarded = true;
      return {
        ...prev,
        earnedXpEvents: [...prev.earnedXpEvents, eventId],
        totalXp: prev.totalXp + amount,
        lastActiveTimestamp: Date.now(),
      };
    });
    if (awarded) {
      setFloatingXp({ amount, key: Date.now() });
    }
    return awarded;
  }, []);

  const unlockSticker = useCallback((stickerId: StickerId): boolean => {
    let unlocked = false;
    setProgress((prev) => {
      if (prev.unlockedStickerIds.includes(stickerId)) {
        return prev;
      }
      unlocked = true;
      return {
        ...prev,
        unlockedStickerIds: [...prev.unlockedStickerIds, stickerId],
        lastActiveTimestamp: Date.now(),
      };
    });
    if (unlocked) {
      setNewlyUnlockedSticker(stickerId);
    }
    return unlocked;
  }, []);

  const completeStep = useCallback(
    (lessonId: string, stepId: string, nextIndex?: number) => {
      setProgress((prev) => {
        const existingSteps = prev.completedStepIds[lessonId] ?? [];
        const updatedSteps = existingSteps.includes(stepId) ? existingSteps : [...existingSteps, stepId];
        return {
          ...prev,
          completedStepIds: {
            ...prev.completedStepIds,
            [lessonId]: updatedSteps,
          },
          currentLessonId: lessonId,
          currentStepIndex: typeof nextIndex === 'number' ? nextIndex : prev.currentStepIndex,
          lastActiveTimestamp: Date.now(),
        };
      });
    },
    [],
  );

  const completeLesson = useCallback(
    (lessonId: string, xpReward: number) => {
      let isFirstTime = false;
      setProgress((prev) => {
        if (!prev.completedLessonIds.includes(lessonId)) {
          isFirstTime = true;
          return {
            ...prev,
            completedLessonIds: [...prev.completedLessonIds, lessonId],
            earnedXpEvents: [...prev.earnedXpEvents, `lesson-${lessonId}`],
            totalXp: prev.totalXp + xpReward,
            lastActiveTimestamp: Date.now(),
          };
        }
        return prev;
      });

      if (isFirstTime) {
        setFloatingXp({ amount: xpReward, key: Date.now() });
      }

      // Check sticker criteria:
      unlockSticker('json-beginner');
      // If all challenges are also completed, unlock champion
      setProgress((current) => {
        if (current.completedChallengeIds.length >= 5) {
          unlockSticker('json-champion');
        }
        return current;
      });
    },
    [unlockSticker],
  );

  const recordHintUsed = useCallback((challengeId: string) => {
    setProgress((prev) => ({
      ...prev,
      hintsUsedByChallenge: {
        ...prev.hintsUsedByChallenge,
        [challengeId]: (prev.hintsUsedByChallenge[challengeId] ?? 0) + 1,
      },
      lastActiveTimestamp: Date.now(),
    }));
  }, []);

  const completeChallenge = useCallback(
    (challengeId: string, xpReward: number, nextIndex?: number) => {
      let isFirstTime = false;
      let usedHints = 0;
      setProgress((prev) => {
        usedHints = prev.hintsUsedByChallenge[challengeId] ?? 0;
        const alreadyDone = prev.completedChallengeIds.includes(challengeId);
        const updatedCompleted = alreadyDone
          ? prev.completedChallengeIds
          : [...prev.completedChallengeIds, challengeId];

        const eventId = `challenge-${challengeId}`;
        const alreadyAwarded = prev.earnedXpEvents.includes(eventId);
        isFirstTime = !alreadyAwarded;

        return {
          ...prev,
          completedChallengeIds: updatedCompleted,
          currentChallengeIndex: typeof nextIndex === 'number' ? nextIndex : prev.currentChallengeIndex,
          earnedXpEvents: alreadyAwarded ? prev.earnedXpEvents : [...prev.earnedXpEvents, eventId],
          totalXp: alreadyAwarded ? prev.totalXp : prev.totalXp + xpReward,
          lastActiveTimestamp: Date.now(),
        };
      });

      if (isFirstTime) {
        setFloatingXp({ amount: xpReward, key: Date.now() });
      }

      // If completed without hint, unlock "perfect-syntax"
      if (usedHints === 0) {
        unlockSticker('perfect-syntax');
      }

      // If all 5 challenges are completed, unlock "bug-hunter"
      setProgress((current) => {
        if (current.completedChallengeIds.length >= 5) {
          unlockSticker('bug-hunter');
          // If lesson 1 is also completed, unlock "json-champion"
          if (current.completedLessonIds.includes('lesson-1')) {
            unlockSticker('json-champion');
          }
        }
        return current;
      });
    },
    [unlockSticker],
  );

  const setCurrentStep = useCallback((lessonId: string, index: number) => {
    setProgress((prev) => ({
      ...prev,
      currentLessonId: lessonId,
      currentStepIndex: index,
      lastActiveTimestamp: Date.now(),
    }));
  }, []);

  const setCurrentChallenge = useCallback((index: number) => {
    setProgress((prev) => ({
      ...prev,
      currentChallengeIndex: index,
      lastActiveTimestamp: Date.now(),
    }));
  }, []);

  const resetAllProgress = useCallback(() => {
    const fresh = resetLearningProgress();
    setProgress(fresh);
    setNewlyUnlockedSticker(null);
    setFloatingXp(null);
  }, []);

  const dismissStickerModal = useCallback(() => {
    setNewlyUnlockedSticker(null);
  }, []);

  const dismissFloatingXp = useCallback(() => {
    setFloatingXp(null);
  }, []);

  return {
    progress,
    awardXp,
    unlockSticker,
    completeStep,
    completeLesson,
    recordHintUsed,
    completeChallenge,
    setCurrentStep,
    setCurrentChallenge,
    resetAllProgress,
    newlyUnlockedSticker,
    dismissStickerModal,
    floatingXp,
    dismissFloatingXp,
  };
}
