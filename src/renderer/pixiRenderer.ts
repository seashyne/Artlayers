import { Application, Container, Graphics, Sprite, Texture } from "pixi.js";
import type { Camera, ImageNode, Layer, Point, ProjectState, Stroke } from "../types/drawing";
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
  let canvasFrame = new Graphics();
  let canvasMask = new Graphics();
  let camera: Camera = { x: 0, y: 0, zoom: 1, rotation: 0 };
  let eraserBackground = "#0f172a";
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
    world.rotation = (camera.rotation * Math.PI) / 180;
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

  const drawCanvasFrame = (project: ProjectState): void => {
    const { width, height, background, showBounds } = project.canvas;
    canvasFrame.clear();
    canvasMask.clear();
    canvasFrame.rect(-width / 2, -height / 2, width, height).fill({ color: hexToNumber(background), alpha: 1 });
    canvasMask.rect(-width / 2, -height / 2, width, height).fill({ color: 0xffffff, alpha: 1 });

    if (showBounds) {
      canvasFrame
        .rect(-width / 2, -height / 2, width, height)
        .stroke({ color: 0x7dd3fc, alpha: 0.42, width: 1 / project.camera.zoom });
    }
  };

  const nodeToSprite = (node: ImageNode): Sprite => {
    const sprite = new Sprite(Texture.from(node.src));
    sprite.label = node.name;
    sprite.anchor.set(0.5);
    sprite.position.set(node.x, node.y);
    sprite.width = node.width;
    sprite.height = node.height;
    sprite.rotation = (node.rotation * Math.PI) / 180;
    sprite.alpha = node.opacity;
    return sprite;
  };

  const strokeToGraphics = (stroke: Stroke, background: string): Graphics => {
    const graphics = new Graphics();
    const points = stroke.points;
    const color = stroke.tool === "eraser" ? hexToNumber(background) : hexToNumber(stroke.color);

    if (points.length === 1) {
      const point = points[0];
      graphics.circle(point.x, point.y, Math.max(1, stroke.size * point.pressure * 0.5)).fill({
        color,
        alpha: stroke.opacity
      });
      return graphics;
    }

    graphics.moveTo(points[0].x, points[0].y);

    if (points.length === 2) {
      graphics.lineTo(points[1].x, points[1].y);
    } else {
      for (let index = 1; index < points.length - 1; index += 1) {
        const current = points[index];
        const next = points[index + 1];
        const midpointX = (current.x + next.x) / 2;
        const midpointY = (current.y + next.y) / 2;
        graphics.quadraticCurveTo(current.x, current.y, midpointX, midpointY);
      }
      const finalPoint = points[points.length - 1];
      graphics.lineTo(finalPoint.x, finalPoint.y);
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

  const renderLayer = (layer: Layer, background: string): Container => {
    const container = new Container();
    container.label = layer.name;
    container.alpha = layer.opacity;
    container.visible = layer.visible;
    layer.nodes.forEach((node) => container.addChild(nodeToSprite(node)));
    layer.strokes.forEach((stroke) => container.addChild(strokeToGraphics(stroke, background)));
    return container;
  };

  const renderNow = (): void => {
    if (!pendingProject) {
      return;
    }
    const project = pendingProject;
    camera = project.camera;
    eraserBackground = project.canvas.background;
    layerRoot.removeChildren();
    drawCanvasFrame(project);
    project.layers.forEach((layer) => layerRoot.addChild(renderLayer(layer, project.canvas.background)));
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
      canvasFrame = new Graphics();
      canvasMask = new Graphics();
      grid = new Graphics();
      app.stage.addChild(grid);
      app.stage.addChild(world);
      world.addChild(canvasFrame);
      world.addChild(canvasMask);
      world.addChild(layerRoot);
      world.addChild(previewRoot);
      layerRoot.mask = canvasMask;
      previewRoot.mask = canvasMask;
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
        previewRoot.addChild(strokeToGraphics(stroke, eraserBackground));
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
      const centeredX = (screenX - pixiApp.renderer.width / 2 - camera.x) / camera.zoom;
      const centeredY = (screenY - pixiApp.renderer.height / 2 - camera.y) / camera.zoom;
      const radians = (-camera.rotation * Math.PI) / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);

      return {
        x: centeredX * cos - centeredY * sin,
        y: centeredX * sin + centeredY * cos,
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
