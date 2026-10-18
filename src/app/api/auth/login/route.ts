import { NextRequest } from "next/server";
import { get } from "@/lib/db";
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

    const user = await get<{ id: number; name: string; email: string; password_hash: string }>(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
      email
    );

    if (!user || !verifyPassword(password, user.password_hash)) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return Response.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
