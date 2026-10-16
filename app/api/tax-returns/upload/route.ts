import { list } from '@vercel/blob';
import { handleUpload } from '@vercel/blob/client';
import type { HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { FILE_PATH, MAX_FILE_BYTES, MAX_FILES, PREFIX } from '@/lib/tax-returns/constants';
import { verifyTicket } from '@/lib/tax-returns/signed-link';

/*
 * POST /api/tax-returns/upload — issues a Vercel Blob client-upload token for
 * ONE file. Only with a valid upload ticket (clientPayload), only into that
 * ticket's own folder, only application/pdf, only up to MAX_FILE_BYTES, and
 * only while the folder holds fewer than MAX_FILES. Without the ticket this
 * would let anyone write into our Blob store.
 *
 * No onUploadCompleted: the client calls /finalize itself once every file is up.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as HandleUploadBody | null;
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const id = verifyTicket(clientPayload);
        const match = FILE_PATH.exec(pathname);
        if (!id || !match || match[1] !== id) throw new Error('Upload not authorised');
        const existing = await list({ prefix: `${PREFIX}${id}/files/`, limit: MAX_FILES });
        if (existing.blobs.length >= MAX_FILES) throw new Error('Too many files');
        return {
          allowedContentTypes: ['application/pdf'],
          maximumSizeInBytes: MAX_FILE_BYTES,
          addRandomSuffix: false,
          allowOverwrite: false
        };
      }
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error(`[tax-returns] upload token - ${e instanceof Error ? e.message : 'unknown error'}`);
    return NextResponse.json({ error: 'Upload not allowed' }, { status: 400 });
  }
}
