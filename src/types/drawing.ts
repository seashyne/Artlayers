export type Tool = "brush" | "eraser" | "pan" | "select";

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
  stabilizer: number;
}

export interface Stroke {
  id: string;
  layerId: string;
  tool: "brush" | "eraser";
  color: string;
  size: number;
  opacity: number;
  points: Point[];
}

export interface ImageNode {
  id: string;
  layerId: string;
  name: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  alphaLocked: boolean;
  clipped: boolean;
  opacity: number;
  strokes: Stroke[];
  nodes: ImageNode[];
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

export interface CanvasSettings {
  width: number;
  height: number;
  background: string;
  showBounds: boolean;
}

export interface ProjectState {
  layers: Layer[];
  activeLayerId: string;
  camera: Camera;
  canvas: CanvasSettings;
}
