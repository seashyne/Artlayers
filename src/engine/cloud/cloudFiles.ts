import type { AuthPayload, CloudFile, CloudFileSummary, CloudUser } from "../../types/cloud";
import type { ProjectState } from "../../types/drawing";

interface ApiErrorPayload {
  message?: string;
}

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    },
    ...init
  });
  const payload = (await response.json()) as T & ApiErrorPayload;

  if (!response.ok) {
    throw new Error(payload.message ?? "Cloud request failed.");
  }

  return payload;
};

export const getSession = async (): Promise<CloudUser | null> => {
  const payload = await request<{ user: CloudUser | null }>("/api/auth/session");
  return payload.user;
};

export const register = async (payload: AuthPayload): Promise<CloudUser> => {
  const response = await request<{ user: CloudUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return response.user;
};

export const login = async (payload: AuthPayload): Promise<CloudUser> => {
  const response = await request<{ user: CloudUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return response.user;
};

export const logout = async (): Promise<void> => {
  await request<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
};

export const listFiles = async (): Promise<CloudFileSummary[]> => {
  const response = await request<{ files: CloudFileSummary[] }>("/api/files");
  return response.files;
};

export const openFile = async (id: string): Promise<CloudFile> => {
  const response = await request<{ file: CloudFile }>(`/api/files/${encodeURIComponent(id)}`);
  return response.file;
};

export const saveFile = async (
  project: ProjectState,
  options: { id?: string; name: string }
): Promise<CloudFileSummary> => {
  const response = await request<{ file: CloudFileSummary }>("/api/files", {
    method: "POST",
    body: JSON.stringify({ ...options, project })
  });
  return response.file;
};

export const deleteFile = async (id: string): Promise<void> => {
  await request<{ ok: boolean }>(`/api/files?id=${encodeURIComponent(id)}`, { method: "DELETE" });
};
