import { NextRequest } from "next/server";
import { getDb, BookingRow } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { readJson } from "@/lib/http";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/bookings/[id]">) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;
    const { action } = await readJson(request);

    if (action !== "cancel") {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    const db = getDb();
    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id) as BookingRow | undefined;
    if (!booking) return Response.json({ error: "Booking not found" }, { status: 404 });
    if (booking.user_id !== user.id) return Response.json({ error: "Forbidden" }, { status: 403 });
    if (booking.status === "cancelled") return Response.json({ error: "Booking is already cancelled" }, { status: 400 });

    db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(id);

    return Response.json({ booking: { ...booking, status: "cancelled" } });
  } catch (err) {
    console.error("Booking cancel error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/bookings/[id]">) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;
    const db = getDb();
    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id) as BookingRow | undefined;
    if (!booking) return Response.json({ error: "Booking not found" }, { status: 404 });
    if (booking.user_id !== user.id) return Response.json({ error: "Forbidden" }, { status: 403 });
    if (booking.status !== "cancelled") {
      return Response.json({ error: "Only cancelled bookings can be removed" }, { status: 400 });
    }

    db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
    return Response.json({ success: true });
  } catch (err) {
    console.error("Booking delete error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
