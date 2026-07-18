import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet,
  ScrollView, Alert, Switch
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/useSettingsStore';
import { useWordStore } from '../store/useWordStore';
import { useMistakeStore } from '../store/useMistakeStore';
import { CoffeeBreakButton } from '../components/CoffeeBreakButton';
import { Colors, fontSize, spacing, radius } from '../constants/typography';
import type { Language, QuizCount } from '../types';

const HSK_LEVELS = [1, 2, 3, 4, 5, 6] as const;
const QUIZ_COUNTS: QuizCount[] = [5, 10, 20];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const {
    language, selectedLevels, quizCount,
    setLanguage, setSelectedLevels, setQuizCount, resetSettings,
  } = useSettingsStore();
  const { updateFilteredWords, resetKnown } = useWordStore();
  const { resetAll } = useMistakeStore();

  const handleLevelToggle = (level: number) => {
    const next = selectedLevels.includes(level)
      ? selectedLevels.length === 1 ? selectedLevels : selectedLevels.filter((l) => l !== level)
      : [...selectedLevels, level].sort();
    setSelectedLevels(next);
    updateFilteredWords(next);
  };

  const handleLangChange = (lang: Language) => {
    setLanguage(lang);
  };

  const handleReset = () => {
    Alert.alert(
      t('settings.resetProgress'),
      t('settings.resetConfirm'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.resetButton'),
          style: 'destructive',
          onPress: () => {
            resetAll();
            resetKnown();
            resetSettings();
            updateFilteredWords([1]);
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <CoffeeBreakButton />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 言語 */}
        <Section title={t('settings.language')}>
          <View style={styles.langRow}>
            {(['ja', 'en'] as Language[]).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.langBtn, language === lang && styles.langBtnActive]}
                onPress={() => handleLangChange(lang)}
              >
                <Text style={[styles.langBtnText, language === lang && styles.langBtnTextActive]}>
                  {lang === 'ja' ? t('settings.japanese') : t('settings.english')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* HSKレベル */}
        <Section title={`${t('settings.level')}（${t('settings.levelDesc')}）`}>
          <View style={styles.levelGrid}>
            {HSK_LEVELS.map((level) => {
              const selected = selectedLevels.includes(level);
              return (
                <TouchableOpacity
                  key={level}
                  style={[styles.levelBtn, selected && styles.levelBtnActive]}
                  onPress={() => handleLevelToggle(level)}
                >
                  <Text style={[styles.levelBtnText, selected && styles.levelBtnTextActive]}>
                    HSK {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* 出題数 */}
        <Section title={t('settings.quizCount')}>
          <View style={styles.langRow}>
            {QUIZ_COUNTS.map((count) => (
              <TouchableOpacity
                key={count}
                style={[styles.langBtn, quizCount === count && styles.langBtnActive]}
                onPress={() => setQuizCount(count)}
              >
                <Text style={[styles.langBtnText, quizCount === count && styles.langBtnTextActive]}>
                  {count}{t('settings.quizCountUnit')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* リセット */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>{t('settings.resetProgress')}</Text>
          </TouchableOpacity>
        </View>

        {/* ライセンス情報 */}
        <Section title={t('settings.license')}>
          <Text style={styles.licenseText}>{t('settings.licenseText')}</Text>
        </Section>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  back: { fontSize: fontSize.body, color: Colors.primary, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: fontSize.h2, fontWeight: '700', color: Colors.text },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.small, fontWeight: '700', color: Colors.textSub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCard: {
    backgroundColor: Colors.card, borderRadius: radius.card, padding: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  langRow: { flexDirection: 'row', gap: 10 },
  langBtn: {
    flex: 1, paddingVertical: 12, borderRadius: radius.button,
    borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center',
    backgroundColor: Colors.background,
  },
  langBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  langBtnText: { fontSize: fontSize.body, fontWeight: '600', color: Colors.textSub },
  langBtnTextActive: { color: Colors.primary },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.badge,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background,
  },
  levelBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  levelBtnText: { fontSize: fontSize.body, fontWeight: '600', color: Colors.textSub },
  levelBtnTextActive: { color: Colors.primary },
  resetButton: {
    backgroundColor: Colors.wrongLight, borderWidth: 1.5, borderColor: Colors.wrong,
    borderRadius: radius.button, paddingVertical: 14, alignItems: 'center',
  },
  resetButtonText: { color: Colors.wrong, fontSize: fontSize.button, fontWeight: '700' },
  licenseText: { fontSize: fontSize.small, color: Colors.textSub, lineHeight: 16 },
});
