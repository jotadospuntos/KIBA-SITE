import { NextResponse } from 'next/server';
import { verifyTicket } from '@/lib/tax-returns/signed-link';
import { syncToGhl } from '@/lib/tax-returns/ghl';
import { deleteBlobs, isPdf, listFiles, markGhlFailed, readSubmission, staffLinks } from '@/lib/tax-returns/storage';

/*
 * POST /api/tax-returns/finalize { ticket } — after the browser has put every
 * file in Blob: drop anything that isn't really a PDF, then GoHighLevel
 * (upsert, tag, note with one signed staff link per file).
 *
 * The files are already safe in Blob, so a GHL failure still answers success
 * and leaves a ghl-failed.json marker for /admin/failed-syncs, as the debt
 * schedule does. Logged by submission id only.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const fail = (status: number, message: string) => NextResponse.json({ message }, { status });

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { ticket?: unknown } | null;
  const id = verifyTicket(body?.ticket);
  if (!id) return fail(403, 'This upload session has expired. Please start again.');

  let links: { name: string; url: string }[];
  let sub: Awaited<ReturnType<typeof readSubmission>>;
  try {
    sub = await readSubmission(id);
    if (!sub) return fail(404, 'This upload session has expired. Please start again.');
    const files = await listFiles(id);
    const checks = await Promise.all(files.map((f) => isPdf(f.pathname)));
    await deleteBlobs(files.filter((_, i) => !checks[i]).map((f) => f.url));
    if (!checks.some(Boolean)) return fail(400, 'We didn’t receive any PDF files. Please choose your returns and try again.');
    links = await staffLinks(id, sub.receivedAt);
  } catch (e) {
    console.error(`[tax-returns] finalize (${id}) - ${e instanceof Error ? e.message : 'unknown error'}`);
    return fail(500, 'Something went wrong on our end.');
  }

  const failure = await syncToGhl(sub.contact, links);
  if (failure) {
    const why = failure.error instanceof Error ? failure.error.message : 'unknown error';
    console.error(`[tax-returns] ghl ${failure.stage} (${id}) - ${why}`);
    await markGhlFailed(id, failure.stage).catch((e2) =>
      console.error(`[tax-returns] ghl-failed marker (${id}) - ${e2 instanceof Error ? e2.message : 'unknown error'}`)
    );
  }
  return NextResponse.json({ received: links.length });
}
