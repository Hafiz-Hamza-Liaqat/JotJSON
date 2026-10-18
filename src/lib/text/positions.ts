export type SourcePosition = {
  line: number;
  column: number;
};

/**
 * Convert a zero-based offset into a one-based line and column.
 * Treats LF, CRLF, and lone CR as line breaks.
 */
export function offsetToPosition(text: string, offset: number): SourcePosition {
  const clamped = Math.max(0, Math.min(offset, text.length));
  let line = 1;
  let column = 1;

  for (let i = 0; i < clamped; i += 1) {
    const ch = text[i];
    if (ch === '\r') {
      line += 1;
      column = 1;
      if (text[i + 1] === '\n') {
        i += 1;
      }
    } else if (ch === '\n') {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return { line, column };
}

/** Count lines using LF, CRLF, and lone CR. Empty text has 0 lines. */
export function countLines(text: string): number {
  if (text.length === 0) {
    return 0;
  }

  let lines = 1;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '\r') {
      lines += 1;
      if (text[i + 1] === '\n') {
        i += 1;
      }
    } else if (ch === '\n') {
      lines += 1;
    }
  }
  return lines;
}
