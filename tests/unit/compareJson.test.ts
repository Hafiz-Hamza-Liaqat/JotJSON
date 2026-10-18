import { describe, expect, it } from 'vitest';
import { compareJson } from '../../src/lib/json/compareJson';

describe('compareJson', () => {
  it('finds no differences for identical documents', () => {
    const result = compareJson('{"a":1}', '{"a":1}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.counts.total).toBe(0);
    }
  });

  it('ignores object key order', () => {
    const result = compareJson('{"a":1,"b":2}', '{"b":2,"a":1}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.diffs).toEqual([]);
    }
  });

  it('detects added, removed, and changed values', () => {
    const result = compareJson(
      '{"user":{"name":"Alex","active":true}}',
      '{"user":{"name":"Alexandra","active":true,"role":"admin"}}',
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.diffs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ kind: 'changed', path: '$["user"]["name"]' }),
          expect.objectContaining({ kind: 'added', path: '$["user"]["role"]' }),
        ]),
      );
    }
  });

  it('detects nested changes and array index differences', () => {
    const result = compareJson('[1,2,3]', '[1,9]');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.diffs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ kind: 'changed', path: '$[1]' }),
          expect.objectContaining({ kind: 'removed', path: '$[2]' }),
        ]),
      );
    }
  });

  it('treats missing properties as distinct from null', () => {
    const result = compareJson('{"a":null}', '{}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.diffs[0]).toMatchObject({ kind: 'removed', path: '$["a"]' });
    }
  });

  it('treats JSON types as distinct', () => {
    const result = compareJson('{"a":1}', '{"a":"1"}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.diffs[0]?.kind).toBe('changed');
      expect(result.diffs[0]?.originalType).toBe('number');
      expect(result.diffs[0]?.modifiedType).toBe('string');
    }
  });

  it('escapes special-character keys in paths', () => {
    const result = compareJson('{"display.name":1}', '{"display.name":2}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.diffs[0]?.path).toBe('$["display.name"]');
    }
  });

  it('compares 1, 1.0, and 1e0 as equal', () => {
    const result = compareJson('[1, -0, 1.50e2]', '[1.0, 0, 150]');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.counts.total).toBe(0);
    }
  });

  it('distinguishes large integers that JS numbers cannot', () => {
    const result = compareJson('[9007199254740992]', '[9007199254740993]');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.counts.changed).toBe(1);
      expect(result.diffs[0]?.originalValue).toBe('9007199254740992');
      expect(result.diffs[0]?.modifiedValue).toBe('9007199254740993');
    }
  });

  it('handles negatives and exponent notation', () => {
    const equal = compareJson('[-1.2e3]', '[-1200]');
    expect(equal.ok && equal.counts.total).toBe(0);
    const different = compareJson('[1e2]', '[1e3]');
    expect(different.ok && different.counts.changed).toBe(1);
  });

  it('fails when either document is invalid', () => {
    const original = compareJson('{', '{}');
    expect(original.ok).toBe(false);
    if (!original.ok) {
      expect(original.target).toBe('original');
    }
    const modified = compareJson('{}', '{');
    expect(modified.ok).toBe(false);
    if (!modified.ok) {
      expect(modified.target).toBe('modified');
    }
  });
});
