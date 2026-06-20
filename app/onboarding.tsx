import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/useSettingsStore';
import { useWordStore } from '../store/useWordStore';
import { Colors, fontSize, spacing, radius } from '../constants/typography';
import type { Language } from '../types';

const HSK_LEVELS = [1, 2, 3, 4, 5, 6] as const;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { setLanguage, setSelectedLevels, setOnboardingDone, language } = useSettingsStore();
  const { updateFilteredWords } = useWordStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLevels, setLocalLevels] = useState<number[]>([1]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
  };

  const handleLevelToggle = (level: number) => {
    setLocalLevels((prev) =>
      prev.includes(level)
        ? prev.length === 1 ? prev : prev.filter((l) => l !== level)
        : [...prev, level].sort()
    );
  };

  const handleStart = () => {
    setSelectedLevels(selectedLevels);
    updateFilteredWords(selectedLevels);
    setOnboardingDone(true);
    router.replace('/');
  };

  const levelDesc = (level: number): string => {
    const key = `onboarding.level.hsk${level}`;
    return t(key);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stepIndicator}>
        {[1, 2].map((s) => (
          <View key={s} style={[styles.dot, step >= s && styles.dotActive]} />
        ))}
      </View>

      {step === 1 ? (
        <View style={styles.content}>
          <Text style={styles.title}>{t('onboarding.language.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.language.subtitle')}</Text>
          <View style={styles.langRow}>
            {(['ja', 'en'] as Language[]).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.langButton, language === lang && styles.langButtonActive]}
                onPress={() => handleLanguageSelect(lang)}
                activeOpacity={0.8}
              >
                <Text style={styles.langFlag}>{lang === 'ja' ? '🇯🇵' : '🇺🇸'}</Text>
                <Text style={[styles.langText, language === lang && styles.langTextActive]}>
                  {lang === 'ja' ? '日本語' : 'English'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.nextButton} onPress={() => setStep(2)}>
            <Text style={styles.nextButtonText}>{t('common.next')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('onboarding.level.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.level.subtitle')}</Text>
          <View style={styles.levelGrid}>
            {HSK_LEVELS.map((level) => {
              const selected = selectedLevels.includes(level);
              return (
                <TouchableOpacity
                  key={level}
                  style={[styles.levelCard, selected && styles.levelCardActive]}
                  onPress={() => handleLevelToggle(level)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.levelTitle, selected && styles.levelTitleActive]}>
                    HSK {level}
                  </Text>
                  <Text style={[styles.levelDesc, selected && styles.levelDescActive]}>
                    {levelDesc(level)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={[styles.nextButton, selectedLevels.length === 0 && styles.nextButtonDisabled]}
            onPress={handleStart}
            disabled={selectedLevels.length === 0}
          >
            <Text style={styles.nextButtonText}>{t('onboarding.start')}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  stepIndicator: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 24 },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  title: { fontSize: fontSize.h1, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: fontSize.body, color: Colors.textSub, textAlign: 'center', marginBottom: spacing.xl },
  langRow: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginBottom: spacing.xl },
  langButton: {
    flex: 1, maxWidth: 160, alignItems: 'center', padding: spacing.lg,
    borderRadius: radius.card, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.card,
  },
  langButtonActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  langFlag: { fontSize: 48, marginBottom: 8 },
  langText: { fontSize: fontSize.body, fontWeight: '600', color: Colors.textSub },
  langTextActive: { color: Colors.primary },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: spacing.xl },
  levelCard: {
    width: '47%', padding: spacing.md, borderRadius: radius.card,
    borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.card,
  },
  levelCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  levelTitle: { fontSize: fontSize.h2, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  levelTitleActive: { color: Colors.primary },
  levelDesc: { fontSize: fontSize.small, color: Colors.textSub },
  levelDescActive: { color: Colors.primary },
  nextButton: {
    backgroundColor: Colors.primary, borderRadius: radius.button,
    padding: spacing.md, alignItems: 'center', marginTop: spacing.md,
  },
  nextButtonDisabled: { backgroundColor: Colors.border },
  nextButtonText: { color: '#fff', fontSize: fontSize.button, fontWeight: '700' },
});
