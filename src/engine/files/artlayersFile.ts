import type { ProjectState } from "../../types/drawing";

const fileVersion = 1;
const fileExtension = "artlayers";
const mimeType = "application/vnd.artlayers.project+json";

interface ArtlayersDocument {
  app: "Artlayers";
  version: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  project: ProjectState;
}

const isProjectState = (value: unknown): value is ProjectState => {
  const project = value as ProjectState;
  return Boolean(
    project &&
      Array.isArray(project.layers) &&
      typeof project.activeLayerId === "string" &&
      project.camera &&
      project.canvas
  );
};

const normalizeFileName = (name: string): string => {
  const cleaned = name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9ก-๙ _-]/gi, "")
    .trim();
  return cleaned || "Untitled Artwork";
};

export const createArtlayersDocument = (project: ProjectState, name: string): ArtlayersDocument => {
  const now = new Date().toISOString();
  return {
    app: "Artlayers",
    version: fileVersion,
    name: normalizeFileName(name),
    createdAt: now,
    updatedAt: now,
    project
  };
};

export const downloadArtlayersFile = (project: ProjectState, name: string): void => {
  const document = createArtlayersDocument(project, name);
  const blob = new Blob([JSON.stringify(document, null, 2)], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = documentObject.createElement("a");
  anchor.href = url;
  anchor.download = `${document.name}.${fileExtension}`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const readArtlayersFile = async (file: File): Promise<{ name: string; project: ProjectState }> => {
  const text = await file.text();
  const payload = JSON.parse(text) as Partial<ArtlayersDocument>;

  if (payload.app !== "Artlayers" || payload.version !== fileVersion || !isProjectState(payload.project)) {
    throw new Error("This is not a valid Artlayers project file.");
  }

  return {
    name: normalizeFileName(payload.name || file.name),
    project: payload.project
  };
};

const documentObject = document;
