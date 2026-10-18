import { describe, expect, it } from 'vitest';
import { SYNTAX_CHALLENGES } from '../../src/features/challenges/challengeData';
import { evaluateChallenge } from '../../src/features/challenges/challengeEvaluator';

describe('challengeEvaluator', () => {
  const case1 = SYNTAX_CHALLENGES[0]!; // Unquoted string case

  it('rejects empty inputs with an informative message', () => {
    const result = evaluateChallenge('', case1);
    expect(result.status).toBe('invalid-syntax');
    expect(result.message).toMatch(/empty/i);
  });

  it('returns invalid-syntax with line numbers for malformed JSON', () => {
    const result = evaluateChallenge(case1.brokenStarter, case1);
    expect(result.status).toBe('invalid-syntax');
    if (result.status === 'invalid-syntax') {
      expect(result.line).toBeDefined();
      expect(result.message).toBeTruthy();
    }
  });

  it('detects structurally altered JSON even if valid syntax', () => {
    // Valid JSON but completely wrong document structure
    const validWrong = '{"completely": "different"}';
    const result = evaluateChallenge(validWrong, case1);
    expect(result.status).toBe('valid-wrong-structure');
    if (result.status === 'valid-wrong-structure') {
      expect(result.diffCount).toBeGreaterThan(0);
      expect(result.message).toMatch(/valid JSON syntax/i);
    }
  });

  it('accepts exact expected solutions with formatting differences', () => {
    // Exact solution with slightly different whitespace
    const solution = '{\n"id":101,\n"username":"Alex",\n"role":"explorer"\n}';
    const result = evaluateChallenge(solution, case1);
    expect(result.status).toBe('success');
    expect(result.message).toBe(case1.explanationOnSuccess);
  });

  it('evaluates all 5 authored challenge solutions as valid and successful', () => {
    for (const challenge of SYNTAX_CHALLENGES) {
      const evaluation = evaluateChallenge(challenge.expectedCorrect, challenge);
      expect(evaluation.status).toBe('success');
    }
  });
});
