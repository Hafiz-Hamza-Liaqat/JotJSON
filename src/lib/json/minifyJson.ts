import { createScanner } from 'jsonc-parser';
import type { JsonStatistics, ValidationError } from './jsonTypes';
import { computeStatistics } from './jsonStatistics';
import { validateJson } from './validateJson';

const SYNTAX_EOF = 17;
const LINE_COMMENT = 12;
const BLOCK_COMMENT = 13;
const LINE_BREAK = 14;
const TRIVIA = 15;
const UNKNOWN = 16;

export type MinifySuccess = {
  ok: true;
  output: string;
  statistics: JsonStatistics;
};

export type MinifyFailure = {
  ok: false;
  error: ValidationError;
};

export type MinifyResult = MinifySuccess | MinifyFailure;

/**
 * Token-aware minification: copy exact source tokens and drop insignificant trivia.
 * String and number tokens are sliced from the original text, never re-serialized.
 */
export function minifyJson(source: string): MinifyResult {
  const validated = validateJson(source);
  if (!validated.ok) {
    return validated;
  }

  const scanner = createScanner(source, false);
  const tokens: string[] = [];
  let kind = scanner.scan();

  while (kind !== SYNTAX_EOF) {
    if (kind === UNKNOWN || scanner.getTokenError() !== 0) {
      return {
        ok: false,
        error: {
          kind: 'processing',
          message: 'Minification stopped because an unexpected token was found.',
        },
      };
    }

    const isTrivia =
      kind === LINE_COMMENT ||
      kind === BLOCK_COMMENT ||
      kind === LINE_BREAK ||
      kind === TRIVIA;

    if (!isTrivia) {
      const start = scanner.getTokenOffset();
      tokens.push(source.slice(start, start + scanner.getTokenLength()));
    }

    kind = scanner.scan();
  }

  const output = tokens.join('');
  const revalidated = validateJson(output);
  if (!revalidated.ok) {
    return {
      ok: false,
      error: {
        kind: 'processing',
        message: 'Minification produced output that is not valid JSON.',
      },
    };
  }

  return {
    ok: true,
    output,
    statistics: computeStatistics(output, revalidated.value),
  };
}
