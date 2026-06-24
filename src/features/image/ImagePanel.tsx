import { ImagePlus, Trash2 } from "lucide-react";
import { Panel } from "../../components/Panel";
import { RangeControl } from "../../components/RangeControl";
import { selectActiveLayer, useAppStore } from "../../store/appStore";
import type { ImageNode } from "../../types/drawing";
import { createId } from "../../utils/ids";

const readImage = (file: File): Promise<Pick<ImageNode, "src" | "width" | "height">> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const src = String(reader.result);
      const image = new Image();
      image.onload = () => resolve({ src, width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error("Image could not be decoded."));
      image.src = src;
    };
    reader.readAsDataURL(file);
  });
};

export const ImagePanel = () => {
  const activeLayer = useAppStore(selectActiveLayer);
  const selectedNodeId = useAppStore((state) => state.selectedNodeId);
  const canvas = useAppStore((state) => state.canvas);
  const addImageNode = useAppStore((state) => state.addImageNode);
  const updateImageNode = useAppStore((state) => state.updateImageNode);
  const removeSelectedNode = useAppStore((state) => state.removeSelectedNode);
  const selectedNode = activeLayer?.nodes.find((node) => node.id === selectedNodeId);

  const importImage = async (file: File): Promise<void> => {
    if (!activeLayer) {
      return;
    }
    const image = await readImage(file);
    const scale = Math.min(1, (Math.min(canvas.width, canvas.height) * 0.55) / Math.max(image.width, image.height));
    addImageNode({
      id: createId("node"),
      layerId: activeLayer.id,
      name: file.name.replace(/\.[^.]+$/, "") || "Image",
      src: image.src,
      x: 0,
      y: 0,
      width: Math.round(image.width * scale),
      height: Math.round(image.height * scale),
      rotation: 0,
      opacity: 1
    });
  };

  return (
    <Panel className="grid w-72 gap-4 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">Image Edit</h2>
        <label className="grid h-10 w-10 cursor-pointer place-items-center rounded-md border border-white/10 text-slate-300 hover:bg-white/8">
          <ImagePlus size={18} />
          <input
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void importImage(file);
              }
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>
      {selectedNode ? (
        <div className="grid gap-3">
          <input
            aria-label="Node name"
            className="h-9 rounded-md border border-white/10 bg-panel2 px-2 text-sm text-slate-100"
            value={selectedNode.name}
            onChange={(event) => updateImageNode(selectedNode.id, { name: event.target.value })}
          />
          <RangeControl
            label="Opacity"
            min={0.05}
            max={1}
            step={0.01}
            value={selectedNode.opacity}
            onChange={(opacity) => updateImageNode(selectedNode.id, { opacity })}
          />
          <RangeControl
            label="Rotation"
            min={-180}
            max={180}
            step={1}
            value={selectedNode.rotation}
            onChange={(rotation) => updateImageNode(selectedNode.id, { rotation })}
          />
          <button
            type="button"
            className="flex h-9 items-center justify-center gap-2 rounded-md border border-red-400/20 bg-red-400/10 text-xs font-semibold text-red-100 hover:bg-red-400/15"
            onClick={removeSelectedNode}
          >
            <Trash2 size={14} />
            Delete node
          </button>
        </div>
      ) : (
        <p className="text-xs leading-5 text-slate-400">Import an image, choose Select, then drag it inside the canvas.</p>
      )}
    </Panel>
  );
};
