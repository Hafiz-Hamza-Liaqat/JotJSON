export type CopyResult = { ok: true } | { ok: false; message: string };

export async function copyText(text: string): Promise<CopyResult> {
  try {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      return {
        ok: false,
        message: 'Clipboard access is not available in this browser.',
      };
    }
    await navigator.clipboard.writeText(text);
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: 'Copy failed. Clipboard permission may have been denied.',
    };
  }
}
