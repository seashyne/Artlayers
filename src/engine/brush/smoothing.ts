import type { Point } from "../../types/drawing";

export const distance = (a: Point, b: Point): number => Math.hypot(b.x - a.x, b.y - a.y);

const lerpPoint = (a: Point, b: Point, amount: number): Point => ({
  x: a.x + (b.x - a.x) * amount,
  y: a.y + (b.y - a.y) * amount,
  pressure: a.pressure + (b.pressure - a.pressure) * amount,
  time: a.time + (b.time - a.time) * amount
});

export const smoothPoint = (previous: Point, next: Point, smoothing: number): Point => {
  const keep = Math.max(0, Math.min(0.96, smoothing));
  return {
    x: previous.x * keep + next.x * (1 - keep),
    y: previous.y * keep + next.y * (1 - keep),
    pressure: previous.pressure * keep + next.pressure * (1 - keep),
    time: next.time
  };
};

export const stabilizePoint = (previous: Point | undefined, next: Point, stabilizer: number): Point => {
  if (!previous || stabilizer <= 0) {
    return next;
  }

  const distanceToTarget = distance(previous, next);
  const pull = Math.max(0.08, 1 - Math.min(0.88, stabilizer) * 0.82);
  const catchup = distanceToTarget > 80 ? 0.72 : pull;

  return {
    x: previous.x + (next.x - previous.x) * catchup,
    y: previous.y + (next.y - previous.y) * catchup,
    pressure: previous.pressure + (next.pressure - previous.pressure) * catchup,
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

export const shouldAppendPoint = (previous: Point | undefined, next: Point, brushSize: number): boolean => {
  if (!previous) {
    return true;
  }

  return distance(previous, next) >= Math.max(0.45, brushSize * 0.08);
};

export const polishStrokePoints = (points: Point[], smoothing: number): Point[] => {
  if (points.length < 3) {
    return points;
  }

  const iterations = smoothing > 0.55 ? 2 : 1;
  let polished = points;

  for (let pass = 0; pass < iterations; pass += 1) {
    const next: Point[] = [polished[0]];

    for (let index = 0; index < polished.length - 1; index += 1) {
      const current = polished[index];
      const target = polished[index + 1];
      next.push(lerpPoint(current, target, 0.28), lerpPoint(current, target, 0.72));
    }

    next.push(polished[polished.length - 1]);
    polished = next;
  }

  return polished;
};
