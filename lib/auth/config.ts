import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

/*
 * EDGE-SAFE half of the admin login: no database imports. middleware.ts uses
 * only this; lib/auth/index.ts adds the database checks on top.
 *
 * Sign-in is "Sign in with Google", limited to the kibadvisors.com Workspace.
 * The `hd` parameter only pre-filters Google's account picker — it is a hint
 * anyone can strip from the URL. The real checks (verified email, `hd` claim,
 * the admin_users allowlist) run server-side in lib/auth/index.ts.
 *
 * Env (Production; see .env.example): AUTH_SECRET, AUTH_GOOGLE_ID,
 * AUTH_GOOGLE_SECRET. Auth.js reads them by those names.
 */
export const authConfig = {
  providers: [
    Google({
      authorization: { params: { hd: 'kibadvisors.com', prompt: 'select_account' } }
    })
  ],
  pages: { signIn: '/admin/sign-in', error: '/admin/sign-in' },
  /* A signed, encrypted cookie; no session table. Revocation doesn't depend on
     it expiring: every admin request re-checks admin_users (lib/admin/access.ts). */
  session: { strategy: 'jwt', maxAge: 12 * 60 * 60 },
  callbacks: {
    /* Middleware gate: signed out → sign-in page (or a 401 for admin APIs). It
       only proves a valid session exists; role and active status are checked
       against the database by every page and action. */
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname === '/admin/sign-in') return true;
      if (auth?.user?.email) return true;
      if (pathname.startsWith('/api/admin')) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return false;
    }
  }
} satisfies NextAuthConfig;
