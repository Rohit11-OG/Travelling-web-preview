import crypto from "crypto";
import { cookies } from "next/headers";
import { getDb, get, run } from "./db";

const SESSION_COOKIE = "wanderlust_session";
const SESSION_DAYS = 7;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  await (await getDb()).batch(
    [
      "DELETE FROM sessions WHERE expires_at <= datetime('now')",
      // Store in SQLite's own datetime format so the `expires_at > datetime('now')` check compares like with like.
      {
        sql: "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, datetime('now', ?))",
        args: [token, userId, `+${SESSION_DAYS} days`],
      },
    ],
    "write"
  );
  return token;
}

export async function deleteSession(token: string) {
  await run("DELETE FROM sessions WHERE token = ?", token);
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
}

export async function getUserByToken(token: string): Promise<SessionUser | null> {
  const row = await get<SessionUser>(
    `SELECT u.id, u.name, u.email FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > datetime('now')`,
    token
  );
  return row ?? null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getUserByToken(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export { SESSION_COOKIE };
