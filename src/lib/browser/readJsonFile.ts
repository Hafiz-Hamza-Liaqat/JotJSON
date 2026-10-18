import { formatByteSize, MAX_INPUT_BYTES, oversizeMessage } from '../json/limits';

export type FileReadSuccess = { ok: true; name: string; text: string };
export type FileReadFailure = { ok: false; message: string };
export type FileReadResult = FileReadSuccess | FileReadFailure;

export async function readJsonFile(file: File): Promise<FileReadResult> {
  if (file.size > MAX_INPUT_BYTES) {
    return {
      ok: false,
      message: oversizeMessage(file.size),
    };
  }

  if (file.size === 0) {
    return {
      ok: false,
      message: `The file “${file.name}” is empty.`,
    };
  }

  const lowerName = file.name.toLowerCase();
  if (lowerName.length > 0 && !lowerName.endsWith('.json')) {
    return {
      ok: false,
      message: `Choose a .json file. “${file.name}” is not accepted.`,
    };
  }

  try {
    const text = await file.text();
    if (text.trim().length === 0) {
      return {
        ok: false,
        message: `The file “${file.name}” does not contain JSON text.`,
      };
    }
    return { ok: true, name: file.name, text };
  } catch {
    return {
      ok: false,
      message: `Could not read “${file.name}” (${formatByteSize(file.size)}).`,
    };
  }
}
