import { create } from "zustand";
import type { Command } from "../types/commands";
import type { BrushSettings, Camera, CanvasNode, CanvasSettings, Layer, ProjectState, Tool } from "../types/drawing";
import { executeCommand, undoCommand } from "../engine/commands/commands";
import { createLayer, duplicateLayer, getNextActiveLayerId } from "../engine/layers/layers";
import { saveProject } from "../engine/storage/projectDb";
import { clamp } from "../utils/colors";

interface AppState extends ProjectState {
  tool: Tool;
  brush: BrushSettings;
  selectedNodeId: string | null;
  undoStack: Command[];
  redoStack: Command[];
  setTool: (tool: Tool) => void;
  setBrush: (brush: Partial<BrushSettings>) => void;
  setCamera: (camera: Camera) => void;
  setCanvas: (canvas: Partial<CanvasSettings>) => void;
  createCanvas: (canvas: CanvasSettings) => void;
  setSelectedNode: (nodeId: string | null) => void;
  addImageNode: (node: CanvasNode) => void;
  updateImageNode: (nodeId: string, patch: Record<string, unknown>) => void;
  removeSelectedNode: () => void;
  setActiveLayer: (layerId: string) => void;
  renameLayer: (layerId: string, name: string) => void;
  toggleLayerLock: (layerId: string) => void;
  toggleLayerVisibility: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  toggleLayerAlphaLock: (layerId: string) => void;
  toggleLayerClipping: (layerId: string) => void;
  runCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  addLayer: () => void;
  duplicateActiveLayer: () => void;
  moveActiveLayer: (direction: -1 | 1) => void;
  removeActiveLayer: () => void;
  clearActiveLayer: () => void;
  hydrateProject: (project: ProjectState) => void;
  persist: () => Promise<void>;
}

const baseLayer = createLayer("Layer 1");
const defaultCanvas: CanvasSettings = {
  width: 1920,
  height: 1080,
  background: "#0f172a",
  showBounds: true
};

