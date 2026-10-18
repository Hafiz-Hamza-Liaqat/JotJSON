import { applyEdits, format, type FormattingOptions, type Range } from 'jsonc-parser';
import type { JsonIndent, JsonStatistics, ValidationError } from './jsonTypes';
import { computeStatistics } from './jsonStatistics';
import { validateJson } from './validateJson';

export type FormatSuccess = {
  ok: true;
  output: string;
  statistics: JsonStatistics;
};

export type FormatFailure = {
  ok: false;
  error: ValidationError;
};

export type FormatResult = FormatSuccess | FormatFailure;

export function formatJson(source: string, indent: JsonIndent = '2'): FormatResult {
  const validated = validateJson(source);
  if (!validated.ok) {
    return validated;
  }

  const options = toFormattingOptions(indent);
  const range: Range = { offset: 0, length: source.length };
  const output = applyEdits(source, format(source, range, options));
  const revalidated = validateJson(output);
  if (!revalidated.ok) {
    return {
      ok: false,
      error: {
        kind: 'processing',
        message: 'Formatting produced output that is not valid JSON.',
      },
    };
  }

  return {
    ok: true,
    output,
    statistics: computeStatistics(output, revalidated.value),
  };
}

function toFormattingOptions(indent: JsonIndent): FormattingOptions {
  if (indent === 'tab') {
    return { tabSize: 4, insertSpaces: false, eol: '\n' };
  }
  return {
    tabSize: indent === '4' ? 4 : 2,
    insertSpaces: true,
    eol: '\n',
  };
}
