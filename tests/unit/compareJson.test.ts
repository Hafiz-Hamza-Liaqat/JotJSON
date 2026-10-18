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

  describe('exact numeric comparison', () => {
    it('distinguishes distinct adjacent extreme exponent values exceeding MAX_SAFE_INTEGER', () => {
      // Exponents beyond 2^53 (9007199254740992 and 9007199254740993)
      const positiveDiff = compareJson('[1e9007199254740992]', '[1e9007199254740993]');
      expect(positiveDiff.ok).toBe(true);
      if (positiveDiff.ok) {
        expect(positiveDiff.counts.changed).toBe(1);
        expect(positiveDiff.diffs[0]?.originalValue).toBe('1e9007199254740992');
        expect(positiveDiff.diffs[0]?.modifiedValue).toBe('1e9007199254740993');
      }

      const negativeDiff = compareJson('[1e-9007199254740992]', '[1e-9007199254740993]');
      expect(negativeDiff.ok).toBe(true);
      if (negativeDiff.ok) {
        expect(negativeDiff.counts.changed).toBe(1);
        expect(negativeDiff.diffs[0]?.originalValue).toBe('1e-9007199254740992');
        expect(negativeDiff.diffs[0]?.modifiedValue).toBe('1e-9007199254740993');
      }
    });

    it('treats equivalent decimal representations with extreme exponents as equal', () => {
      // 10e9007199254740992 === 1e9007199254740993
      const equalExtreme = compareJson('[10e9007199254740992]', '[1e9007199254740993]');
      expect(equalExtreme.ok).toBe(true);
      if (equalExtreme.ok) {
        expect(equalExtreme.counts.total).toBe(0);
      }

      // 0.1e9007199254740993 === 1e9007199254740992
      const equalExtremeFrac = compareJson('[0.1e9007199254740993]', '[1e9007199254740992]');
      expect(equalExtremeFrac.ok).toBe(true);
      if (equalExtremeFrac.ok) {
        expect(equalExtremeFrac.counts.total).toBe(0);
      }
    });

    it('distinguishes large integers exceeding MAX_SAFE_INTEGER and recognizes equivalent scientific notation', () => {
      const distinctLarge = compareJson(
        '[123456789012345678901234567890]',
        '[123456789012345678901234567891]',
      );
      expect(distinctLarge.ok).toBe(true);
      if (distinctLarge.ok) {
        expect(distinctLarge.counts.changed).toBe(1);
      }

      const equivalentLarge = compareJson(
        '[123456789012345678900000]',
        '[1234567890123456789e5]',
      );
      expect(equivalentLarge.ok).toBe(true);
      if (equivalentLarge.ok) {
        expect(equivalentLarge.counts.total).toBe(0);
      }
    });

    it('treats various representations of zero as equal and distinguishes zero from non-zero', () => {
      const zeros = compareJson('[0, -0, 0.0, 0.000, 0e0, 0e100, -0e-50]', '[0, 0, 0, 0, 0, 0, 0]');
      expect(zeros.ok).toBe(true);
      if (zeros.ok) {
        expect(zeros.counts.total).toBe(0);
      }

      const zeroVsTiny = compareJson('[0]', '[1e-9007199254740992]');
      expect(zeroVsTiny.ok).toBe(true);
      if (zeroVsTiny.ok) {
        expect(zeroVsTiny.counts.changed).toBe(1);
      }
    });

    it('correctly handles negative values and preserves signs', () => {
      const equalNegatives = compareJson('[-150, -1.5e2, -0.15e3]', '[-150.0, -150, -150]');
      expect(equalNegatives.ok).toBe(true);
      if (equalNegatives.ok) {
        expect(equalNegatives.counts.total).toBe(0);
      }

      const signMismatch = compareJson('[-150]', '[150]');
      expect(signMismatch.ok).toBe(true);
      if (signMismatch.ok) {
        expect(signMismatch.counts.changed).toBe(1);
      }

      const extremeNegativeSign = compareJson('[-1e9007199254740992]', '[1e9007199254740992]');
      expect(extremeNegativeSign.ok).toBe(true);
      if (extremeNegativeSign.ok) {
        expect(extremeNegativeSign.counts.changed).toBe(1);
      }

      const distinctExtremeNegatives = compareJson('[-1e9007199254740992]', '[-1e9007199254740993]');
      expect(distinctExtremeNegatives.ok).toBe(true);
      if (distinctExtremeNegatives.ok) {
        expect(distinctExtremeNegatives.counts.changed).toBe(1);
      }
    });
  });
});
