import { randomUUID } from "node:crypto";
import { parseBody, readSession, sendJson } from "./_auth.js";
import { getJson, setJson } from "./_kv.js";

const filesKey = (userId) => `files:${userId}`;

const toSummary = (file) => ({
  id: file.id,
  name: file.name,
  updatedAt: file.updatedAt,
  size: file.size
});

const readFiles = async (userId) => getJson(filesKey(userId), []);

const writeFiles = async (userId, files) => setJson(filesKey(userId), files);

export default async function handler(req, res) {
  const session = readSession(req);
  if (!session) {
    sendJson(res, 401, { message: "Login required." });
    return;
  }

  try {
    if (req.method === "GET") {
      const files = await readFiles(session.userId);
      sendJson(res, 200, { files: files.map(toSummary) });
      return;
    }

    if (req.method === "POST" || req.method === "PUT") {
      const body = parseBody(req);
      const files = await readFiles(session.userId);
      const now = new Date().toISOString();
      const id = body.id || randomUUID();
      const project = body.project;
      const name = String(body.name || "Untitled").trim().slice(0, 80) || "Untitled";

      if (!project || !Array.isArray(project.layers)) {
        sendJson(res, 400, { message: "Project payload is required." });
        return;
      }

      const nextFile = {
        id,
        name,
        project,
        updatedAt: now,
        size: JSON.stringify(project).length
      };
      const nextFiles = [nextFile, ...files.filter((file) => file.id !== id)];
      await writeFiles(session.userId, nextFiles);
      sendJson(res, 200, { file: toSummary(nextFile) });
      return;
    }

    if (req.method === "DELETE") {
      const id = String(req.query.id || parseBody(req).id || "");
      const files = await readFiles(session.userId);
      await writeFiles(
        session.userId,
        files.filter((file) => file.id !== id)
      );
      sendJson(res, 200, { ok: true });
      return;
    }

    sendJson(res, 405, { message: "Method not allowed." });
  } catch (error) {
    sendJson(res, error.statusCode || 500, { message: error.message || "File request failed." });
  }
}
