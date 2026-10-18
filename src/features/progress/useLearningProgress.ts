import { useCallback, useEffect, useReducer } from 'react';
import type { StickerId } from '../achievements/stickerTypes';
import {
  loadLearningProgress,
  resetLearningProgress,
  saveLearningProgress,
  type LearningProgressState,
} from './progressStorage';

export type LearningHookState = {
  progress: LearningProgressState;
  newlyUnlockedSticker: StickerId | null;
  stickerQueue: StickerId[];
  floatingXp: { amount: number; key: number } | null;
};

export type LearningAction =
  | { type: 'AWARD_XP'; eventId: string; amount: number; timestamp: number }
  | { type: 'UNLOCK_STICKER'; stickerId: StickerId; timestamp: number }
  | { type: 'COMPLETE_STEP'; lessonId: string; stepId: string; nextIndex?: number; timestamp: number }
  | { type: 'COMPLETE_LESSON'; lessonId: string; xpReward: number; timestamp: number }
  | { type: 'RECORD_HINT_USED'; challengeId: string; timestamp: number }
  | { type: 'COMPLETE_CHALLENGE'; challengeId: string; xpReward: number; nextIndex?: number; timestamp: number }
  | { type: 'SET_CURRENT_STEP'; lessonId: string; index: number; timestamp: number }
  | { type: 'SET_CURRENT_CHALLENGE'; index: number; timestamp: number }
  | { type: 'RESET_ALL_PROGRESS'; fresh: LearningProgressState }
  | { type: 'DISMISS_STICKER_MODAL' }
  | { type: 'DISMISS_FLOATING_XP' };

function unlockStickersHelper(
  currentUnlocked: string[],
  currentNewlyUnlocked: StickerId | null,
  currentQueue: StickerId[],
  toUnlock: StickerId[],
): {
  unlockedStickerIds: string[];
  newlyUnlockedSticker: StickerId | null;
  stickerQueue: StickerId[];
} {
  const newUnlockedSet = new Set(currentUnlocked);
  const newlyAdded: StickerId[] = [];

  for (const id of toUnlock) {
    if (!newUnlockedSet.has(id)) {
      newUnlockedSet.add(id);
      newlyAdded.push(id);
    }
  }

  if (newlyAdded.length === 0) {
    return {
      unlockedStickerIds: currentUnlocked,
      newlyUnlockedSticker: currentNewlyUnlocked,
      stickerQueue: currentQueue,
    };
  }

  const updatedUnlockedList = Array.from(newUnlockedSet);
  let nextNewlyUnlocked = currentNewlyUnlocked;
  const nextQueue = [...currentQueue];

  for (const id of newlyAdded) {
    if (nextNewlyUnlocked === null) {
      nextNewlyUnlocked = id;
    } else {
      nextQueue.push(id);
    }
  }

  return {
    unlockedStickerIds: updatedUnlockedList,
    newlyUnlockedSticker: nextNewlyUnlocked,
    stickerQueue: nextQueue,
  };
}

