import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WritePracticeRecord } from '../types';

interface WriteState {
  records: Record<string, WritePracticeRecord>;
}

interface WriteActions {
  recordPractice: (wordId: string, hanzi: string, accuracy: number) => void;
  getRecord: (wordId: string) => WritePracticeRecord | null;
  getTodayCount: () => number;
  resetAll: () => void;
}

type WriteStore = WriteState & WriteActions;

export const useWriteStore = create<WriteStore>()(
  persist(
    (set, get) => ({
      records: {},

      recordPractice: (wordId, hanzi, accuracy) => {
        set((state) => {
          const existing = state.records[wordId];
          const now = new Date().toISOString();

          if (existing) {
            return {
              records: {
                ...state.records,
                [wordId]: {
                  ...existing,
                  practiceCount: existing.practiceCount + 1,
                  lastAccuracy: accuracy,
                  lastPracticeAt: now,
                },
              },
            };
          }

          const newRecord: WritePracticeRecord = {
            wordId,
            hanzi,
            practiceCount: 1,
            lastAccuracy: accuracy,
            lastPracticeAt: now,
          };
          return { records: { ...state.records, [wordId]: newRecord } };
        });
      },

      getRecord: (wordId) => get().records[wordId] ?? null,

      getTodayCount: () => {
        const today = new Date().toDateString();
        return Object.values(get().records).filter(
          (r) => new Date(r.lastPracticeAt).toDateString() === today
        ).length;
      },

      resetAll: () => set({ records: {} }),
    }),
    {
      name: '@write_practice_v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
