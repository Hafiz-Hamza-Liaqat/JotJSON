import { describe, expect, it } from 'vitest';
import { LESSON_1_JSON_BASICS } from '../../src/features/learning/lessonData';

describe('lessonData', () => {
  it('has valid metadata and 6 structured steps', () => {
    expect(LESSON_1_JSON_BASICS.id).toBe('lesson-1');
    expect(LESSON_1_JSON_BASICS.xpReward).toBe(100);
    expect(LESSON_1_JSON_BASICS.steps).toHaveLength(6);
  });

  it('contains correctly defined interactive options for every step', () => {
    for (const step of LESSON_1_JSON_BASICS.steps) {
      expect(step.id).toBeTruthy();
      expect(step.title).toBeTruthy();
      expect(step.explanation).toBeTruthy();
      expect(step.codeSnippet).toBeTruthy();
      expect(step.hint).toBeTruthy();
      expect(step.options && step.options.length).toBeGreaterThanOrEqual(2);

      // Must have exactly one correct option
      const correctOptions = step.options?.filter((o) => o.isCorrect);
      expect(correctOptions).toHaveLength(1);
    }
  });

  it('strictly validates educational accuracy of key JSON concepts', () => {
    const step3 = LESSON_1_JSON_BASICS.steps.find((s) => s.id === 'step-3-strings-and-numbers')!;
    const correctStep3 = step3.options?.find((o) => o.isCorrect);
    expect(correctStep3?.label).toMatch(/"25" is a STRING.*25 is a NUMBER/i);

    const step4 = LESSON_1_JSON_BASICS.steps.find((s) => s.id === 'step-4-booleans-and-null')!;
    const correctStep4 = step4.options?.find((o) => o.isCorrect);
    expect(correctStep4?.label).toBe('true');

    const step6 = LESSON_1_JSON_BASICS.steps.find((s) => s.id === 'step-6-strict-syntax-rules')!;
    const correctStep6 = step6.options?.find((o) => o.isCorrect);
    expect(correctStep6?.label).toBe('{ "name": "Byte", "active": true }');
  });
});
