import { useEffect } from "react";
import { useAppStore } from "../store/appStore";

export const useKeyboardShortcuts = (): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const isCommand = event.ctrlKey || event.metaKey;
      const store = useAppStore.getState();

      if (isCommand && event.key.toLowerCase() === "z" && event.shiftKey) {
        event.preventDefault();
        store.redo();
        return;
      }
      if (isCommand && event.key.toLowerCase() === "z") {
        event.preventDefault();
        store.undo();
        return;
      }
      if (isCommand && event.key.toLowerCase() === "y") {
        event.preventDefault();
        store.redo();
        return;
      }
      if (isCommand && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void store.persist();
        return;
      }
      if (isCommand && event.key.toLowerCase() === "e") {
        event.preventDefault();
        window.dispatchEvent(new Event("artlayers:export"));
        return;
      }
      if (event.key.toLowerCase() === "b") {
        store.setTool("brush");
      }
      if (event.key.toLowerCase() === "e" && !isCommand) {
        store.setTool("eraser");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
};
