import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import PostEditor from '@/components/admin/blog/PostEditor';
import { requireAdminUser } from '@/lib/admin/access';
import { toEditorPost } from '@/lib/blog/editor-server';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { editorOptions } from '../editor-data';

/* /admin/blog/<id> — edit one post. */
export default async function EditPostPage({ params }: { params: { id: string } }) {
  const user = await requireAdminUser('editor');
  if (!z.uuid().safeParse(params.id).success) notFound();
  const [row] = await db().select().from(blogPosts).where(eq(blogPosts.id, params.id)).limit(1);
  if (!row) notFound();
  const { categories, authors } = await editorOptions();
  return (
    <PostEditor
      initial={toEditorPost(row)}
      categories={categories}
      authors={authors}
      canManageCategories={user.role === 'admin'}
    />
  );
}
