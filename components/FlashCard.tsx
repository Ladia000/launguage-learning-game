import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AudioButton } from './AudioButton';
import { Word } from '@/types';

interface Props {
  word: Word;
  language: 'ja' | 'en';
  isRevealed: boolean;
  onReveal: () => void;
}

export function FlashCard({ word, language, isRevealed, onReveal }: Props) {
  const meaning = language === 'ja' ? word.meaning_ja : word.meaning_en;
  const example = language === 'ja' ? word.example_ja : word.example_en;
  const category = language === 'ja' ? word.category_ja : word.category_en;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={!isRevealed ? onReveal : undefined}
      activeOpacity={isRevealed ? 1 : 0.85}
    >
      <View style={styles.header}>
        <Text style={styles.level}>HSK {word.level}</Text>
        <Text style={styles.category}>{category}</Text>
      </View>

      <View style={styles.hanziRow}>
        <Text style={styles.hanzi}>{word.hanzi}</Text>
        <AudioButton hanzi={word.hanzi} size={28} />
      </View>

      {isRevealed ? (
        <View style={styles.revealed}>
          <Text style={styles.pinyin}>{word.pinyin}</Text>
          <Text style={styles.meaning}>{meaning}</Text>
          <View style={styles.divider} />
          <Text style={styles.exampleChinese}>{word.example}</Text>
          <Text style={styles.exampleTrans}>{example}</Text>
        </View>
      ) : (
        <Text style={styles.hint}>タップして答えを確認</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    minHeight: 280,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  level: {
    fontSize: 13,
    color: '#534AB7',
    fontWeight: '600',
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  category: {
    fontSize: 13,
    color: '#6B7280',
  },
  hanziRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  hanzi: {
    fontSize: 56,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  hint: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
  },
  revealed: {
    alignItems: 'center',
    gap: 6,
  },
  pinyin: {
    fontSize: 20,
    color: '#534AB7',
    fontWeight: '500',
  },
  meaning: {
    fontSize: 22,
    color: '#1A1A2E',
    fontWeight: '600',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '80%',
    marginVertical: 8,
  },
  exampleChinese: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  exampleTrans: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});
