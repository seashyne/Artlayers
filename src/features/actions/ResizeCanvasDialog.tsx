import { Check, X } from "lucide-react";
import { useState } from "react";
import { canvasBackgrounds } from "../canvas/canvasPresets";
import type { CanvasSettings } from "../../types/drawing";

interface ResizeCanvasDialogProps {
  canvas: CanvasSettings;
  onApply: (canvas: Partial<CanvasSettings>) => void;
  onClose: () => void;
}

export const ResizeCanvasDialog = ({ canvas, onApply, onClose }: ResizeCanvasDialogProps) => {
  const [draft, setDraft] = useState(canvas);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-4 backdrop-blur-sm">
      <section className="w-full max-w-sm border border-white/10 bg-panel/95 p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Resize Canvas</h2>
          <button type="button" title="Close" className="file-action !h-8 !w-8 !px-0" onClick={onClose}>
            <X size={15} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-xs text-slate-400">
            Width
            <input
              className="h-10 rounded-md border border-white/10 bg-panel2 px-3 text-sm text-slate-100"
              type="number"
              value={draft.width}
              onChange={(event) => setDraft({ ...draft, width: Number(event.target.value) })}
            />
          </label>
          <label className="grid gap-1 text-xs text-slate-400">
            Height
            <input
              className="h-10 rounded-md border border-white/10 bg-panel2 px-3 text-sm text-slate-100"
              type="number"
              value={draft.height}
              onChange={(event) => setDraft({ ...draft, height: Number(event.target.value) })}
            />
          </label>
        </div>
        <div className="mt-4 grid grid-cols-6 gap-1.5">
          {canvasBackgrounds.map((background) => (
            <button
              key={background}
              aria-label={`Use ${background}`}
              className="h-8 rounded border border-white/10"
              style={{ background }}
              type="button"
              onClick={() => setDraft({ ...draft, background })}
            />
          ))}
        </div>
        <button
          type="button"
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-sky-300/30 bg-sky-300/14 px-3 text-sm font-semibold text-sky-100 hover:bg-sky-300/20"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
        >
          <Check size={15} />
          Apply
        </button>
      </section>
    </div>
  );
};
