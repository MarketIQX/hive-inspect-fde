import { Pool } from "pg";

let pool: Pool | undefined;

/**
 * Single shared connection pool, built from DATABASE_URL. Works against
 * both local Supabase (`npx supabase start`) and a hosted Supabase
 * project — the schema and this module don't change, only the
 * environment variable's value does.
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set. See .env.example.");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}
