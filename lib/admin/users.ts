import 'server-only';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { adminUsers, type AdminUser } from '@/lib/db/schema';

/* Only Google Workspace accounts on this domain can ever be admin users. */
export const ADMIN_DOMAIN = 'kibadvisors.com';

export function isAdminDomainEmail(email: string): boolean {
  return email.toLowerCase().endsWith(`@${ADMIN_DOMAIN}`);
}

export async function findActiveUser(email: string): Promise<AdminUser | null> {
  const [user] = await db()
    .select()
    .from(adminUsers)
    .where(and(eq(adminUsers.email, email.toLowerCase()), eq(adminUsers.active, true)))
    .limit(1);
  return user ?? null;
}
