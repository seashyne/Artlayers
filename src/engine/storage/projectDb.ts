import type { ProjectState } from "../../types/drawing";

const dbName = "artlayers-db";
const storeName = "projects";
const currentProjectKey = "current";

export interface LocalProjectFile {
  id: string;
  name: string;
  updatedAt: string;
  size: number;
  project: ProjectState;
}

export type LocalProjectSummary = Omit<LocalProjectFile, "project">;

const openProjectDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const saveProject = async (project: ProjectState): Promise<void> => {
  const db = await openProjectDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(project, currentProjectKey);
    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve();
  });
  db.close();
};

export const loadProject = async (): Promise<ProjectState | null> => {
  const db = await openProjectDb();
  const project = await new Promise<ProjectState | null>((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).get(currentProjectKey);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve((request.result as ProjectState | undefined) ?? null);
  });
  db.close();
  return project;
};

export const listLocalProjects = async (): Promise<LocalProjectSummary[]> => {
  const db = await openProjectDb();
  const files = await new Promise<LocalProjectFile[]>((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () =>
      resolve(
        (request.result as LocalProjectFile[]).filter(
          (file): file is LocalProjectFile => Boolean(file?.id && file.project)
        )
      );
  });
  db.close();
  return files
    .map(({ project: _project, ...summary }) => summary)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const saveLocalProject = async (
  project: ProjectState,
  options: { id?: string; name: string }
): Promise<LocalProjectSummary> => {
  const db = await openProjectDb();
  const now = new Date().toISOString();
  const file: LocalProjectFile = {
    id: options.id ?? crypto.randomUUID(),
    name: options.name.trim().slice(0, 80) || "Untitled Artwork",
    updatedAt: now,
    size: JSON.stringify(project).length,
    project
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(file, file.id);
    tx.objectStore(storeName).put(project, currentProjectKey);
    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve();
  });
  db.close();
  const { project: _project, ...summary } = file;
  return summary;
};

export const loadLocalProjectFile = async (id: string): Promise<ProjectState | null> => {
  const db = await openProjectDb();
  const file = await new Promise<LocalProjectFile | null>((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve((request.result as LocalProjectFile | undefined) ?? null);
  });
  db.close();
  return file?.project ?? null;
};

export const deleteLocalProjectFile = async (id: string): Promise<void> => {
  const db = await openProjectDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(id);
    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve();
  });
  db.close();
};
