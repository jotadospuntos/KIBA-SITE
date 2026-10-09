import type { Doc } from './doc';

/* The editor writes the post-in-progress here; /admin/preview reads it. */
export const PREVIEW_STORAGE_KEY = 'kiba-blog-preview';

/* The post as the dashboard editor holds it. Plain and serializable: it goes
   both ways across the server-action boundary. */
export type EditorPost = {
  /* null until the first save. */
  id: string | null;
  /* Optimistic lock: the save is refused if the post changed since this. */
  updatedAt: string | null;
  updatedBy: string | null;
  title: string;
  slug: string;
  excerpt: string;
  searchDescription: string;
  categoryId: string | null;
  author: string;
  coverImageUrl: string | null;
  coverImageAlt: string;
  body: Doc;
  status: 'draft' | 'published';
  /* "YYYY-MM-DDTHH:mm" in Central, or '' for "as soon as it's published". */
  publishAt: string;
  /* The slug the public site currently serves, if it has ever been live —
     used to warn before changing the address of a published post. */
  liveSlug: string | null;
};

export type SaveIntent = 'save' | 'publish' | 'unpublish';

export type SaveResult = { ok: true; post: EditorPost; message: string } | { ok: false; error: string };

export type RevisionSummary = { id: number; savedAt: string; savedBy: string; title: string; status: string };
