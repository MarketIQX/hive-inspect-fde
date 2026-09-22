import { existsSync } from "fs";

// Loads .env.local for tests that touch the local database (e.g.
// tests/db.*.test.ts), the same file `next dev` loads automatically.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}
