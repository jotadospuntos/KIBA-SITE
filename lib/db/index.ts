import 'server-only';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/*
 * SERVER-ONLY database client.
 *
 *   DATABASE_URL   Supabase's TRANSACTION pooler (port 6543). Production AND
 *                  Preview in Vercel. Serverless functions open and drop
 *                  connections constantly; the pooler is what absorbs that.
 *
 * `prepare: false` is required by the transaction pooler (it can't keep
 * prepared statements across pooled connections).
 *
 * Created lazily, so `next build` and pages that never touch the database
 * don't need the variable. Kept on globalThis so a warm function reuses its
 * pool, and so dev hot reload doesn't open a new pool on every edit.
 */

type Db = PostgresJsDatabase<typeof schema>;
const globalForDb = globalThis as unknown as { kibaDb?: Db };

export function db(): Db {
  if (globalForDb.kibaDb) return globalForDb.kibaDb;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Missing environment variable DATABASE_URL');
  const client = postgres(url, { prepare: false, max: 5 });
  globalForDb.kibaDb = drizzle(client, { schema });
  return globalForDb.kibaDb;
}

export { schema };
