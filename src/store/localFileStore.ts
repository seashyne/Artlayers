import { create } from "zustand";
import {
  deleteLocalProjectFile,
  listLocalProjects,
  loadLocalProjectFile,
  saveLocalProject,
  type LocalProjectSummary
} from "../engine/storage/projectDb";
import type { ProjectState } from "../types/drawing";

type LocalStatus = "idle" | "loading" | "saving" | "error";

interface LocalFileState {
  files: LocalProjectSummary[];
  selectedFileId: string | null;
  status: LocalStatus;
  error: string | null;
  refreshFiles: () => Promise<void>;
  saveProject: (project: ProjectState, name?: string) => Promise<LocalProjectSummary>;
  loadProject: (id: string) => Promise<ProjectState | null>;
  removeFile: (id: string) => Promise<void>;
}

const createDefaultFileName = () => {
  const date = new Date();
  return `Local Artwork ${date.toLocaleDateString(undefined, { month: "short", day: "2-digit" })}`;
};

const sortFiles = (files: LocalProjectSummary[]) =>
  [...files].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

export const useLocalFileStore = create<LocalFileState>((set, get) => ({
  files: [],
  selectedFileId: null,
  status: "idle",
  error: null,
  refreshFiles: async () => {
    set({ status: "loading", error: null });
    try {
      set({ files: await listLocalProjects(), status: "idle" });
    } catch (error) {
      set({ status: "error", error: (error as Error).message });
    }
  },
  saveProject: async (project, name) => {
    set({ status: "saving", error: null });
    try {
      const selected = get().files.find((file) => file.id === get().selectedFileId);
      const file = await saveLocalProject(project, {
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
      const project = await loadLocalProjectFile(id);
      set({ selectedFileId: project ? id : null, status: "idle" });
      return project;
    } catch (error) {
      set({ status: "error", error: (error as Error).message });
      throw error;
    }
  },
  removeFile: async (id) => {
    set({ status: "loading", error: null });
    try {
      await deleteLocalProjectFile(id);
      set((state) => ({
        files: state.files.filter((file) => file.id !== id),
        selectedFileId: state.selectedFileId === id ? null : state.selectedFileId,
        status: "idle"
      }));
    } catch (error) {
      set({ status: "error", error: (error as Error).message });
    }
  }
}));
