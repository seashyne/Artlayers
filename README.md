# Artlayers

Artlayers is a PixiJS/WebGL drawing MVP built with React, TypeScript, Vite, Zustand, TailwindCSS, and IndexedDB.

## Setup

```bash
npm install
npm run dev
```

Local file management works without an account and stores artwork in the browser with IndexedDB. Cloud login and file sync are optional and run through Vercel Node functions. Set these environment variables in Vercel before using cloud storage:

```bash
AUTH_SECRET=replace-with-a-long-random-secret
KV_REST_API_URL=your-upstash-or-vercel-kv-rest-url
KV_REST_API_TOKEN=your-upstash-or-vercel-kv-rest-token
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
- `src/engine` contains drawing, stroke interpolation, command history, cloud file access, and storage logic.
- `api` contains Vercel Node functions for account sessions and cloud file persistence.
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
- `Ctrl/Cmd + S`: save the active project to the selected storage mode
- `Ctrl/Cmd + E`: export PNG

## Canvas And Layers

- Canvas settings support width, height, background color, and visible artboard bounds.
- New canvas creation includes screen, square, poster, and tablet presets with background swatches.
- Layers support add, remove, duplicate, rename, reorder, visibility, lock, opacity, and per-layer stroke counts.
- Locked or hidden layers are protected from new drawing input.
- Brush strokes use jitter filtering, stroke polishing, interpolation, and curved WebGL rendering for smoother lines.
- SAI-style controls include brush presets, adjustable stabilizer, canvas rotation, navigator preview, alpha lock, and clipping flags.
- Drawing and imported images are clipped to the artboard; pointer input cannot start drawing outside the canvas.
- Image editing supports importing PNG/JPEG/WebP files as movable image nodes, selecting nodes, dragging them, rotating them, changing opacity, renaming, and deleting.

## Current Capabilities

- Create a canvas from presets or custom dimensions.
- Import/export native `.artlayers` project files.
- Draw brush and eraser strokes inside the canvas only.
- Smooth line work with brush presets, smoothing, interpolation, and stabilizer controls.
- Manage layers with add, delete, duplicate, reorder, rename, visibility, lock, opacity, alpha lock, and clipping flags.
- Import raster images as editable nodes on the active layer.
- Select and move image nodes within the canvas.
- Zoom, pan, rotate, and reset the canvas view.
- Save/load the project in IndexedDB and export PNG.
- Manage local artwork files from the first screen without registering.
- Optionally register/login to manage cloud-synced artwork files.
