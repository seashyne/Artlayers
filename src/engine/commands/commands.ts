import type { Command } from "../../types/commands";
import type { ProjectState } from "../../types/drawing";

export const executeCommand = (state: ProjectState, command: Command): ProjectState => {
  switch (command.type) {
    case "ADD_STROKE":
      return {
        ...state,
        layers: state.layers.map((layer) =>
          layer.id === command.stroke.layerId ? { ...layer, strokes: [...layer.strokes, command.stroke] } : layer
        )
      };
    case "ADD_LAYER": {
      const layers = [...state.layers];
      layers.splice(command.index, 0, command.layer);
      return { ...state, layers, activeLayerId: command.layer.id };
    }
    case "REMOVE_LAYER":
      return {
        ...state,
        layers: state.layers.filter((layer) => layer.id !== command.layer.id),
        activeLayerId: command.nextActiveLayerId
      };
    case "CLEAR_LAYER":
      return {
        ...state,
        layers: state.layers.map((layer) =>
          layer.id === command.layerId ? { ...layer, strokes: [] } : layer
        )
      };
  }
};

export const undoCommand = (state: ProjectState, command: Command): ProjectState => {
  switch (command.type) {
    case "ADD_STROKE":
      return {
        ...state,
        layers: state.layers.map((layer) =>
          layer.id === command.stroke.layerId
            ? { ...layer, strokes: layer.strokes.filter((stroke) => stroke.id !== command.stroke.id) }
            : layer
        )
      };
    case "ADD_LAYER":
      return {
        ...state,
        layers: state.layers.filter((layer) => layer.id !== command.layer.id),
        activeLayerId: command.previousActiveLayerId
      };
    case "REMOVE_LAYER": {
      const layers = [...state.layers];
      layers.splice(command.index, 0, command.layer);
      return { ...state, layers, activeLayerId: command.layer.id };
    }
    case "CLEAR_LAYER":
      return {
        ...state,
        layers: state.layers.map((layer) =>
          layer.id === command.layerId ? { ...layer, strokes: command.previousStrokes } : layer
        )
      };
  }
};
