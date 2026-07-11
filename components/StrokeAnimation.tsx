import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Line, G, Text as SvgText } from 'react-native-svg';
import { getStrokeData } from '@/services/strokeOrder';

interface Props {
  hanzi: string;
  size?: number;
  autoPlay?: boolean;
  showGrid?: boolean;
  onComplete?: () => void;
}

const AUTO_PLAY_INTERVAL_MS = 800;
const VIEWBOX_SIZE = 1024;

export function StrokeAnimation({
  hanzi,
  size = 200,
  autoPlay = true,
  showGrid = true,
  onComplete,
}: Props) {
  const strokeData = getStrokeData(hanzi);
  const totalStrokes = strokeData ? strokeData.strokes.length : 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    setCurrentIndex(0);
    hasCompletedRef.current = false;
  }, [hanzi]);

  useEffect(() => {
    if (!autoPlay || totalStrokes === 0 || currentIndex >= totalStrokes - 1) {
      return;
    }
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, totalStrokes - 1));
    }, AUTO_PLAY_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [autoPlay, currentIndex, totalStrokes]);

  useEffect(() => {
    if (totalStrokes === 0) return;
    if (currentIndex === totalStrokes - 1 && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete?.();
    }
  }, [currentIndex, totalStrokes, onComplete]);

  const handlePrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
  const handleNext = () =>
    setCurrentIndex((prev) => Math.min(prev + 1, totalStrokes - 1));
  const handleRestart = () => {
    setCurrentIndex(0);
    hasCompletedRef.current = false;
  };

  if (!strokeData || totalStrokes === 0) {
    return (
      <View style={[styles.fallback, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <SvgText
            x={size / 2}
            y={size / 2}
            fontSize={80}
            fill="#534AB7"
            textAnchor="middle"
            alignmentBaseline="central"
          >
            {hanzi}
          </SvgText>
        </Svg>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      >
        {showGrid && (
          <>
            <Line
              x1={VIEWBOX_SIZE / 2}
              y1={0}
              x2={VIEWBOX_SIZE / 2}
              y2={VIEWBOX_SIZE}
              stroke="#E5E7EB"
              strokeWidth={2}
            />
            <Line
              x1={0}
              y1={VIEWBOX_SIZE / 2}
              x2={VIEWBOX_SIZE}
              y2={VIEWBOX_SIZE / 2}
              stroke="#E5E7EB"
              strokeWidth={2}
            />
          </>
        )}
        <G transform="scale(1, -1) translate(0, -1024)">
          {strokeData.strokes.slice(0, currentIndex + 1).map((pathData, index) => (
            <Path
              key={index}
              d={pathData}
              fill={index === currentIndex ? '#534AB7' : '#1A1A2E'}
            />
          ))}
        </G>
      </Svg>

      <Text style={styles.progress}>
        {currentIndex + 1} / {totalStrokes}
      </Text>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, currentIndex === 0 && styles.buttonDisabled]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <Text style={styles.buttonText}>‹ 前へ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleRestart}>
          <Text style={styles.buttonText}>最初から</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            currentIndex === totalStrokes - 1 && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={currentIndex === totalStrokes - 1}
        >
          <Text style={styles.buttonText}>次へ ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  progress: {
    marginTop: 12,
    fontSize: 16,
    color: '#1A1A2E',
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EEF0FF',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#534AB7',
    fontWeight: '600',
    fontSize: 14,
  },
});
