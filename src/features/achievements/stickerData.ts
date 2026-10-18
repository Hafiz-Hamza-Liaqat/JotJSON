import type { Sticker, StickerId } from './stickerTypes';

export const STARTER_STICKERS: Sticker[] = [
  {
    id: 'json-beginner',
    name: 'JSON Beginner',
    emoji: '🐣',
    description: 'Took the first step into structured data by finishing Lesson 1.',
    unlockRequirement: 'Complete the JSON Basics guided lesson.',
    themeColor: 'from-amber-400 to-amber-600',
    badgeLabel: 'Lesson Complete',
  },
  {
    id: 'structure-explorer',
    name: 'Structure Explorer',
    emoji: '🧩',
    description: 'Mastered the art of nesting arrays and objects together.',
    unlockRequirement: 'Solve the Arrays & Nested Data activity in Lesson 1.',
    themeColor: 'from-blue-400 to-indigo-600',
    badgeLabel: 'Deep Structures',
  },
  {
    id: 'perfect-syntax',
    name: 'Perfect Syntax',
    emoji: '✨',
    description: 'Diagnosed and solved a Syntax Detective case without using any clues!',
    unlockRequirement: 'Solve any Syntax Detective case without hints.',
    themeColor: 'from-purple-400 to-pink-600',
    badgeLabel: 'Zero Clues',
  },
  {
    id: 'bug-hunter',
    name: 'Bug Hunter',
    emoji: '🔎',
    description: 'Repaired all 5 broken JSON documents in the Syntax Detective laboratory.',
    unlockRequirement: 'Solve all 5 rounds in Syntax Detective.',
    themeColor: 'from-cyan-400 to-teal-600',
    badgeLabel: 'Case Closed',
  },
  {
    id: 'json-champion',
    name: 'JSON Champion',
    emoji: '🏆',
    description: 'Achieved mastery by completing both the guided lesson and all detective cases.',
    unlockRequirement: 'Complete Lesson 1 and all Syntax Detective rounds.',
    themeColor: 'from-yellow-400 to-amber-600',
    badgeLabel: 'Grand Master',
  },
];

export function getStickerById(id: StickerId): Sticker | undefined {
  return STARTER_STICKERS.find((s) => s.id === id);
}
