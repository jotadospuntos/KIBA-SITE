'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdminUser } from '@/lib/admin/access';
import { audit } from '@/lib/admin/audit';
import { isAdminDomainEmail } from '@/lib/admin/users';
import { db } from '@/lib/db';
import { adminRole, adminUsers } from '@/lib/db/schema';

/*
 * User management. Admin-only, re-checked inside every action (a server action
 * is a public POST endpoint; the page's own check doesn't protect it).
 *
 * An admin can't change their own role or deactivate themselves, so the last
 * admin can never lock everyone out.
 *
 * Results come back as ?ok= / ?error= on /admin/users rather than client state,
 * so the forms work without any client JavaScript.
 */

const role = z.enum(adminRole.enumValues);

function done(param: 'ok' | 'error', message: string): never {
  revalidatePath('/admin/users');
  redirect(`/admin/users?${param}=${encodeURIComponent(message)}`);
}

export async function createUser(formData: FormData) {
  const me = await requireAdminUser('admin');
  const parsed = z
    .object({ email: z.string().trim().toLowerCase().pipe(z.email()), role })
    .safeParse({ email: formData.get('email'), role: formData.get('role') });
  if (!parsed.success) done('error', 'Enter a valid email address and pick a role.');
  const { email, role: newRole } = parsed.data;
  if (!isAdminDomainEmail(email)) done('error', 'Only @kibadvisors.com accounts can be added.');

  const [created] = await db()
    .insert(adminUsers)
    .values({ email, role: newRole })
    .onConflictDoNothing({ target: adminUsers.email })
    .returning({ id: adminUsers.id });
  if (!created) done('error', `${email} is already on the list.`);

  await audit({
    actorEmail: me.email,
    action: 'user.create',
    targetType: 'admin_user',
    targetId: email,
    detail: { role: newRole }
  });
  done('ok', `Added ${email} as ${newRole}.`);
}

async function loadTarget(formData: FormData) {
  const me = await requireAdminUser('admin');
  const id = z.uuid().safeParse(formData.get('id'));
  if (!id.success) done('error', 'Unknown user.');
  const [target] = await db().select().from(adminUsers).where(eq(adminUsers.id, id.data)).limit(1);
  if (!target) done('error', 'Unknown user.');
  if (target.id === me.id) done('error', "You can't change your own access.");
  return { me, target };
}

export async function changeRole(formData: FormData) {
  const { me, target } = await loadTarget(formData);
  const next = role.safeParse(formData.get('role'));
  if (!next.success) done('error', 'Pick a role.');
  if (next.data === target.role) done('ok', `${target.email} is already ${next.data}.`);

  await db().update(adminUsers).set({ role: next.data }).where(eq(adminUsers.id, target.id));
  await audit({
    actorEmail: me.email,
    action: 'user.role_change',
    targetType: 'admin_user',
    targetId: target.email,
    detail: { from: target.role, to: next.data }
  });
  done('ok', `${target.email} is now ${next.data}.`);
}

export async function setActive(formData: FormData) {
  const { me, target } = await loadTarget(formData);
  const active = formData.get('active') === 'true';

  await db().update(adminUsers).set({ active }).where(eq(adminUsers.id, target.id));
  await audit({
    actorEmail: me.email,
    action: active ? 'user.reactivate' : 'user.deactivate',
    targetType: 'admin_user',
    targetId: target.email
  });
  done('ok', `${target.email} ${active ? 'can sign in again' : 'can no longer sign in'}.`);
}
