import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const sessionCookieName = "artlayers_session";
const sessionTtlSeconds = 60 * 60 * 24 * 7;

const base64Url = (value) => Buffer.from(value).toString("base64url");
const fromBase64Url = (value) => Buffer.from(value, "base64url").toString("utf8");

const getSecret = () => process.env.AUTH_SECRET || "local-development-secret-change-me";

const signValue = (value) => createHmac("sha256", getSecret()).update(value).digest("base64url");

export const parseBody = (req) => {
  if (!req.body) {
    return {};
  }
  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }
  return req.body;
};

export const sendJson = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

export const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  createdAt: user.createdAt
});

export const hashPassword = (password) => {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("base64url");
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
};

export const verifyPassword = (password, storedHash) => {
  const [, iterations, salt, expectedHash] = storedHash.split("$");
  const actual = pbkdf2Sync(password, salt, Number(iterations), 32, "sha256");
  const expected = Buffer.from(expectedHash, "base64url");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

export const createSessionToken = (user) => {
  const payload = base64Url(
    JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + sessionTtlSeconds
    })
  );
  return `${payload}.${signValue(payload)}`;
};

export const readSession = (req) => {
  const cookies = Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map((cookie) => cookie.trim().split("="))
      .filter(([key, value]) => key && value)
  );
  const token = cookies[sessionCookieName];
  if (!token) {
    return null;
  }
  const [payload, signature] = token.split(".");
  if (!payload || !signature || signValue(payload) !== signature) {
    return null;
  }
  const session = JSON.parse(fromBase64Url(payload));
  if (session.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return session;
};

export const setSessionCookie = (res, token) => {
  res.setHeader(
    "Set-Cookie",
    `${sessionCookieName}=${token}; Path=/; Max-Age=${sessionTtlSeconds}; HttpOnly; SameSite=Lax; Secure`
  );
};

export const clearSessionCookie = (res) => {
  res.setHeader("Set-Cookie", `${sessionCookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`);
};
