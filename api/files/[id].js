import { readSession, sendJson } from "../_auth.js";
import { getJson } from "../_kv.js";

export default async function handler(req, res) {
  const session = readSession(req);
  if (!session) {
    sendJson(res, 401, { message: "Login required." });
    return;
  }

  try {
    const files = await getJson(`files:${session.userId}`, []);
    const file = files.find((candidate) => candidate.id === req.query.id);
    if (!file) {
      sendJson(res, 404, { message: "File not found." });
      return;
    }

    sendJson(res, 200, { file });
  } catch (error) {
    sendJson(res, error.statusCode || 500, { message: error.message || "Open file failed." });
  }
}
