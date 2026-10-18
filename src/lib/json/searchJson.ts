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
  const collector = { matches: [] as SearchMatch[], total: 0 };
  visit(validated.value, [], needle, scope, collector);

  return {
    ok: true,
    total: collector.total,
    truncated: collector.total > SEARCH_DISPLAY_LIMIT,
    matches: collector.matches,
  };
}

function visit(
  value: JsonValue,
  path: PathSegment[],
  needle: string,
  scope: SearchScope,
  collector: { matches: SearchMatch[]; total: number },
): void {
  if (value.type === 'object') {
    for (const entry of value.entries) {
      const childPath = [...path, entry.key];
      if (scope !== 'values' && includesInsensitive(entry.key, needle)) {
        collector.total += 1;
        if (collector.matches.length < SEARCH_DISPLAY_LIMIT) {
          collector.matches.push({
            path: toJsonPath(childPath),
            kind: 'key',
            matchedText: entry.key,
            valueText: jsonValueToText(entry.value),
          });
        }
      }
      visit(entry.value, childPath, needle, scope, collector);
    }
    return;
  }

  if (value.type === 'array') {
    for (let index = 0; index < value.items.length; index += 1) {
      const item = value.items[index];
      if (item) {
        visit(item, [...path, index], needle, scope, collector);
      }
    }
    return;
  }

  if (scope === 'keys') {
    return;
  }

  const haystack = primitiveSearchText(value);
  if (includesInsensitive(haystack, needle)) {
    collector.total += 1;
    if (collector.matches.length < SEARCH_DISPLAY_LIMIT) {
      collector.matches.push({
        path: toJsonPath(path),
        kind: 'value',
        matchedText: haystack,
        valueText: jsonValueToText(value),
      });
    }
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
