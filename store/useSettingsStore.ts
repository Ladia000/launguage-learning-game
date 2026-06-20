import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../services/i18n';
import type { Language, QuizCount } from '../types';

interface SettingsState {
  language: Language;
  selectedLevels: number[];
  quizCount: QuizCount;
  isOnboardingDone: boolean;
}

interface SettingsActions {
  setLanguage: (lang: Language) => void;
  setSelectedLevels: (levels: number[]) => void;
  setQuizCount: (count: QuizCount) => void;
  setOnboardingDone: (done: boolean) => void;
  resetSettings: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

const DEFAULT_STATE: SettingsState = {
  language: 'ja',
  selectedLevels: [1],
  quizCount: 10,
  isOnboardingDone: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },

      setSelectedLevels: (levels) => {
        set({ selectedLevels: levels });
      },

      setQuizCount: (count) => {
        set({ quizCount: count });
      },

      setOnboardingDone: (done) => {
        set({ isOnboardingDone: done });
      },

      resetSettings: () => {
        set(DEFAULT_STATE);
      },
    }),
    {
      name: '@settings_v1',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
      },
    }
  )
);
