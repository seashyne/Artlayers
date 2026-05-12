import type { BrushSettings, Point, Stroke, Tool } from "../../types/drawing";
import { createId } from "../../utils/ids";
import { interpolateStrokePoints, smoothPoint } from "./smoothing";

export interface BrushEngine {
  beginStroke: (input: Omit<Point, "time">, layerId: string, tool: Exclude<Tool, "pan">) => Stroke;
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
      const point = previous ? smoothPoint(previous, next, brush.smoothing) : next;

      return {
        ...stroke,
        points: [...stroke.points, point]
      };
    },
    completeStroke: (stroke) => ({
      ...stroke,
      points: interpolateStrokePoints(stroke.points, Math.max(1.5, stroke.size * 0.2))
    })
  };
};
