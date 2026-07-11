import type { HandwritingResult } from '../types';

// TODO: TensorFlow.jsモデル読み込みに差し替え予定
// 現時点はスタブ実装（常に高スコアを返す）
export const recognizeWeb = async (
  imageBase64: string,
  expectedChar: string
): Promise<HandwritingResult> => {
  // 暫定: 0.5秒待機してスタブ結果を返す
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    recognized: expectedChar,
    confidence: 0.85,
    isCorrect: true,
  };
};
