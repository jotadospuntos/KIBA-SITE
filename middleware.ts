import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

/*
 * First fence around /admin: no session cookie → the sign-in page (or a 401
 * for /api/admin). Edge runtime, so it can't reach the database; the allowlist
 * and role checks happen in lib/admin/access.ts on every request.
 *
 * Only these paths run middleware. The public site is untouched.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
