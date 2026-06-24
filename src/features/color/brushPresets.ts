import type { BrushSettings } from "../../types/drawing";

export interface BrushPreset {
  id: string;
  name: string;
  brush: Pick<BrushSettings, "size" | "opacity" | "smoothing" | "stabilizer">;
}

export const brushPresets: BrushPreset[] = [
  { id: "ink", name: "Ink", brush: { size: 6, opacity: 1, smoothing: 0.62, stabilizer: 0.55 } },
  { id: "paint", name: "Paint", brush: { size: 18, opacity: 0.82, smoothing: 0.48, stabilizer: 0.28 } },
  { id: "sketch", name: "Sketch", brush: { size: 4, opacity: 0.58, smoothing: 0.34, stabilizer: 0.12 } },
  { id: "lineart", name: "Line", brush: { size: 3, opacity: 1, smoothing: 0.72, stabilizer: 0.72 } }
];
