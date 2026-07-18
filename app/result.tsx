import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet,
  ScrollView, Animated
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTestStore } from '../store/useTestStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { CoffeeBreakButton } from '../components/CoffeeBreakButton';
import { Colors, fontSize, spacing, radius } from '../constants/typography';

export default function ResultScreen() {
  const { t } = useTranslation();
  const { questions, answers, score, scorePercent, wrongWords, startTest, reset } = useTestStore();
  const { language, selectedLevels, quizCount } = useSettingsStore();
  const wobble = useRef(new Animated.Value(0)).current;
  const scaleIn = useRef(new Animated.Value(0)).current;

  const s = score();
  const pct = scorePercent();
  const total = answers.length;
  const isPerfect = total > 0 && s === total;
  const wrongs = wrongWords();

  const evaluationKey =
    pct >= 90 ? 'result.excellent' :
    pct >= 60 ? 'result.good' :
    'result.keep';

  const nextLevel = Math.max(...selectedLevels) + 1;

  useEffect(() => {
    if (isPerfect) {
      Animated.spring(scaleIn, { toValue: 1, friction: 4, useNativeDriver: true }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(wobble, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.timing(wobble, { toValue: -1, duration: 250, useNativeDriver: true }),
          Animated.timing(wobble, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.delay(1000),
        ])
      ).start();
    }
  }, [isPerfect, wobble, scaleIn]);

  const wobbleRotate = wobble.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-6deg', '0deg', '6deg'],
  });

  const handleRetest = () => {
    const allWords = questions.map((q) => q.word);
    startTest(wrongs, allWords, wrongs.length, language, 'retest');
    router.replace('/test');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.coffeeHeader}>
        <CoffeeBreakButton />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {isPerfect ? (
          /* 満点画面 */
          <View style={styles.perfectSection}>
            <Animated.View style={[styles.badgeWrap, { transform: [{ scale: scaleIn }, { rotate: wobbleRotate }] }]}>
              <Text style={styles.badgeStar}>★</Text>
            </Animated.View>
            <Text style={styles.badgeLabel}>{t('result.perfectBadge')}</Text>
            <Text style={styles.perfectTitle}>{t('result.perfect')}</Text>
            <Text style={styles.perfectSub}>{t('result.perfectSub')}</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreText}>{t('result.score', { score: s, total })}</Text>
              <Text style={styles.accuracy}> — {t('result.accuracy', { percent: 100 })}</Text>
            </View>
            {nextLevel <= 6 && (
              <Text style={styles.nextChallenge}>
                {t('result.nextChallenge', { level: nextLevel })}
              </Text>
            )}
          </View>
        ) : (
          /* 通常結果 */
          <View style={styles.normalSection}>
            {/* スコアリング */}
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreCircleMain}>{s}</Text>
              <Text style={styles.scoreCircleDivider}>/</Text>
              <Text style={styles.scoreCircleTotal}>{total}</Text>
            </View>
            <Text style={styles.accuracyLarge}>{pct}%</Text>
            <Text style={styles.evalMessage}>{t(evaluationKey)}</Text>
          </View>
        )}

        {/* 間違い一覧 */}
        {wrongs.length > 0 && (
          <View style={styles.wrongSection}>
            <Text style={styles.wrongTitle}>{t('result.wrongList')}</Text>
            {wrongs.map((w) => (
              <View key={w.id} style={styles.wrongItem}>
                <Text style={styles.wrongHanzi}>{w.hanzi}</Text>
                <Text style={styles.wrongMeaning}>
                  {language === 'ja' ? w.meaning_ja : w.meaning_en}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* アクションボタン */}
        <View style={styles.actions}>
          {wrongs.length > 0 && (
            <TouchableOpacity style={styles.retestButton} onPress={handleRetest}>
              <Text style={styles.retestButtonText}>{t('result.retestWrong')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => { reset(); router.replace('/'); }}
          >
            <Text style={styles.homeButtonText}>{t('result.backHome')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  coffeeHeader: {
    flexDirection: 'row', justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md,
  },
  scroll: { paddingBottom: 40 },
  perfectSection: { alignItems: 'center', paddingTop: 40, paddingHorizontal: spacing.lg },
  badgeWrap: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.goldBadge, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.goldBadge, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  badgeStar: { fontSize: 64, color: '#fff' },
  badgeLabel: {
    fontSize: fontSize.body, fontWeight: '700', color: Colors.goldBadgeDark,
    marginBottom: 8,
  },
  perfectTitle: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  perfectSub: { fontSize: fontSize.h2, color: Colors.textSub, marginBottom: 16, textAlign: 'center' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  scoreText: { fontSize: fontSize.h2, fontWeight: '700', color: Colors.text },
  accuracy: { fontSize: fontSize.body, color: Colors.textSub },
  nextChallenge: {
    marginTop: 8, fontSize: fontSize.body, color: Colors.primary, fontWeight: '600',
    textAlign: 'center',
  },
  normalSection: { alignItems: 'center', paddingTop: 40, paddingBottom: 24 },
  scoreCircle: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 6, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
    marginBottom: 16,
  },
  scoreCircleMain: { fontSize: 48, fontWeight: '800', color: Colors.primary },
  scoreCircleDivider: { fontSize: 24, color: Colors.textMuted, marginHorizontal: 4 },
  scoreCircleTotal: { fontSize: 24, fontWeight: '600', color: Colors.textSub },
  accuracyLarge: { fontSize: fontSize.h1, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  evalMessage: { fontSize: fontSize.h2, color: Colors.textSub },
  wrongSection: {
    marginHorizontal: spacing.lg, marginTop: spacing.lg,
    backgroundColor: Colors.card, borderRadius: radius.card, padding: spacing.md,
  },
  wrongTitle: { fontSize: fontSize.body, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  wrongItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  wrongHanzi: { fontSize: fontSize.h2, fontWeight: '700', color: Colors.text, width: 80 },
  wrongMeaning: { flex: 1, fontSize: fontSize.body, color: Colors.textSub },
  actions: {
    paddingHorizontal: spacing.lg, marginTop: spacing.xl, gap: 12,
  },
  retestButton: {
    backgroundColor: Colors.wrong, borderRadius: radius.button,
    paddingVertical: 14, alignItems: 'center',
  },
  retestButtonText: { color: '#fff', fontSize: fontSize.button, fontWeight: '700' },
  homeButton: {
    backgroundColor: Colors.primary, borderRadius: radius.button,
    paddingVertical: 14, alignItems: 'center',
  },
  homeButtonText: { color: '#fff', fontSize: fontSize.button, fontWeight: '700' },
});
