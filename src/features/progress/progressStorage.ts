export const STORAGE_KEY_V2 = 'jotjson-learning-progress:v2';

export type LearningProgressState = {
  version: 2;
  completedLessonIds: string[];
  completedStepIds: Record<string, string[]>;
  currentLessonId: string;
  currentStepIndex: number;
  completedChallengeIds: string[];
  currentChallengeIndex: number;
  hintsUsedByChallenge: Record<string, number>;
  earnedXpEvents: string[];
  totalXp: number;
  unlockedStickerIds: string[];
  lastActiveTimestamp: number;
};

export const INITIAL_LEARNING_PROGRESS: LearningProgressState = {
  version: 2,
  completedLessonIds: [],
  completedStepIds: {},
  currentLessonId: 'lesson-1',
  currentStepIndex: 0,
  completedChallengeIds: [],
  currentChallengeIndex: 0,
  hintsUsedByChallenge: {},
  earnedXpEvents: [],
  totalXp: 0,
  unlockedStickerIds: [],
  lastActiveTimestamp: Date.now(),
};

/**
 * Validate that an unknown value conforms to LearningProgressState.
 * Returns valid state or recovers safely with defaults.
 */
export function validateLearningProgress(data: unknown): LearningProgressState {
  if (!data || typeof data !== 'object') {
    return { ...INITIAL_LEARNING_PROGRESS, lastActiveTimestamp: Date.now() };
  }

  const candidate = data as Partial<LearningProgressState>;

  if (candidate.version !== 2) {
    // Migration or fallback point for future versions
    return { ...INITIAL_LEARNING_PROGRESS, lastActiveTimestamp: Date.now() };
  }

  const completedLessonIds = Array.isArray(candidate.completedLessonIds)
    ? candidate.completedLessonIds.filter((id): id is string => typeof id === 'string')
    : [];

  const completedStepIds: Record<string, string[]> = {};
  if (candidate.completedStepIds && typeof candidate.completedStepIds === 'object') {
    for (const [lessonId, stepIds] of Object.entries(candidate.completedStepIds)) {
      if (Array.isArray(stepIds)) {
        completedStepIds[lessonId] = stepIds.filter((s): s is string => typeof s === 'string');
      }
    }
  }

  const completedChallengeIds = Array.isArray(candidate.completedChallengeIds)
    ? candidate.completedChallengeIds.filter((id): id is string => typeof id === 'string')
    : [];

  const hintsUsedByChallenge: Record<string, number> = {};
  if (candidate.hintsUsedByChallenge && typeof candidate.hintsUsedByChallenge === 'object') {
    for (const [id, count] of Object.entries(candidate.hintsUsedByChallenge)) {
      if (typeof count === 'number' && Number.isFinite(count) && count >= 0) {
        hintsUsedByChallenge[id] = count;
      }
    }
  }

  const earnedXpEvents = Array.isArray(candidate.earnedXpEvents)
    ? candidate.earnedXpEvents.filter((e): e is string => typeof e === 'string')
    : [];

  const unlockedStickerIds = Array.isArray(candidate.unlockedStickerIds)
    ? candidate.unlockedStickerIds.filter((s): s is string => typeof s === 'string')
    : [];

  const totalXp =
    typeof candidate.totalXp === 'number' && Number.isFinite(candidate.totalXp) && candidate.totalXp >= 0
      ? candidate.totalXp
      : 0;

  const currentStepIndex =
    typeof candidate.currentStepIndex === 'number' && candidate.currentStepIndex >= 0
      ? candidate.currentStepIndex
      : 0;

  const currentChallengeIndex =
    typeof candidate.currentChallengeIndex === 'number' && candidate.currentChallengeIndex >= 0
      ? candidate.currentChallengeIndex
      : 0;

  return {
    version: 2,
    completedLessonIds,
    completedStepIds,
    currentLessonId: typeof candidate.currentLessonId === 'string' ? candidate.currentLessonId : 'lesson-1',
    currentStepIndex,
    completedChallengeIds,
    currentChallengeIndex,
    hintsUsedByChallenge,
    earnedXpEvents,
    totalXp,
    unlockedStickerIds,
    lastActiveTimestamp:
      typeof candidate.lastActiveTimestamp === 'number' ? candidate.lastActiveTimestamp : Date.now(),
  };
}

export function loadLearningProgress(): LearningProgressState {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...INITIAL_LEARNING_PROGRESS, lastActiveTimestamp: Date.now() };
    }
    const raw = window.localStorage.getItem(STORAGE_KEY_V2);
    if (!raw) {
      return { ...INITIAL_LEARNING_PROGRESS, lastActiveTimestamp: Date.now() };
    }
    const parsed = JSON.parse(raw);
    return validateLearningProgress(parsed);
  } catch {
    // If parse fails or localStorage is disabled, safely return initial state
    return { ...INITIAL_LEARNING_PROGRESS, lastActiveTimestamp: Date.now() };
  }
}

export function saveLearningProgress(state: LearningProgressState): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function resetLearningProgress(): LearningProgressState {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY_V2);
    }
  } catch {
    // Ignore storage errors on reset
  }
  return { ...INITIAL_LEARNING_PROGRESS, lastActiveTimestamp: Date.now() };
}
