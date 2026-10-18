import { describe, expect, it } from 'vitest';
import { SEARCH_DISPLAY_LIMIT, searchJson } from '../../src/lib/json/searchJson';

describe('searchJson', () => {
  const sample = `{
    "user": { "email": "casey@example.test", "active": true },
    "items": [{ "price": 12.5 }],
    "metadata": { "display.name": "Casey", "note": null }
  }`;

  it('finds keys, string values, numbers, booleans, and null', () => {
    expect(searchJson(sample, 'email', 'keys').ok).toBe(true);
    const email = searchJson(sample, 'casey@example.test', 'values');
    expect(email.ok && email.total).toBeGreaterThan(0);
    const price = searchJson(sample, '12.5', 'values');
    expect(price.ok && price.matches[0]?.path).toBe('$["items"][0]["price"]');
    const active = searchJson(sample, 'true', 'values');
    expect(active.ok && active.total).toBeGreaterThan(0);
    const nothing = searchJson(sample, 'null', 'values');
    expect(nothing.ok && nothing.total).toBeGreaterThan(0);
  });

  it('supports partial case-insensitive matching', () => {
    const result = searchJson(sample, 'CASEY', 'both');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.total).toBeGreaterThan(0);
    }
  });

  it('searches nested objects and arrays', () => {
    const result = searchJson(sample, 'price', 'keys');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.matches[0]?.path).toBe('$["items"][0]["price"]');
    }
  });

  it('keeps dotted keys intact', () => {
    const result = searchJson(sample, 'display.name', 'keys');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.matches[0]?.path).toBe('$["metadata"]["display.name"]');
    }
  });

  it('requires a non-empty query', () => {
    const result = searchJson(sample, '   ');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('empty-query');
    }
  });

  it('returns no results for unmatched queries', () => {
    const result = searchJson(sample, 'no-such-value');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.total).toBe(0);
    }
  });

  it('does not search invalid JSON', () => {
    const result = searchJson('{', 'a');
    expect(result.ok).toBe(false);
  });

  it('limits displayed matches while reporting the total', () => {
    const bulky: Record<string, number> = {};
    for (let i = 0; i < SEARCH_DISPLAY_LIMIT + 25; i += 1) {
      bulky[`key-${i}`] = i;
    }
    const result = searchJson(JSON.stringify(bulky), 'key-', 'keys');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.total).toBe(SEARCH_DISPLAY_LIMIT + 25);
      expect(result.matches).toHaveLength(SEARCH_DISPLAY_LIMIT);
      expect(result.truncated).toBe(true);
    }
  });
});
