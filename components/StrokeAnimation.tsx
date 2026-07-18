import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Svg, { Path, Line, G, Text as SvgText } from 'react-native-svg';
import { getStrokeData } from '@/services/strokeOrder';
import type { StrokeData } from '@/types';

interface Props {
  hanzi: string;
  size?: number;
  autoPlay?: boolean;
  showGrid?: boolean;
  onComplete?: () => void;
}

const AUTO_PLAY_INTERVAL_MS = 800;
const VIEWBOX_SIZE = 1024;

// makemeahanzi の座標系（Y軸が下から上）を SVG の座標系（Y軸が上から下）に変換する
// matrix(a,b,c,d,e,f) は (x,y) -> (a*x + c*y + e, b*x + d*y + f) に写像する
export const STROKE_GROUP_TRANSFORM = `matrix(1,0,0,-1,0,${VIEWBOX_SIZE})`;

export const getVisibleStrokes = <T,>(strokes: T[], currentIndex: number): T[] =>
  strokes.slice(0, currentIndex + 1);

interface CharacterInfo {
  char: string;
  data: StrokeData | null;
  steps: number;
  offset: number;
}

// hanzi を文字ごとに分解し、各文字のストロークデータ・ステップ数（画数。
// データがない文字は静的グリフ表示として1ステップ扱い）・全体の中での
// 開始オフセット（通し番号）を計算する。
const buildCharacterInfos = (hanzi: string): CharacterInfo[] => {
  let offset = 0;
  return [...hanzi].map((char) => {
    const data = getStrokeData(char);
    const steps = data ? data.strokes.length : 1;
    const info: CharacterInfo = { char, data, steps, offset };
    offset += steps;
    return info;
  });
};

export function StrokeAnimation({
  hanzi,
  size = 200,
  autoPlay = true,
  showGrid = true,
  onComplete,
}: Props) {
  const characterInfos = buildCharacterInfos(hanzi);
  const totalSteps = characterInfos.reduce((sum, info) => sum + info.steps, 0);
  const hasAnyStrokeData = characterInfos.some((info) => info.data !== null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    setCurrentIndex(0);
    hasCompletedRef.current = false;
  }, [hanzi]);

  useEffect(() => {
    if (!autoPlay || totalSteps === 0 || currentIndex >= totalSteps - 1) {
      return;
    }
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, totalSteps - 1));
    }, AUTO_PLAY_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [autoPlay, currentIndex, totalSteps, hanzi]);

  useEffect(() => {
    if (totalSteps === 0) return;
    if (currentIndex === totalSteps - 1 && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete?.();
    }
  }, [currentIndex, totalSteps, onComplete]);

  const handlePrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
  const handleNext = () =>
    setCurrentIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  const handleRestart = () => {
    setCurrentIndex(0);
    hasCompletedRef.current = false;
  };

  // 単語を構成する全ての文字でストロークデータが取得できない場合のみ、
  // 単語全体を大きな静的テキストとして表示するフォールバックを使う。
  if (!hasAnyStrokeData || totalSteps === 0) {
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

  const renderGrid = () => (
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
  );

  const renderCharacter = (info: CharacterInfo, key: string) => {
    const { data, steps, offset } = info;

    // ストロークデータがない文字: そのステップに到達したら静的グリフとして表示する
    if (!data) {
      const reached = currentIndex >= offset;
      return (
        <Svg
          key={key}
          width={size}
          height={size}
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        >
          {showGrid && renderGrid()}
          {reached && (
            <SvgText
              x={VIEWBOX_SIZE / 2}
              y={VIEWBOX_SIZE / 2}
              fontSize={700}
              fill="#534AB7"
              textAnchor="middle"
              alignmentBaseline="central"
            >
              {info.char}
            </SvgText>
          )}
        </Svg>
      );
    }

    // currentIndex（通し番号）をこの文字内のローカルなストロークindexに変換する。
    // まだこの文字に到達していない場合は -1（何も表示しない）、
    // すでにこの文字を通過している場合はその文字の最後のストロークまで表示する。
    const isActiveChar = currentIndex >= offset && currentIndex <= offset + steps - 1;
    const localIndex =
      currentIndex < offset ? -1 : Math.min(currentIndex - offset, steps - 1);
    const visibleStrokes = localIndex >= 0 ? getVisibleStrokes(data.strokes, localIndex) : [];

    return (
      <Svg
        key={key}
        width={size}
        height={size}
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      >
        {showGrid && renderGrid()}
        <G transform={STROKE_GROUP_TRANSFORM}>
          {visibleStrokes.map((pathData, index) => (
            <Path
              key={index}
              d={pathData}
              fill={isActiveChar && index === localIndex ? '#534AB7' : '#1A1A2E'}
            />
          ))}
        </G>
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={characterInfos.length > 1}
        style={styles.scrollRow}
        contentContainerStyle={styles.row}
      >
        {characterInfos.map((info, index) => renderCharacter(info, `${info.char}-${index}`))}
      </ScrollView>

      <Text style={styles.progress}>
        {currentIndex + 1} / {totalSteps}
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
            currentIndex === totalSteps - 1 && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={currentIndex === totalSteps - 1}
        >
          <Text style={styles.buttonText}>次へ ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollRow: {
    width: '100%',
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
