import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Word, MistakeRecord, MistakeFilter, LearnMode } from '../types';

interface MistakeState {
  records: Record<string, MistakeRecord>;
}

interface MistakeActions {
  recordMistake: (word: Word, mode: LearnMode) => void;
  recordCorrect: (wordId: string, mode: LearnMode) => void;
  getMistakes: (filter?: MistakeFilter) => MistakeRecord[];
  resetRecord: (wordId: string) => void;
  resetAll: () => void;
  unmastered: number;
}

type MistakeStore = MistakeState & MistakeActions;

const MAX_HISTORY = 20;

export const useMistakeStore = create<MistakeStore>()(
  persist(
    (set, get) => ({
      records: {},

      get unmastered() {
        return Object.values(get().records).filter((r) => !r.isMastered).length;
      },

      recordMistake: (word, mode) => {
        set((state) => {
          const existing = state.records[word.id];
          const now = new Date().toISOString();
          const historyEntry = { date: now, mode, wasCorrect: false };

          if (existing) {
            const history = [historyEntry, ...existing.history].slice(0, MAX_HISTORY);
            return {
              records: {
                ...state.records,
                [word.id]: {
                  ...existing,
                  mistakeCount: existing.mistakeCount + 1,
                  consecutiveCorrect: 0,
                  isMastered: false,
                  lastMistakeAt: now,
                  history,
                },
              },
            };
          }

          const newRecord: MistakeRecord = {
            wordId: word.id,
            wordType: word.type,
            hanzi: word.hanzi,
            pinyin: word.pinyin,
            meaning_ja: word.meaning_ja,
            meaning_en: word.meaning_en,
            mistakeCount: 1,
            consecutiveCorrect: 0,
            isMastered: false,
            lastMistakeAt: now,
            history: [historyEntry],
          };
          return { records: { ...state.records, [word.id]: newRecord } };
        });
      },

      recordCorrect: (wordId, mode) => {
        set((state) => {
          const existing = state.records[wordId];
          if (!existing) return state;
          const consecutiveCorrect = existing.consecutiveCorrect + 1;
          const isMastered = consecutiveCorrect >= 3;
          const historyEntry = {
            date: new Date().toISOString(),
            mode,
            wasCorrect: true,
          };
          const history = [historyEntry, ...existing.history].slice(0, MAX_HISTORY);
          return {
            records: {
              ...state.records,
              [wordId]: { ...existing, consecutiveCorrect, isMastered, history },
            },
          };
        });
      },

      getMistakes: (filter) => {
        const records = Object.values(get().records);
        if (!filter) return records;
        return records.filter((r) => {
          if (filter.type && r.wordType !== filter.type) return false;
          if (filter.mastered !== undefined && r.isMastered !== filter.mastered) return false;
          return true;
        });
      },

      resetRecord: (wordId) => {
        set((state) => {
          const next = { ...state.records };
          delete next[wordId];
          return { records: next };
        });
      },

      resetAll: () => set({ records: {} }),
    }),
    {
      name: '@mistakes_v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
