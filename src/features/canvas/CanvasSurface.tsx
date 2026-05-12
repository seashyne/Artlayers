import { useCanvasController } from "../../hooks/useCanvasController";

export const CanvasSurface = () => {
  const { hostRef } = useCanvasController();

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 cursor-crosshair overflow-hidden bg-ink"
      role="application"
      aria-label="Drawing canvas"
    />
  );
};
