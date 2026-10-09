import {
  bigint,
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core';

/*
 * The site's database (Supabase Postgres). One source of truth for the tables:
 * change this file, then `npm run db:generate` writes a migration into
 * drizzle/ — commit both, and apply with `npm run db:migrate`.
 *
 * WHAT DOES NOT GO IN HERE (decided): SSNs, dates of birth, bank details.
 * Those stay in SignWell and in the expiring private Blob files. Submissions,
 * when they arrive, are an INDEX (who, status, a reference to the document) —
 * storing full applications is a separate decision needing field encryption,
 * a retention policy and a compliance sign-off.
 *
 * Every table has RLS enabled and NO policies. The site connects as the
 * database owner, which bypasses RLS; Supabase's public Data API (anon /
 * authenticated roles) gets nothing, even if someone switches that API back on.
 */

/* admin = everything, incl. users and the audit log. editor = the blog only. */
export const adminRole = pgEnum('admin_role', ['admin', 'editor']);
export type AdminRole = (typeof adminRole.enumValues)[number];

/* The allowlist. Google proves who someone is; this table decides whether they
   get in and what they can touch. Checked on EVERY admin request, not just at
   sign-in, so deactivating someone takes effect immediately. */
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  /* Always stored lowercase. */
  email: text('email').notNull().unique(),
  name: text('name'),
  role: adminRole('role').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastSignInAt: timestamp('last_sign_in_at', { withTimezone: true })
}).enableRLS();

export type AdminUser = typeof adminUsers.$inferSelect;

/* Who did what, append-only. `detail` is for small, non-sensitive context
   (a role change, a post title) — never form contents or anything a client
   typed. Denied sign-ins are logged with the email Google reported. */
export const auditLog = pgTable(
  'audit_log',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
    actorEmail: text('actor_email'),
    action: text('action').notNull(),
    targetType: text('target_type'),
    targetId: text('target_id'),
    detail: jsonb('detail')
  },
  (t) => [index('audit_log_at_idx').on(t.at.desc())]
).enableRLS();

export type AuditEntry = typeof auditLog.$inferSelect;
