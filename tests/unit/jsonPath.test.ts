import { describe, expect, it } from 'vitest';
import { toJsonPath } from '../../src/lib/json/jsonPath';

describe('jsonPath', () => {
  it('quotes object keys and indexes arrays', () => {
    expect(toJsonPath(['user', 'email'])).toBe('$["user"]["email"]');
    expect(toJsonPath(['items', 0, 'price'])).toBe('$["items"][0]["price"]');
  });

  it('escapes keys with dots, spaces, quotes, and brackets', () => {
    expect(toJsonPath(['display.name'])).toBe('$["display.name"]');
    expect(toJsonPath(['privacy note'])).toBe('$["privacy note"]');
    expect(toJsonPath(['a"b'])).toBe('$["a\\"b"]');
    expect(toJsonPath(['arr[0]'])).toBe('$["arr[0]"]');
  });
});
