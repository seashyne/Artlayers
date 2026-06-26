import { TopActionBar } from "../features/actions/TopActionBar";
import { CanvasSurface } from "../features/canvas/CanvasSurface";
import { NavigatorPanel } from "../features/canvas/NavigatorPanel";
import { ColorPicker } from "../features/color/ColorPicker";
import { FileManagerShell } from "../features/files/FileManagerShell";
import { ImagePanel } from "../features/image/ImagePanel";
import { LayerPanel } from "../features/layers/LayerPanel";
import { Toolbar } from "../features/toolbar/Toolbar";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

export const App = () => {
  useKeyboardShortcuts();

  return (
    <FileManagerShell>
      <div className="relative h-dvh w-full overflow-hidden bg-ink text-slate-100">
        <CanvasSurface />
        <div className="pointer-events-none absolute inset-0 grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr] gap-4 p-4">
          <div className="pointer-events-auto col-start-2 row-start-1 justify-self-center">
            <TopActionBar />
          </div>
          <div className="pointer-events-auto col-start-1 row-span-2 row-start-1 self-center">
            <Toolbar />
          </div>
          <div className="pointer-events-auto col-start-3 row-span-2 row-start-1 hidden max-h-[calc(100dvh-2rem)] self-stretch overflow-y-auto pr-1 xl:block">
            <div className="grid w-72 min-w-0 gap-3">
              <div className="h-56 min-h-0">
                <LayerPanel />
              </div>
              <NavigatorPanel />
              <ImagePanel />
              <ColorPicker />
            </div>
          </div>
          <div className="pointer-events-auto col-span-3 row-start-2 block self-end justify-self-center xl:hidden">
            <div className="flex max-w-[calc(100vw-2rem)] gap-3 overflow-x-auto">
              <ColorPicker />
              <NavigatorPanel />
              <ImagePanel />
              <LayerPanel />
            </div>
          </div>
        </div>
      </div>
    </FileManagerShell>
  );
};
