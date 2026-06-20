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
}

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
