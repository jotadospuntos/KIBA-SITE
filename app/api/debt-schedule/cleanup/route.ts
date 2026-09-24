import type { NextRequest } from 'next/server';
import { RETENTION_DAYS } from '@/lib/debt-schedule/constants';
import { secret } from '@/lib/debt-schedule/env';
import { deleteExpired } from '@/lib/debt-schedule/storage';

/*
 * GET /api/debt-schedule/cleanup — the retention job. Run daily by the Vercel
 * cron in vercel.json, which sends `Authorization: Bearer $CRON_SECRET`.
 * Deletes every debt-schedule blob older than RETENTION_DAYS (45).
 *
 * Vercel only runs crons on PRODUCTION deployments, so on a preview this
 * never fires by itself.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  let expected: string;
  try {
    expected = `Bearer ${secret('CRON_SECRET')}`;
  } catch {
    console.error('[debt-schedule] cleanup - CRON_SECRET is not set');
    return new Response('Not configured', { status: 500 });
  }
  if (req.headers.get('authorization') !== expected) return new Response('Unauthorized', { status: 401 });

  try {
    const removed = await deleteExpired();
    console.log(`[debt-schedule] cleanup removed ${removed} blob(s) older than ${RETENTION_DAYS} days`);
    return Response.json({ removed });
  } catch (e) {
    console.error(`[debt-schedule] cleanup failed - ${e instanceof Error ? e.message : 'unknown error'}`);
    return new Response('Cleanup failed', { status: 500 });
  }
}
