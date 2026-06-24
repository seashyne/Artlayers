import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Layers2, Lock, Plus, Shield, Trash2, Unlock } from "lucide-react";
import { IconButton } from "../../components/IconButton";
import { Panel } from "../../components/Panel";
import { useAppStore } from "../../store/appStore";

export const LayerPanel = () => {
  const layers = useAppStore((state) => state.layers);
  const activeLayerId = useAppStore((state) => state.activeLayerId);
  const addLayer = useAppStore((state) => state.addLayer);
  const duplicateActiveLayer = useAppStore((state) => state.duplicateActiveLayer);
  const moveActiveLayer = useAppStore((state) => state.moveActiveLayer);
  const removeActiveLayer = useAppStore((state) => state.removeActiveLayer);
  const renameLayer = useAppStore((state) => state.renameLayer);
  const setActiveLayer = useAppStore((state) => state.setActiveLayer);
  const toggleLayerLock = useAppStore((state) => state.toggleLayerLock);
  const toggleLayerAlphaLock = useAppStore((state) => state.toggleLayerAlphaLock);
  const toggleLayerClipping = useAppStore((state) => state.toggleLayerClipping);
  const toggleLayerVisibility = useAppStore((state) => state.toggleLayerVisibility);
  const setLayerOpacity = useAppStore((state) => state.setLayerOpacity);

  return (
    <Panel className="flex h-full min-h-0 w-72 flex-col rounded-lg">
      <div className="flex items-center justify-between border-b border-white/10 p-3">
        <h2 className="text-sm font-semibold text-slate-100">Layers</h2>
        <div className="flex gap-1">
          <IconButton icon={Plus} label="Add layer" onClick={addLayer} />
          <IconButton icon={Copy} label="Duplicate layer" onClick={duplicateActiveLayer} />
          <IconButton icon={Trash2} label="Remove layer" onClick={removeActiveLayer} />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col-reverse gap-2 overflow-y-auto p-3">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className={`grid gap-2 rounded-md border p-3 text-left transition ${
              activeLayerId === layer.id
                ? "border-sky-300/60 bg-sky-300/12"
                : "border-white/10 bg-panel2/80 hover:border-white/20"
            }`}
            onClick={() => setActiveLayer(layer.id)}
          >
            <span className="flex items-center justify-between gap-2">
              <input
                aria-label={`${layer.name} name`}
                className="min-w-0 flex-1 rounded bg-transparent text-sm font-medium text-slate-100 outline-none focus:bg-black/20"
                value={layer.name}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => renameLayer(layer.id, event.target.value)}
              />
              <IconButton
                icon={layer.visible ? Eye : EyeOff}
                label={layer.visible ? "Hide layer" : "Show layer"}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleLayerVisibility(layer.id);
                }}
              />
            </span>
            <div className="flex items-center gap-1">
              <IconButton
                icon={ArrowUp}
                label="Move layer up"
                disabled={index === layers.length - 1}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveLayer(layer.id);
                  moveActiveLayer(1);
                }}
              />
              <IconButton
                icon={ArrowDown}
                label="Move layer down"
                disabled={index === 0}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveLayer(layer.id);
                  moveActiveLayer(-1);
                }}
              />
              <IconButton
                icon={layer.locked ? Lock : Unlock}
                label={layer.locked ? "Unlock layer" : "Lock layer"}
                active={layer.locked}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleLayerLock(layer.id);
                }}
              />
              <IconButton
                icon={Shield}
                label={layer.alphaLocked ? "Disable alpha lock" : "Alpha lock"}
                active={layer.alphaLocked}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleLayerAlphaLock(layer.id);
                }}
              />
              <IconButton
                icon={Layers2}
                label={layer.clipped ? "Disable clipping" : "Clip to layer below"}
                active={layer.clipped}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleLayerClipping(layer.id);
                }}
              />
            </div>
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
            <span className="text-xs text-slate-500">
              {layer.strokes.length} strokes · {layer.nodes.length} nodes{layer.locked ? " · locked" : ""}
              {layer.alphaLocked ? " · alpha" : ""}{layer.clipped ? " · clipped" : ""}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
};
