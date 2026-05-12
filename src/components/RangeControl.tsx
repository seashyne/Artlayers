interface RangeControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export const RangeControl = ({ label, value, min, max, step, onChange }: RangeControlProps) => (
  <label className="grid gap-2 text-xs text-slate-400">
    <span className="flex items-center justify-between">
      <span>{label}</span>
      <span className="font-medium tabular-nums text-slate-200">{Math.round(value * 100) / 100}</span>
    </span>
    <input
      className="accent-sky-300"
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  </label>
);
