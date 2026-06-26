import { randomUUID } from "node:crypto";
import { createSessionToken, hashPassword, parseBody, publicUser, sendJson, setSessionCookie } from "../_auth.js";
import { getJson, setJson } from "../_kv.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { message: "Method not allowed." });
    return;
  }

  try {
    const body = parseBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim().slice(0, 64);
    const password = String(body.password || "");

    if (!email.includes("@") || password.length < 6 || !name) {
      sendJson(res, 400, { message: "Name, valid email, and 6+ character password are required." });
      return;
    }

    const emailKey = `user:email:${email}`;
    const existingUserId = await getJson(emailKey);
    if (existingUserId) {
      sendJson(res, 409, { message: "This email is already registered." });
      return;
    }

    const user = {
      id: randomUUID(),
      email,
      name,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };

    await setJson(`user:${user.id}`, user);
    await setJson(emailKey, user.id);
    setSessionCookie(res, createSessionToken(user));
    sendJson(res, 201, { user: publicUser(user) });
  } catch (error) {
    sendJson(res, error.statusCode || 500, { message: error.message || "Register failed." });
  }
}
