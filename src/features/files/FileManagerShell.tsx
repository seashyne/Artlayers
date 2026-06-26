import { Cloud, FilePlus2, FolderOpen, HardDrive, Loader2, LogOut, Save, Trash2, X } from "lucide-react";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { useAppStore, selectProject } from "../../store/appStore";
import { useCloudStore } from "../../store/cloudStore";
import { useLocalFileStore } from "../../store/localFileStore";
import { AuthPanel } from "../auth/AuthPanel";
import { NewProjectDialog } from "./NewProjectDialog";

const formatSize = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const FileManagerShell = ({ children }: PropsWithChildren) => {
  const user = useCloudStore((state) => state.user);
  const cloudFiles = useCloudStore((state) => state.files);
  const selectedCloudFileId = useCloudStore((state) => state.selectedFileId);
  const cloudStatus = useCloudStore((state) => state.status);
  const cloudError = useCloudStore((state) => state.error);
  const bootstrap = useCloudStore((state) => state.bootstrap);
  const saveCloudProject = useCloudStore((state) => state.saveProject);
  const loadCloudProject = useCloudStore((state) => state.loadProject);
  const removeCloudFile = useCloudStore((state) => state.removeFile);
  const signOut = useCloudStore((state) => state.signOut);
  const localFiles = useLocalFileStore((state) => state.files);
  const selectedLocalFileId = useLocalFileStore((state) => state.selectedFileId);
  const localStatus = useLocalFileStore((state) => state.status);
  const localError = useLocalFileStore((state) => state.error);
  const refreshLocalFiles = useLocalFileStore((state) => state.refreshFiles);
  const saveLocalProject = useLocalFileStore((state) => state.saveProject);
  const loadLocalProject = useLocalFileStore((state) => state.loadProject);
  const removeLocalFile = useLocalFileStore((state) => state.removeFile);
  const hydrateProject = useAppStore((state) => state.hydrateProject);
  const createCanvas = useAppStore((state) => state.createCanvas);
  const [storageMode, setStorageMode] = useState<"local" | "cloud">("local");
  const [showAuth, setShowAuth] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const isCloudMode = storageMode === "cloud" && Boolean(user);
  const files = isCloudMode ? cloudFiles : localFiles;
  const selectedFileId = isCloudMode ? selectedCloudFileId : selectedLocalFileId;
  const status = isCloudMode ? cloudStatus : localStatus;
  const error = isCloudMode ? cloudError : localError;

  useEffect(() => {
    void bootstrap();
    void refreshLocalFiles();
  }, [bootstrap, refreshLocalFiles]);

  useEffect(() => {
    if (user) {
      setShowAuth(false);
      setStorageMode("cloud");
    }
  }, [user]);

  useEffect(() => {
    const saveCurrentProject = () => {
      void (isCloudMode ? saveCloudProject : saveLocalProject)(selectProject(useAppStore.getState()));
    };
    window.addEventListener("artlayers:save", saveCurrentProject);
    return () => window.removeEventListener("artlayers:save", saveCurrentProject);
  }, [isCloudMode, saveCloudProject, saveLocalProject]);

  const createFile = async (canvas: Parameters<typeof createCanvas>[0]) => {
    createCanvas(canvas);
    await (isCloudMode ? saveCloudProject : saveLocalProject)(
      selectProject(useAppStore.getState()),
      isCloudMode ? "Cloud Artwork" : "Local Artwork"
    );
    setShowNewProject(false);
  };

  const openSelectedFile = async (id: string) => {
    const project = await (isCloudMode ? loadCloudProject(id) : loadLocalProject(id));
    if (project) {
      hydrateProject(project);
    }
  };

  return (
    <main className="grid h-dvh w-screen grid-cols-[280px_1fr] overflow-hidden bg-ink text-slate-100">
      <aside className="z-20 flex min-h-0 flex-col border-r border-white/10 bg-panel/95 backdrop-blur-xl">
        <header className="border-b border-white/10 p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
                {isCloudMode ? <Cloud size={17} /> : <HardDrive size={17} />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{isCloudMode ? user?.name : "Local Files"}</p>
                <p className="truncate text-xs text-slate-400">
                  {isCloudMode ? user?.email : "Saved on this device"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (user) {
                  void signOut();
                  setStorageMode("local");
                  return;
                }
                setShowAuth(true);
              }}
              title={user ? "Logout" : "Login for cloud sync"}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-white/8 hover:text-white"
            >
              {user ? <LogOut size={16} /> : <Cloud size={16} />}
            </button>
          </div>
          <div className="mb-3 grid grid-cols-2 border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setStorageMode("local")}
              className={`h-8 text-xs ${!isCloudMode ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Local
            </button>
            <button
              type="button"
              onClick={() => (user ? setStorageMode("cloud") : setShowAuth(true))}
              className={`h-8 text-xs ${isCloudMode ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Cloud
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setShowNewProject(true)} title="New file" className="file-action">
              <FilePlus2 size={16} />
              <span>New</span>
            </button>
            <button
              type="button"
              onClick={() => void (isCloudMode ? saveCloudProject : saveLocalProject)(selectProject(useAppStore.getState()))}
              title={isCloudMode ? "Save to cloud" : "Save locally"}
              className="file-action"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={() => selectedFileId && void (isCloudMode ? removeCloudFile : removeLocalFile)(selectedFileId)}
              title="Delete selected file"
              className="file-action"
              disabled={!selectedFileId}
            >
              <Trash2 size={16} />
              <span>Delete</span>
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
              {isCloudMode ? "No cloud files yet." : "No local files yet."}
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
            error ?? (isCloudMode ? "Cloud sync ready" : "Local storage ready")
          )}
        </footer>
      </aside>
      <section className="relative min-w-0 overflow-hidden">
        {children}
        {showAuth ? (
          <div className="absolute inset-0 z-30 bg-black/55 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setShowAuth(false)}
              title="Close login"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-panel/90 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <X size={17} />
            </button>
            <AuthPanel />
          </div>
        ) : null}
        {showNewProject ? <NewProjectDialog onClose={() => setShowNewProject(false)} onCreate={(canvas) => void createFile(canvas)} /> : null}
      </section>
    </main>
  );
};
