import { numericTokensEqual } from './decimalToken';
import type { JsonDiff, JsonValue, ValidationError } from './jsonTypes';
import { jsonTypeName, jsonValueToText } from './jsonValue';
import { toJsonPath, type PathSegment } from './jsonPath';
import { validateJson } from './validateJson';

export type CompareSuccess = {
  ok: true;
  diffs: JsonDiff[];
  counts: { total: number; added: number; removed: number; changed: number };
};

export type CompareFailure = {
  ok: false;
  error: ValidationError;
  target: 'original' | 'modified';
};

export type CompareResult = CompareSuccess | CompareFailure;

export function compareJson(originalSource: string, modifiedSource: string): CompareResult {
  const original = validateJson(originalSource);
  if (!original.ok) {
    return { ok: false, error: original.error, target: 'original' };
  }
  const modified = validateJson(modifiedSource);
  if (!modified.ok) {
    return { ok: false, error: modified.error, target: 'modified' };
  }

  const diffs: JsonDiff[] = [];
  walk(original.value, modified.value, [], diffs);

  const added = diffs.filter((diff) => diff.kind === 'added').length;
  const removed = diffs.filter((diff) => diff.kind === 'removed').length;
  const changed = diffs.filter((diff) => diff.kind === 'changed').length;

  return {
    ok: true,
    diffs,
    counts: {
      total: diffs.length,
      added,
      removed,
      changed,
    },
  };
}

function walk(
  original: JsonValue | undefined,
  modified: JsonValue | undefined,
  path: PathSegment[],
  diffs: JsonDiff[],
): void {
  if (original === undefined && modified === undefined) {
    return;
  }

  if (original === undefined && modified !== undefined) {
    diffs.push({
      kind: 'added',
      path: toJsonPath(path),
      modifiedValue: jsonValueToText(modified),
      modifiedType: jsonTypeName(modified),
    });
    return;
  }

  if (original !== undefined && modified === undefined) {
    diffs.push({
      kind: 'removed',
      path: toJsonPath(path),
      originalValue: jsonValueToText(original),
      originalType: jsonTypeName(original),
    });
    return;
  }

  if (!original || !modified) {
    return;
  }

  if (original.type !== modified.type) {
    diffs.push({
      kind: 'changed',
      path: toJsonPath(path),
      originalValue: jsonValueToText(original),
      modifiedValue: jsonValueToText(modified),
      originalType: jsonTypeName(original),
      modifiedType: jsonTypeName(modified),
    });
    return;
  }

  if (original.type === 'object' && modified.type === 'object') {
    const originalMap = lastWinsMap(original.entries);
    const modifiedMap = lastWinsMap(modified.entries);
    const keys = new Set([...originalMap.keys(), ...modifiedMap.keys()]);
    for (const key of keys) {
      walk(originalMap.get(key), modifiedMap.get(key), [...path, key], diffs);
    }
    return;
  }

  if (original.type === 'array' && modified.type === 'array') {
    const length = Math.max(original.items.length, modified.items.length);
    for (let index = 0; index < length; index += 1) {
      walk(original.items[index], modified.items[index], [...path, index], diffs);
    }
    return;
  }

  if (valuesEqual(original, modified)) {
    return;
  }

  diffs.push({
    kind: 'changed',
    path: toJsonPath(path),
    originalValue: jsonValueToText(original),
    modifiedValue: jsonValueToText(modified),
    originalType: jsonTypeName(original),
    modifiedType: jsonTypeName(modified),
  });
}

function lastWinsMap(entries: Array<{ key: string; value: JsonValue }>): Map<string, JsonValue> {
  const map = new Map<string, JsonValue>();
  for (const entry of entries) {
    map.set(entry.key, entry.value);
  }
  return map;
}

function valuesEqual(left: JsonValue, right: JsonValue): boolean {
  if (left.type !== right.type) {
    return false;
  }
  switch (left.type) {
    case 'number':
      return right.type === 'number' && numericTokensEqual(left.token, right.token);
    case 'string':
      return right.type === 'string' && left.value === right.value;
    case 'boolean':
      return right.type === 'boolean' && left.value === right.value;
    case 'null':
      return right.type === 'null';
    default:
      return false;
  }
}
