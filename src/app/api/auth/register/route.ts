import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { readJson, str } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const body = await readJson(request);
    const name = str(body.name);
    const email = str(body.email).toLowerCase();
    const password = body.password;

    if (!name || !email || !password) {
      return Response.json({ error: "Name, email and password are required" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return Response.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const result = db
      .prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
      .run(name, email, hashPassword(password));

    const userId = Number(result.lastInsertRowid);
    const token = createSession(userId);
    await setSessionCookie(token);

    return Response.json({ user: { id: userId, name, email } }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
