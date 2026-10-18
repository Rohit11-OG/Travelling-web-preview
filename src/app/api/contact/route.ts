import { NextRequest } from "next/server";
import { run } from "@/lib/db";
import { readJson, str } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const body = await readJson(request);
    const [name, email, subject, message] = [body.name, body.email, body.subject, body.message].map(str);

    if (!name || !email || !subject || !message) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }

    await run("INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)", name, email, subject, message);

    return Response.json({ success: true, message: "Message received. We will get back to you within 24 hours." }, { status: 201 });
  } catch (err) {
    console.error("Contact error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
