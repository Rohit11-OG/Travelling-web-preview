import { createClient, type Client, type InValue } from "@libsql/client";
import path from "path";
import fs from "fs";
import { packages as seedPackages } from "../data/packages";

const globalForDb = globalThis as unknown as { db?: Promise<Client> };

function connect(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  // Vercel's disk is read-only and per-instance, so a local file can't hold users or bookings there.
  if (process.env.VERCEL) {
    throw new Error("TURSO_DATABASE_URL is not set: connect a Turso database in Vercel (Storage tab), then redeploy");
  }
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return createClient({ url: `file:${path.join(dir, "wanderlust.db")}` });
}

async function init(): Promise<Client> {
  const db = connect();
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS packages (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      destination TEXT NOT NULL,
      region TEXT NOT NULL,
      duration INTEGER NOT NULL,
      base_price INTEGER NOT NULL,
      rating REAL NOT NULL,
      reviews INTEGER NOT NULL,
      image TEXT NOT NULL,
      description TEXT NOT NULL,
      highlights TEXT NOT NULL,
      itinerary TEXT NOT NULL,
      inclusions TEXT NOT NULL,
      exclusions TEXT NOT NULL,
      category TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      max_group_size INTEGER NOT NULL DEFAULT 12
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id TEXT NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      tier TEXT NOT NULL,
      price_multiplier REAL NOT NULL,
      perks TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      package_id TEXT NOT NULL REFERENCES packages(id),
      plan_id INTEGER NOT NULL REFERENCES plans(id),
      travel_date TEXT NOT NULL,
      travelers INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      special_requests TEXT,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_plans_package ON plans(package_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `);

  const { rows } = await db.execute("SELECT COUNT(*) AS c FROM packages");
  if (Number(rows[0].c) === 0) await seedDatabase(db);
  return db;
}

const PLAN_TEMPLATES = [
  {
    name: "Standard",
    tier: "standard",
    priceMultiplier: 1.0,
    perks: [
      "Comfortable 3-star accommodation",
      "Daily breakfast included",
      "Group guided tours",
      "Standard airport transfers",
      "Travel assistance hotline",
    ],
  },
  {
    name: "Premium",
    tier: "premium",
    priceMultiplier: 1.35,
    perks: [
      "Premium 4-star accommodation",
      "All breakfasts + 3 dinners",
      "Small group tours (max 8)",
      "Private airport transfers",
      "1 exclusive experience included",
      "Priority customer support",
    ],
  },
  {
    name: "Luxury",
    tier: "luxury",
    priceMultiplier: 1.8,
    perks: [
      "Luxury 5-star accommodation",
      "All meals included",
      "Private guide & vehicle",
      "VIP airport meet & greet",
      "All exclusive experiences included",
      "24/7 concierge service",
      "Flexible date changes",
    ],
  },
];

// Idempotent (INSERT OR IGNORE / WHERE NOT EXISTS) because parallel build workers or cold starts can seed at once.
async function seedDatabase(db: Client) {
  await db.batch(
    seedPackages.flatMap((p) => [
      {
        sql: `INSERT OR IGNORE INTO packages (id, title, destination, region, duration, base_price, rating, reviews, image, description, highlights, itinerary, inclusions, exclusions, category, featured, max_group_size)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.id, p.title, p.destination, p.region, p.duration, p.price, p.rating, p.reviews,
          p.image, p.description, JSON.stringify(p.highlights), JSON.stringify(p.itinerary),
          JSON.stringify(p.inclusions), JSON.stringify(p.exclusions), p.category,
          p.featured ? 1 : 0, p.maxGroupSize,
        ],
      },
      ...PLAN_TEMPLATES.map((plan) => ({
        sql: `INSERT INTO plans (package_id, name, tier, price_multiplier, perks)
              SELECT ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM plans WHERE package_id = ? AND tier = ?)`,
        args: [p.id, plan.name, plan.tier, plan.priceMultiplier, JSON.stringify(plan.perks), p.id, plan.tier],
      })),
    ]),
    "write"
  );
}

export function getDb(): Promise<Client> {
  // On failure (e.g. a network blip) forget the promise so the next request retries instead of failing forever.
  return (globalForDb.db ??= init().catch((err) => {
    globalForDb.db = undefined;
    throw err;
  }));
}

export async function all<T>(sql: string, ...args: InValue[]): Promise<T[]> {
  const { rows } = await (await getDb()).execute({ sql, args });
  return rows as unknown as T[];
}

export async function get<T>(sql: string, ...args: InValue[]): Promise<T | undefined> {
  return (await all<T>(sql, ...args))[0];
}

export async function run(sql: string, ...args: InValue[]) {
  return (await getDb()).execute({ sql, args });
}

export interface PlanRow {
  id: number;
  package_id: string;
  name: string;
  tier: string;
  price_multiplier: number;
  perks: string;
}

export interface PackageRow {
  id: string;
  title: string;
  destination: string;
  region: string;
  duration: number;
  base_price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  highlights: string;
  itinerary: string;
  inclusions: string;
  exclusions: string;
  category: string;
  featured: number;
  max_group_size: number;
}

export interface BookingRow {
  id: string;
  user_id: number;
  package_id: string;
  plan_id: number;
  travel_date: string;
  travelers: number;
  total_price: number;
  customer_name: string;
  email: string;
  phone: string;
  special_requests: string | null;
  status: string;
  created_at: string;
}
