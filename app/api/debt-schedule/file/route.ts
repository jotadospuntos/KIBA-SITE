import type { NextRequest } from 'next/server';
import { verifySignedPdf } from '@/lib/debt-schedule/signed-link';
import { readPdf } from '@/lib/debt-schedule/storage';

/*
 * GET /api/debt-schedule/file?id&exp&sig — streams one PDF out of the private
 * Blob store, only for a genuine, unexpired signed link (see signed-link.ts).
 * Anything else gets the same bare 404, so the route can't be used to probe
 * which ids exist.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const notFound = () => new Response('Not found', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });

export async function GET(req: NextRequest) {
  let id: string | null;
  try {
    id = verifySignedPdf(req.nextUrl.searchParams);
  } catch (e) {
    console.error(`[debt-schedule] file link - ${e instanceof Error ? e.message : 'unknown error'}`);
    return notFound();
  }
  if (!id) return notFound();

  const stream = await readPdf(id).catch(() => null);
  if (!stream) return notFound();

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="KIBA-Business-Debt-Schedule.pdf"',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex'
    }
  });
}
