import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Database is optional - app works with in-memory storage if not configured
export let pool: pg.Pool | null = null;
export let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1')
      ? { rejectUnauthorized: false }
      : undefined,
  });
  db = drizzle(pool, { schema });
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  if (!pool) {
    console.log("No DATABASE_URL configured - using in-memory storage");
    return true;
  }
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    console.log("Falling back to in-memory storage");
    return true; // Don't crash, use in-memory
  }
}
