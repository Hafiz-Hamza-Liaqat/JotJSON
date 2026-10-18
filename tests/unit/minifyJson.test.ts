import { describe, expect, it } from 'vitest';
import { minifyJson } from '../../src/lib/json/minifyJson';
import { validateJson } from '../../src/lib/json/validateJson';

describe('minifyJson', () => {
  it('removes insignificant whitespace from nested documents', () => {
    const result = minifyJson('{\n  "a": [ 1, 2, { "b": true } ]\n}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toBe('{"a":[1,2,{"b":true}]}');
    }
  });

  it('preserves whitespace inside strings', () => {
    const result = minifyJson('{"a":"  spaced  text  "}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toBe('{"a":"  spaced  text  "}');
    }
  });

  it('preserves escaped quotes, backslashes, and unicode escapes', () => {
    const source = '{"q":"say \\"hi\\"","p":"C:\\\\temp","u":"\\u0041"}';
    const result = minifyJson(source);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toContain('\\"hi\\"');
      expect(result.output).toContain('C:\\\\temp');
      expect(result.output).toContain('\\u0041');
    }
  });

  it('preserves large integers and exponent tokens', () => {
    const source = '[9007199254740993, -1.2e-5, 1E+10]';
    const result = minifyJson(source);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toBe('[9007199254740993,-1.2e-5,1E+10]');
    }
  });

  it('minifies primitives including null and booleans', () => {
    expect(minifyJson('  null  ').ok && minifyJson('  null  ')).toMatchObject({ output: 'null' });
    const bools = minifyJson('  false  ');
    expect(bools.ok && bools.output).toBe('false');
  });

  it('rejects invalid input', () => {
    expect(minifyJson("{'a':1}").ok).toBe(false);
  });

  it('revalidates generated output', () => {
    const result = minifyJson('{"ok": [true, null, "x"]}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(validateJson(result.output).ok).toBe(true);
    }
  });
});
