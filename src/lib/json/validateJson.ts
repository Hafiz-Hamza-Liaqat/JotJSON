import {
  parseTree,
  printParseErrorCode,
  type ParseError,
  type ParseOptions,
} from 'jsonc-parser';
import type { JsonDiagnostic, ValidationError, ValidationResult } from './jsonTypes';
import { jsoncNodeToValue } from './jsonValue';
import { isOversize, oversizeMessage, utf8ByteLength } from './limits';
import { offsetToPosition } from '../text/positions';

export const STRICT_JSON_OPTIONS: ParseOptions = {
  disallowComments: true,
  allowTrailingComma: false,
  allowEmptyContent: false,
};

export function validateJson(source: string): ValidationResult {
  if (source.trim().length === 0) {
    return {
      ok: false,
      error: {
        kind: 'empty',
        message: 'Enter JSON to continue. Empty input is not valid JSON.',
      },
    };
  }

  const byteLength = utf8ByteLength(source);
  if (isOversize(source)) {
    return {
      ok: false,
      error: {
        kind: 'too-large',
        byteLength,
        message: oversizeMessage(byteLength),
      },
    };
  }

  const errors: ParseError[] = [];
  const tree = parseTree(source, errors, STRICT_JSON_OPTIONS);

  if (errors.length > 0) {
    const first = errors[0];
    if (!first) {
      return failure({
        kind: 'syntax',
        message: 'The document is not valid JSON.',
        diagnostic: {
          message: 'The document is not valid JSON.',
          offset: 0,
          length: 0,
          line: 1,
          column: 1,
        },
      });
    }
    const diagnostic = toDiagnostic(source, first);
    return failure({
      kind: 'syntax',
      message: diagnostic.message,
      diagnostic,
    });
  }

  if (!tree) {
    return failure({
      kind: 'syntax',
      message: 'The document is not valid JSON.',
      diagnostic: {
        message: 'The document is not valid JSON.',
        offset: 0,
        length: 0,
        line: 1,
        column: 1,
      },
    });
  }

  try {
    const value = jsoncNodeToValue(source, tree);
    return { ok: true, source, tree, value };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to read the JSON syntax tree.';
    return failure({ kind: 'processing', message });
  }
}

export function errorLineNumber(error: ValidationError): number | null {
  if (error.kind === 'syntax') {
    return error.diagnostic.line;
  }
  return null;
}

function failure(error: ValidationError): ValidationResult {
  return { ok: false, error };
}

function toDiagnostic(source: string, error: ParseError): JsonDiagnostic {
  const position = offsetToPosition(source, error.offset);
  const codeLabel = printParseErrorCode(error.error);
  const message = `${humanizeParseError(codeLabel)} at line ${position.line}, column ${position.column} (character ${error.offset + 1}).`;
  return {
    message,
    offset: error.offset,
    length: error.length,
    line: position.line,
    column: position.column,
  };
}

function humanizeParseError(code: string): string {
  switch (code) {
    case 'InvalidSymbol':
      return 'Invalid symbol';
    case 'InvalidNumberFormat':
      return 'Invalid number';
    case 'PropertyNameExpected':
      return 'Property name expected';
    case 'ValueExpected':
      return 'Value expected';
    case 'ColonExpected':
      return 'Colon expected';
    case 'CommaExpected':
      return 'Comma expected';
    case 'CloseBraceExpected':
      return 'Closing brace expected';
    case 'CloseBracketExpected':
      return 'Closing bracket expected';
    case 'EndOfFileExpected':
      return 'Unexpected extra content after the JSON value';
    case 'InvalidCommentToken':
      return 'Comments are not allowed in standard JSON';
    case 'UnexpectedEndOfComment':
      return 'Unterminated comment';
    case 'UnexpectedEndOfString':
      return 'Unterminated string';
    case 'UnexpectedEndOfNumber':
      return 'Incomplete number';
    case 'InvalidUnicode':
      return 'Invalid Unicode escape';
    case 'InvalidEscapeCharacter':
      return 'Invalid escape sequence';
    case 'InvalidCharacter':
      return 'Invalid character';
    default:
      return 'Invalid JSON';
  }
}
