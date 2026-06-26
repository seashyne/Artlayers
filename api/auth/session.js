import { readSession, sendJson } from "../_auth.js";

export default function handler(req, res) {
  const session = readSession(req);
  sendJson(res, 200, {
    user: session
      ? {
          id: session.userId,
          email: session.email,
          name: session.name
        }
      : null
  });
}
