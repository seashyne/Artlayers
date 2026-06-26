import type { ProjectState } from "./drawing";

export interface CloudUser {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface CloudFileSummary {
  id: string;
  name: string;
  updatedAt: string;
  size: number;
}

export interface CloudFile extends CloudFileSummary {
  project: ProjectState;
}

export interface AuthPayload {
  email: string;
  password: string;
  name?: string;
}
