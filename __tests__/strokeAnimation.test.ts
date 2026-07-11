import { STROKE_GROUP_TRANSFORM, getVisibleStrokes } from '../components/StrokeAnimation';
import { getStrokeData, getStrokeCount, isStrokeDataAvailable } from '../services/strokeOrder';

interface Point {
  x: number;
  y: number;
}

const applySvgMatrix = (matrix: string, point: Point): Point => {
  const match = matrix.match(/matrix\(([^)]+)\)/);
  if (!match) throw new Error(`invalid matrix string: ${matrix}`);
  const [a, b, c, d, e, f] = match[1].split(',').map(Number);
  return {
    x: a * point.x + c * point.y + e,
    y: b * point.x + d * point.y + f,
  };
};

describe('StrokeAnimation matrix transform', () => {
  it('flips the Y axis: (x, y) -> (x, 1024 - y)', () => {
    expect(applySvgMatrix(STROKE_GROUP_TRANSFORM, { x: 100, y: 0 })).toEqual({ x: 100, y: 1024 });
    expect(applySvgMatrix(STROKE_GROUP_TRANSFORM, { x: 100, y: 512 })).toEqual({ x: 100, y: 512 });
    expect(applySvgMatrix(STROKE_GROUP_TRANSFORM, { x: 100, y: 1024 })).toEqual({ x: 100, y: 0 });
  });

  it('leaves the X coordinate unchanged', () => {
    expect(applySvgMatrix(STROKE_GROUP_TRANSFORM, { x: 0, y: 300 }).x).toBe(0);
    expect(applySvgMatrix(STROKE_GROUP_TRANSFORM, { x: 1024, y: 300 }).x).toBe(1024);
  });
});

describe('StrokeAnimation visible strokes (slice range)', () => {
  const strokes = ['s0', 's1', 's2', 's3', 's4'];

  it('returns the first stroke when currentIndex is 0', () => {
    const visible = getVisibleStrokes(strokes, 0);
    expect(visible).toHaveLength(1);
    expect(visible).toEqual(['s0']);
  });

  it('returns the first 3 strokes when currentIndex is 2', () => {
    const visible = getVisibleStrokes(strokes, 2);
    expect(visible).toHaveLength(3);
    expect(visible).toEqual(['s0', 's1', 's2']);
  });

  it('returns all strokes when currentIndex is the last index', () => {
    const visible = getVisibleStrokes(strokes, strokes.length - 1);
    expect(visible).toEqual(strokes);
  });
});

describe('strokeOrder data for 小', () => {
  it('getStrokeData returns non-null stroke data', () => {
    expect(getStrokeData('小')).not.toBeNull();
  });

  it('getStrokeCount returns a positive number', () => {
    expect(getStrokeCount('小')).toBeGreaterThan(0);
  });

  it('isStrokeDataAvailable returns true', () => {
    expect(isStrokeDataAvailable('小')).toBe(true);
  });
});
