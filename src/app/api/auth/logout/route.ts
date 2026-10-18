import { cookies } from "next/headers";
import { deleteSession, clearSessionCookie, SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) await deleteSession(token);
    await clearSessionCookie();
    return Response.json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
