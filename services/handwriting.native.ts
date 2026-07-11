import TextRecognition from '@react-native-ml-kit/text-recognition';
import type { HandwritingResult } from '../types';

export const recognizeNative = async (
  imageBase64: string,
  expectedChar: string
): Promise<HandwritingResult> => {
  try {
    const result = await TextRecognition.recognize(imageBase64);
    const recognized = result.text.trim().charAt(0);
    const isCorrect = recognized === expectedChar;
    return {
      recognized: recognized || '',
      confidence: isCorrect ? 0.95 : 0.3,
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
