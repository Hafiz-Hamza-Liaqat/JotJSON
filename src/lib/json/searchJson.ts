import type { JsonValue, SearchMatch, SearchScope, ValidationError } from './jsonTypes';
import { jsonValueToText } from './jsonValue';
import { toJsonPath, type PathSegment } from './jsonPath';
import { validateJson } from './validateJson';

export const SEARCH_DISPLAY_LIMIT = 100;

export type SearchSuccess = {
  ok: true;
  matches: SearchMatch[];
  total: number;
  truncated: boolean;
};

export type SearchFailure = {
  ok: false;
  error: ValidationError | { kind: 'empty-query'; message: string };
};

export type SearchResult = SearchSuccess | SearchFailure;

export function searchJson(
  source: string,
  query: string,
  scope: SearchScope = 'both',
): SearchResult {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) {
    return {
      ok: false,
      error: {
        kind: 'empty-query',
        message: 'Enter a non-empty search query. Queries match keys and primitive values.',
      },
    };
  }

  const validated = validateJson(source);
  if (!validated.ok) {
    return validated;
  }

  const needle = trimmedQuery.toLowerCase();
  const collected: SearchMatch[] = [];
  visit(validated.value, [], needle, scope, collected);

  return {
    ok: true,
    total: collected.length,
    truncated: collected.length > SEARCH_DISPLAY_LIMIT,
    matches: collected.slice(0, SEARCH_DISPLAY_LIMIT),
  };
}

function visit(
  value: JsonValue,
  path: PathSegment[],
  needle: string,
  scope: SearchScope,
  matches: SearchMatch[],
): void {
  if (value.type === 'object') {
    for (const entry of value.entries) {
      const childPath = [...path, entry.key];
      if (scope !== 'values' && includesInsensitive(entry.key, needle)) {
        matches.push({
          path: toJsonPath(childPath),
          kind: 'key',
          matchedText: entry.key,
          valueText: jsonValueToText(entry.value),
        });
      }
      visit(entry.value, childPath, needle, scope, matches);
    }
    return;
  }

  if (value.type === 'array') {
    value.items.forEach((item, index) => {
      visit(item, [...path, index], needle, scope, matches);
    });
    return;
  }

  if (scope === 'keys') {
    return;
  }

  const haystack = primitiveSearchText(value);
  if (includesInsensitive(haystack, needle)) {
    matches.push({
      path: toJsonPath(path),
      kind: 'value',
      matchedText: haystack,
      valueText: jsonValueToText(value),
    });
  }
}

function primitiveSearchText(value: JsonValue): string {
  switch (value.type) {
    case 'string':
      return value.value;
    case 'number':
    case 'boolean':
    case 'null':
      return value.token;
    default:
      return '';
  }
}

function includesInsensitive(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle);
}
