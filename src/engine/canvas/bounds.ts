import type { CanvasNode, CanvasSettings, Point } from "../../types/drawing";

export const isPointInsideCanvas = (point: Pick<Point, "x" | "y">, canvas: CanvasSettings): boolean => {
  return (
    point.x >= -canvas.width / 2 &&
    point.x <= canvas.width / 2 &&
    point.y >= -canvas.height / 2 &&
    point.y <= canvas.height / 2
  );
};

export const clampPointToCanvas = (point: Point, canvas: CanvasSettings): Point => ({
  ...point,
  x: Math.min(canvas.width / 2, Math.max(-canvas.width / 2, point.x)),
  y: Math.min(canvas.height / 2, Math.max(-canvas.height / 2, point.y))
});

export const findNodeAtPoint = (nodes: CanvasNode[], point: Pick<Point, "x" | "y">): CanvasNode | undefined => {
  return [...nodes].reverse().find((node) => {
    const left = node.x - node.width / 2;
    const right = node.x + node.width / 2;
    const top = node.y - node.height / 2;
    const bottom = node.y + node.height / 2;
    return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
  });
};
