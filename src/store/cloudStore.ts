import { create } from "zustand";
import {
  deleteFile,
  getSession,
  listFiles,
  login,
  logout,
  openFile,
  register,
  saveFile
} from "../engine/cloud/cloudFiles";
import type { AuthPayload, CloudFileSummary, CloudUser } from "../types/cloud";
import type { ProjectState } from "../types/drawing";

type CloudStatus = "idle" | "loading" | "saving" | "error";
type AuthMode = "login" | "register";

interface CloudState {
  user: CloudUser | null;
  files: CloudFileSummary[];
  selectedFileId: string | null;
  status: CloudStatus;
  authMode: AuthMode;
  bootstrapped: boolean;
  error: string | null;
  setAuthMode: (mode: AuthMode) => void;
  bootstrap: () => Promise<void>;
  signIn: (payload: AuthPayload) => Promise<void>;
  signUp: (payload: AuthPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshFiles: () => Promise<void>;
  saveProject: (project: ProjectState, name?: string) => Promise<CloudFileSummary>;
  loadProject: (id: string) => Promise<ProjectState>;
  removeFile: (id: string) => Promise<void>;
  clearError: () => void;
}

const createDefaultFileName = () => {
  const date = new Date();
  return `Artwork ${date.toLocaleDateString(undefined, { month: "short", day: "2-digit" })}`;
};

const sortFiles = (files: CloudFileSummary[]) =>
  [...files].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

export const useCloudStore = create<CloudState>((set, get) => ({
  user: null,
  files: [],
  selectedFileId: null,
  status: "idle",
  authMode: "login",
  bootstrapped: false,
  error: null,
  setAuthMode: (authMode) => set({ authMode, error: null }),
  bootstrap: async () => {
    if (get().bootstrapped) {
      return;
    }
    set({ status: "loading", error: null });
    try {
      const user = await getSession();
      set({ user, bootstrapped: true, status: "idle" });
      if (user) {
        await get().refreshFiles();
      }
    } catch (error) {
      set({ bootstrapped: true, status: "error", error: (error as Error).message });
    }
  },
  signIn: async (payload) => {
    set({ status: "loading", error: null });
    try {
      const user = await login(payload);
      set({ user, status: "idle" });
      await get().refreshFiles();
    } catch (error) {
      set({ status: "error", error: (error as Error).message });
    }
  },
  signUp: async (payload) => {
    set({ status: "loading", error: null });
    try {
      const user = await register(payload);
      set({ user, status: "idle" });
      await get().refreshFiles();
    } catch (error) {
      set({ status: "error", error: (error as Error).message });
    }
  },
  signOut: async () => {
    set({ status: "loading", error: null });
    await logout();
    set({ user: null, files: [], selectedFileId: null, status: "idle" });
  },
  refreshFiles: async () => {
    set({ status: "loading", error: null });
    try {
      const files = await listFiles();
      set({ files: sortFiles(files), status: "idle" });
    } catch (error) {
      set({ status: "error", error: (error as Error).message });
    }
  },
  saveProject: async (project, name) => {
    set({ status: "saving", error: null });
    try {
      const selected = get().files.find((file) => file.id === get().selectedFileId);
      const file = await saveFile(project, {
        id: selected?.id,
        name: name ?? selected?.name ?? createDefaultFileName()
      });
      set((state) => ({
        files: sortFiles([file, ...state.files.filter((candidate) => candidate.id !== file.id)]),
        selectedFileId: file.id,
        status: "idle"
      }));
      return file;
    } catch (error) {
      set({ status: "error", error: (error as Error).message });
      throw error;
    }
  },
  loadProject: async (id) => {
    set({ status: "loading", error: null });
    try {
      const file = await openFile(id);
      set({ selectedFileId: file.id, status: "idle" });
      return file.project;
    } catch (error) {
      set({ status: "error", error: (error as Error).message });
      throw error;
    }
  },
  removeFile: async (id) => {
    set({ status: "loading", error: null });
    try {
      await deleteFile(id);
      set((state) => ({
        files: state.files.filter((file) => file.id !== id),
        selectedFileId: state.selectedFileId === id ? null : state.selectedFileId,
        status: "idle"
      }));
    } catch (error) {
      set({ status: "error", error: (error as Error).message });
    }
  },
  clearError: () => set({ error: null, status: "idle" })
}));
