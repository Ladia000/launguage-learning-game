import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, FlatList
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMistakeStore } from '../../store/useMistakeStore';
import { useWordStore } from '../../store/useWordStore';
import { useTestStore } from '../../store/useTestStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { WrongWordCard } from '../../components/WrongWordCard';
import { CoffeeBreakButton } from '../../components/CoffeeBreakButton';
import { Colors, fontSize, spacing, radius } from '../../constants/typography';
import type { MistakeRecord } from '../../types';

type Filter = 'all' | 'word' | 'idiom';

export default function ReviewScreen() {
  const { t } = useTranslation();
  const { getMistakes } = useMistakeStore();
  const { allWords } = useWordStore();
  const { startTest } = useTestStore();
  const { language } = useSettingsStore();
  const [filter, setFilter] = useState<Filter>('all');

  const allMistakes = getMistakes();
  const filtered = filter === 'all'
    ? allMistakes
    : allMistakes.filter((r) => r.wordType === filter);

  const handleRetestAll = () => {
    const wordIds = filtered.map((r) => r.wordId);
    const words = allWords.filter((w) => wordIds.includes(w.id));
    startTest(words, allWords, words.length, language, 'retest');
    router.push('/test');
  };

  const handleCardPress = (record: MistakeRecord) => {
    router.push(`/review/${record.wordId}`);
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all',   label: t('review.filterAll') },
    { key: 'word',  label: t('review.filterWord') },
    { key: 'idiom', label: t('review.filterIdiom') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('review.title')}</Text>
        <CoffeeBreakButton />
      </View>

      {/* フィルターバー */}
      <View style={styles.filterBar}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>{t('review.empty')}</Text>
          <Text style={styles.emptyDesc}>{t('review.emptyDesc')}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.wordId}
            renderItem={({ item }) => (
              <WrongWordCard
                record={item}
                language={language}
                onPress={() => handleCardPress(item)}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.footer}>
            <TouchableOpacity style={styles.retestButton} onPress={handleRetestAll}>
              <Text style={styles.retestButtonText}>{t('review.retestAll')}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  filterBar: {
    flexDirection: 'row', paddingHorizontal: spacing.lg, gap: 8, paddingBottom: spacing.sm,
  },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.badge,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.card,
  },
  filterBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  filterText: { fontSize: fontSize.small, fontWeight: '600', color: Colors.textSub },
  filterTextActive: { color: Colors.primary },
  list: { paddingTop: spacing.sm, paddingBottom: 100 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 72, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize.h2, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyDesc: { fontSize: fontSize.body, color: Colors.textSub },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.lg, backgroundColor: Colors.background,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  retestButton: {
    backgroundColor: Colors.wrong, borderRadius: radius.button,
    paddingVertical: 14, alignItems: 'center',
  },
  retestButtonText: { color: '#fff', fontSize: fontSize.button, fontWeight: '700' },
});
