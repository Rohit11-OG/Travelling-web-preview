import { NextRequest } from "next/server";
import { all, get, run, PackageRow, PlanRow } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { readJson, str } from "@/lib/http";

const BOOKING_SELECT = `
  SELECT b.*,
    COALESCE(p.title, 'Unknown Package') AS packageTitle,
    COALESCE(p.destination, '') AS destination,
    COALESCE(p.image, '') AS image,
    COALESCE(pl.name, 'Standard') AS planName,
    COALESCE(pl.tier, 'standard') AS planTier
  FROM bookings b
  LEFT JOIN packages p ON p.id = b.package_id
  LEFT JOIN plans pl ON pl.id = b.plan_id`;

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return Response.json({ error: "You must be logged in to view bookings" }, { status: 401 });
    }

    const bookings = await all(`${BOOKING_SELECT} WHERE b.user_id = ? ORDER BY b.created_at DESC`, user.id);

    return Response.json({ bookings });
  } catch (err) {
    console.error("Bookings list error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return Response.json({ error: "You must be logged in to book a trip" }, { status: 401 });
    }

    const body = await readJson(request);
    const [packageId, travelDate, customerName, email, phone, specialRequests] = [
      body.packageId, body.travelDate, body.customerName, body.email, body.phone, body.specialRequests,
    ].map(str);
    const planId = Number(body.planId);

    if (!packageId || !planId || !travelDate || !body.travelers || !customerName || !email || !phone) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const travelerCount = Number(body.travelers);
    if (!Number.isInteger(travelerCount) || travelerCount < 1 || travelerCount > 20) {
      return Response.json({ error: "Travelers must be between 1 and 20" }, { status: 400 });
    }

    // Round-trip through Date rejects calendar-impossible dates like 2027-02-31 (which JS rolls into March).
    const parsed = new Date(`${travelDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate) || isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== travelDate) {
      return Response.json({ error: "Travel date must be a valid date (YYYY-MM-DD)" }, { status: 400 });
    }
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (travelDate < todayStr) {
      return Response.json({ error: "Travel date must be in the future" }, { status: 400 });
    }

    const pkg = await get<PackageRow>("SELECT * FROM packages WHERE id = ?", packageId);
    if (!pkg) return Response.json({ error: "Package not found" }, { status: 404 });

    const plan = await get<PlanRow>("SELECT * FROM plans WHERE id = ? AND package_id = ?", planId, packageId);
    if (!plan) return Response.json({ error: "Plan not found for this package" }, { status: 404 });

    if (travelerCount > pkg.max_group_size) {
      return Response.json({ error: `This package allows a maximum of ${pkg.max_group_size} travelers` }, { status: 400 });
    }

    const unitPrice = Math.round(pkg.base_price * plan.price_multiplier);
    const totalPrice = unitPrice * travelerCount;
    const bookingId = `BK-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    await run(
      `INSERT INTO bookings (id, user_id, package_id, plan_id, travel_date, travelers, total_price, customer_name, email, phone, special_requests, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      bookingId, user.id, packageId, planId, travelDate, travelerCount, totalPrice, customerName, email, phone, specialRequests || null
    );

    const booking = await get(`${BOOKING_SELECT} WHERE b.id = ?`, bookingId);

    return Response.json({ booking }, { status: 201 });
  } catch (err) {
    console.error("Booking create error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
