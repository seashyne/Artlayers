import { Panel } from "../../components/Panel";
import { RangeControl } from "../../components/RangeControl";
import { useAppStore } from "../../store/appStore";

const swatches = ["#f8fafc", "#ef4444", "#f97316", "#facc15", "#22c55e", "#38bdf8", "#a78bfa", "#f472b6"];

export const ColorPicker = () => {
  const brush = useAppStore((state) => state.brush);
  const setBrush = useAppStore((state) => state.setBrush);

  return (
    <Panel className="grid w-64 gap-4 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <input
          aria-label="Brush color"
          className="h-10 w-12 cursor-pointer rounded-md border border-white/10 bg-transparent"
          type="color"
          value={brush.color}
          onChange={(event) => setBrush({ color: event.target.value })}
        />
        <div className="grid flex-1 grid-cols-4 gap-2">
          {swatches.map((color) => (
            <button
              key={color}
              aria-label={`Use ${color}`}
              className="h-6 rounded border border-white/10"
              style={{ backgroundColor: color }}
              type="button"
              onClick={() => setBrush({ color })}
            />
          ))}
        </div>
      </div>
      <RangeControl label="Size" min={1} max={96} step={1} value={brush.size} onChange={(size) => setBrush({ size })} />
      <RangeControl
        label="Opacity"
        min={0.05}
        max={1}
        step={0.01}
        value={brush.opacity}
        onChange={(opacity) => setBrush({ opacity })}
      />
      <RangeControl
        label="Smoothing"
        min={0}
        max={0.9}
        step={0.01}
        value={brush.smoothing}
        onChange={(smoothing) => setBrush({ smoothing })}
      />
    </Panel>
  );
};
