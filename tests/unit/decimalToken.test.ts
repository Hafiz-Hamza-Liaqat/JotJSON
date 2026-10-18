import { describe, expect, it } from 'vitest';
import { normalizeDecimalToken, numericTokensEqual } from '../../src/lib/json/decimalToken';

describe('decimalToken', () => {
  describe('normalizeDecimalToken', () => {
    it('returns null for invalid inputs', () => {
      expect(normalizeDecimalToken('')).toBeNull();
      expect(normalizeDecimalToken('   ')).toBeNull();
      expect(normalizeDecimalToken('-')).toBeNull();
      expect(normalizeDecimalToken('abc')).toBeNull();
      expect(normalizeDecimalToken('1e')).toBeNull();
      expect(normalizeDecimalToken('1e+')).toBeNull();
      expect(normalizeDecimalToken('1.2.3')).toBeNull();
    });

    it('normalizes integer tokens', () => {
      expect(normalizeDecimalToken('42')).toEqual({
        sign: 1,
        digits: '42',
        exponent: 0n,
      });
      expect(normalizeDecimalToken('-42')).toEqual({
        sign: -1,
        digits: '42',
        exponent: 0n,
      });
    });

    it('normalizes zero in various forms to standard representation', () => {
      const expectedZero = { sign: 1, digits: '0', exponent: 0n };
      expect(normalizeDecimalToken('0')).toEqual(expectedZero);
      expect(normalizeDecimalToken('-0')).toEqual(expectedZero);
      expect(normalizeDecimalToken('0.00')).toEqual(expectedZero);
      expect(normalizeDecimalToken('0e15')).toEqual(expectedZero);
      expect(normalizeDecimalToken('-0.0e-10')).toEqual(expectedZero);
    });

    it('normalizes decimal numbers stripping trailing zeros and adjusting exponent', () => {
      expect(normalizeDecimalToken('1.500')).toEqual({
        sign: 1,
        digits: '15',
        exponent: -1n,
      });
      expect(normalizeDecimalToken('150')).toEqual({
        sign: 1,
        digits: '15',
        exponent: 1n,
      });
      expect(normalizeDecimalToken('1.5e2')).toEqual({
        sign: 1,
        digits: '15',
        exponent: 1n,
      });
    });

    it('handles arbitrarily large exponents accurately using BigInt', () => {
      const extreme = normalizeDecimalToken('1e9007199254740992');
      expect(extreme).toEqual({
        sign: 1,
        digits: '1',
        exponent: 9007199254740992n,
      });

      const extremeNext = normalizeDecimalToken('1e9007199254740993');
      expect(extremeNext).toEqual({
        sign: 1,
        digits: '1',
        exponent: 9007199254740993n,
      });

      expect(extreme?.exponent).not.toEqual(extremeNext?.exponent);
    });
  });

  describe('numericTokensEqual', () => {
    it('accurately compares equivalent representations', () => {
      expect(numericTokensEqual('1', '1.0')).toBe(true);
      expect(numericTokensEqual('1', '1e0')).toBe(true);
      expect(numericTokensEqual('0.01', '1e-2')).toBe(true);
      expect(numericTokensEqual('-0.01', '-1e-2')).toBe(true);
    });

    it('distinguishes distinct extreme exponents', () => {
      expect(numericTokensEqual('1e9007199254740992', '1e9007199254740993')).toBe(false);
      expect(numericTokensEqual('1e-9007199254740992', '1e-9007199254740993')).toBe(false);
    });

    it('accurately equates extreme exponents after normalization', () => {
      expect(numericTokensEqual('10e9007199254740992', '1e9007199254740993')).toBe(true);
      expect(numericTokensEqual('0.1e9007199254740993', '1e9007199254740992')).toBe(true);
    });
  });
});
