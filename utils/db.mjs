import pg from "pg";
import "dotenv/config";
const { Pool } = pg;


const connectionString = process.env.CONNECTION_STRING || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing CONNECTION_STRING or DATABASE_URL environment variable");
}

const isHostedPostgres =
  connectionString.includes("supabase.co") ||
  connectionString.includes("render.com") ||
  connectionString.includes("neon.tech");

const connectionPool = new Pool({
  connectionString,
  ssl: isHostedPostgres ? { rejectUnauthorized: false } : undefined,
});

connectionPool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

export default connectionPool;