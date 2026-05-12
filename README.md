# Artlayers

Artlayers is a PixiJS/WebGL drawing MVP built with React, TypeScript, Vite, Zustand, TailwindCSS, and IndexedDB.

## Setup

```bash
npm install
npm run dev
```

## Verification

```bash
npm run typecheck
npm run build
```

## Architecture

- `src/app` hosts the application shell and layout.
- `src/components` contains reusable UI primitives.
- `src/features` contains product UI features such as toolbar, layers, actions, and color controls.
- `src/engine` contains drawing, stroke interpolation, command history, and storage logic.
- `src/renderer` owns PixiJS lifecycle and WebGL rendering.
- `src/store` contains Zustand state slices.
- `src/hooks`, `src/utils`, and `src/types` provide typed shared helpers.

React renders controls only. PixiJS renders the infinite canvas, strokes, layers, zooming, panning, and export snapshots. Commands mutate project state through a typed undo/redo stack so future multiplayer or AI operations can reuse the same command boundary.

## Shortcuts

- `B`: brush
- `E`: eraser
- `Space + drag`: pan
- `Ctrl/Cmd + Z`: undo
- `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y`: redo
- `Ctrl/Cmd + S`: persist project to IndexedDB
- `Ctrl/Cmd + E`: export PNG
