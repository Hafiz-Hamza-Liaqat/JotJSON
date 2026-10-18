import type { JsonStatistics, JsonValue } from './jsonTypes';
import { countLines } from '../text/positions';
import { utf8ByteLength } from './limits';

export function computeStatistics(source: string, value: JsonValue): JsonStatistics {
  return {
    byteLength: utf8ByteLength(source),
    lineCount: countLines(source),
    objectKeyCount: countObjectKeys(value),
    maxDepth: measureDepth(value),
  };
}

export function countObjectKeys(value: JsonValue): number {
  switch (value.type) {
    case 'object':
      return (
        value.entries.length +
        value.entries.reduce((sum, entry) => sum + countObjectKeys(entry.value), 0)
      );
    case 'array':
      return value.items.reduce((sum, item) => sum + countObjectKeys(item), 0);
    default:
      return 0;
  }
}

/**
 * A root object or array has depth 1. A root primitive has depth 0.
 * Nested containers increment the depth.
 */
export function measureDepth(value: JsonValue): number {
  switch (value.type) {
    case 'object': {
      if (value.entries.length === 0) {
        return 1;
      }
      return 1 + Math.max(...value.entries.map((entry) => measureDepth(entry.value)));
    }
    case 'array': {
      if (value.items.length === 0) {
        return 1;
      }
      return 1 + Math.max(...value.items.map((item) => measureDepth(item)));
    }
    default:
      return 0;
  }
}
