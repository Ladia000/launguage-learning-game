import '../services/i18n'; // i18next を最初に初期化
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSettingsStore } from '../store/useSettingsStore';
import { useWordStore } from '../store/useWordStore';

export default function RootLayout() {
  const { selectedLevels } = useSettingsStore();
  const { updateFilteredWords } = useWordStore();

  // selectedLevels が変わったら単語リストを更新
  useEffect(() => {
    updateFilteredWords(selectedLevels);
  }, [selectedLevels, updateFilteredWords]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#F8F8FC' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="learn/index" />
        <Stack.Screen name="test/index" />
        <Stack.Screen name="result" />
        <Stack.Screen name="review/index" />
        <Stack.Screen name="review/[id]" />
        <Stack.Screen name="retest/index" />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}
