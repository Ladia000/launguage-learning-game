import { useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Path, G, Line, Text as SvgText } from 'react-native-svg';
import { recognizeHandwriting } from '@/services/handwriting';
import type { HandwritingResult } from '@/types';

interface Props {
  expectedChar: string;
  size?: number;
  onResult?: (result: HandwritingResult) => void;
}

const strokeToPath = (stroke: string[]): string => stroke.join(' ');

export function WriteCanvas({ expectedChar, size = 280, onResult }: Props) {
  const [strokes, setStrokes] = useState<string[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<string[]>([]);
  const [result, setResult] = useState<HandwritingResult | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const currentStrokeRef = useRef<string[]>([]);
  const isDrawingRef = useRef<boolean>(false);

  const handleMouseDown = (e: ReactMouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    isDrawingRef.current = true;
    const newStroke = [`M ${x} ${y}`];
    currentStrokeRef.current = newStroke;
    setCurrentStroke(newStroke);
  };

  const handleMouseMove = (e: ReactMouseEvent) => {
    if (!isDrawingRef.current) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const updated = [...currentStrokeRef.current, `L ${x} ${y}`];
    currentStrokeRef.current = updated;
    setCurrentStroke(updated);
  };

  const handleMouseUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    setStrokes((prev) => [...prev, currentStrokeRef.current]);
    currentStrokeRef.current = [];
    setCurrentStroke([]);
  };

  const handleMouseLeave = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentStrokeRef.current.length > 0) {
      setStrokes((prev) => [...prev, currentStrokeRef.current]);
      currentStrokeRef.current = [];
      setCurrentStroke([]);
    }
  };

  const handleJudge = async () => {
    if (strokes.length === 0) return;
    console.log('strokes:', strokes.length);
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
    currentStrokeRef.current = [];
    setStrokes([]);
    setCurrentStroke([]);
    setResult(null);
  };

  return (
    <View style={styles.container}>
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          overflow: 'hidden',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <Svg width={size} height={size}>
          <SvgText
            x={size / 2}
            y={size / 2}
            fontSize={size * 0.7}
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
      </div>

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
