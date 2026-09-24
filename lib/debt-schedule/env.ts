/*
 * SERVER-ONLY. The debt schedule's secrets, read in one place so a missing one
 * fails loudly with its own name instead of as a confusing 401 from GoHighLevel
 * or Cloudflare three calls later. Set all of them in Vercel for BOTH
 * Production and Preview.
 *
 *   GHL_PRIVATE_TOKEN           GoHighLevel Private Integration token
 *   TURNSTILE_SECRET_KEY        Cloudflare Turnstile secret
 *   DEBT_SCHEDULE_LINK_SECRET   HMAC key for the signed PDF links (any long random string)
 *   CRON_SECRET                 Vercel sends it to the cleanup cron as a Bearer token
 *   BLOB_READ_WRITE_TOKEN       added by Vercel when the Blob store is connected
 */
export type SecretName =
  | 'GHL_PRIVATE_TOKEN'
  | 'TURNSTILE_SECRET_KEY'
  | 'DEBT_SCHEDULE_LINK_SECRET'
  | 'CRON_SECRET'
  | 'BLOB_READ_WRITE_TOKEN';

export class MissingSecretError extends Error {
  constructor(name: SecretName) {
    super(`Missing environment variable ${name}`);
    this.name = 'MissingSecretError';
  }
}

export function secret(name: SecretName): string {
  const value = process.env[name];
  if (!value) throw new MissingSecretError(name);
  return value;
}
