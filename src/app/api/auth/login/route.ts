import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { readJson, str } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const body = await readJson(request);
    const email = str(body.email).toLowerCase();
    const password = body.password;

    if (!email || typeof password !== "string" || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    const db = getDb();
    const user = db
      .prepare("SELECT id, name, email, password_hash FROM users WHERE email = ?")
      .get(email) as { id: number; name: string; email: string; password_hash: string } | undefined;

    if (!user || !verifyPassword(password, user.password_hash)) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = createSession(user.id);
    await setSessionCookie(token);

    return Response.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
