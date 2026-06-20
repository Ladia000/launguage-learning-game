import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Word } from '../types';

// words.json はプロジェクトの data/ フォルダに配置済み
// eslint-disable-next-line @typescript-eslint/no-require-imports
const wordsData: Word[] = require('../data/words.json') as Word[];

interface WordState {
  allWords: Word[];
  filteredWords: Word[];
  knownWordIds: string[];
}

interface WordActions {
  updateFilteredWords: (selectedLevels: number[]) => void;
  markAsKnown: (id: string) => void;
  markAsUnknown: (id: string) => void;
  resetKnown: () => void;
  knownCount: () => number;
  totalCount: () => number;
}

type WordStore = WordState & WordActions;

export const useWordStore = create<WordStore>()(
  persist(
    (set, get) => ({
      allWords: wordsData,
      filteredWords: wordsData.filter((w) => w.level === 1),
      knownWordIds: [],

      updateFilteredWords: (selectedLevels) => {
        const filtered = wordsData.filter((w) => selectedLevels.includes(w.level));
        set({ filteredWords: filtered });
      },

      markAsKnown: (id) => {
        set((state) => ({
          knownWordIds: state.knownWordIds.includes(id)
            ? state.knownWordIds
            : [...state.knownWordIds, id],
        }));
      },

      markAsUnknown: (id) => {
        set((state) => ({
          knownWordIds: state.knownWordIds.filter((wid) => wid !== id),
        }));
      },

      resetKnown: () => set({ knownWordIds: [] }),

      knownCount: () => get().knownWordIds.length,

      totalCount: () => get().filteredWords.length,
    }),
    {
      name: '@known_words_v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ knownWordIds: state.knownWordIds }),
    }
  )
);
