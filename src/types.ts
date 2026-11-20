export type NavSection =
  | 'dashboard'
  | 'modules'
  | 'lab'
  | 'exam'
  | 'questions'
  | 'arena'
  | 'notes'
  | 'tutor';

export type ModuleId = 'fundamentals' | '8085' | '8086' | '8051' | 'peripherals';

export type VisualWidgetType =
  | 'up-vs-uc'
  | 'von-neumann-harvard'
  | 'risc-cisc'
  | '8085-architecture'
  | '8085-registers-flags'
  | '8085-pinout'
  | '8085-buses'
  | '8085-addressing'
  | '8085-timing'
  | '8085-interrupts'
  | '8085-memory-map'
  | '8086-architecture'
  | '8086-segments'
  | '8086-pipeline'
  | '8051-architecture'
  | '8051-ram-map'
  | '8051-ports-timers'
  | '8255-ppi'
  | '8253-timer'
  | '8259-pic'
  | 'adc-dac'
  | 'led-seven-seg';

export interface InteractiveHotspot {
  id: string;
  label: string;
  role: string;
  details: string;
  signalNote?: string;
}

export interface StepStage {
  step: number;
  title: string;
  internalAction: string;
  busState?: string;
}

export interface RevisionCard {
  term: string;
  summary: string;
}

export interface Topic {
  id: string;
  moduleId: ModuleId;
  order: number;
  title: string;
  subtitle: string;
  durationMin: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  visualType: VisualWidgetType;
  simpleExplanation: string;
  analogy: string;
  keyFacts: string[];
  interactiveHotspots: InteractiveHotspot[];
  stepByStep: StepStage[];
  realWorldApplications: Array<{ domain: string; example: string }>;
  examPerspective: {
    keyDefinitions: string[];
    importantDiagrams: string[];
    likelyQuestions: Array<{ marks: 2 | 5 | 10; question: string }>;
  };
  quickRecap: RevisionCard[];
  relatedLabTab?: string;
}

export interface LearningModule {
  id: ModuleId;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  accentColor: 'blue' | 'cyan' | 'violet' | 'emerald' | 'amber';
  topics: Topic[];
}

export type QuestionFormat =
  | 'mcq'
  | 'multi-select'
  | 'true-false'
  | 'fill-blank'
  | 'match'
  | 'predict-output'
  | 'find-error'
  | 'diagram-id'
  | 'numerical'
  | 'application';

export interface Question {
  id: string;
  moduleId: ModuleId;
  topicId: string;
  topicName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  format: QuestionFormat;
  sourceLabel: 'MicroVerse Curated Practice' | 'Conceptual Exam Pattern';
  prompt: string;
  codeSnippet?: string;
  diagramHint?: '8085-flag-register' | '8085-bus-demux' | '8086-phys-addr' | '8051-ram-bank' | '8255-cw';
  options?: string[];
  correctAnswer: string | string[]; // index string(s) for mcq/multi-select/true-false, or exact text for fill-blank/numerical
  matchPairs?: Array<{ left: string; right: string }>;
  optionExplanations?: Record<string, string>;
  explanation: string;
  hint: string;
  marks: number;
}

export interface QuizAttempt {
  id: string;
  dateIso: string;
  mode: string;
  moduleFilter: string;
  score: number;
  maxScore: number;
  accuracy: number;
  totalQuestions: number;
  correctCount: number;
  weakTopics: string[];
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  xpReward: number;
}

export interface StudentProgress {
  completedTopicIds: string[];
  bookmarkedTopicIds: string[];
  bookmarkedQuestionIds: string[];
  recentTopicIds: string[];
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  dailyChallengeCompletedDate: string | null;
  quizHistory: QuizAttempt[];
  weakTopicIds: string[];
  masteredFlashcards: string[];
  unlockedBadges: string[];
  theme: 'dark' | 'light';
}
