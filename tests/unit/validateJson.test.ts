import { describe, expect, it } from 'vitest';
import { offsetToPosition } from '../../src/lib/text/positions';
import { validateJson } from '../../src/lib/json/validateJson';

describe('validateJson', () => {
  it('accepts objects and arrays', () => {
    expect(validateJson('{"a":1}').ok).toBe(true);
    expect(validateJson('[1, false, null]').ok).toBe(true);
  });

  it('accepts root primitives', () => {
    expect(validateJson('"hello"').ok).toBe(true);
    expect(validateJson('42').ok).toBe(true);
    expect(validateJson('true').ok).toBe(true);
    expect(validateJson('false').ok).toBe(true);
    expect(validateJson('null').ok).toBe(true);
  });

  it('rejects empty and whitespace-only input', () => {
    const empty = validateJson('');
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.error.kind).toBe('empty');
    }
    const blank = validateJson(' \n\t ');
    expect(blank.ok).toBe(false);
    if (!blank.ok) {
      expect(blank.error.kind).toBe('empty');
    }
  });

  it('reports missing closing braces with line and column', () => {
    const result = validateJson('{\n  "a": 1');
    expect(result.ok).toBe(false);
    if (!result.ok && result.error.kind === 'syntax') {
      expect(result.error.diagnostic.line).toBeGreaterThanOrEqual(1);
      expect(result.error.diagnostic.column).toBeGreaterThanOrEqual(1);
      expect(result.error.message).toMatch(/line \d+, column \d+/);
    }
  });

  it('rejects missing commas', () => {
    const result = validateJson('{"a":1 "b":2}');
    expect(result.ok).toBe(false);
  });

  it('rejects invalid escape sequences', () => {
    const result = validateJson('{"a":"\\x"}');
    expect(result.ok).toBe(false);
  });

  it('rejects invalid number syntax', () => {
    expect(validateJson('01').ok).toBe(false);
    expect(validateJson('1.').ok).toBe(false);
  });

  it('rejects single-quoted strings', () => {
    expect(validateJson("{'a':1}").ok).toBe(false);
  });

  it('rejects comments', () => {
    expect(validateJson('{"a":1 /* no */}').ok).toBe(false);
    expect(validateJson('{"a":1}// trailing').ok).toBe(false);
  });

  it('rejects trailing commas', () => {
    expect(validateJson('{"a":1,}').ok).toBe(false);
    expect(validateJson('[1,]').ok).toBe(false);
  });

  it('rejects multiple root values', () => {
    expect(validateJson('{} {}').ok).toBe(false);
  });

  it('converts offsets to one-based positions', () => {
    const result = validateJson('[\n1 2]');
    expect(result.ok).toBe(false);
    if (!result.ok && result.error.kind === 'syntax') {
      expect(result.error.diagnostic.offset).toBeGreaterThanOrEqual(0);
      expect(result.error.diagnostic.line).toBe(2);
    }
  });

  it('handles LF, CRLF, and lone CR line endings', () => {
    expect(offsetToPosition('a\nb', 2)).toEqual({ line: 2, column: 1 });
    expect(offsetToPosition('a\r\nb', 3)).toEqual({ line: 2, column: 1 });
    expect(offsetToPosition('a\rb', 2)).toEqual({ line: 2, column: 1 });
    const crlf = validateJson('{\r\n"a":\r\n}');
    expect(crlf.ok).toBe(false);
  });

  it('accepts unicode content', () => {
    const result = validateJson('{"note":"café 日本語"}');
    expect(result.ok).toBe(true);
  });
});
