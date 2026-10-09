'use client';

import { useEffect, useState } from 'react';
import PostPage from '@/app/blog/PostPage';
import { sanitizeDoc } from '@/lib/blog/doc';
import { PREVIEW_STORAGE_KEY } from '@/lib/blog/editor-types';
import type { PublicPost } from '@/lib/blog/queries';

/*
 * Renders the post being edited with the REAL article template. The editor
 * writes its current state to localStorage as you type; this tab re-renders on
 * every change (the `storage` event), so it stays open beside the editor as a
 * live preview — including unsaved edits, without touching the live post.
 */

function read(): PublicPost | null {
  try {
    const raw = localStorage.getItem(PREVIEW_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PublicPost;
    return { ...p, body: sanitizeDoc(p.body) };
  } catch {
    return null;
  }
}

export default function PreviewClient() {
  const [post, setPost] = useState<PublicPost | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPost(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === PREVIEW_STORAGE_KEY) setPost(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!ready) return null;
  if (!post) {
    return (
      <p className="p-10 text-center text-slate">
        Nothing to preview. Open a post in the dashboard and click &ldquo;Preview&rdquo;.
      </p>
    );
  }
  return <PostPage post={post} others={[]} preview="Preview — this updates as you edit. It is not the live page." />;
}
