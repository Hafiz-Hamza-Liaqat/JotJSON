/** Application-level processing limit: 5 MiB per document. */
export const MAX_INPUT_BYTES = 5 * 1024 * 1024;

export function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function isOversize(text: string): boolean {
  return utf8ByteLength(text) > MAX_INPUT_BYTES;
}

export function formatByteSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    const kib = bytes / 1024;
    return `${kib < 10 ? kib.toFixed(1) : kib.toFixed(0)} KiB`;
  }
  const mib = bytes / (1024 * 1024);
  return `${mib.toFixed(2)} MiB`;
}

export function oversizeMessage(bytes: number): string {
  return `This document is ${formatByteSize(bytes)}, which exceeds the ${formatByteSize(MAX_INPUT_BYTES)} processing limit. Remove or replace the content to continue.`;
}
