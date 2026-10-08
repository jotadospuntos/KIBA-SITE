/*
 * SERVER-ONLY. The funding application's secrets, checked before any work is
 * done so a missing one is logged by name. Set in Vercel for BOTH Production
 * and Preview, and redeploy after adding one.
 *
 *   SIGNWELL_API_KEY            SignWell API key (Settings -> API)
 *   TURNSTILE_SECRET_KEY        shared with the debt schedule
 *   GHL_PRIVATE_TOKEN           shared with the debt schedule
 *   DEBT_SCHEDULE_LINK_SECRET   shared HMAC key; the staff links here sign a
 *                               different payload, so the two can't be swapped
 */
export type SecretName =
  | 'SIGNWELL_API_KEY'
  | 'TURNSTILE_SECRET_KEY'
  | 'GHL_PRIVATE_TOKEN'
  | 'DEBT_SCHEDULE_LINK_SECRET';

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

export function missingSubmitSecrets(): SecretName[] {
  const needed: SecretName[] = ['SIGNWELL_API_KEY', 'TURNSTILE_SECRET_KEY', 'GHL_PRIVATE_TOKEN', 'DEBT_SCHEDULE_LINK_SECRET'];
  return needed.filter((name) => !process.env[name]);
}
