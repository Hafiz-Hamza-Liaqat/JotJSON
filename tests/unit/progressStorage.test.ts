import { describe, expect, it } from 'vitest';
import {
  INITIAL_LEARNING_PROGRESS,
  validateLearningProgress,
} from '../../src/features/progress/progressStorage';

describe('progressStorage', () => {
  it('returns default initial state for null or non-object inputs', () => {
    const fromNull = validateLearningProgress(null);
    expect(fromNull.version).toBe(2);
    expect(fromNull.completedLessonIds).toEqual([]);
    expect(fromNull.totalXp).toBe(0);

    const fromString = validateLearningProgress('malformed string');
    expect(fromString.version).toBe(2);
    expect(fromString.totalXp).toBe(0);
  });

  it('resets to initial state if version is missing or outdated', () => {
    const outdated = validateLearningProgress({ version: 1, totalXp: 500 });
    expect(outdated.version).toBe(2);
    expect(outdated.totalXp).toBe(0);
  });

  it('safely validates and cleans partial or corrupted fields', () => {
    const corrupted = {
      version: 2,
      completedLessonIds: ['lesson-1', 123, null],
      completedStepIds: {
        'lesson-1': ['step-1', null, 456],
      },
      completedChallengeIds: ['case-1', false],
      hintsUsedByChallenge: {
        'case-1': 2,
        'case-2': -5,
        'case-3': 'invalid',
      },
      earnedXpEvents: ['lesson-lesson-1', 999],
      totalXp: -50, // invalid negative XP
      unlockedStickerIds: ['json-beginner'],
    };

    const validated = validateLearningProgress(corrupted);
    expect(validated.completedLessonIds).toEqual(['lesson-1']);
    expect(validated.completedStepIds['lesson-1']).toEqual(['step-1']);
    expect(validated.completedChallengeIds).toEqual(['case-1']);
    expect(validated.hintsUsedByChallenge).toEqual({ 'case-1': 2 });
    expect(validated.earnedXpEvents).toEqual(['lesson-lesson-1']);
    expect(validated.totalXp).toBe(0); // reset negative XP to 0
    expect(validated.unlockedStickerIds).toEqual(['json-beginner']);
  });

  it('preserves valid progress state', () => {
    const valid = {
      ...INITIAL_LEARNING_PROGRESS,
      completedLessonIds: ['lesson-1'],
      totalXp: 125,
      unlockedStickerIds: ['json-beginner', 'perfect-syntax'],
    };

    const validated = validateLearningProgress(valid);
    expect(validated.completedLessonIds).toEqual(['lesson-1']);
    expect(validated.totalXp).toBe(125);
    expect(validated.unlockedStickerIds).toEqual(['json-beginner', 'perfect-syntax']);
  });

  it('never contains raw JSON or sensitive user document fields', () => {
    const state = validateLearningProgress(INITIAL_LEARNING_PROGRESS);
    const keys = Object.keys(state);
    expect(keys).not.toContain('rawJson');
    expect(keys).not.toContain('document');
    expect(keys).not.toContain('editorContent');
    expect(keys).not.toContain('input');
  });
});
