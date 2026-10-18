import { describe, expect, it } from 'vitest';
import { formatJson } from '../../src/lib/json/formatJson';

describe('formatJson', () => {
  it('formats with two-space indentation by default', () => {
    const result = formatJson('{"a":1,"b":[true]}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toBe('{\n  "a": 1,\n  "b": [\n    true\n  ]\n}');
    }
  });

  it('formats with four-space indentation', () => {
    const result = formatJson('{"a":1}', '4');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toContain('\n    "a": 1');
    }
  });

  it('formats with tabs', () => {
    const result = formatJson('{"a":1}', 'tab');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toContain('\n\t"a": 1');
    }
  });

  it('keeps empty objects and arrays', () => {
    const objects = formatJson('{}');
    const arrays = formatJson('[]');
    expect(objects.ok && objects.output.includes('{}')).toBe(true);
    expect(arrays.ok && arrays.output.includes('[]')).toBe(true);
  });

  it('formats nested structures', () => {
    const result = formatJson('{"a":{"b":{"c":[1,2]}}}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output.split('\n').length).toBeGreaterThan(3);
    }
  });

  it('preserves escaped quotes and string whitespace', () => {
    const source = '{"q":"He said \\"ok\\"","s":"keep  spaces\\nand lines"}';
    const result = formatJson(source);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toContain('\\"ok\\"');
      expect(result.output).toContain('keep  spaces\\nand lines');
    }
  });

  it('preserves large integer tokens and exponent notation', () => {
    const source = '{"big":9007199254740993,"exp":1e+20}';
    const result = formatJson(source);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toContain('9007199254740993');
      expect(result.output).not.toContain('9007199254740992');
      expect(result.output).toMatch(/1[eE]\+?20/);
    }
  });

  it('preserves object-key order', () => {
    const result = formatJson('{"z":1,"a":2}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output.indexOf('"z"')).toBeLessThan(result.output.indexOf('"a"'));
    }
  });

  it('rejects invalid input', () => {
    const result = formatJson('{');
    expect(result.ok).toBe(false);
  });
});
