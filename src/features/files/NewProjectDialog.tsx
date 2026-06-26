import { Maximize2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { canvasBackgrounds, canvasPresets, presetToCanvas } from "../canvas/canvasPresets";
import type { CanvasSettings } from "../../types/drawing";

interface NewProjectDialogProps {
  onClose: () => void;
  onCreate: (canvas: CanvasSettings) => void;
}

export const NewProjectDialog = ({ onClose, onCreate }: NewProjectDialogProps) => {
  const [draft, setDraft] = useState<CanvasSettings>(presetToCanvas(canvasPresets[0]));

  const updateDraft = (next: Partial<CanvasSettings>): void => {
    setDraft((current) => ({ ...current, ...next }));
  };

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
      <section className="w-full max-w-xl border border-white/10 bg-panel/95 p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">New Artwork</h2>
            <p className="text-xs text-slate-400">Choose the canvas before entering the workspace.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="grid h-9 w-9 place-items-center rounded-md text-slate-400 hover:bg-white/8 hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {canvasPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`grid min-w-0 gap-2 overflow-hidden rounded-md border p-2 text-left transition ${
                draft.width === preset.width && draft.height === preset.height
                  ? "border-sky-300/60 bg-sky-300/10"
                  : "border-white/10 bg-panel2 hover:border-white/20"
              }`}
              onClick={() => setDraft(presetToCanvas(preset))}
            >
              <span
                className="block w-full rounded border border-white/10"
                style={{ aspectRatio: `${preset.width} / ${preset.height}`, background: preset.background }}
              />
              <span className="text-xs font-semibold text-slate-100">{preset.name}</span>
              <span className="text-[11px] text-slate-500">{preset.size}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-xs text-slate-400">
            Width
            <input
              className="h-10 rounded-md border border-white/10 bg-panel2 px-3 text-sm text-slate-100"
              min={256}
              max={8192}
              type="number"
              value={draft.width}
              onChange={(event) => updateDraft({ width: Number(event.target.value) })}
            />
          </label>
          <label className="grid gap-1 text-xs text-slate-400">
            Height
            <input
              className="h-10 rounded-md border border-white/10 bg-panel2 px-3 text-sm text-slate-100"
              min={256}
              max={8192}
              type="number"
              value={draft.height}
              onChange={(event) => updateDraft({ height: Number(event.target.value) })}
            />
          </label>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            aria-label="Canvas background"
            className="h-9 w-12 cursor-pointer rounded-md border border-white/10 bg-transparent"
            type="color"
            value={draft.background}
            onChange={(event) => updateDraft({ background: event.target.value })}
          />
          <div className="grid flex-1 grid-cols-6 gap-1.5">
            {canvasBackgrounds.map((background) => (
              <button
                key={background}
                aria-label={`Use ${background}`}
                className="h-8 rounded border border-white/10"
                style={{ background }}
                type="button"
                onClick={() => updateDraft({ background })}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-sky-300/30 bg-sky-300/14 px-3 text-sm font-semibold text-sky-100 hover:bg-sky-300/20"
            onClick={() => onCreate(draft)}
          >
            <Sparkles size={15} />
            Create Artwork
          </button>
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-panel2 px-3 text-sm font-medium text-slate-200 hover:bg-white/8"
            onClick={() => updateDraft({ width: 1920, height: 1080 })}
          >
            <Maximize2 size={15} />
            1080p
          </button>
        </div>
      </section>
    </div>
  );
};
