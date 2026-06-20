import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, fontSize, radius } from '../constants/typography';
import type { MistakeRecord, Language } from '../types';

interface Props {
  record: MistakeRecord;
  language: Language;
  onPress: () => void;
}

export const WrongWordCard: React.FC<Props> = ({ record, language, onPress }) => {
  const meaning = language === 'ja' ? record.meaning_ja : record.meaning_en;
  const { mistakeCount } = record;

  const badgeStyle =
    mistakeCount >= 3 ? styles.badgeRed :
    mistakeCount === 2 ? styles.badgeOrange :
    styles.badgeGreen;

  const badgeTextStyle =
    mistakeCount >= 3 ? styles.badgeTextRed :
    mistakeCount === 2 ? styles.badgeTextOrange :
    styles.badgeTextGreen;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.left}>
        <Text style={styles.hanzi}>{record.hanzi}</Text>
        <Text style={styles.pinyin}>{record.pinyin}</Text>
        <Text style={styles.meaning} numberOfLines={1}>{meaning}</Text>
      </View>
      <View style={styles.right}>
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, badgeTextStyle]}>{mistakeCount}回</Text>
        </View>
        {record.isMastered && (
          <Text style={styles.mastered}>✓</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: radius.card,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  left: { flex: 1 },
  hanzi: { fontSize: fontSize.h2, fontWeight: '700', color: Colors.text },
  pinyin: { fontSize: fontSize.body, color: Colors.primary, marginTop: 2 },
  meaning: { fontSize: fontSize.small, color: Colors.textSub, marginTop: 2 },
  right: { alignItems: 'center', gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeRed: { backgroundColor: Colors.badgeRedBg },
  badgeOrange: { backgroundColor: Colors.badgeOrangeBg },
  badgeGreen: { backgroundColor: Colors.badgeGreenBg },
  badgeText: { fontSize: fontSize.small, fontWeight: '700' },
  badgeTextRed: { color: Colors.badgeRed },
  badgeTextOrange: { color: Colors.badgeOrange },
  badgeTextGreen: { color: Colors.badgeGreen },
  mastered: { fontSize: 16, color: Colors.correct },
});
