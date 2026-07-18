import { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, G, Line, Text as SvgText } from 'react-native-svg';
import { recognizeHandwriting } from '@/services/handwriting';
import type { HandwritingResult } from '@/types';

interface Props {
  expectedChar: string;
  size?: number;
  onResult?: (result: HandwritingResult) => void;
}

// タップしただけ（ドラッグなし）の見えない極小ストロークをノイズとして除外するための閾値（px）
const MIN_STROKE_DISTANCE = 3;

const strokeToPath = (stroke: string[]): string => stroke.join(' ');

const parseCommandPoint = (command: string): { x: number; y: number } => {
  const parts = command.split(' ');
  return { x: parseFloat(parts[1]), y: parseFloat(parts[2]) };
};

// ストロークを構成する各点間のユークリッド距離を合計した総移動距離を求める
const getStrokeDistance = (stroke: string[]): number => {
  let total = 0;
  for (let i = 1; i < stroke.length; i++) {
    const prev = parseCommandPoint(stroke[i - 1]);
    const curr = parseCommandPoint(stroke[i]);
    total += Math.hypot(curr.x - prev.x, curr.y - prev.y);
  }
  return total;
};

const getSampleFontScale = (hanzi: string): number => {
  if (hanzi.length === 1) return 0.28;
  if (hanzi.length === 2) return 0.16;
  return 0.12;
};

export function WriteCanvas({ expectedChar, size = 280, onResult }: Props) {
  const [strokes, setStrokes] = useState<string[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<string[]>([]);
  const [result, setResult] = useState<HandwritingResult | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const strokesRef = useRef<string[][]>([]);
  const currentStrokeRef = useRef<string[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentStrokeRef.current = [`M ${locationX} ${locationY}`];
        setCurrentStroke(currentStrokeRef.current);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentStrokeRef.current = [
          ...currentStrokeRef.current,
          `L ${locationX} ${locationY}`,
        ];
        setCurrentStroke(currentStrokeRef.current);
      },
      onPanResponderRelease: () => {
        // タップのみ（ドラッグなし・ごく僅かな移動）は見た目に何も描かれないのに
        // 画数だけ増える「ノイズストローク」になるため除外する
        if (
          currentStrokeRef.current.length > 0 &&
          getStrokeDistance(currentStrokeRef.current) >= MIN_STROKE_DISTANCE
        ) {
          strokesRef.current = [...strokesRef.current, currentStrokeRef.current];
          setStrokes(strokesRef.current);
        }
        currentStrokeRef.current = [];
        setCurrentStroke([]);
      },
    })
  ).current;

  const handleJudge = async () => {
    if (strokes.length === 0) return;
    setIsRecognizing(true);
    try {
      const res = await recognizeHandwriting('', expectedChar, strokes.length);
      setResult(res);
      onResult?.(res);
    } catch (e) {
      console.error('判定エラー:', e);
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleRetry = () => {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    setStrokes([]);
    setCurrentStroke([]);
    setResult(null);
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.canvas, { width: size, height: size }]}
        {...panResponder.panHandlers}
      >
        <Svg width={size} height={size}>
          <SvgText
            x={size / 2}
            y={size / 2}
            fontSize={size * getSampleFontScale(expectedChar)}
            fill="#534AB7"
            opacity={0.08}
            textAnchor="middle"
            alignmentBaseline="central"
          >
            {expectedChar}
          </SvgText>

          <Line x1={size / 2} y1={0} x2={size / 2} y2={size} stroke="#E5E7EB" strokeWidth={1} />
          <Line x1={0} y1={size / 2} x2={size} y2={size / 2} stroke="#E5E7EB" strokeWidth={1} />

          <G>
            {strokes.map((stroke, index) => (
              <Path
                key={index}
                d={strokeToPath(stroke)}
                stroke="#1A1A2E"
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {currentStroke.length > 0 && (
              <Path
                d={strokeToPath(currentStroke)}
                stroke="#1A1A2E"
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </G>
        </Svg>
      </View>

      {result && (
        <View style={styles.resultBox}>
          <Text
            style={[
              styles.resultText,
              result.isCorrect ? styles.resultCorrect : styles.resultWrong,
            ]}
          >
            {result.isCorrect ? '✓ 正解！' : '✗ もう一度'}
          </Text>
          <Text style={styles.confidenceText}>
            信頼度 {Math.round(result.confidence * 100)}%
          </Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={handleRetry}>
          <Text style={styles.buttonText}>やり直す</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleJudge}
          disabled={strokes.length === 0}
        >
          {isRecognizing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonTextPrimary}>判定</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  canvas: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultBox: {
    marginTop: 12,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 20,
    fontWeight: '700',
  },
  resultCorrect: {
    color: '#1D9E75',
  },
  resultWrong: {
    color: '#E24B4A',
  },
  confidenceText: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#EEF0FF',
    minWidth: 96,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#534AB7',
  },
  buttonText: {
    color: '#534AB7',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
