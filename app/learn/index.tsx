import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet,
  Animated, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useWordStore } from '../../store/useWordStore';
import { useMistakeStore } from '../../store/useMistakeStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { AudioButton } from '../../components/AudioButton';
import { ProgressBar } from '../../components/ProgressBar';
import { StrokeAnimation } from '../../components/StrokeAnimation';
import { CoffeeBreakButton } from '../../components/CoffeeBreakButton';
import { Colors, fontSize, spacing, radius } from '../../constants/typography';
import type { Word } from '../../types';

type BackTab = 'meaning' | 'stroke' | 'example';

export default function LearnScreen() {
  const { t } = useTranslation();
  const { filteredWords } = useWordStore();
  const { markAsKnown } = useWordStore();
  const { recordMistake } = useMistakeStore();
  const { language } = useSettingsStore();

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [activeTab, setActiveTab] = useState<BackTab>('meaning');
  const flipAnim = useRef(new Animated.Value(0)).current;

  // 初回レンダリングはサーバー/クライアントで一致させるため未シャッフルの順序を使い、
  // マウント後（ハイドレーション完了後）に useEffect でシャッフルする
  // （render中に Math.random() を呼ぶと React Hydration Error #418 が発生するため）
  const [words, setWords] = useState<Word[]>(filteredWords);
  useEffect(() => {
    setWords([...filteredWords].sort(() => Math.random() - 0.5));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const current = words[index];

  const handleFlip = () => {
    Animated.spring(flipAnim, { toValue: flipped ? 0 : 1, useNativeDriver: false }).start();
    setFlipped(!flipped);
    setActiveTab('meaning');
  };

  const handleKnew = () => {
    markAsKnown(current.id);
    goNext();
  };

  const handleDidntKnow = () => {
    recordMistake(current, 'learn');
    goNext();
  };

  const goNext = () => {
    flipAnim.setValue(0);
    setFlipped(false);
    setActiveTab('meaning');
    if (index + 1 >= words.length) {
      setDone(true);
    } else {
      setIndex(index + 1);
    }
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  // opacity で中点以降に切り替え（backfaceVisibility が Web で効かない対策）
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity  = flipAnim.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [0, 0, 1, 1] });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const meaning = language === 'ja' ? current?.meaning_ja : current?.meaning_en;
  const example = language === 'ja' ? current?.example_ja : current?.example_en;
  const category = language === 'ja' ? current?.category_ja : current?.category_en;

  if (done) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>{t('learn.complete')}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.primaryButtonText}>{t('home.title')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!current) {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.back}>‹ {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('learn.title')}</Text>
        <CoffeeBreakButton />
      </View>

      <ProgressBar current={index + 1} total={words.length} />

      <TouchableOpacity style={styles.cardContainer} onPress={handleFlip} activeOpacity={1}>
        {/* Front — box-none lets the AudioButton child receive taps while the
            card background still bubbles to the parent flip handler */}
        <Animated.View
          pointerEvents={flipped ? 'none' : 'box-none'}
          style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontRotate }], opacity: frontOpacity }]}
        >
          <Text style={styles.levelBadge}>HSK {current.level}</Text>
          <Text style={styles.hanzi}>{current.hanzi}</Text>
          <View style={styles.audioRow}>
            <AudioButton hanzi={current.hanzi} />
          </View>
          <Text style={styles.tapHint}>{t('learn.tapHint')}</Text>
        </Animated.View>

        {/* Back */}
        <Animated.View
          pointerEvents={flipped ? 'box-none' : 'none'}
          style={[styles.card, styles.cardBack, { transform: [{ rotateY: backRotate }], opacity: backOpacity }]}
        >
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, styles.tabBorder, activeTab === 'meaning' && styles.tabActive]}
              onPress={() => setActiveTab('meaning')}
            >
              <Text style={[styles.tabText, activeTab === 'meaning' && styles.tabTextActive]}>
                {t('learn.tabMeaning')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, styles.tabBorder, activeTab === 'stroke' && styles.tabActive]}
              onPress={() => setActiveTab('stroke')}
            >
              <Text style={[styles.tabText, activeTab === 'stroke' && styles.tabTextActive]}>
                {t('learn.tabStroke')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'example' && styles.tabActive]}
              onPress={() => setActiveTab('example')}
            >
              <Text style={[styles.tabText, activeTab === 'example' && styles.tabTextActive]}>
                {t('learn.tabExample')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.backScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.backContent}>
            {activeTab === 'meaning' && (
              <>
                <Text style={styles.hanziBack}>{current.hanzi}</Text>
                <Text style={styles.pinyin}>{current.pinyin}</Text>
                <Text style={styles.meaning}>{meaning}</Text>
                {current.example && (
                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleLabel}>{t('learn.example')}</Text>
                    <Text style={styles.exampleText}>{current.example}</Text>
                    <Text style={styles.exampleTrans}>{example}</Text>
                  </View>
                )}
              </>
            )}

            {activeTab === 'stroke' && (
              <StrokeAnimation hanzi={current.hanzi} size={160} autoPlay={true} showGrid={true} />
            )}

            {activeTab === 'example' && (
              <View style={styles.exampleLargeBox}>
                <Text style={styles.exampleTextLarge}>{current.example}</Text>
                <Text style={styles.exampleTransLarge}>{example}</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>

      {flipped && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionButton, styles.actionDidnt]} onPress={handleDidntKnow}>
            <Text style={styles.actionTextDidnt}>{t('learn.didntKnow')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionKnew]} onPress={handleKnew}>
            <Text style={styles.actionTextKnew}>{t('learn.knew')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  back: { fontSize: fontSize.body, color: Colors.primary, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: fontSize.h2, fontWeight: '700', color: Colors.text },
  cardContainer: { flex: 1, marginHorizontal: spacing.lg, marginVertical: spacing.md },
  card: {
    position: 'absolute', width: '100%', height: '100%',
    backgroundColor: Colors.card, borderRadius: radius.card,
    padding: spacing.xl, alignItems: 'center', justifyContent: 'center',

    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
  },
  cardFront: {},
  cardBack: { justifyContent: 'flex-start' },
  tabBar: {
    flexDirection: 'row',
    height: 36,
    width: '100%',
    borderRadius: radius.small,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabBorder: {
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  tabActive: {
    backgroundColor: '#534AB7',
  },
  tabText: {
    fontSize: fontSize.small,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  backScroll: {
    flex: 1,
    width: '100%',
  },
  levelBadge: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: Colors.primaryLight, color: Colors.primary,
    fontSize: fontSize.small, fontWeight: '700', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: radius.badge,
  },
  hanzi: { fontSize: fontSize.hanzi, fontWeight: '700', color: Colors.text },
  audioRow: { marginTop: spacing.md },
  tapHint: { position: 'absolute', bottom: 20, fontSize: fontSize.small, color: Colors.textMuted },
  backContent: { alignItems: 'center', paddingVertical: spacing.md },
  hanziBack: { fontSize: 40, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  pinyin: { fontSize: fontSize.pinyin, color: Colors.wrong, fontWeight: '500', marginBottom: 12 },
  meaning: { fontSize: fontSize.h2, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  exampleBox: {
    marginTop: spacing.lg, backgroundColor: Colors.background, borderRadius: radius.small,
    padding: spacing.md, width: '100%',
  },
  exampleLabel: { fontSize: fontSize.small, color: Colors.textMuted, marginBottom: 4 },
  exampleText: { fontSize: fontSize.body, color: Colors.text, marginBottom: 4 },
  exampleTrans: { fontSize: fontSize.small, color: Colors.textSub },
  exampleLargeBox: { width: '100%', alignItems: 'center', paddingHorizontal: spacing.md },
  exampleTextLarge: { fontSize: fontSize.h1, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: spacing.md },
  exampleTransLarge: { fontSize: fontSize.h2, color: Colors.textSub, textAlign: 'center' },
  actions: {
    flexDirection: 'row', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg,
    paddingTop: spacing.sm, gap: 12,
  },
  actionButton: {
    flex: 1, borderRadius: radius.button, paddingVertical: 16,
    alignItems: 'center',
  },
  actionDidnt: { backgroundColor: Colors.wrongLight, borderWidth: 1.5, borderColor: Colors.wrong },
  actionKnew: { backgroundColor: Colors.correctLight, borderWidth: 1.5, borderColor: Colors.correct },
  actionTextDidnt: { color: Colors.wrong, fontSize: fontSize.button, fontWeight: '700' },
  actionTextKnew: { color: Colors.correct, fontSize: fontSize.button, fontWeight: '700' },
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  doneEmoji: { fontSize: 72, marginBottom: spacing.md },
  doneTitle: { fontSize: fontSize.h1, fontWeight: '700', color: Colors.text, marginBottom: spacing.xl },
  primaryButton: {
    backgroundColor: Colors.primary, borderRadius: radius.button,
    paddingVertical: 14, paddingHorizontal: 40,
  },
  primaryButtonText: { color: '#fff', fontSize: fontSize.button, fontWeight: '700' },
});
