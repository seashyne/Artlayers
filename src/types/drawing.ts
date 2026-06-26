export type Tool = "brush" | "eraser" | "pan" | "select" | "transform" | "shape" | "text" | "fill" | "eyedropper";

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
  type?: "image";
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

export interface ShapeNode {
  type: "shape";
  id: string;
  layerId: string;
  name: string;
  shape: "rectangle" | "ellipse" | "line";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface TextNode {
  type: "text";
  id: string;
  layerId: string;
  name: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  color: string;
  fontSize: number;
}

export type CanvasNode = ImageNode | ShapeNode | TextNode;

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  alphaLocked: boolean;
  clipped: boolean;
  opacity: number;
  strokes: Stroke[];
  nodes: CanvasNode[];
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
