import type { NextRequest } from 'next/server';
import { fetchCompletedPdf } from '@/lib/funding-application/signwell';
import { verifyStaffLink } from '@/lib/funding-application/staff-link';

/*
 * GET /api/funding-application/document?id&exp&sig — the staff link from the
 * GoHighLevel note. Streams the signed application PDF from SignWell, only for
 * a genuine, unexpired link. A bad link gets a bare 404, so the route can't be
 * used to probe which documents exist.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const text = (status: number, body: string) =>
  new Response(body, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }
  });

export async function GET(req: NextRequest) {
  let id: string | null;
  try {
    id = verifyStaffLink(req.nextUrl.searchParams);
  } catch (e) {
    console.error(`[funding-application] document link - ${e instanceof Error ? e.message : 'unknown error'}`);
    return text(404, 'Not found');
  }
  if (!id) return text(404, 'Not found');

  let pdf: Awaited<ReturnType<typeof fetchCompletedPdf>>;
  try {
    pdf = await fetchCompletedPdf(id);
  } catch (e) {
    console.error(`[funding-application] document (${id}) - ${e instanceof Error ? e.message : 'unknown error'}`);
    return text(502, 'SignWell didn’t return the document. Try again in a minute, or open it in SignWell.');
  }
  if (pdf === 'missing') return text(404, 'Not found');
  if (pdf === 'pending') {
    return text(409, 'This application hasn’t been signed yet. The PDF is available once the applicant signs it.');
  }

  return new Response(pdf.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="KIBA-Lending-Application.pdf"',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex'
    }
  });
}
