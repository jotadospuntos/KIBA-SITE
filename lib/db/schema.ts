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

/* ---------------------------------------------------------------- blog --- */

/* Managed in /admin/blog/categories (admins). Deleting one that a post uses is
   refused rather than cascading, so a post never silently loses its category. */
export const blogCategories = pgTable('blog_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}).enableRLS();

export type BlogCategory = typeof blogCategories.$inferSelect;

/* draft = never public. published = public from `publish_at` on, so a
   published post with a future publish_at is "scheduled" — there is no third
   status to keep in sync. */
export const blogPostStatus = pgEnum('blog_post_status', ['draft', 'published']);

export const blogPosts = pgTable(
  'blog_posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /* The URL: /blog/<slug>. The three posts moved from WordPress keep their
       original slugs, which next.config.js's redirects depend on. */
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    /* Card text on /blog and the "More from the blog" grid. */
    excerpt: text('excerpt').notNull().default(''),
    /* Search-result description; falls back to the excerpt when empty. */
    searchDescription: text('search_description').notNull().default(''),
    categoryId: uuid('category_id').references(() => blogCategories.id, { onDelete: 'restrict' }),
    /* A team member's display name (app/meet-our-team/team-data.ts). Stored as
       text so a post keeps its byline if someone later leaves the team page. */
    author: text('author').notNull(),
    /* Social-share image (og:image). Optional; the site default is used without. */
    coverImageUrl: text('cover_image_url'),
    coverImageAlt: text('cover_image_alt').notNull().default(''),
    /* Tiptap / ProseMirror JSON. Sanitized to an allowlist on every save
       (lib/blog/doc.ts) and rendered by our own renderer, never as raw HTML. */
    body: jsonb('body').notNull(),
    status: blogPostStatus('status').notNull().default('draft'),
    publishAt: timestamp('publish_at', { withTimezone: true }),
    createdBy: text('created_by').notNull(),
    updatedBy: text('updated_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (t) => [index('blog_posts_public_idx').on(t.status, t.publishAt.desc())]
).enableRLS();

export type BlogPost = typeof blogPosts.$inferSelect;

/* A full snapshot on every save, so any earlier version can be restored from
   the editor. Deleted with the post. */
export const blogPostRevisions = pgTable(
  'blog_post_revisions',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    postId: uuid('post_id')
      .notNull()
      .references(() => blogPosts.id, { onDelete: 'cascade' }),
    savedAt: timestamp('saved_at', { withTimezone: true }).notNull().defaultNow(),
    savedBy: text('saved_by').notNull(),
    snapshot: jsonb('snapshot').notNull()
  },
  (t) => [index('blog_post_revisions_post_idx').on(t.postId, t.savedAt.desc())]
).enableRLS();
