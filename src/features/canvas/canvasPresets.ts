import type { CanvasSettings } from "../../types/drawing";

export interface CanvasPreset {
  id: string;
  name: string;
  size: string;
  width: number;
  height: number;
  background: string;
}

export const canvasPresets: CanvasPreset[] = [
  { id: "screen", name: "Screen", size: "1920 x 1080", width: 1920, height: 1080, background: "#0f172a" },
  { id: "square", name: "Square", size: "2048 x 2048", width: 2048, height: 2048, background: "#111827" },
  { id: "poster", name: "Poster", size: "1440 x 2160", width: 1440, height: 2160, background: "#18181b" },
  { id: "tablet", name: "Tablet", size: "2732 x 2048", width: 2732, height: 2048, background: "#0b1120" }
];

export const canvasBackgrounds = ["#0f172a", "#111827", "#18181b", "#020617", "#fafafa", "#f8fafc"];

export const presetToCanvas = (preset: CanvasPreset): CanvasSettings => ({
  width: preset.width,
  height: preset.height,
  background: preset.background,
  showBounds: true
});
