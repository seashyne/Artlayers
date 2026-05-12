export type Tool = "brush" | "eraser" | "pan";

export type BlendModeName = "normal" | "erase";

export interface Point {
  x: number;
  y: number;
  pressure: number;
  time: number;
}

export interface BrushSettings {
  color: string;
  size: number;
  opacity: number;
  smoothing: number;
}

export interface Stroke {
  id: string;
  layerId: string;
  tool: Exclude<Tool, "pan">;
  color: string;
  size: number;
  opacity: number;
  points: Point[];
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  strokes: Stroke[];
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface ProjectState {
  layers: Layer[];
  activeLayerId: string;
  camera: Camera;
}
