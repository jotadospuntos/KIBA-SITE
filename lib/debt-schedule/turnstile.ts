import { secret } from './env';

/*
 * SERVER-ONLY. Cloudflare Turnstile verification. The only abuse protection
 * on the route for now - IP rate limiting was deliberately skipped (decided by
 * the human; add a store such as Upstash if it's ever needed).
 *
 * Tokens are single-use and expire after 300s, so the form fetches a fresh one
 * for every submit attempt.
 */
export async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  if (!token) return false;
  const body = new URLSearchParams({ secret: secret('TURNSTILE_SECRET_KEY'), response: token });
  if (ip) body.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body
  });
  if (!res.ok) return false;
  const json = (await res.json()) as { success?: boolean };
  return json.success === true;
}