export function learningProgressReducer(
  state: LearningHookState,
  action: LearningAction,
): LearningHookState {
  switch (action.type) {
    case 'AWARD_XP': {
      if (state.progress.earnedXpEvents.includes(action.eventId)) {
        return state;
      }
      return {
        ...state,
        progress: {
          ...state.progress,
          earnedXpEvents: [...state.progress.earnedXpEvents, action.eventId],
          totalXp: state.progress.totalXp + action.amount,
          lastActiveTimestamp: action.timestamp,
        },
        floatingXp: { amount: action.amount, key: action.timestamp },
      };
    }

    case 'UNLOCK_STICKER': {
      const stickers = unlockStickersHelper(
        state.progress.unlockedStickerIds,
        state.newlyUnlockedSticker,
        state.stickerQueue,
        [action.stickerId],
      );
      if (stickers.unlockedStickerIds === state.progress.unlockedStickerIds) {
        return state;
      }
      return {
        ...state,
        progress: {
          ...state.progress,
          unlockedStickerIds: stickers.unlockedStickerIds,
          lastActiveTimestamp: action.timestamp,
        },
        newlyUnlockedSticker: stickers.newlyUnlockedSticker,
        stickerQueue: stickers.stickerQueue,
      };
    }

    case 'COMPLETE_STEP': {
      const existingSteps = state.progress.completedStepIds[action.lessonId] ?? [];
      const updatedSteps = existingSteps.includes(action.stepId)
        ? existingSteps
        : [...existingSteps, action.stepId];

      const toUnlock: StickerId[] = [];
      if (action.stepId === 'step-5-arrays-and-nested-data') {
        toUnlock.push('structure-explorer');
      }

      const stickers = unlockStickersHelper(
        state.progress.unlockedStickerIds,
        state.newlyUnlockedSticker,
        state.stickerQueue,
        toUnlock,
      );

      return {
        ...state,
        progress: {
          ...state.progress,
          completedStepIds: {
            ...state.progress.completedStepIds,
            [action.lessonId]: updatedSteps,
          },
          currentLessonId: action.lessonId,
          currentStepIndex:
            typeof action.nextIndex === 'number'
              ? action.nextIndex
              : state.progress.currentStepIndex,
          unlockedStickerIds: stickers.unlockedStickerIds,
          lastActiveTimestamp: action.timestamp,
        },
        newlyUnlockedSticker: stickers.newlyUnlockedSticker,
        stickerQueue: stickers.stickerQueue,
      };
    }

    case 'COMPLETE_LESSON': {
      const isAlreadyCompleted = state.progress.completedLessonIds.includes(action.lessonId);
      const updatedLessonIds = isAlreadyCompleted
        ? state.progress.completedLessonIds
        : [...state.progress.completedLessonIds, action.lessonId];

      const eventId = `lesson-${action.lessonId}`;
      const isAlreadyAwarded = state.progress.earnedXpEvents.includes(eventId);
      const isFirstTimeXp = !isAlreadyAwarded;

      const updatedEarnedEvents = isAlreadyAwarded
        ? state.progress.earnedXpEvents
        : [...state.progress.earnedXpEvents, eventId];
      const updatedTotalXp = isAlreadyAwarded
        ? state.progress.totalXp
        : state.progress.totalXp + action.xpReward;

      const toUnlock: StickerId[] = [];
      if (action.lessonId === 'lesson-1') {
        toUnlock.push('json-beginner');
      }
      if (state.progress.completedChallengeIds.length >= 5) {
        toUnlock.push('json-champion');
      }

      const stickers = unlockStickersHelper(
        state.progress.unlockedStickerIds,
        state.newlyUnlockedSticker,
        state.stickerQueue,
        toUnlock,
      );

      return {
        ...state,
        progress: {
          ...state.progress,
          completedLessonIds: updatedLessonIds,
          earnedXpEvents: updatedEarnedEvents,
          totalXp: updatedTotalXp,
          unlockedStickerIds: stickers.unlockedStickerIds,
          lastActiveTimestamp: action.timestamp,
        },
        newlyUnlockedSticker: stickers.newlyUnlockedSticker,
        stickerQueue: stickers.stickerQueue,
        floatingXp: isFirstTimeXp ? { amount: action.xpReward, key: action.timestamp } : state.floatingXp,
      };
    }

    case 'RECORD_HINT_USED': {
      return {
        ...state,
        progress: {
          ...state.progress,
          hintsUsedByChallenge: {
            ...state.progress.hintsUsedByChallenge,
            [action.challengeId]: (state.progress.hintsUsedByChallenge[action.challengeId] ?? 0) + 1,
          },
          lastActiveTimestamp: action.timestamp,
        },
      };
    }

    case 'COMPLETE_CHALLENGE': {
      const isAlreadyCompleted = state.progress.completedChallengeIds.includes(action.challengeId);
      const updatedChallengeIds = isAlreadyCompleted
        ? state.progress.completedChallengeIds
        : [...state.progress.completedChallengeIds, action.challengeId];

      const eventId = `challenge-${action.challengeId}`;
      const isAlreadyAwarded = state.progress.earnedXpEvents.includes(eventId);
      const isFirstTimeXp = !isAlreadyAwarded;

      const updatedEarnedEvents = isAlreadyAwarded
        ? state.progress.earnedXpEvents
        : [...state.progress.earnedXpEvents, eventId];
      const updatedTotalXp = isAlreadyAwarded
        ? state.progress.totalXp
        : state.progress.totalXp + action.xpReward;

      const usedHints = state.progress.hintsUsedByChallenge[action.challengeId] ?? 0;

      const toUnlock: StickerId[] = [];
      if (usedHints === 0) {
        toUnlock.push('perfect-syntax');
      }
      if (updatedChallengeIds.length >= 5) {
        toUnlock.push('bug-hunter');
        if (state.progress.completedLessonIds.includes('lesson-1')) {
          toUnlock.push('json-champion');
        }
      }

      const stickers = unlockStickersHelper(
        state.progress.unlockedStickerIds,
        state.newlyUnlockedSticker,
        state.stickerQueue,
        toUnlock,
      );

      return {
        ...state,
        progress: {
          ...state.progress,
          completedChallengeIds: updatedChallengeIds,
          currentChallengeIndex:
            typeof action.nextIndex === 'number'
              ? action.nextIndex
              : state.progress.currentChallengeIndex,
          earnedXpEvents: updatedEarnedEvents,
          totalXp: updatedTotalXp,
          unlockedStickerIds: stickers.unlockedStickerIds,
          lastActiveTimestamp: action.timestamp,
        },
        newlyUnlockedSticker: stickers.newlyUnlockedSticker,
        stickerQueue: stickers.stickerQueue,
        floatingXp: isFirstTimeXp ? { amount: action.xpReward, key: action.timestamp } : state.floatingXp,
      };
    }

    case 'SET_CURRENT_STEP': {
      return {
        ...state,
        progress: {
          ...state.progress,
          currentLessonId: action.lessonId,
          currentStepIndex: action.index,
          lastActiveTimestamp: action.timestamp,
        },
      };
    }

    case 'SET_CURRENT_CHALLENGE': {
      return {
        ...state,
        progress: {
          ...state.progress,
          currentChallengeIndex: action.index,
          lastActiveTimestamp: action.timestamp,
        },
      };
    }

    case 'RESET_ALL_PROGRESS': {
      return {
        progress: action.fresh,
        newlyUnlockedSticker: null,
        stickerQueue: [],
        floatingXp: null,
      };
    }

    case 'DISMISS_STICKER_MODAL': {
      if (state.stickerQueue.length > 0) {
        const [next, ...rest] = state.stickerQueue;
        return {
          ...state,
          newlyUnlockedSticker: next ?? null,
          stickerQueue: rest,
        };
      }
      return {
        ...state,
        newlyUnlockedSticker: null,
        stickerQueue: [],
      };
    }

    case 'DISMISS_FLOATING_XP': {
      return {
        ...state,
        floatingXp: null,
      };
    }

    default:
      return state;
  }
}

