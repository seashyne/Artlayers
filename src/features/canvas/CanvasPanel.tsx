import { Frame, Maximize2, Sparkles } from "lucide-react";
import { useState } from "react";
import { IconButton } from "../../components/IconButton";
import { Panel } from "../../components/Panel";
import { useAppStore } from "../../store/appStore";
import { canvasBackgrounds, canvasPresets, presetToCanvas } from "./canvasPresets";

export const CanvasPanel = () => {
  const canvas = useAppStore((state) => state.canvas);
  const createCanvas = useAppStore((state) => state.createCanvas);
  const setCanvas = useAppStore((state) => state.setCanvas);
  const [draft, setDraft] = useState(canvas);

  const updateDraft = (next: Partial<typeof draft>): void => {
    setDraft((current) => ({ ...current, ...next }));
  };

  return (
    <Panel className="grid w-72 gap-4 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">Canvas</h2>
        <IconButton
          icon={Frame}
          label={canvas.showBounds ? "Hide bounds" : "Show bounds"}
          active={canvas.showBounds}
          onClick={() => setCanvas({ showBounds: !canvas.showBounds })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {canvasPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="grid gap-2 rounded-md border border-white/10 bg-panel2 p-2 text-left hover:border-sky-300/50"
            onClick={() => setDraft(presetToCanvas(preset))}
          >
            <span
              className="block rounded border border-white/10"
              style={{
                aspectRatio: `${preset.width} / ${preset.height}`,
                background: preset.background
              }}
            />
            <span className="text-xs font-semibold text-slate-100">{preset.name}</span>
            <span className="text-[11px] text-slate-500">{preset.size}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1 text-xs text-slate-400">
          Width
          <input
            className="h-9 rounded-md border border-white/10 bg-panel2 px-2 text-sm text-slate-100"
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
            className="h-9 rounded-md border border-white/10 bg-panel2 px-2 text-sm text-slate-100"
            min={256}
            max={8192}
            type="number"
            value={draft.height}
            onChange={(event) => updateDraft({ height: Number(event.target.value) })}
          />
        </label>
      </div>
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
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
                className="h-7 rounded border border-white/10"
                style={{ background }}
                type="button"
                onClick={() => updateDraft({ background })}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-sky-300/30 bg-sky-300/14 px-3 text-xs font-semibold text-sky-100 hover:bg-sky-300/20"
          onClick={() => createCanvas(draft)}
        >
          <Sparkles size={14} />
          Create
        </button>
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-md border border-white/10 bg-panel2 px-3 text-xs font-medium text-slate-200 hover:bg-white/8"
          onClick={() => setDraft({ ...draft, width: 1920, height: 1080 })}
        >
          <Maximize2 size={14} />
          1080p
        </button>
      </div>
    </Panel>
  );
};
