import { randomUUID } from 'node:crypto';
import { put } from '@vercel/blob';
import { getVercelOidcToken } from '@vercel/oidc';
import { getAdminUserForApi } from '@/lib/admin/access';
import { audit } from '@/lib/admin/audit';

/*
 * POST /api/admin/blog/image — one image from the blog editor, into the PUBLIC
 * Blob store `kiba-blog-images`. That is a different store from the debt
 * schedule's private one, on purpose: these images are meant to be public,
 * those files never are.
 *
 * AUTH: the store was connected with Vercel's token-less method (prefix
 * "blog", so the env var is the lowercase-prefixed `blog_STORE_ID`). On Vercel
 * the SDK pairs that store id with the function's automatic OIDC identity; no
 * secret exists to leak. Locally there is no OIDC identity, so
 * BLOG_READ_WRITE_TOKEN in .env.local (the token from the store's .env.local
 * snippet, renamed) is used instead.
 *
 * Both are passed EXPLICITLY. Left to itself the SDK falls back to
 * BLOB_READ_WRITE_TOKEN — the debt schedule's private store — so a missing
 * OIDC identity must fail loudly here, never quietly write elsewhere.
 *
 * The browser has already shrunk the image to at most 2000px wide and
 * re-encoded it (components/admin/blog/upload.ts), so anything near the limit
 * here is not a photo that went through the editor.
 */

export const runtime = 'nodejs';

async function blogStoreAuth() {
  if (process.env.VERCEL) {
    const storeId = process.env.blog_STORE_ID;
    if (!storeId) throw new Error('Missing environment variable blog_STORE_ID');
    return { storeId, oidcToken: await getVercelOidcToken() };
  }
  const token = process.env.BLOG_READ_WRITE_TOKEN;
  if (!token) throw new Error('Missing environment variable BLOG_READ_WRITE_TOKEN (local only)');
  return { token };
}

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' };

export async function POST(request: Request) {
  const user = await getAdminUserForApi('editor');
  if (!user) return Response.json({ error: 'Not signed in.' }, { status: 401 });

  let auth: { storeId: string; oidcToken: string } | { token: string };
  try {
    auth = await blogStoreAuth();
  } catch (e) {
    console.error(`[blog image] ${e instanceof Error ? e.message : 'auth failed'}`);
    return Response.json({ error: 'Image uploads are not set up yet.' }, { status: 500 });
  }

  const file = (await request.formData()).get('file');
  if (!(file instanceof File)) return Response.json({ error: 'No image received.' }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return Response.json({ error: 'Use a JPG, PNG or WebP image.' }, { status: 415 });
  if (file.size > MAX_BYTES) return Response.json({ error: 'That image is too large.' }, { status: 413 });

  const year = new Date().getUTCFullYear();
  const blob = await put(`blog/${year}/${randomUUID()}.${ext}`, file, {
    access: 'public',
    ...auth,
    contentType: file.type,
    addRandomSuffix: false,
    cacheControlMaxAge: 60 * 60 * 24 * 365
  });

  await audit({ actorEmail: user.email, action: 'blog.image_upload', targetType: 'blob', targetId: blob.pathname });
  return Response.json({ url: blob.url });
}
