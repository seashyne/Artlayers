import { clearSessionCookie, sendJson } from "../_auth.js";

export default function handler(_req, res) {
  clearSessionCookie(res);
  sendJson(res, 200, { ok: true });
}
