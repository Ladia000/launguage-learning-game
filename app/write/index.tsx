import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useWordStore } from '../../store/useWordStore';
import { useWriteStore } from '../../store/useWriteStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { AudioButton } from '../../components/AudioButton';
import { StrokeAnimation } from '../../components/StrokeAnimation';
import { WriteCanvas } from '../../components/WriteCanvas';
import { CoffeeBreakButton } from '../../components/CoffeeBreakButton';
import { Colors, fontSize, spacing, radius } from '../../constants/typography';
import type { Word, HandwritingResult } from '../../types';

const MAX_WORDS = 10;
const AUTO_ADVANCE_DELAY_MS = 800;

type Tab = 'stroke' | 'practice';

export default function WriteScreen() {
  const { t } = useTranslation();
  const { filteredWords } = useWordStore();
  const { recordPractice } = useWriteStore();
  const { language } = useSettingsStore();
  const { width: windowWidth } = useWindowDimensions();
  // 画面幅に応じて練習キャンバスのサイズを可変にする（固定260pxだと
  // 広い画面で紙の領域が狭く見える・文字が窮屈になる問題への対応）
  const canvasSize = Math.min(Math.max(windowWidth - spacing.lg * 2 - 16, 260), 400);

  // 初回レンダリングはサーバー/クライアントで一致させるため未シャッフルの順序を使い、
  // マウント後（ハイドレーション完了後）に useEffect でシャッフルする
  // （render中に Math.random() を呼ぶと React Hydration Error #418 が発生するため）
  const [wordList, setWordList] = useState<Word[]>(filteredWords.slice(0, MAX_WORDS));
  useEffect(() => {
    setWordList([...filteredWords].sort(() => Math.random() - 0.5).slice(0, MAX_WORDS));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('stroke');
  const [results, setResults] = useState<HandwritingResult[]>([]);
  const [hasResult, setHasResult] = useState(false);
  const [done, setDone] = useState(false);

  const current = wordList[currentIndex];
  const meaning = language === 'ja' ? current?.meaning_ja : current?.meaning_en;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const goToNext = () => {
    setHasResult(false);
    setActiveTab('stroke');
    if (currentIndex + 1 >= wordList.length) {
      setDone(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleResult = (result: HandwritingResult) => {
    recordPractice(current.id, current.hanzi, result.confidence * 100);
    setResults((prev) => [...prev, result]);
    setHasResult(true);
    if (result.isCorrect) {
      setTimeout(goToNext, AUTO_ADVANCE_DELAY_MS);
    }
  };

  if (wordList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneTitle}>{t('review.empty')}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.primaryButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    const average =
      results.length > 0
        ? Math.round(
            (results.reduce((sum, r) => sum + r.confidence, 0) / results.length) * 100
          )
        : 0;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>{t('write.complete')}</Text>
          <Text style={styles.averageScore}>{t('write.avgAccuracy', { percent: average })}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.primaryButtonText}>{t('write.backHome')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.back}>‹ {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('write.title')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {wordList.length}
          </Text>
          <CoffeeBreakButton />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.wordCard}>
          <Text style={styles.hanzi}>{current.hanzi}</Text>
          <Text style={styles.pinyin}>{current.pinyin}</Text>
          <Text style={styles.meaning}>{meaning}</Text>
          <View style={styles.audioRow}>
            <AudioButton hanzi={current.hanzi} />
          </View>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, styles.tabBorder, activeTab === 'stroke' && styles.tabActive]}
            onPress={() => setActiveTab('stroke')}
          >
            <Text style={[styles.tabText, activeTab === 'stroke' && styles.tabTextActive]}>
              {t('write.tabStroke')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'practice' && styles.tabActive]}
            onPress={() => setActiveTab('practice')}
          >
            <Text style={[styles.tabText, activeTab === 'practice' && styles.tabTextActive]}>
              {t('write.tabPractice')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'stroke' && (
            <StrokeAnimation hanzi={current.hanzi} size={180} autoPlay={true} />
          )}
          {activeTab === 'practice' && (
            <WriteCanvas
              key={current.id}
              expectedChar={current.hanzi.charAt(0)}
              size={canvasSize}
              onResult={handleResult}
            />
          )}
        </View>

        {activeTab === 'practice' && (
          <TouchableOpacity
            style={[styles.nextButton, !hasResult && styles.nextButtonDisabled]}
            onPress={goToNext}
            disabled={!hasResult}
          >
            <Text style={styles.nextButtonText}>{t('write.next')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  back: { fontSize: fontSize.body, color: Colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: fontSize.h2, fontWeight: '700', color: Colors.text },
  progressText: { fontSize: fontSize.body, color: Colors.textSub, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  wordCard: {
    backgroundColor: Colors.card, borderRadius: radius.card, padding: spacing.lg,
    alignItems: 'center', marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  hanzi: { fontSize: fontSize.hanzi, fontWeight: '700', color: Colors.text },
  pinyin: { fontSize: fontSize.pinyin, color: Colors.primary, fontWeight: '500', marginTop: 4 },
  meaning: { fontSize: fontSize.h2, fontWeight: '600', color: Colors.text, marginTop: 4 },
  audioRow: { marginTop: spacing.sm },
  tabBar: {
    flexDirection: 'row',
    height: 36,
    borderRadius: radius.small,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabBorder: {
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: fontSize.small,
    fontWeight: '600',
    color: Colors.textSub,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabContent: {
    alignItems: 'center',
  },
  nextButton: {
    marginTop: spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: Colors.border,
  },
  nextButtonText: { color: '#fff', fontSize: fontSize.button, fontWeight: '700' },
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  doneEmoji: { fontSize: 72, marginBottom: spacing.md },
  doneTitle: { fontSize: fontSize.h1, fontWeight: '700', color: Colors.text, marginBottom: spacing.sm },
  averageScore: { fontSize: fontSize.h2, color: Colors.textSub, marginBottom: spacing.xl },
  primaryButton: {
    backgroundColor: Colors.primary, borderRadius: radius.button,
    paddingVertical: 14, paddingHorizontal: 40,
  },
  primaryButtonText: { color: '#fff', fontSize: fontSize.button, fontWeight: '700' },
});
