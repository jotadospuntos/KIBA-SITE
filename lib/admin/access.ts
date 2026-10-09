import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import type { AdminRole, AdminUser } from '@/lib/db/schema';
import { findActiveUser } from './users';

/*
 * THE gate for every admin page and server action. Call it first, every time —
 * the middleware only proves a session cookie exists; this re-checks the
 * allowlist on each request, so a deactivated user or a changed role takes
 * effect immediately rather than when their 12-hour session expires.
 *
 * An editor asking for an admin-only page gets a 404, not a "forbidden":
 * there's no reason to tell them the page exists.
 */
export async function requireAdminUser(need: AdminRole = 'editor'): Promise<AdminUser> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect('/admin/sign-in');

  const user = await findActiveUser(email);
  if (!user) redirect('/admin/sign-in?error=AccessDenied');
  if (need === 'admin' && user.role !== 'admin') notFound();
  return user;
}
