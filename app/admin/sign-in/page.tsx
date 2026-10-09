import { redirect } from 'next/navigation';
import { auth, signIn } from '@/lib/auth';
import { findActiveUser } from '@/lib/admin/users';

/* Only ever send people back into /admin after signing in. The middleware
   passes an absolute URL; only its path is kept, so a callbackUrl pointing at
   another site (or anywhere outside /admin) falls back to /admin. */
function safeCallback(value: string | string[] | undefined): string {
  if (typeof value !== 'string') return '/admin';
  try {
    const { pathname, search } = new URL(value, 'http://local');
    return pathname.startsWith('/admin') && pathname !== '/admin/sign-in' ? pathname + search : '/admin';
  } catch {
    return '/admin';
  }
}

const ERRORS: Record<string, string> = {
  AccessDenied:
    "That account doesn't have access. Use your @kibadvisors.com Google account, or ask an admin to add you.",
  Configuration: 'Sign-in is not configured correctly. Let the site admin know.'
};

export default async function SignInPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const callbackUrl = safeCallback(searchParams.callbackUrl);

  /* Already signed in AND still on the allowlist → straight through. Checking
     the allowlist (not just the session) is what stops a redirect loop for a
     deactivated user, who lands here with ?error=AccessDenied. */
  const session = await auth();
  if (session?.user?.email && (await findActiveUser(session.user.email))) redirect(callbackUrl);

  const errorKey = typeof searchParams.error === 'string' ? searchParams.error : null;
  const error = errorKey ? (ERRORS[errorKey] ?? 'Sign-in failed. Please try again.') : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-line">
        <p className="font-mono text-xs tracking-widest text-blue uppercase">KIBA Admin</p>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-navy-deep">Sign in</h1>
        <p className="mt-2 text-sm text-slate">Staff only. Use your KIBA Google account.</p>

        {error && (
          <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200">
            {error}
          </p>
        )}

        <form
          className="mt-6"
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: callbackUrl });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-navy-deep px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </main>
  );
}
