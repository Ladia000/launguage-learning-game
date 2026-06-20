import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, radius } from '../constants/typography';
import { speakChinese, stopSpeaking } from '../services/speech';

interface Props {
  hanzi: string;
  size?: number;
}

export const AudioButton: React.FC<Props> = ({ hanzi, size = 44 }) => {
  const [playing, setPlaying] = useState(false);

  const handlePress = () => {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    // speakChinese must be called synchronously in the click handler.
    // An await before this call loses the browser gesture context and
    // blocks Web Speech API (speechSynthesis.speak).
    speakChinese(hanzi);
    setPlaying(true);
    setTimeout(() => setPlaying(false), 2000);
  };

  return (
    <TouchableOpacity
      style={[styles.button, { width: size, height: size, borderRadius: size / 2 },
        playing && styles.playing]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {playing
        ? <ActivityIndicator size="small" color="#fff" />
        : <Text style={styles.icon}>🔊</Text>
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  playing: { backgroundColor: Colors.correct },
  icon: { fontSize: 20 },
});
