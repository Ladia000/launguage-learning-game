import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Animated
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTestStore } from '../../store/useTestStore';
import { useWordStore } from '../../store/useWordStore';
import { useMistakeStore } from '../../store/useMistakeStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ChoiceButton } from '../../components/ChoiceButton';
import { ProgressBar } from '../../components/ProgressBar';
import { CoffeeBreakButton } from '../../components/CoffeeBreakButton';
import { Colors, fontSize, spacing, radius } from '../../constants/typography';

type ChoiceState = 'default' | 'correct' | 'wrong';

export default function TestScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = (params.mode === 'retest' ? 'retest' : 'test') as 'test' | 'retest';

  const { questions, currentIndex, isFinished, startTest, answerQuestion } = useTestStore();
  const { filteredWords, allWords } = useWordStore();
  const { recordMistake, recordCorrect } = useMistakeStore();
  const { language, quizCount } = useSettingsStore();

  const [choiceStates, setChoiceStates] = useState<Record<string, ChoiceState>>({});
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  // テスト初回開始（retestの場合はstoreに問題が入っているはずなのでスキップ）
  useEffect(() => {
    if (questions.length === 0) {
      startTest(filteredWords, allWords, quizCount, language, mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFinished) router.replace('/result');
  }, [isFinished]);

  const current = questions[currentIndex];
  if (!current) return null;

  const showFeedback = (type: 'correct' | 'wrong') => {
    setFeedback(type);
    Animated.sequence([
      Animated.timing(feedbackOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(500),
      Animated.timing(feedbackOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const handleChoice = (choice: string) => {
    if (answered) return;
    setAnswered(true);

    const isCorrect = choice === current.correctAnswer;

    const newStates: Record<string, ChoiceState> = {};
    current.choices.forEach((c) => {
      if (c === current.correctAnswer) newStates[c] = 'correct';
      else if (c === choice && !isCorrect) newStates[c] = 'wrong';
      else newStates[c] = 'default';
    });
    setChoiceStates(newStates);
    showFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      recordCorrect(current.word.id, mode);
    } else {
      recordMistake(current.word, mode);
    }

    setTimeout(() => {
      answerQuestion(isCorrect);
      setChoiceStates({});
      setAnswered(false);
      setFeedback(null);
    }, 800);
  };

  const feedbackMessage = feedback === 'correct'
    ? (Math.random() > 0.5 ? t('test.correct') : t('test.correct2'))
    : feedback === 'wrong'
    ? `${t('test.wrong')} — ${t('test.wrongAnswer', { answer: current.correctAnswer })}`
    : '';

  const feedbackBg = feedback === 'correct' ? Colors.correct : Colors.wrong;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={styles.back}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('test.title')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.questionNum}>{t('test.question', { current: currentIndex + 1, total: questions.length })}</Text>
          <CoffeeBreakButton />
        </View>
      </View>

      <ProgressBar current={currentIndex + 1} total={questions.length} showText={false} />

      {/* Question card */}
      <View style={styles.questionCard}>
        <Text style={styles.hanzi}>{current.word.hanzi}</Text>
        <Text style={styles.pinyin}>{current.word.pinyin}</Text>
        <Text style={styles.levelBadge}>HSK {current.word.level}</Text>
      </View>

      {/* Choices */}
      <View style={styles.choicesGrid}>
        {current.choices.map((choice) => (
          <ChoiceButton
            key={choice}
            label={choice}
            state={choiceStates[choice] ?? 'default'}
            onPress={() => handleChoice(choice)}
            disabled={answered}
          />
        ))}
      </View>

      {/* Feedback banner */}
      <Animated.View style={[styles.feedbackBanner, { backgroundColor: feedbackBg, opacity: feedbackOpacity }]}>
        <Text style={styles.feedbackText} numberOfLines={2}>{feedbackMessage}</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  back: { fontSize: 22, color: Colors.textSub, width: 32 },
  headerTitle: { fontSize: fontSize.h2, fontWeight: '700', color: Colors.text },
  questionNum: { fontSize: fontSize.small, color: Colors.textSub, width: 80, textAlign: 'right' },
  questionCard: {
    marginHorizontal: spacing.lg, marginVertical: spacing.md,
    backgroundColor: Colors.card, borderRadius: radius.card, padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  hanzi: { fontSize: fontSize.hanzi, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  pinyin: { fontSize: fontSize.pinyin, color: Colors.primary, fontWeight: '500' },
  levelBadge: {
    marginTop: 12, backgroundColor: Colors.primaryLight, color: Colors.primary,
    fontSize: fontSize.small, fontWeight: '700', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: radius.badge,
  },
  choicesGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: 10,
  },
  feedbackBanner: {
    position: 'absolute', bottom: 40, left: spacing.lg, right: spacing.lg,
    borderRadius: radius.card, padding: spacing.md, alignItems: 'center',
  },
  feedbackText: { color: '#fff', fontSize: fontSize.body, fontWeight: '700', textAlign: 'center' },
});
