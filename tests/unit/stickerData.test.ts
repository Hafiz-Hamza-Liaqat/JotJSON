import { describe, expect, it } from 'vitest';
import { STARTER_STICKERS, getStickerById } from '../../src/features/achievements/stickerData';

describe('stickerData', () => {
  it('contains at least 5 unique starter stickers with valid metadata', () => {
    expect(STARTER_STICKERS.length).toBeGreaterThanOrEqual(5);
    const ids = STARTER_STICKERS.map((s) => s.id);
    expect(new Set(ids).size).toBe(STARTER_STICKERS.length);
  });

  it('includes all 5 required starter stickers', () => {
    const required = [
      'json-beginner',
      'structure-explorer',
      'perfect-syntax',
      'bug-hunter',
      'json-champion',
    ];
    for (const reqId of required) {
      expect(getStickerById(reqId as never)).toBeDefined();
    }
  });

  it('provides accessible names, unlock requirements, and emoji icons', () => {
    for (const sticker of STARTER_STICKERS) {
      expect(sticker.name).toBeTruthy();
      expect(sticker.emoji).toBeTruthy();
      expect(sticker.description).toBeTruthy();
      expect(sticker.unlockRequirement).toBeTruthy();
    }
  });
});
