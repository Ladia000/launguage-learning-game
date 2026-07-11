import strokeData from '../data/strokes/stroke_data.json';
import type { StrokeData } from '../types';

const strokeDataMap: Map<string, StrokeData> = new Map(
  (strokeData as StrokeData[]).map((entry) => [entry.character, entry])
);

export const getStrokeData = (hanzi: string): StrokeData | null => {
  const char = [...hanzi][0];
  if (!char) return null;
  return strokeDataMap.get(char) ?? null;
};

export const getStrokeCount = (hanzi: string): number => {
  const data = getStrokeData(hanzi);
  return data ? data.strokes.length : 0;
};

export const isStrokeDataAvailable = (hanzi: string): boolean => {
  const char = [...hanzi][0];
  if (!char) return false;
  return strokeDataMap.has(char);
};

export const getAllAvailableCharacters = (): string[] => {
  return [...strokeDataMap.keys()];
};
