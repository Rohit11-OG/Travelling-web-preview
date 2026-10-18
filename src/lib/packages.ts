import { cacheLife } from "next/cache";
import { getDb, PackageRow, PlanRow } from "./db";
import type { ApiPackage } from "../types";

function toApiPackage(row: PackageRow, plans: PlanRow[]): ApiPackage {
  return {
    ...row,
    highlights: JSON.parse(row.highlights),
    itinerary: JSON.parse(row.itinerary),
    inclusions: JSON.parse(row.inclusions),
    exclusions: JSON.parse(row.exclusions),
    featured: row.featured === 1,
    plans: plans.map((p) => ({ ...p, perks: JSON.parse(p.perks), price: Math.round(row.base_price * p.price_multiplier) })),
  };
}

// Package data is seed-only (no admin writes), so it is safe to cache and bake into the static shell.
export async function getPackages(): Promise<ApiPackage[]> {
  "use cache";
  cacheLife("hours");
  const db = getDb();
  const plans = db.prepare("SELECT * FROM plans ORDER BY price_multiplier ASC").all() as PlanRow[];
  const rows = db.prepare("SELECT * FROM packages").all() as PackageRow[];
  return rows.map((row) => toApiPackage(row, plans.filter((p) => p.package_id === row.id)));
}

export async function getPackage(id: string): Promise<ApiPackage | null> {
  "use cache";
  cacheLife("hours");
  const db = getDb();
  const row = db.prepare("SELECT * FROM packages WHERE id = ?").get(id) as PackageRow | undefined;
  if (!row) return null;
  const plans = db.prepare("SELECT * FROM plans WHERE package_id = ? ORDER BY price_multiplier ASC").all(id) as PlanRow[];
  return toApiPackage(row, plans);
}
