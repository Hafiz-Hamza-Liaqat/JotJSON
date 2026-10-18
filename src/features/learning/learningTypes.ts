export type PrimaryNavMode = 'playground' | 'learn';

export type LearnViewMode = 'home' | 'lesson' | 'detective' | 'stickers';

export type MascotExpression = 'idle' | 'happy' | 'thinking' | 'detective' | 'champion';

export type StepActivityType =
  | 'multiple-choice'
  | 'type-identification'
  | 'key-value-identification'
  | 'syntax-inspection';

export type ActivityOption = {
  id: string;
  label: string;
  explanation: string;
  isCorrect: boolean;
};

export type KeyValuePart = 'key' | 'value' | 'colon' | 'brace';

export type LessonStep = {
  id: string;
  title: string;
  subtitle: string;
  explanation: string;
  codeSnippet: string;
  highlightedLine?: number;
  activityType: StepActivityType;
  prompt: string;
  options?: ActivityOption[];
  // For key-value identification
  targetKey?: string;
  targetValue?: string;
  // Feedback and hints
  hint: string;
  successMessage: string;
  mascotMessages: {
    intro: string;
    thinking?: string;
    success: string;
  };
};

export type Lesson = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  estimatedMinutes: number;
  xpReward: number;
  steps: LessonStep[];
};
