import { describe, expect, it } from 'vitest';
import { INITIAL_LEARNING_PROGRESS } from '../../src/features/progress/progressStorage';
import {
  learningProgressReducer,
  type LearningHookState,
} from '../../src/features/progress/useLearningProgress';

function createInitialState(): LearningHookState {
  return {
    progress: { ...INITIAL_LEARNING_PROGRESS },
    newlyUnlockedSticker: null,
    stickerQueue: [],
    floatingXp: null,
  };
}

describe('learningProgressReducer', () => {
  it('does not unlock Bug Hunter when only the first detective case is completed', () => {
    let state = createInitialState();

    state = learningProgressReducer(state, {
      type: 'COMPLETE_CHALLENGE',
      challengeId: 'case-1-missing-quote',
      xpReward: 25,
      timestamp: 1000,
    });

    expect(state.progress.completedChallengeIds).toEqual(['case-1-missing-quote']);
    expect(state.progress.unlockedStickerIds).not.toContain('bug-hunter');
    expect(state.progress.totalXp).toBe(25);
    expect(state.floatingXp).toEqual({ amount: 25, key: 1000 });
  });

  it('unlocks Perfect Syntax when a case is solved without any hints', () => {
    let state = createInitialState();

    state = learningProgressReducer(state, {
      type: 'COMPLETE_CHALLENGE',
      challengeId: 'case-1-missing-quote',
      xpReward: 25,
      timestamp: 1000,
    });

    expect(state.progress.unlockedStickerIds).toContain('perfect-syntax');
    expect(state.newlyUnlockedSticker).toBe('perfect-syntax');
  });

  it('does not unlock Perfect Syntax if hints were used on that case', () => {
    let state = createInitialState();

    state = learningProgressReducer(state, {
      type: 'RECORD_HINT_USED',
      challengeId: 'case-1-missing-quote',
      timestamp: 500,
    });

    state = learningProgressReducer(state, {
      type: 'COMPLETE_CHALLENGE',
      challengeId: 'case-1-missing-quote',
      xpReward: 25,
      timestamp: 1000,
    });

    expect(state.progress.unlockedStickerIds).not.toContain('perfect-syntax');
  });

  it('unlocks Bug Hunter when all 5 detective cases are completed', () => {
    let state = createInitialState();
    const cases = [
      'case-1-missing-quote',
      'case-2-trailing-comma',
      'case-3-missing-comma',
      'case-4-mismatched-brackets',
      'case-5-single-quotes',
    ];

    for (let i = 0; i < 4; i++) {
      state = learningProgressReducer(state, {
        type: 'COMPLETE_CHALLENGE',
        challengeId: cases[i]!,
        xpReward: 25,
        timestamp: 1000 + i,
      });
      expect(state.progress.unlockedStickerIds).not.toContain('bug-hunter');
    }

    // Complete the 5th case
    state = learningProgressReducer(state, {
      type: 'COMPLETE_CHALLENGE',
      challengeId: cases[4]!,
      xpReward: 25,
      timestamp: 1005,
    });

    expect(state.progress.completedChallengeIds.length).toBe(5);
    expect(state.progress.unlockedStickerIds).toContain('bug-hunter');
  });

  it('unlocks JSON Champion only after both Lesson 1 and all 5 detective cases are complete (Lesson first, then Challenges)', () => {
    let state = createInitialState();

    // 1. Complete Lesson 1
    state = learningProgressReducer(state, {
      type: 'COMPLETE_LESSON',
      lessonId: 'lesson-1',
      xpReward: 100,
      timestamp: 1000,
    });

    expect(state.progress.unlockedStickerIds).toContain('json-beginner');
    expect(state.progress.unlockedStickerIds).not.toContain('json-champion');

    // 2. Complete 5 challenges
    const cases = [
      'case-1-missing-quote',
      'case-2-trailing-comma',
      'case-3-missing-comma',
      'case-4-mismatched-brackets',
      'case-5-single-quotes',
    ];

    for (let i = 0; i < cases.length; i++) {
      state = learningProgressReducer(state, {
        type: 'COMPLETE_CHALLENGE',
        challengeId: cases[i]!,
        xpReward: 25,
        timestamp: 2000 + i,
      });
    }

    expect(state.progress.unlockedStickerIds).toContain('bug-hunter');
    expect(state.progress.unlockedStickerIds).toContain('json-champion');
  });

  it('unlocks JSON Champion only after both Lesson 1 and all 5 detective cases are complete (Challenges first, then Lesson)', () => {
    let state = createInitialState();

    // 1. Complete 5 challenges first
    const cases = [
      'case-1-missing-quote',
      'case-2-trailing-comma',
      'case-3-missing-comma',
      'case-4-mismatched-brackets',
      'case-5-single-quotes',
    ];

    for (let i = 0; i < cases.length; i++) {
      state = learningProgressReducer(state, {
        type: 'COMPLETE_CHALLENGE',
        challengeId: cases[i]!,
        xpReward: 25,
        timestamp: 1000 + i,
      });
    }

    expect(state.progress.unlockedStickerIds).toContain('bug-hunter');
    expect(state.progress.unlockedStickerIds).not.toContain('json-champion');

    // 2. Complete Lesson 1
    state = learningProgressReducer(state, {
      type: 'COMPLETE_LESSON',
      lessonId: 'lesson-1',
      xpReward: 100,
      timestamp: 2000,
    });

    expect(state.progress.unlockedStickerIds).toContain('json-beginner');
    expect(state.progress.unlockedStickerIds).toContain('json-champion');
  });

  it('does not duplicate XP or re-trigger first-time achievements on replay', () => {
    let state = createInitialState();

    // Complete case 1 first time
    state = learningProgressReducer(state, {
      type: 'COMPLETE_CHALLENGE',
      challengeId: 'case-1-missing-quote',
      xpReward: 25,
      timestamp: 1000,
    });

    expect(state.progress.totalXp).toBe(25);
    expect(state.floatingXp).toEqual({ amount: 25, key: 1000 });

    // Dismiss floating XP and modal
    state = learningProgressReducer(state, { type: 'DISMISS_FLOATING_XP' });
    state = learningProgressReducer(state, { type: 'DISMISS_STICKER_MODAL' });
    expect(state.floatingXp).toBeNull();
    expect(state.newlyUnlockedSticker).toBeNull();

    // Replay case 1
    state = learningProgressReducer(state, {
      type: 'COMPLETE_CHALLENGE',
      challengeId: 'case-1-missing-quote',
      xpReward: 25,
      timestamp: 2000,
    });

    // Total XP must still be 25, floating XP must NOT be set, and newlyUnlockedSticker must NOT be re-triggered
    expect(state.progress.totalXp).toBe(25);
    expect(state.floatingXp).toBeNull();
    expect(state.newlyUnlockedSticker).toBeNull();
  });

  it('unlocks Structure Explorer on Step 5 of Lesson 1', () => {
    let state = createInitialState();

    state = learningProgressReducer(state, {
      type: 'COMPLETE_STEP',
      lessonId: 'lesson-1',
      stepId: 'step-5-arrays-and-nested-data',
      nextIndex: 5,
      timestamp: 1000,
    });

    expect(state.progress.unlockedStickerIds).toContain('structure-explorer');
    expect(state.newlyUnlockedSticker).toBe('structure-explorer');
  });

  it('manages modal dismissal and queue sequentially', () => {
    let state = createInitialState();

    // Trigger two stickers at once
    state = learningProgressReducer(state, {
      type: 'UNLOCK_STICKER',
      stickerId: 'json-beginner',
      timestamp: 1000,
    });
    state = learningProgressReducer(state, {
      type: 'UNLOCK_STICKER',
      stickerId: 'bug-hunter',
      timestamp: 1001,
    });

    expect(state.newlyUnlockedSticker).toBe('json-beginner');
    expect(state.stickerQueue).toEqual(['bug-hunter']);

    // Dismiss first modal
    state = learningProgressReducer(state, { type: 'DISMISS_STICKER_MODAL' });
    expect(state.newlyUnlockedSticker).toBe('bug-hunter');
    expect(state.stickerQueue).toEqual([]);

    // Dismiss second modal
    state = learningProgressReducer(state, { type: 'DISMISS_STICKER_MODAL' });
    expect(state.newlyUnlockedSticker).toBeNull();
  });
});