export function useLearningProgress() {
  const [state, dispatch] = useReducer(
    learningProgressReducer,
    null,
    (): LearningHookState => ({
      progress: loadLearningProgress(),
      newlyUnlockedSticker: null,
      stickerQueue: [],
      floatingXp: null,
    }),
  );

  // Sync to localStorage whenever progress updates
  useEffect(() => {
    saveLearningProgress(state.progress);
  }, [state.progress]);

  const awardXp = useCallback(
    (eventId: string, amount: number): boolean => {
      const canAward = !state.progress.earnedXpEvents.includes(eventId);
      if (canAward) {
        dispatch({ type: 'AWARD_XP', eventId, amount, timestamp: Date.now() });
      }
      return canAward;
    },
    [state.progress.earnedXpEvents],
  );

  const unlockSticker = useCallback(
    (stickerId: StickerId): boolean => {
      const canUnlock = !state.progress.unlockedStickerIds.includes(stickerId);
      if (canUnlock) {
        dispatch({ type: 'UNLOCK_STICKER', stickerId, timestamp: Date.now() });
      }
      return canUnlock;
    },
    [state.progress.unlockedStickerIds],
  );

  const completeStep = useCallback((lessonId: string, stepId: string, nextIndex?: number) => {
    dispatch({
      type: 'COMPLETE_STEP',
      lessonId,
      stepId,
      nextIndex,
      timestamp: Date.now(),
    });
  }, []);

  const completeLesson = useCallback((lessonId: string, xpReward: number) => {
    dispatch({
      type: 'COMPLETE_LESSON',
      lessonId,
      xpReward,
      timestamp: Date.now(),
    });
  }, []);

  const recordHintUsed = useCallback((challengeId: string) => {
    dispatch({
      type: 'RECORD_HINT_USED',
      challengeId,
      timestamp: Date.now(),
    });
  }, []);

  const completeChallenge = useCallback(
    (challengeId: string, xpReward: number, nextIndex?: number) => {
      dispatch({
        type: 'COMPLETE_CHALLENGE',
        challengeId,
        xpReward,
        nextIndex,
        timestamp: Date.now(),
      });
    },
    [],
  );

  const setCurrentStep = useCallback((lessonId: string, index: number) => {
    dispatch({
      type: 'SET_CURRENT_STEP',
      lessonId,
      index,
      timestamp: Date.now(),
    });
  }, []);

  const setCurrentChallenge = useCallback((index: number) => {
    dispatch({
      type: 'SET_CURRENT_CHALLENGE',
      index,
      timestamp: Date.now(),
    });
  }, []);

  const resetAllProgress = useCallback(() => {
    const fresh = resetLearningProgress();
    dispatch({ type: 'RESET_ALL_PROGRESS', fresh });
  }, []);

  const dismissStickerModal = useCallback(() => {
    dispatch({ type: 'DISMISS_STICKER_MODAL' });
  }, []);

  const dismissFloatingXp = useCallback(() => {
    dispatch({ type: 'DISMISS_FLOATING_XP' });
  }, []);

  return {
    progress: state.progress,
    awardXp,
    unlockSticker,
    completeStep,
    completeLesson,
    recordHintUsed,
    completeChallenge,
    setCurrentStep,
    setCurrentChallenge,
    resetAllProgress,
    newlyUnlockedSticker: state.newlyUnlockedSticker,
    dismissStickerModal,
    floatingXp: state.floatingXp,
    dismissFloatingXp,
  };
}
