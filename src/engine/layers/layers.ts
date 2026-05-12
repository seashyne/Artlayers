import type { Layer } from "../../types/drawing";
import { createId } from "../../utils/ids";

export const createLayer = (name: string): Layer => ({
  id: createId("layer"),
  name,
  visible: true,
  locked: false,
  opacity: 1,
  strokes: []
});

export const getNextActiveLayerId = (layers: Layer[], removedId: string): string => {
  const remaining = layers.filter((layer) => layer.id !== removedId);
  return remaining.at(-1)?.id ?? removedId;
};
