import { useEffect, useMemo, useRef, type RefObject } from "react";
import { createBrushEngine } from "../engine/brush/brushEngine";
import { loadProject } from "../engine/storage/projectDb";
import { createPixiDrawingRenderer, type PixiDrawingRenderer } from "../renderer/pixiRenderer";
import { selectActiveLayer, selectProject, useAppStore } from "../store/appStore";
import type { Stroke } from "../types/drawing";
import { clamp } from "../utils/colors";

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

      if (shouldPan) {
        panRef.current = { x: event.clientX, y: event.clientY };
        return;
      }

      const layer = selectActiveLayer(state);
      if (!layer || layer.locked || !layer.visible) {
        return;
      }

      const point = renderer.toWorldPoint(event.clientX, event.clientY);
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

      const stroke = activeStrokeRef.current;
      if (!stroke) {
        return;
      }
      const point = renderer.toWorldPoint(event.clientX, event.clientY);
      activeStrokeRef.current = brushEngine.extendStroke(stroke, {
        x: point.x,
        y: point.y,
        pressure: event.pressure || 1
      });
      renderer.previewStroke(activeStrokeRef.current);
    };

    const pointerUp = (event: PointerEvent): void => {
      const renderer = rendererRef.current;
      panRef.current = null;
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
