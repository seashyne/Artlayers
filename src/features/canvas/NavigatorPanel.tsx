import { RotateCcw } from "lucide-react";
import { IconButton } from "../../components/IconButton";
import { Panel } from "../../components/Panel";
import { RangeControl } from "../../components/RangeControl";
import { useAppStore } from "../../store/appStore";

export const NavigatorPanel = () => {
  const camera = useAppStore((state) => state.camera);
  const canvas = useAppStore((state) => state.canvas);
  const setCamera = useAppStore((state) => state.setCamera);

  return (
    <Panel className="grid w-72 gap-3 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">Navigator</h2>
        <IconButton icon={RotateCcw} label="Reset rotation" onClick={() => setCamera({ ...camera, rotation: 0 })} />
      </div>
      <div className="grid place-items-center rounded-md border border-white/10 bg-black/20 p-4">
        <div
          className="grid place-items-center border border-sky-300/40 shadow-soft"
          style={{
            width: canvas.width >= canvas.height ? 132 : Math.max(44, (canvas.width / canvas.height) * 132),
            height: canvas.height >= canvas.width ? 132 : Math.max(44, (canvas.height / canvas.width) * 132),
            backgroundColor: canvas.background,
            transform: `rotate(${camera.rotation}deg)`
          }}
        >
          <span className="text-[10px] font-medium text-slate-400">{Math.round(camera.zoom * 100)}%</span>
        </div>
      </div>
      <RangeControl
        label="Rotation"
        min={-180}
        max={180}
        step={1}
        value={camera.rotation}
        onChange={(rotation) => setCamera({ ...camera, rotation })}
      />
    </Panel>
  );
};
