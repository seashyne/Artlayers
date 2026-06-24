import type { BrushSettings, Point, Stroke } from "../../types/drawing";
import { createId } from "../../utils/ids";
import { interpolateStrokePoints, polishStrokePoints, shouldAppendPoint, smoothPoint, stabilizePoint } from "./smoothing";

export interface BrushEngine {
  beginStroke: (input: Omit<Point, "time">, layerId: string, tool: "brush" | "eraser") => Stroke;
  extendStroke: (stroke: Stroke, input: Omit<Point, "time">) => Stroke;
  completeStroke: (stroke: Stroke) => Stroke;
}

export const createBrushEngine = (getBrush: () => BrushSettings): BrushEngine => {
  const withTime = (input: Omit<Point, "time">): Point => ({ ...input, time: performance.now() });

  return {
    beginStroke: (input, layerId, tool) => {
      const brush = getBrush();
      const point = withTime(input);

      return {
        id: createId("stroke"),
        layerId,
        tool,
        color: brush.color,
        size: brush.size,
        opacity: brush.opacity,
        points: [point]
      };
    },
    extendStroke: (stroke, input) => {
      const brush = getBrush();
      const previous = stroke.points.at(-1);
      const next = withTime(input);
      const stabilized = stabilizePoint(previous, next, brush.stabilizer);
      const point = previous ? smoothPoint(previous, stabilized, brush.smoothing) : next;

      if (!shouldAppendPoint(previous, point, brush.size)) {
        return stroke;
      }

      return {
        ...stroke,
        points: [...stroke.points, point]
      };
    },
    completeStroke: (stroke) => {
      const brush = getBrush();
      const polished = polishStrokePoints(stroke.points, brush.smoothing);

      return {
        ...stroke,
        points: interpolateStrokePoints(polished, Math.max(0.9, stroke.size * 0.14))
      };
    }
  };
};
