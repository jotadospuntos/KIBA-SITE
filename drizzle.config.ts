import { defineConfig } from 'drizzle-kit';

/*
 * Migrations. `npm run db:generate` diffs lib/db/schema.ts into a new SQL file
 * in drizzle/ (no database needed); `npm run db:migrate` applies pending ones.
 *
 * Migrating uses DIRECT_URL — Supabase's SESSION pooler / direct connection
 * (port 5432) — not the transaction pooler the site runs on, because DDL wants
 * a real session. Run it from your machine with DIRECT_URL in .env.local; it is
 * deliberately NOT part of `npm run build`, so a deploy never changes the schema.
 */
export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DIRECT_URL ?? '' },
  strict: true,
  verbose: true
});
