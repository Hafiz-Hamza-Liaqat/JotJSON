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
  let count = 0;
  const stack: JsonValue[] = [value];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current.type === 'object') {
      count += current.entries.length;
      for (let i = current.entries.length - 1; i >= 0; i -= 1) {
        const child = current.entries[i]?.value;
        if (child && (child.type === 'object' || child.type === 'array')) {
          stack.push(child);
        }
      }
    } else if (current.type === 'array') {
      for (let i = current.items.length - 1; i >= 0; i -= 1) {
        const item = current.items[i];
        if (item && (item.type === 'object' || item.type === 'array')) {
          stack.push(item);
        }
      }
    }
  }

  return count;
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
      let maxChild = 0;
      for (const entry of value.entries) {
        const childDepth = measureDepth(entry.value);
        if (childDepth > maxChild) {
          maxChild = childDepth;
        }
      }
      return 1 + maxChild;
    }
    case 'array': {
      if (value.items.length === 0) {
        return 1;
      }
      let maxChild = 0;
      for (const item of value.items) {
        const childDepth = measureDepth(item);
        if (childDepth > maxChild) {
          maxChild = childDepth;
        }
      }
      return 1 + maxChild;
    }
    default:
      return 0;
  }
}
