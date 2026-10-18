import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { packages as seedPackages } from "../data/packages";

const DB_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
const DB_PATH = path.join(DB_DIR, "wanderlust.db");

const globalForDb = globalThis as unknown as { db?: Database.Database };

function createDb() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema(db);
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
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

  const pkgCount = (db.prepare("SELECT COUNT(*) as c FROM packages").get() as { c: number }).c;
  if (pkgCount === 0) seedDatabase(db);
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

function seedDatabase(db: Database.Database) {
  const insertPkg = db.prepare(`
    INSERT INTO packages (id, title, destination, region, duration, base_price, rating, reviews, image, description, highlights, itinerary, inclusions, exclusions, category, featured, max_group_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertPlan = db.prepare(`
    INSERT INTO plans (package_id, name, tier, price_multiplier, perks)
    VALUES (?, ?, ?, ?, ?)
  `);

  const seedAll = db.transaction(() => {
    for (const p of seedPackages) {
      insertPkg.run(
        p.id, p.title, p.destination, p.region, p.duration, p.price, p.rating, p.reviews,
        p.image, p.description, JSON.stringify(p.highlights), JSON.stringify(p.itinerary),
        JSON.stringify(p.inclusions), JSON.stringify(p.exclusions), p.category,
        p.featured ? 1 : 0, p.maxGroupSize
      );
      for (const plan of PLAN_TEMPLATES) {
        insertPlan.run(p.id, plan.name, plan.tier, plan.priceMultiplier, JSON.stringify(plan.perks));
      }
    }
  });
  seedAll();
}

export function getDb() {
  if (!globalForDb.db) globalForDb.db = createDb();
  return globalForDb.db;
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
