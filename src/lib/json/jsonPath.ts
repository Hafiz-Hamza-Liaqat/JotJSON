export type PathSegment = string | number;

/**
 * Build an unambiguous JSONPath-style location.
 * Object keys are always quoted and escaped so dots, spaces, and brackets
 * cannot be mistaken for path syntax.
 */
export function toJsonPath(segments: readonly PathSegment[]): string {
  let path = '$';
  for (const segment of segments) {
    if (typeof segment === 'number') {
      path += `[${segment}]`;
    } else {
      path += `[${quotePathKey(segment)}]`;
    }
  }
  return path;
}

export function quotePathKey(key: string): string {
  return `"${escapePathKey(key)}"`;
}

function escapePathKey(key: string): string {
  return key.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}
