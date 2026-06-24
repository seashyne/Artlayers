import type { ImageNode, Layer, Stroke } from "./drawing";

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
      previousNodes: ImageNode[];
    }
  | {
      type: "ADD_NODE";
      node: ImageNode;
    }
  | {
      type: "REMOVE_NODE";
      node: ImageNode;
    };
