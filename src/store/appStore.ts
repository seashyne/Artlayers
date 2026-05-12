import { create } from "zustand";
import type { Command } from "../types/commands";
import type { BrushSettings, Camera, Layer, ProjectState, Tool } from "../types/drawing";
import { executeCommand, undoCommand } from "../engine/commands/commands";
import { createLayer, getNextActiveLayerId } from "../engine/layers/layers";
import { saveProject } from "../engine/storage/projectDb";
import { clamp } from "../utils/colors";

interface AppState extends ProjectState {
  tool: Tool;
  brush: BrushSettings;
  undoStack: Command[];
  redoStack: Command[];
  setTool: (tool: Tool) => void;
  setBrush: (brush: Partial<BrushSettings>) => void;
  setCamera: (camera: Camera) => void;
  setActiveLayer: (layerId: string) => void;
  toggleLayerVisibility: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  runCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  addLayer: () => void;
  removeActiveLayer: () => void;
  clearActiveLayer: () => void;
  hydrateProject: (project: ProjectState) => void;
  persist: () => Promise<void>;
}

const baseLayer = createLayer("Layer 1");

export const useAppStore = create<AppState>((set, get) => ({
  layers: [baseLayer],
  activeLayerId: baseLayer.id,
  camera: { x: 0, y: 0, zoom: 1 },
  tool: "brush",
  brush: {
    color: "#f8fafc",
    size: 8,
    opacity: 1,
    smoothing: 0.52
  },
  undoStack: [],
  redoStack: [],
  setTool: (tool) => set({ tool }),
  setBrush: (brush) =>
    set((state) => ({
      brush: {
        ...state.brush,
        ...brush,
        size: brush.size === undefined ? state.brush.size : clamp(brush.size, 1, 96),
        opacity: brush.opacity === undefined ? state.brush.opacity : clamp(brush.opacity, 0.05, 1)
      }
    })),
  setCamera: (camera) => set({ camera }),
  setActiveLayer: (activeLayerId) => set({ activeLayerId }),
  toggleLayerVisibility: (layerId) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    })),
  setLayerOpacity: (layerId, opacity) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId ? { ...layer, opacity: clamp(opacity, 0.05, 1) } : layer
      )
    })),
  runCommand: (command) =>
    set((state) => ({
      ...executeCommand(state, command),
      undoStack: [...state.undoStack, command],
      redoStack: []
    })),
  undo: () =>
    set((state) => {
      const command = state.undoStack.at(-1);
      if (!command) {
        return state;
      }
      return {
        ...undoCommand(state, command),
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, command]
      };
    }),
  redo: () =>
    set((state) => {
      const command = state.redoStack.at(-1);
      if (!command) {
        return state;
      }
      return {
        ...executeCommand(state, command),
        undoStack: [...state.undoStack, command],
        redoStack: state.redoStack.slice(0, -1)
      };
    }),
  addLayer: () =>
    set((state) => {
      const layer = createLayer(`Layer ${state.layers.length + 1}`);
      const command: Command = {
        type: "ADD_LAYER",
        layer,
        index: state.layers.length,
        previousActiveLayerId: state.activeLayerId
      };
      return { ...executeCommand(state, command), undoStack: [...state.undoStack, command], redoStack: [] };
    }),
  removeActiveLayer: () =>
    set((state) => {
      if (state.layers.length <= 1) {
        return state;
      }
      const index = state.layers.findIndex((layer) => layer.id === state.activeLayerId);
      const layer = state.layers[index];
      if (!layer) {
        return state;
      }
      const command: Command = {
        type: "REMOVE_LAYER",
        layer,
        index,
        nextActiveLayerId: getNextActiveLayerId(state.layers, layer.id)
      };
      return { ...executeCommand(state, command), undoStack: [...state.undoStack, command], redoStack: [] };
    }),
  clearActiveLayer: () =>
    set((state) => {
      const layer = state.layers.find((candidate) => candidate.id === state.activeLayerId);
      if (!layer || layer.strokes.length === 0) {
        return state;
      }
      const command: Command = {
        type: "CLEAR_LAYER",
        layerId: layer.id,
        previousStrokes: layer.strokes
      };
      return { ...executeCommand(state, command), undoStack: [...state.undoStack, command], redoStack: [] };
    }),
  hydrateProject: (project) => set({ ...project, undoStack: [], redoStack: [] }),
  persist: async () => {
    const { layers, activeLayerId, camera } = get();
    await saveProject({ layers, activeLayerId, camera });
  }
}));

export const selectProject = (state: AppState): ProjectState => ({
  layers: state.layers,
  activeLayerId: state.activeLayerId,
  camera: state.camera
});

export const selectActiveLayer = (state: AppState): Layer | undefined => {
  return state.layers.find((layer) => layer.id === state.activeLayerId);
};
