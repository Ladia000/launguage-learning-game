import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Path, G, Line, Text as SvgText } from 'react-native-svg';
import { getStrokeCount } from '@/services/strokeOrder';
import type { HandwritingResult } from '@/types';

interface Props {
  expectedChar: string;
  size?: number;
  onResult?: (result: HandwritingResult) => void;
}

// クリックしただけ（ドラッグなし）の見えない極小ストロークをノイズとして除外するための閾値（px）
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

  const currentStrokeRef = useRef<string[]>([]);
  const isDrawingRef = useRef<boolean>(false);
  // 不正解時に「判定」ボタンからブラウザのフォーカスを外し、「やり直す」ボタンへ移すためのref。
  // React Native の View は NativeMethods（focus/blur）を実装しているため any を使わず型安全に扱える。
  const retryButtonRef = useRef<View>(null);

  // 確定したストロークをコミットする。ドラッグなし（or ごく僅かな移動）のクリックは
  // 見た目には何も描かれないのに画数だけ増える「ノイズストローク」になるため除外する。
  const commitCurrentStroke = () => {
    const stroke = currentStrokeRef.current;
    if (stroke.length > 0 && getStrokeDistance(stroke) >= MIN_STROKE_DISTANCE) {
      setStrokes((prev) => [...prev, stroke]);
    }
    currentStrokeRef.current = [];
    setCurrentStroke([]);
  };

  const handlePointerDown = (e: ReactPointerEvent) => {
    // ブラウザ標準のテキスト選択・スクロール・ジェスチャー横取りを防ぐ
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    // ポインターキャプチャにより、要素の境界外に指・マウスが出ても
    // pointermove/pointerup が確実にこの要素に届くようになる
    target.setPointerCapture(e.pointerId);
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    isDrawingRef.current = true;
    const newStroke = [`M ${x} ${y}`];
    currentStrokeRef.current = newStroke;
    setCurrentStroke(newStroke);
  };

  const handlePointerMove = (e: ReactPointerEvent) => {
    if (!isDrawingRef.current) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const updated = [...currentStrokeRef.current, `L ${x} ${y}`];
    currentStrokeRef.current = updated;
    setCurrentStroke(updated);
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    commitCurrentStroke();
  };

  // ブラウザがジェスチャー（スクロール・ピンチ等）を横取りした場合などに発火する。
  // pointerup が来ないまま描画中のストロークが失われないよう、必ず確定させる。
  const handlePointerCancel = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    commitCurrentStroke();
  };

  const handleJudge = async () => {
    console.log('判定ボタン押下 strokes:', strokes.length);
    if (strokes.length === 0) {
      console.log('ストロークなし - スキップ');
      return;
    }
    setIsRecognizing(true);
    try {
      // Web版はストローク数比較方式を使用
      const expectedCount = getStrokeCount(expectedChar);
      console.log('期待画数:', expectedCount, 'ユーザー画数:', strokes.length);
      const diff = Math.abs(strokes.length - (expectedCount || strokes.length));
      const isCorrect = expectedCount === 0 || diff <= 1;
      const confidence = Math.max(0, 1 - diff * 0.2);
      const res: HandwritingResult = {
        recognized: expectedChar,
        confidence,
        isCorrect,
      };
      setResult(res);
      onResult?.(res);
      if (!res.isCorrect) {
        // 「判定」ボタンに残ったフォーカスを「やり直す」ボタンへ移し、
        // 不正解時に「判定」が選択状態のまま見えてしまう問題を防ぐ
        retryButtonRef.current?.focus();
      }
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
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          cursor: 'crosshair',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
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
        <TouchableOpacity ref={retryButtonRef} style={styles.button} onPress={handleRetry}>
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
