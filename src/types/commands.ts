import type { CanvasNode, Layer, Stroke } from "./drawing";

export type Command =
  | {
      type: "ADD_STROKE";
      stroke: Stroke;
    }
  | {
      type: "REMOVE_LAYER";
      layer: Layer;
      index: number;
      nextActiveLayerId: string;
    }
  | {
      type: "ADD_LAYER";
      layer: Layer;
      index: number;
      previousActiveLayerId: string;
    }
  | {
      type: "CLEAR_LAYER";
      layerId: string;
      previousStrokes: Stroke[];
      previousNodes: CanvasNode[];
    }
  | {
      type: "ADD_NODE";
      node: CanvasNode;
    }
  | {
      type: "REMOVE_NODE";
      node: CanvasNode;
    };
