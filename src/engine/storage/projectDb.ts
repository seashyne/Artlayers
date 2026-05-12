import type { ProjectState } from "../../types/drawing";

const dbName = "artlayers-db";
const storeName = "projects";
const currentProjectKey = "current";

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
