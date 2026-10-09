import NextAuth from 'next-auth';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { audit } from '@/lib/admin/audit';
import { ADMIN_DOMAIN, findActiveUser, isAdminDomainEmail } from '@/lib/admin/users';
import { authConfig } from './config';

/*
 * The admin login (Node runtime). Who may sign in is decided HERE, server-side:
 * a Google account whose email Google has verified, that belongs to the
 * kibadvisors.com Workspace, AND that is an active row in admin_users.
 * Anything else is refused and logged as auth.sign_in_denied.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      if (account?.provider !== 'google' || !profile?.email) return false;
      const email = profile.email.toLowerCase();

      const fromWorkspace =
        profile.email_verified === true && profile.hd === ADMIN_DOMAIN && isAdminDomainEmail(email);
      const user = fromWorkspace ? await findActiveUser(email) : null;

      if (!user) {
        await audit({ actorEmail: email, action: 'auth.sign_in_denied' });
        return false;
      }

      await db()
        .update(adminUsers)
        .set({ lastSignInAt: new Date(), name: user.name ?? profile.name ?? null })
        .where(eq(adminUsers.id, user.id));
      await audit({ actorEmail: email, action: 'auth.sign_in' });
      return true;
    },
    jwt({ token, profile }) {
      if (profile?.email) token.email = profile.email.toLowerCase();
      return token;
    }
  }
});
