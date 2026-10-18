export type StickerId =
  | 'json-beginner'
  | 'bug-hunter'
  | 'structure-explorer'
  | 'perfect-syntax'
  | 'json-champion';

export type Sticker = {
  id: StickerId;
  name: string;
  emoji: string;
  description: string;
  unlockRequirement: string;
  themeColor: string;
  badgeLabel: string;
};
