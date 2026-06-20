import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  get: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // silent fail
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // silent fail
    }
  },

  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch {
      // silent fail
    }
  },
};
