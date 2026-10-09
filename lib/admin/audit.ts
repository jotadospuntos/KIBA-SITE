import 'server-only';
import { db } from '@/lib/db';
import { auditLog } from '@/lib/db/schema';

/* Every action the audit log knows about. Add to this list rather than
   inventing strings at the call site, so the log stays filterable. */
export type AuditAction =
  | 'auth.sign_in'
  | 'auth.sign_in_denied'
  | 'auth.sign_out'
  | 'user.create'
  | 'user.role_change'
  | 'user.deactivate'
  | 'user.reactivate'
  | 'blog.create'
  | 'blog.update'
  | 'blog.publish'
  | 'blog.schedule'
  | 'blog.unpublish'
  | 'blog.delete'
  | 'blog.image_upload'
  | 'blog.category_create'
  | 'blog.category_rename'
  | 'blog.category_delete';

/* Awaited, and allowed to throw: an action we couldn't record is an action
   that shouldn't silently succeed. `detail` must never hold form contents or
   anything a client typed — see lib/db/schema.ts. */
export async function audit(entry: {
  actorEmail: string | null;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  detail?: Record<string, unknown>;
}): Promise<void> {
  await db()
    .insert(auditLog)
    .values({
      actorEmail: entry.actorEmail,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      detail: entry.detail ?? null
    });
}
