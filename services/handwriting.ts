import { Platform } from 'react-native';
import type { HandwritingResult } from '../types';

export const recognizeHandwriting = async (
  imageBase64: string,
  expectedChar: string,
  userStrokeCount?: number
): Promise<HandwritingResult> => {
  if (Platform.OS === 'web') {
    const { recognizeWeb } = await import('./handwriting.web');
    return recognizeWeb(imageBase64, expectedChar);
  }
  const { recognizeNative } = await import('./handwriting.native');
  return recognizeNative(imageBase64, expectedChar, userStrokeCount);
};
