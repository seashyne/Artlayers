import type { Point } from "../../types/drawing";

const distance = (a: Point, b: Point): number => Math.hypot(b.x - a.x, b.y - a.y);

const lerpPoint = (a: Point, b: Point, amount: number): Point => ({
  x: a.x + (b.x - a.x) * amount,
  y: a.y + (b.y - a.y) * amount,
  pressure: a.pressure + (b.pressure - a.pressure) * amount,
  time: a.time + (b.time - a.time) * amount
});

export const smoothPoint = (previous: Point, next: Point, smoothing: number): Point => {
  const keep = Math.max(0, Math.min(0.92, smoothing));
  return {
    x: previous.x * keep + next.x * (1 - keep),
    y: previous.y * keep + next.y * (1 - keep),
    pressure: previous.pressure * keep + next.pressure * (1 - keep),
    time: next.time
  };
};

export const interpolateStrokePoints = (points: Point[], spacing: number): Point[] => {
  if (points.length < 2) {
    return points;
  }

  const interpolated: Point[] = [points[0]];

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const segmentLength = distance(previous, current);
    const steps = Math.max(1, Math.floor(segmentLength / spacing));

    for (let step = 1; step <= steps; step += 1) {
      interpolated.push(lerpPoint(previous, current, step / steps));
    }
  }

  return interpolated;
};
