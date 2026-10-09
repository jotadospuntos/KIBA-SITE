import 'server-only';
import type { BlogPost } from '@/lib/db/schema';
import { sanitizeDoc } from './doc';
import type { EditorPost } from './editor-types';
import { toCentralInput } from './time';

/* A database row as the dashboard editor's form state. */
export function toEditorPost(row: BlogPost): EditorPost {
  return {
    id: row.id,
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    searchDescription: row.searchDescription,
    categoryId: row.categoryId,
    author: row.author,
    coverImageUrl: row.coverImageUrl,
    coverImageAlt: row.coverImageAlt,
    body: sanitizeDoc(row.body),
    status: row.status,
    publishAt: row.publishAt ? toCentralInput(row.publishAt) : '',
    liveSlug: row.status === 'published' ? row.slug : null
  };
}
