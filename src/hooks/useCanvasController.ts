import { useEffect, useMemo, useRef, type RefObject } from "react";
import { createBrushEngine } from "../engine/brush/brushEngine";
import { clampPointToCanvas, findNodeAtPoint, isPointInsideCanvas } from "../engine/canvas/bounds";
import { loadProject } from "../engine/storage/projectDb";
import { createPixiDrawingRenderer, type PixiDrawingRenderer } from "../renderer/pixiRenderer";
import { selectActiveLayer, selectProject, useAppStore } from "../store/appStore";
import type { CanvasNode, Point, Stroke } from "../types/drawing";
import { clamp } from "../utils/colors";
import { createId } from "../utils/ids";

interface CanvasController {
  hostRef: RefObject<HTMLDivElement | null>;
}

const downloadDataUrl = (url: string, filename: string): void => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
};

export const useCanvasController = (): CanvasController => {
  const hostRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<PixiDrawingRenderer | null>(null);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const nodeDragRef = useRef<{ nodeId: string; dx: number; dy: number } | null>(null);
  const shapeDraftRef = useRef<{ layerId: string; start: Point } | null>(null);
  const panRef = useRef<{ x: number; y: number } | null>(null);
  const spaceHeldRef = useRef(false);

  const brushEngine = useMemo(
    () => createBrushEngine(() => useAppStore.getState().brush),
    []
  );

  useEffect(() => {
    const renderer = createPixiDrawingRenderer();
    rendererRef.current = renderer;
    let mounted = true;

    const mount = async (): Promise<void> => {
      const host = hostRef.current;
      if (!host) {
        return;
      }
      await renderer.mount(host);
      if (!mounted) {
        return;
      }
      const storedProject = await loadProject();
      if (storedProject) {
        useAppStore.getState().hydrateProject(storedProject);
      }
      renderer.renderProject(selectProject(useAppStore.getState()));
    };

    void mount();
    const unsubscribe = useAppStore.subscribe((state) => renderer.renderProject(selectProject(state)));
    const resize = (): void => renderer.resize();
    const exportCanvas = (): void => downloadDataUrl(renderer.exportPng(), "artlayers-export.png");
    window.addEventListener("resize", resize);
    window.addEventListener("artlayers:export", exportCanvas);

    return () => {
      mounted = false;
      unsubscribe();
      window.removeEventListener("resize", resize);
      window.removeEventListener("artlayers:export", exportCanvas);
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    const down = (event: KeyboardEvent): void => {
      if (event.code === "Space") {
        spaceHeldRef.current = true;
      }
    };
    const up = (event: KeyboardEvent): void => {
      if (event.code === "Space") {
        spaceHeldRef.current = false;
        panRef.current = null;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const pointerDown = (event: PointerEvent): void => {
      const renderer = rendererRef.current;
      if (!renderer) {
        return;
      }
      host.setPointerCapture(event.pointerId);
      const state = useAppStore.getState();
      const shouldPan = spaceHeldRef.current || event.button === 1 || state.tool === "pan";
      const point = renderer.toWorldPoint(event.clientX, event.clientY);

      if (shouldPan) {
        panRef.current = { x: event.clientX, y: event.clientY };
        return;
      }

      const layer = selectActiveLayer(state);
      if (!layer || layer.locked || !layer.visible) {
        return;
      }

      if (state.tool === "select" || state.tool === "transform") {
        const node = findNodeAtPoint(layer.nodes, point);
        useAppStore.getState().setSelectedNode(node?.id ?? null);
        nodeDragRef.current = node ? { nodeId: node.id, dx: point.x - node.x, dy: point.y - node.y } : null;
        return;
      }

      if (!isPointInsideCanvas(point, state.canvas)) {
        return;
      }

      if (state.tool === "fill") {
        useAppStore.getState().setCanvas({ background: state.brush.color });
        return;
      }

      if (state.tool === "eyedropper") {
        const node = findNodeAtPoint(layer.nodes, point);
        const color = node?.type === "shape" ? node.fill : node?.type === "text" ? node.color : state.canvas.background;
        useAppStore.getState().setBrush({ color });
        return;
      }

      if (state.tool === "text") {
        const node: CanvasNode = {
          type: "text",
          id: createId("text"),
          layerId: layer.id,
          name: "Text",
          text: "Text",
          x: point.x,
          y: point.y,
          width: 280,
          height: 80,
          rotation: 0,
          opacity: 1,
          color: state.brush.color,
          fontSize: 48
        };
        useAppStore.getState().runCommand({ type: "ADD_NODE", node });
        useAppStore.getState().setSelectedNode(node.id);
        return;
      }

      if (state.tool === "shape") {
        shapeDraftRef.current = { layerId: layer.id, start: point };
        return;
      }

      activeStrokeRef.current = brushEngine.beginStroke(
        { x: point.x, y: point.y, pressure: event.pressure || 1 },
        layer.id,
        state.tool === "eraser" ? "eraser" : "brush"
      );
      renderer.previewStroke(activeStrokeRef.current);
    };

    const pointerMove = (event: PointerEvent): void => {
      const renderer = rendererRef.current;
      if (!renderer) {
        return;
      }

      if (panRef.current) {
        const previous = panRef.current;
        const dx = event.clientX - previous.x;
        const dy = event.clientY - previous.y;
        const camera = useAppStore.getState().camera;
        useAppStore.getState().setCamera({ ...camera, x: camera.x + dx, y: camera.y + dy });
        panRef.current = { x: event.clientX, y: event.clientY };
        return;
      }

      if (nodeDragRef.current) {
        const state = useAppStore.getState();
        const point = renderer.toWorldPoint(event.clientX, event.clientY);
        const clamped = clampPointToCanvas(point, state.canvas);
        useAppStore.getState().updateImageNode(nodeDragRef.current.nodeId, {
          x: clamped.x - nodeDragRef.current.dx,
          y: clamped.y - nodeDragRef.current.dy
        });
        return;
      }

      if (shapeDraftRef.current) {
        return;
      }

      const stroke = activeStrokeRef.current;
      if (!stroke) {
        return;
      }
      const point = renderer.toWorldPoint(event.clientX, event.clientY);
      const clamped = clampPointToCanvas(point, useAppStore.getState().canvas);
      activeStrokeRef.current = brushEngine.extendStroke(stroke, {
        x: clamped.x,
        y: clamped.y,
        pressure: event.pressure || 1
      });
      renderer.previewStroke(activeStrokeRef.current);
    };

    const pointerUp = (event: PointerEvent): void => {
      const renderer = rendererRef.current;
      panRef.current = null;
      nodeDragRef.current = null;
      const shapeDraft = shapeDraftRef.current;
      if (renderer && shapeDraft) {
        shapeDraftRef.current = null;
        const state = useAppStore.getState();
        const point = clampPointToCanvas(renderer.toWorldPoint(event.clientX, event.clientY), state.canvas);
        const width = Math.abs(point.x - shapeDraft.start.x);
        const height = Math.abs(point.y - shapeDraft.start.y);
        if (width > 4 || height > 4) {
          const node: CanvasNode = {
            type: "shape",
            id: createId("shape"),
            layerId: shapeDraft.layerId,
            name: "Rectangle",
            shape: "rectangle",
            x: (shapeDraft.start.x + point.x) / 2,
            y: (shapeDraft.start.y + point.y) / 2,
            width: Math.max(8, width),
            height: Math.max(8, height),
            rotation: 0,
            opacity: 1,
            fill: state.brush.color,
            stroke: state.brush.color,
            strokeWidth: 2
          };
          useAppStore.getState().runCommand({ type: "ADD_NODE", node });
          useAppStore.getState().setSelectedNode(node.id);
        }
      }
      const stroke = activeStrokeRef.current;
      if (!renderer || !stroke) {
        if (host.hasPointerCapture(event.pointerId)) {
          host.releasePointerCapture(event.pointerId);
        }
        return;
      }
      activeStrokeRef.current = null;
      renderer.clearPreview();
      useAppStore.getState().runCommand({ type: "ADD_STROKE", stroke: brushEngine.completeStroke(stroke) });
      if (host.hasPointerCapture(event.pointerId)) {
        host.releasePointerCapture(event.pointerId);
      }
    };

    const wheel = (event: WheelEvent): void => {
      event.preventDefault();
      const state = useAppStore.getState();
      const nextZoom = clamp(state.camera.zoom * (event.deltaY > 0 ? 0.9 : 1.1), 0.12, 8);
      useAppStore.getState().setCamera({ ...state.camera, zoom: nextZoom });
    };

    host.addEventListener("pointerdown", pointerDown);
    host.addEventListener("pointermove", pointerMove);
    host.addEventListener("pointerup", pointerUp);
    host.addEventListener("pointercancel", pointerUp);
    host.addEventListener("wheel", wheel, { passive: false });
    return () => {
      host.removeEventListener("pointerdown", pointerDown);
      host.removeEventListener("pointermove", pointerMove);
      host.removeEventListener("pointerup", pointerUp);
      host.removeEventListener("pointercancel", pointerUp);
      host.removeEventListener("wheel", wheel);
    };
  }, [brushEngine]);

  return { hostRef };
};
