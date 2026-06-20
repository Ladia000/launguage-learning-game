import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, fontSize } from '../constants/typography';

interface Props {
  current: number;
  total: number;
  showText?: boolean;
}

export const ProgressBar: React.FC<Props> = ({ current, total, showText = true }) => {
  const progress = total > 0 ? Math.min(current / total, 1) : 0;
  return (
    <View style={styles.container}>
      {showText && (
        <Text style={styles.text}>{current} / {total}</Text>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 8 },
  text: { fontSize: fontSize.small, color: Colors.textSub, textAlign: 'right', marginBottom: 4 },
  track: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
});
