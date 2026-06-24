import type { Layer } from "../../types/drawing";
import { createId } from "../../utils/ids";

export const createLayer = (name: string): Layer => ({
  id: createId("layer"),
  name,
  visible: true,
  locked: false,
  alphaLocked: false,
  clipped: false,
  opacity: 1,
  strokes: [],
  nodes: []
});

export const getNextActiveLayerId = (layers: Layer[], removedId: string): string => {
  const remaining = layers.filter((layer) => layer.id !== removedId);
  return remaining.at(-1)?.id ?? removedId;
};

export const duplicateLayer = (layer: Layer, name: string): Layer => {
  const id = createId("layer");

  return {
    ...layer,
    id,
    name,
    locked: false,
    strokes: layer.strokes.map((stroke) => ({
      ...stroke,
      id: createId("stroke"),
      layerId: id,
      points: stroke.points.map((point) => ({ ...point }))
    })),
    nodes: layer.nodes.map((node) => ({
      ...node,
      id: createId("node"),
      layerId: id,
      name: `${node.name} Copy`
    }))
  };
};
