export interface Word {
  id: string;
  type: 'word' | 'idiom';
  hanzi: string;
  pinyin: string;
  meaning_ja: string;
  meaning_en: string;
  level: number;
  category_ja: string;
  category_en: string;
  example: string;
  example_ja: string;
  example_en: string;
  strokeCount?: number;
  tags?: string[];
  cultureTip?: string;
}

export interface StrokeData {
  character: string;
  strokes: string[];
  medians: number[][][];
}

export interface WritePracticeRecord {
  wordId: string;
  hanzi: string;
  practiceCount: number;
  lastAccuracy: number;
  lastPracticeAt: string;
}

export type HandwritingResult = {
  recognized: string;
  confidence: number;
  isCorrect: boolean;
};

export interface MistakeRecord {
  wordId: string;
  wordType: 'word' | 'idiom';
  hanzi: string;
  pinyin: string;
  meaning_ja: string;
  meaning_en: string;
  mistakeCount: number;
  consecutiveCorrect: number;
  isMastered: boolean;
  lastMistakeAt: string;
  history: MistakeHistory[];
}

export interface MistakeHistory {
  date: string;
  mode: LearnMode;
  wasCorrect: boolean;
}

export interface TestQuestion {
  word: Word;
  choices: string[];
  correctAnswer: string;
}

export type Language = 'ja' | 'en';
export type QuizCount = 5 | 10 | 20;
export type LearnMode = 'learn' | 'test' | 'retest';

export interface MistakeFilter {
  type?: 'word' | 'idiom';
  mastered?: boolean;
}
