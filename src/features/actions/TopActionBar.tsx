import { Crop, Download, Minus, Plus, Redo2, RotateCcw, Save, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";
import { IconButton } from "../../components/IconButton";
import { Panel } from "../../components/Panel";
import { useAppStore } from "../../store/appStore";
import { clamp } from "../../utils/colors";
import { ResizeCanvasDialog } from "./ResizeCanvasDialog";

export const TopActionBar = () => {
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);
  const persist = useAppStore((state) => state.persist);
  const canvas = useAppStore((state) => state.canvas);
  const camera = useAppStore((state) => state.camera);
  const setCamera = useAppStore((state) => state.setCamera);
  const setCanvas = useAppStore((state) => state.setCanvas);
  const clearActiveLayer = useAppStore((state) => state.clearActiveLayer);
  const [showResize, setShowResize] = useState(false);

  return (
    <>
      <Panel className="flex max-w-full items-center gap-1 rounded-lg p-1.5">
        <IconButton icon={Undo2} label="Undo" onClick={undo} />
        <IconButton icon={Redo2} label="Redo" onClick={redo} />
        <div className="mx-1 h-7 w-px bg-white/10" />
        <IconButton
          icon={Minus}
          label="Zoom out"
          onClick={() => setCamera({ ...camera, zoom: clamp(camera.zoom * 0.9, 0.12, 8) })}
        />
        <button
          type="button"
          className="h-10 min-w-16 rounded-md px-3 text-sm font-medium text-slate-200 hover:bg-white/8"
          onClick={() => setCamera({ x: 0, y: 0, zoom: 1, rotation: camera.rotation })}
        >
          {Math.round(camera.zoom * 100)}%
        </button>
        <IconButton
          icon={Plus}
          label="Zoom in"
          onClick={() => setCamera({ ...camera, zoom: clamp(camera.zoom * 1.1, 0.12, 8) })}
        />
        <IconButton icon={RotateCcw} label="Reset view" onClick={() => setCamera({ x: 0, y: 0, zoom: 1, rotation: 0 })} />
        <div className="mx-1 h-7 w-px bg-white/10" />
        <IconButton icon={Crop} label="Resize canvas" onClick={() => setShowResize(true)} />
        <IconButton
          icon={Save}
          label="Save"
          onClick={() => {
            window.dispatchEvent(new Event("artlayers:save"));
            void persist();
          }}
        />
        <IconButton icon={Download} label="Export PNG" onClick={() => window.dispatchEvent(new Event("artlayers:export"))} />
        <IconButton icon={Trash2} label="Clear layer" onClick={clearActiveLayer} />
      </Panel>
      {showResize ? <ResizeCanvasDialog canvas={canvas} onApply={setCanvas} onClose={() => setShowResize(false)} /> : null}
    </>
  );
};
