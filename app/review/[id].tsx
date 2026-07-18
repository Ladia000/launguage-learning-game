import React from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMistakeStore } from '../../store/useMistakeStore';
import { useWordStore } from '../../store/useWordStore';
import { useTestStore } from '../../store/useTestStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { AudioButton } from '../../components/AudioButton';
import { CoffeeBreakButton } from '../../components/CoffeeBreakButton';
import { Colors, fontSize, spacing, radius } from '../../constants/typography';
import type { MistakeHistory } from '../../types';

export default function WordDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { records } = useMistakeStore();
  const { allWords } = useWordStore();
  const { startTest } = useTestStore();
  const { language } = useSettingsStore();

  const record = records[id ?? ''];
  const word = allWords.find((w) => w.id === id);

  if (!record || !word) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.back}>‹ {t('common.back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const meaning = language === 'ja' ? word.meaning_ja : word.meaning_en;
  const example = language === 'ja' ? word.example_ja : word.example_en;

  const handleRetest = () => {
    startTest([word], allWords, 1, language, 'retest');
    router.push('/test');
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  };

  const renderHistory = (h: MistakeHistory, i: number) => (
    <View key={i} style={styles.historyItem}>
      <Text style={[styles.historyResult, h.wasCorrect ? styles.correct : styles.wrong]}>
        {h.wasCorrect ? t('wordDetail.correct') : t('wordDetail.wrong')}
      </Text>
      <Text style={styles.historyMode}>{h.mode}</Text>
      <Text style={styles.historyDate}>{formatDate(h.date)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('wordDetail.title')}</Text>
        <CoffeeBreakButton />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 単語カード */}
        <View style={styles.wordCard}>
          <View style={styles.wordRow}>
            <Text style={styles.hanzi}>{word.hanzi}</Text>
            <AudioButton hanzi={word.hanzi} />
          </View>
          <Text style={styles.pinyin}>{word.pinyin}</Text>
          <Text style={styles.meaning}>{meaning}</Text>
          {word.example && (
            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>{word.example}</Text>
              <Text style={styles.exampleTrans}>{example}</Text>
            </View>
          )}
        </View>

        {/* 統計 */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{record.mistakeCount}</Text>
            <Text style={styles.statLabel}>{t('wordDetail.mistakeCount', { count: 0 }).replace(/: \d+/, '')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{record.consecutiveCorrect}</Text>
            <Text style={styles.statLabel}>{t('review.consecutiveCorrect', { count: 0 }).replace(/^\d+ /, '')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, record.isMastered && { color: Colors.correct }]}>
              {record.isMastered ? '✓' : '–'}
            </Text>
            <Text style={styles.statLabel}>{t('review.mastered')}</Text>
          </View>
        </View>

        {/* 履歴 */}
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>{t('wordDetail.history')}</Text>
          {record.history.slice(0, 10).map(renderHistory)}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.retestButton} onPress={handleRetest}>
            <Text style={styles.retestButtonText}>{t('wordDetail.retest')}</Text>
          </TouchableOpacity>
        </View>
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
  backBtn: { padding: spacing.md },
  headerTitle: { fontSize: fontSize.h2, fontWeight: '700', color: Colors.text },
  wordCard: {
    marginHorizontal: spacing.lg, marginVertical: spacing.md,
    backgroundColor: Colors.card, borderRadius: radius.card, padding: spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  wordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hanzi: { fontSize: 48, fontWeight: '700', color: Colors.text },
  pinyin: { fontSize: fontSize.pinyin, color: Colors.primary, marginTop: 4, marginBottom: 8 },
  meaning: { fontSize: fontSize.h2, fontWeight: '600', color: Colors.text },
  exampleBox: { marginTop: 12, padding: 12, backgroundColor: Colors.background, borderRadius: radius.small },
  exampleText: { fontSize: fontSize.body, color: Colors.text, marginBottom: 4 },
  exampleTrans: { fontSize: fontSize.small, color: Colors.textSub },
  statsCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    backgroundColor: Colors.card, borderRadius: radius.card, padding: spacing.md,
    flexDirection: 'row',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: fontSize.h1, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: fontSize.small, color: Colors.textSub, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  historyCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    backgroundColor: Colors.card, borderRadius: radius.card, padding: spacing.md,
  },
  historyTitle: { fontSize: fontSize.body, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  historyItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  historyResult: { width: 48, fontSize: fontSize.small, fontWeight: '700' },
  correct: { color: Colors.correct },
  wrong: { color: Colors.wrong },
  historyMode: { flex: 1, fontSize: fontSize.small, color: Colors.textSub },
  historyDate: { fontSize: fontSize.small, color: Colors.textMuted },
  actions: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  retestButton: {
    backgroundColor: Colors.primary, borderRadius: radius.button,
    paddingVertical: 14, alignItems: 'center',
  },
  retestButtonText: { color: '#fff', fontSize: fontSize.button, fontWeight: '700' },
});
