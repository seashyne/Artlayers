import { createSessionToken, parseBody, publicUser, sendJson, setSessionCookie, verifyPassword } from "../_auth.js";
import { getJson } from "../_kv.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { message: "Method not allowed." });
    return;
  }

  try {
    const body = parseBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const userId = await getJson(`user:email:${email}`);
    const user = userId ? await getJson(`user:${userId}`) : null;

    if (!user || !verifyPassword(password, user.passwordHash)) {
      sendJson(res, 401, { message: "Invalid email or password." });
      return;
    }

    setSessionCookie(res, createSessionToken(user));
    sendJson(res, 200, { user: publicUser(user) });
  } catch (error) {
    sendJson(res, error.statusCode || 500, { message: error.message || "Login failed." });
  }
}
