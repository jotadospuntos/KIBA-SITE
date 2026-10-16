import type { NextRequest } from 'next/server';
import { verifyFileLink } from '@/lib/tax-returns/signed-link';
import { readFile } from '@/lib/tax-returns/storage';

/*
 * GET /api/tax-returns/file?id&name&exp&sig — streams one uploaded return out
 * of the private Blob store for a genuine, unexpired staff link (the GHL
 * note). Anything else gets the same bare 404.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const notFound = () => new Response('Not found', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });

export async function GET(req: NextRequest) {
  let file: { id: string; name: string } | null;
  try {
    file = verifyFileLink(req.nextUrl.searchParams);
  } catch (e) {
    console.error(`[tax-returns] file link - ${e instanceof Error ? e.message : 'unknown error'}`);
    return notFound();
  }
  if (!file) return notFound();

  const stream = await readFile(file.id, file.name).catch(() => null);
  if (!stream) return notFound();

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${file.name}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex'
    }
  });
}
