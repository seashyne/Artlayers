import { Application, Container, Graphics } from "pixi.js";
import type { Camera, Layer, Point, ProjectState, Stroke } from "../types/drawing";
import { hexToNumber } from "../utils/colors";

export interface PixiDrawingRenderer {
  mount: (host: HTMLDivElement) => Promise<void>;
  renderProject: (project: ProjectState) => void;
  previewStroke: (stroke: Stroke) => void;
  clearPreview: () => void;
  toWorldPoint: (clientX: number, clientY: number) => Point;
  exportPng: () => string;
  resize: () => void;
  destroy: () => void;
}

const canvasBackground = "#0a0d13";
const gridColor = 0x242a35;
const majorGridColor = 0x323a49;

export const createPixiDrawingRenderer = (): PixiDrawingRenderer => {
  let app: Application | null = null;
  let hostElement: HTMLDivElement | null = null;
  let world = new Container();
  let layerRoot = new Container();
  let previewRoot = new Container();
  let grid = new Graphics();
  let camera: Camera = { x: 0, y: 0, zoom: 1 };
  let pendingProject: ProjectState | null = null;
  let frameId: number | null = null;

  const assertApp = (): Application => {
    if (!app) {
      throw new Error("Pixi renderer has not been mounted.");
    }
    return app;
  };

  const schedule = (callback: () => void): void => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
    }
    frameId = requestAnimationFrame(() => {
      frameId = null;
      callback();
    });
  };

  const updateCamera = (): void => {
    const pixiApp = assertApp();
    world.position.set(pixiApp.renderer.width / 2 + camera.x, pixiApp.renderer.height / 2 + camera.y);
    world.scale.set(camera.zoom);
  };

  const drawGrid = (): void => {
    const pixiApp = assertApp();
    const width = pixiApp.renderer.width;
    const height = pixiApp.renderer.height;
    const gridSize = 64 * camera.zoom;
    const majorEvery = gridSize * 4;
    const offsetX = (width / 2 + camera.x) % gridSize;
    const offsetY = (height / 2 + camera.y) % gridSize;

    // The grid is screen-space and recalculated from camera state so panning stays crisp at WebGL scale.
    grid.clear();
    for (let x = offsetX; x < width; x += gridSize) {
      const major = Math.abs((x - offsetX) % majorEvery) < 0.1;
      grid.moveTo(x, 0).lineTo(x, height).stroke({ color: major ? majorGridColor : gridColor, alpha: 0.38, width: 1 });
    }
    for (let y = offsetY; y < height; y += gridSize) {
      const major = Math.abs((y - offsetY) % majorEvery) < 0.1;
      grid.moveTo(0, y).lineTo(width, y).stroke({ color: major ? majorGridColor : gridColor, alpha: 0.38, width: 1 });
    }
  };

  const strokeToGraphics = (stroke: Stroke): Graphics => {
    const graphics = new Graphics();
    const points = stroke.points;
    const color = stroke.tool === "eraser" ? hexToNumber(canvasBackground) : hexToNumber(stroke.color);

    if (points.length === 1) {
      const point = points[0];
      graphics.circle(point.x, point.y, Math.max(1, stroke.size * point.pressure * 0.5)).fill({
        color,
        alpha: stroke.opacity
      });
      return graphics;
    }

    graphics.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index += 1) {
      graphics.lineTo(points[index].x, points[index].y);
    }
    graphics.stroke({
      color,
      alpha: stroke.opacity,
      width: stroke.size,
      cap: "round",
      join: "round"
    });
    return graphics;
  };

  const renderLayer = (layer: Layer): Container => {
    const container = new Container();
    container.label = layer.name;
    container.alpha = layer.opacity;
    container.visible = layer.visible;
    layer.strokes.forEach((stroke) => container.addChild(strokeToGraphics(stroke)));
    return container;
  };

  const renderNow = (): void => {
    if (!pendingProject) {
      return;
    }
    camera = pendingProject.camera;
    layerRoot.removeChildren();
    pendingProject.layers.forEach((layer) => layerRoot.addChild(renderLayer(layer)));
    updateCamera();
    drawGrid();
    pendingProject = null;
  };

  return {
    mount: async (host) => {
      hostElement = host;
      app = new Application();
      await app.init({
        antialias: true,
        autoDensity: true,
        background: canvasBackground,
        preference: "webgl",
        resolution: window.devicePixelRatio || 1,
        resizeTo: host
      });
      app.canvas.className = "h-full w-full touch-none";
      host.appendChild(app.canvas);
      world = new Container();
      layerRoot = new Container();
      previewRoot = new Container();
      grid = new Graphics();
      app.stage.addChild(grid);
      app.stage.addChild(world);
      world.addChild(layerRoot);
      world.addChild(previewRoot);
      updateCamera();
      drawGrid();
    },
    renderProject: (project) => {
      pendingProject = project;
      schedule(renderNow);
    },
    previewStroke: (stroke) => {
      schedule(() => {
        previewRoot.removeChildren();
        previewRoot.addChild(strokeToGraphics(stroke));
      });
    },
    clearPreview: () => {
      schedule(() => previewRoot.removeChildren());
    },
    toWorldPoint: (clientX, clientY) => {
      const host = hostElement;
      if (!host) {
        return { x: 0, y: 0, pressure: 1, time: performance.now() };
      }
      const rect = host.getBoundingClientRect();
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;
      const pixiApp = assertApp();
      return {
        x: (screenX - pixiApp.renderer.width / 2 - camera.x) / camera.zoom,
        y: (screenY - pixiApp.renderer.height / 2 - camera.y) / camera.zoom,
        pressure: 1,
        time: performance.now()
      };
    },
    exportPng: () => assertApp().canvas.toDataURL("image/png"),
    resize: () => {
      updateCamera();
      drawGrid();
    },
    destroy: () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      if (app) {
        app.canvas.remove();
        app.destroy(false);
      }
      app = null;
      hostElement = null;
    }
  };
};
