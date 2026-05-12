import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { IconButton } from "../../components/IconButton";
import { Panel } from "../../components/Panel";
import { useAppStore } from "../../store/appStore";

export const LayerPanel = () => {
  const layers = useAppStore((state) => state.layers);
  const activeLayerId = useAppStore((state) => state.activeLayerId);
  const addLayer = useAppStore((state) => state.addLayer);
  const removeActiveLayer = useAppStore((state) => state.removeActiveLayer);
  const setActiveLayer = useAppStore((state) => state.setActiveLayer);
  const toggleLayerVisibility = useAppStore((state) => state.toggleLayerVisibility);
  const setLayerOpacity = useAppStore((state) => state.setLayerOpacity);

  return (
    <Panel className="flex h-full min-h-0 w-72 flex-col rounded-lg">
      <div className="flex items-center justify-between border-b border-white/10 p-3">
        <h2 className="text-sm font-semibold text-slate-100">Layers</h2>
        <div className="flex gap-1">
          <IconButton icon={Plus} label="Add layer" onClick={addLayer} />
          <IconButton icon={Trash2} label="Remove layer" onClick={removeActiveLayer} />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col-reverse gap-2 overflow-y-auto p-3">
        {layers.map((layer) => (
          <button
            key={layer.id}
            type="button"
            className={`grid gap-2 rounded-md border p-3 text-left transition ${
              activeLayerId === layer.id
                ? "border-sky-300/60 bg-sky-300/12"
                : "border-white/10 bg-panel2/80 hover:border-white/20"
            }`}
            onClick={() => setActiveLayer(layer.id)}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-slate-100">{layer.name}</span>
              <span
                role="button"
                tabIndex={0}
                className="grid h-7 w-7 place-items-center rounded text-slate-300 hover:bg-white/8"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleLayerVisibility(layer.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.stopPropagation();
                    toggleLayerVisibility(layer.id);
                  }
                }}
              >
                {layer.visible ? <Eye size={15} /> : <EyeOff size={15} />}
              </span>
            </span>
            <input
              aria-label={`${layer.name} opacity`}
              className="accent-sky-300"
              max={1}
              min={0.05}
              step={0.01}
              type="range"
              value={layer.opacity}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => setLayerOpacity(layer.id, Number(event.target.value))}
            />
            <span className="text-xs text-slate-500">{layer.strokes.length} strokes</span>
          </button>
        ))}
      </div>
    </Panel>
  );
};
