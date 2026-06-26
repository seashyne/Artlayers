import { Brush, Eraser, Hand, MousePointer2, Move, PaintBucket, Pipette, Shapes, Type } from "lucide-react";
import { IconButton } from "../../components/IconButton";
import { Panel } from "../../components/Panel";
import { useAppStore } from "../../store/appStore";
import type { Tool } from "../../types/drawing";

const tools: Array<{ id: Tool; label: string; icon: typeof Brush }> = [
  { id: "brush", label: "Brush", icon: Brush },
  { id: "eraser", label: "Eraser", icon: Eraser },
  { id: "select", label: "Select node", icon: MousePointer2 },
  { id: "transform", label: "Move / transform", icon: Move },
  { id: "shape", label: "Rectangle shape", icon: Shapes },
  { id: "text", label: "Text", icon: Type },
  { id: "fill", label: "Fill canvas", icon: PaintBucket },
  { id: "eyedropper", label: "Eyedropper", icon: Pipette },
  { id: "pan", label: "Pan", icon: Hand }
];

export const Toolbar = () => {
  const activeTool = useAppStore((state) => state.tool);
  const setTool = useAppStore((state) => state.setTool);

  return (
    <Panel className="flex flex-col gap-1 rounded-lg p-1.5">
      {tools.map((tool) => (
        <IconButton
          key={tool.id}
          icon={tool.icon}
          label={tool.label}
          active={activeTool === tool.id}
          onClick={() => setTool(tool.id)}
        />
      ))}
    </Panel>
  );
};