export const useAppStore = create<AppState>((set, get) => ({
  layers: [baseLayer],
  activeLayerId: baseLayer.id,
  camera: { x: 0, y: 0, zoom: 1, rotation: 0 },
  canvas: defaultCanvas,
  tool: "brush",
  brush: {
    color: "#f8fafc",
    size: 8,
    opacity: 1,
    smoothing: 0.58,
    stabilizer: 0.35
  },
  selectedNodeId: null,
  undoStack: [],
  redoStack: [],
  setTool: (tool) => set({ tool }),
  setBrush: (brush) =>
    set((state) => ({
      brush: {
        ...state.brush,
        ...brush,
        size: brush.size === undefined ? state.brush.size : clamp(brush.size, 1, 96),
        opacity: brush.opacity === undefined ? state.brush.opacity : clamp(brush.opacity, 0.05, 1),
        smoothing: brush.smoothing === undefined ? state.brush.smoothing : clamp(brush.smoothing, 0, 0.95),
        stabilizer: brush.stabilizer === undefined ? state.brush.stabilizer : clamp(brush.stabilizer, 0, 0.9)
      }
    })),
  setCamera: (camera) => set({ camera: { ...camera, rotation: clamp(camera.rotation, -180, 180) } }),
  setCanvas: (canvas) =>
    set((state) => ({
      canvas: {
        ...state.canvas,
        ...canvas,
        width: canvas.width === undefined ? state.canvas.width : Math.round(clamp(canvas.width, 256, 8192)),
        height: canvas.height === undefined ? state.canvas.height : Math.round(clamp(canvas.height, 256, 8192))
      }
    })),
  createCanvas: (canvas) => {
    const layer = createLayer("Layer 1");
    set({
      layers: [layer],
      activeLayerId: layer.id,
      camera: { x: 0, y: 0, zoom: 1, rotation: 0 },
      canvas: {
        ...canvas,
        width: Math.round(clamp(canvas.width, 256, 8192)),
        height: Math.round(clamp(canvas.height, 256, 8192))
      },
      undoStack: [],
      redoStack: [],
      selectedNodeId: null
    });
  },
  setSelectedNode: (selectedNodeId) => set({ selectedNodeId }),
  addImageNode: (node) =>
    set((state) => ({
      ...executeCommand(state, { type: "ADD_NODE", node }),
      selectedNodeId: node.id,
      undoStack: [...state.undoStack, { type: "ADD_NODE", node }],
      redoStack: []
    })),
  updateImageNode: (nodeId, patch) =>
    set((state) => ({
      layers: state.layers.map((layer) => ({
        ...layer,
        nodes: layer.nodes.map((node) => (node.id === nodeId ? ({ ...node, ...patch } as CanvasNode) : node))
      }))
    })),
  removeSelectedNode: () =>
    set((state) => {
      const node = state.layers.flatMap((layer) => layer.nodes).find((candidate) => candidate.id === state.selectedNodeId);
      if (!node) {
        return state;
      }
      const command: Command = { type: "REMOVE_NODE", node };
      return { ...executeCommand(state, command), selectedNodeId: null, undoStack: [...state.undoStack, command], redoStack: [] };
    }),
  setActiveLayer: (activeLayerId) => set({ activeLayerId }),
  renameLayer: (layerId, name) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId ? { ...layer, name: name.trimStart().slice(0, 48) || layer.name } : layer
      )
    })),
  toggleLayerLock: (layerId) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      )
    })),
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
  toggleLayerAlphaLock: (layerId) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId ? { ...layer, alphaLocked: !layer.alphaLocked } : layer
      )
    })),
  toggleLayerClipping: (layerId) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === layerId ? { ...layer, clipped: !layer.clipped } : layer
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
  duplicateActiveLayer: () =>
    set((state) => {
      const index = state.layers.findIndex((layer) => layer.id === state.activeLayerId);
      const layer = state.layers[index];
      if (!layer) {
        return state;
      }
      const copy = duplicateLayer(layer, `${layer.name} Copy`);
      const command: Command = {
        type: "ADD_LAYER",
        layer: copy,
        index: index + 1,
        previousActiveLayerId: state.activeLayerId
      };
      return { ...executeCommand(state, command), undoStack: [...state.undoStack, command], redoStack: [] };
    }),
  moveActiveLayer: (direction) =>
    set((state) => {
      const index = state.layers.findIndex((layer) => layer.id === state.activeLayerId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= state.layers.length) {
        return state;
      }
      const layers = [...state.layers];
      const [layer] = layers.splice(index, 1);
      layers.splice(targetIndex, 0, layer);
      return { layers };
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
      if (!layer || (layer.strokes.length === 0 && layer.nodes.length === 0)) {
        return state;
      }
      const command: Command = {
        type: "CLEAR_LAYER",
        layerId: layer.id,
        previousStrokes: layer.strokes,
        previousNodes: layer.nodes
      };
      return { ...executeCommand(state, command), undoStack: [...state.undoStack, command], redoStack: [] };
    }),
  hydrateProject: (project) =>
    set({
      ...project,
      camera: { ...project.camera, rotation: project.camera.rotation ?? 0 },
      canvas: project.canvas ?? defaultCanvas,
      layers: project.layers.map((layer) => ({
        ...layer,
        alphaLocked: layer.alphaLocked ?? false,
        clipped: layer.clipped ?? false,
        nodes: layer.nodes ?? []
      })),
      undoStack: [],
      redoStack: [],
      selectedNodeId: null
    }),
  persist: async () => {
    const { layers, activeLayerId, camera, canvas } = get();
    await saveProject({ layers, activeLayerId, camera, canvas });
  }
}));

export const selectProject = (state: AppState): ProjectState => ({
  layers: state.layers,
  activeLayerId: state.activeLayerId,
  camera: state.camera,
  canvas: state.canvas
});

export const selectActiveLayer = (state: AppState): Layer | undefined => {
  return state.layers.find((layer) => layer.id === state.activeLayerId);
};
