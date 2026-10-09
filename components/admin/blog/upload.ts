/*
 * Shrinks a photo in the browser before it's uploaded: at most 2000px wide,
 * re-encoded as WebP (or JPEG where the browser can't write WebP). A 6 MB
 * phone photo comes out around 200-400 KB, which is what the page should load.
 */

const MAX_WIDTH = 2000;

async function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, 0.85));
}

async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const webp = await encode(canvas, 'image/webp');
  /* Older Safari silently returns PNG when asked for WebP. */
  if (webp && webp.type === 'image/webp') return webp;
  const jpeg = await encode(canvas, 'image/jpeg');
  if (!jpeg) throw new Error('This browser could not process the image.');
  return jpeg;
}

export async function uploadBlogImage(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp|heic|heif|avif|gif)$/.test(file.type)) {
    throw new Error('Choose a photo (JPG, PNG or WebP).');
  }
  const blob = await shrink(file);
  const form = new FormData();
  form.append('file', blob, blob.type === 'image/webp' ? 'image.webp' : 'image.jpg');
  const res = await fetch('/api/admin/blog/image', { method: 'POST', body: form });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? 'The upload failed. Try again.');
  return data.url;
}
