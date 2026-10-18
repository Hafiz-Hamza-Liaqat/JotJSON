export type ChallengeRound = {
  id: string;
  roundNumber: number;
  title: string;
  missionDescription: string;
  brokenStarter: string;
  expectedCorrect: string;
  errorCategory: 'quote' | 'comma' | 'bracket' | 'syntax';
  firstHint: string;
  secondHint?: string;
  explanationOnSuccess: string;
  xpReward: number;
};

export type EvaluationResult =
  | { status: 'invalid-syntax'; line?: number; message: string }
  | { status: 'valid-wrong-structure'; message: string; diffCount: number }
  | { status: 'success'; message: string };
