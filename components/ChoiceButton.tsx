import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Colors, fontSize, radius } from '../constants/typography';

type State = 'default' | 'correct' | 'wrong';

interface Props {
  label: string;
  state?: State;
  onPress: () => void;
  disabled?: boolean;
}

export const ChoiceButton: React.FC<Props> = ({
  label,
  state = 'default',
  onPress,
  disabled = false,
}) => {
  const bgColor =
    state === 'correct' ? Colors.correct :
    state === 'wrong'   ? Colors.wrong :
    Colors.card;

  const textColor =
    state === 'correct' || state === 'wrong' ? '#FFFFFF' : Colors.text;

  const borderColor =
    state === 'correct' ? Colors.correct :
    state === 'wrong'   ? Colors.wrong :
    Colors.border;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bgColor, borderColor }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      <Text style={[styles.label, { color: textColor }]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: radius.button,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 56,
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: '600',
    textAlign: 'center',
  },
});
