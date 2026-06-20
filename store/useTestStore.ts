import { create } from 'zustand';
import type { Word, TestQuestion, LearnMode } from '../types';

interface TestState {
  questions: TestQuestion[];
  currentIndex: number;
  answers: boolean[];
  mode: LearnMode;
  isFinished: boolean;
}

interface TestActions {
  startTest: (words: Word[], allWords: Word[], count: number, lang: 'ja' | 'en', mode?: LearnMode) => void;
  answerQuestion: (isCorrect: boolean) => void;
  reset: () => void;
  score: () => number;
  scorePercent: () => number;
  wrongWords: () => Word[];
}

type TestStore = TestState & TestActions;

const shuffle = <T>(arr: T[]): T[] =>
  [...arr].sort(() => Math.random() - 0.5);

const generateChoices = (
  correct: Word,
  pool: Word[],
  lang: 'ja' | 'en'
): string[] => {
  const correctMeaning = lang === 'ja' ? correct.meaning_ja : correct.meaning_en;
  const sameLevel = pool.filter((w) => w.id !== correct.id && w.level === correct.level);
  const otherLevel = pool.filter((w) => w.id !== correct.id && w.level !== correct.level);
  const candidates = shuffle([...sameLevel, ...otherLevel]);
  const dummyMeanings: string[] = [];

  for (const w of candidates) {
    const m = lang === 'ja' ? w.meaning_ja : w.meaning_en;
    if (!dummyMeanings.includes(m) && m !== correctMeaning) {
      dummyMeanings.push(m);
      if (dummyMeanings.length === 3) break;
    }
  }

  return shuffle([correctMeaning, ...dummyMeanings]);
};

const INITIAL: TestState = {
  questions: [],
  currentIndex: 0,
  answers: [],
  mode: 'test',
  isFinished: false,
};

export const useTestStore = create<TestStore>()((set, get) => ({
  ...INITIAL,

  startTest: (words, allWords, count, lang, mode = 'test') => {
    const selected = shuffle(words).slice(0, count);
    const questions: TestQuestion[] = selected.map((word) => ({
      word,
      choices: generateChoices(word, allWords, lang),
      correctAnswer: lang === 'ja' ? word.meaning_ja : word.meaning_en,
    }));
    set({ questions, currentIndex: 0, answers: [], mode, isFinished: false });
  },

  answerQuestion: (isCorrect) => {
    set((state) => {
      const answers = [...state.answers, isCorrect];
      const isFinished = answers.length >= state.questions.length;
      return {
        answers,
        currentIndex: isFinished ? state.currentIndex : state.currentIndex + 1,
        isFinished,
      };
    });
  },

  reset: () => set(INITIAL),

  score: () => get().answers.filter(Boolean).length,

  scorePercent: () => {
    const { answers } = get();
    if (answers.length === 0) return 0;
    return Math.round((answers.filter(Boolean).length / answers.length) * 100);
  },

  wrongWords: () =>
    get()
      .questions.filter((_, i) => get().answers[i] === false)
      .map((q) => q.word),
}));
