import { Cloud, FilePlus2, FolderOpen, Loader2, LogOut, Save, Trash2 } from "lucide-react";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { useAppStore, selectProject } from "../../store/appStore";
import { useCloudStore } from "../../store/cloudStore";
import { AuthPanel } from "../auth/AuthPanel";

const defaultCanvas = {
  width: 1920,
  height: 1080,
  background: "#0f172a",
  showBounds: true
};

const formatSize = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const FileManagerShell = ({ children }: PropsWithChildren) => {
  const user = useCloudStore((state) => state.user);
  const files = useCloudStore((state) => state.files);
  const selectedFileId = useCloudStore((state) => state.selectedFileId);
  const status = useCloudStore((state) => state.status);
  const error = useCloudStore((state) => state.error);
  const bootstrap = useCloudStore((state) => state.bootstrap);
  const saveProject = useCloudStore((state) => state.saveProject);
  const loadProject = useCloudStore((state) => state.loadProject);
  const removeFile = useCloudStore((state) => state.removeFile);
  const signOut = useCloudStore((state) => state.signOut);
  const hydrateProject = useAppStore((state) => state.hydrateProject);
  const createCanvas = useAppStore((state) => state.createCanvas);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const saveCurrentProject = () => {
      void saveProject(selectProject(useAppStore.getState()));
    };
    window.addEventListener("artlayers:cloud-save", saveCurrentProject);
    return () => window.removeEventListener("artlayers:cloud-save", saveCurrentProject);
  }, [saveProject]);

  const createFile = async () => {
    createCanvas(defaultCanvas);
    await saveProject(selectProject(useAppStore.getState()), "Untitled Artwork");
  };

  const openSelectedFile = async (id: string) => {
    const project = await loadProject(id);
    hydrateProject(project);
  };

  if (!user) {
    return (
      <main className="relative h-dvh w-screen overflow-hidden bg-ink text-slate-100">
        <div className="absolute inset-0 opacity-25">{children}</div>
        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm">
          <AuthPanel />
        </div>
      </main>
    );
  }

  return (
    <main className="grid h-dvh w-screen grid-cols-[280px_1fr] overflow-hidden bg-ink text-slate-100">
      <aside className="z-20 flex min-h-0 flex-col border-r border-white/10 bg-panel/95 backdrop-blur-xl">
        <header className="border-b border-white/10 p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
                <Cloud size={17} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user.name}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              title="Logout"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-white/8 hover:text-white"
            >
              <LogOut size={16} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => void createFile()} title="New file" className="file-action">
              <FilePlus2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => void saveProject(selectProject(useAppStore.getState()))}
              title="Save to cloud"
              className="file-action"
            >
              <Save size={16} />
            </button>
            <button
              type="button"
              onClick={() => selectedFileId && void removeFile(selectedFileId)}
              title="Delete selected file"
              className="file-action"
              disabled={!selectedFileId}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {files.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => void openSelectedFile(file.id)}
              className={`mb-2 flex w-full items-center gap-3 border p-3 text-left transition ${
                selectedFileId === file.id
                  ? "border-sky-300/40 bg-sky-300/12"
                  : "border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.06]"
              }`}
            >
              <FolderOpen className="shrink-0 text-slate-300" size={17} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-white">{file.name}</span>
                <span className="block truncate text-xs text-slate-500">
                  {formatSize(file.size)} · {new Date(file.updatedAt).toLocaleDateString()}
                </span>
              </span>
            </button>
          ))}
          {files.length === 0 ? (
            <div className="border border-dashed border-white/10 p-4 text-center text-xs text-slate-500">
              No cloud files yet.
            </div>
          ) : null}
        </div>

        <footer className="border-t border-white/10 p-3 text-xs text-slate-400">
          {status === "loading" || status === "saving" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={14} />
              {status === "saving" ? "Saving..." : "Syncing..."}
            </span>
          ) : (
            error ?? "Cloud sync ready"
          )}
        </footer>
      </aside>
      <section className="relative min-w-0 overflow-hidden">{children}</section>
    </main>
  );
};
