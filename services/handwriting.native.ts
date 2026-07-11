import type { HandwritingResult } from '../types';
import { getStrokeCount } from './strokeOrder';

export const recognizeNative = async (
  _imageBase64: string,
  expectedChar: string,
  userStrokeCount?: number
): Promise<HandwritingResult> => {
  try {
    const expectedCount = getStrokeCount(expectedChar);

    // ストローク数データがない場合はスタブで返す
    if (expectedCount === 0) {
      return { recognized: expectedChar, confidence: 0.8, isCorrect: true };
    }

    // ユーザーのストローク数と期待値を比較（±1画の誤差を許容）
    const diff = Math.abs((userStrokeCount ?? 0) - expectedCount);
    const isCorrect = diff <= 1;
    const confidence = Math.max(0, 1 - diff * 0.2);

    return {
      recognized: expectedChar,
      confidence,
      isCorrect,
    };
  } catch {
    return {
      recognized: '',
      confidence: 0,
      isCorrect: false,
    };
  }
};
