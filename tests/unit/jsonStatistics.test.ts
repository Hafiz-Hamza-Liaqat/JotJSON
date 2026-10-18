import { describe, expect, it } from 'vitest';
import { computeStatistics } from '../../src/lib/json/jsonStatistics';
import { utf8ByteLength } from '../../src/lib/json/limits';
import { validateJson } from '../../src/lib/json/validateJson';

function stats(source: string) {
  const result = validateJson(source);
  if (!result.ok) {
    throw new Error('expected valid JSON');
  }
  return computeStatistics(source, result.value);
}

describe('jsonStatistics', () => {
  it('counts UTF-8 bytes rather than JS characters', () => {
    const source = '"é"';
    expect(stats(source).byteLength).toBe(utf8ByteLength(source));
    expect(stats(source).byteLength).toBeGreaterThan(source.length);
  });

  it('counts lines', () => {
    expect(stats('{\n"a":1\n}').lineCount).toBe(3);
  });

  it('counts nested object keys', () => {
    expect(stats('{"a":{"b":1},"c":[ {"d":true} ]}').objectKeyCount).toBe(4);
  });

  it('uses depth 0 for primitives and 1 for root containers', () => {
    expect(stats('true').maxDepth).toBe(0);
    expect(stats('{}').maxDepth).toBe(1);
    expect(stats('[]').maxDepth).toBe(1);
  });

  it('measures nested depth', () => {
    expect(stats('{"a":{"b":[1]}}').maxDepth).toBe(3);
  });

  it('does not produce statistics for empty or invalid content through validation', () => {
    expect(validateJson('').ok).toBe(false);
    expect(validateJson('{').ok).toBe(false);
  });

  it('safely processes large arrays without argument-limit or stack overflow error', () => {
    // 70,000 elements exceeds JavaScript's function argument limit (~65,536)
    const largeArray = '[' + Array(70000).fill('1').join(',') + ']';
    const result = stats(largeArray);
    expect(result.maxDepth).toBe(1);
    expect(result.objectKeyCount).toBe(0);
    expect(result.lineCount).toBe(1);
  });
});
