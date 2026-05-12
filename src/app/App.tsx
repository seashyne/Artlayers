import { TopActionBar } from "../features/actions/TopActionBar";
import { CanvasSurface } from "../features/canvas/CanvasSurface";
import { ColorPicker } from "../features/color/ColorPicker";
import { LayerPanel } from "../features/layers/LayerPanel";
import { Toolbar } from "../features/toolbar/Toolbar";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

export const App = () => {
  useKeyboardShortcuts();

  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-ink text-slate-100">
      <CanvasSurface />
      <div className="pointer-events-none absolute inset-0 grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-4 p-4">
        <div className="pointer-events-auto col-start-2 row-start-1 justify-self-center">
          <TopActionBar />
        </div>
        <div className="pointer-events-auto col-start-1 row-start-2 self-center">
          <Toolbar />
        </div>
        <div className="pointer-events-auto col-start-3 row-start-2 hidden min-h-0 self-stretch lg:block">
          <LayerPanel />
        </div>
        <div className="pointer-events-auto col-start-1 row-start-3 mb-1 hidden self-end sm:block">
          <ColorPicker />
        </div>
        <div className="pointer-events-auto col-span-3 row-start-3 block self-end justify-self-center lg:hidden">
          <div className="flex max-w-[calc(100vw-2rem)] gap-3 overflow-x-auto">
            <ColorPicker />
            <LayerPanel />
          </div>
        </div>
      </div>
    </main>
  );
};
