import { compareJson } from '../../lib/json/compareJson';
import { errorLineNumber, validateJson } from '../../lib/json/validateJson';
import type { ChallengeRound, EvaluationResult } from './challengeTypes';

export function evaluateChallenge(
  submittedCode: string,
  challenge: ChallengeRound,
): EvaluationResult {
  const trimmed = submittedCode.trim();
  if (trimmed.length === 0) {
    return {
      status: 'invalid-syntax',
      message: 'The editor is empty. Enter or restore the JSON snippet to evaluate.',
    };
  }

  // Step 1: Strict JSON syntax validation
  const validation = validateJson(submittedCode);
  if (!validation.ok) {
    const line = errorLineNumber(validation.error);
    return {
      status: 'invalid-syntax',
      line: typeof line === 'number' && line > 0 ? line : undefined,
      message: validation.error.message,
    };
  }

  // Step 2: Structural comparison against expected corrected document
  const comparison = compareJson(submittedCode, challenge.expectedCorrect);
  if (!comparison.ok) {
    return {
      status: 'invalid-syntax',
      message: comparison.error.message,
    };
  }

  if (comparison.counts.total === 0) {
    return {
      status: 'success',
      message: challenge.explanationOnSuccess,
    };
  }

  return {
    status: 'valid-wrong-structure',
    diffCount: comparison.counts.total,
    message:
      'Valid JSON syntax, but the document structure does not match the mission objective yet! Make sure you only repaired the targeted error without altering the other properties.',
  };
}
