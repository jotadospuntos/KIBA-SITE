import 'server-only';
import { revalidatePath, revalidateTag } from 'next/cache';
import { BLOG_TAG } from './queries';

/* Called after every dashboard change that could alter the public blog: drops
   the cached post data and the pages built from it, so a publish (or an edit
   to a live post) shows on the next visit. */
export function revalidateBlog(slugs: string[] = []) {
  revalidateTag(BLOG_TAG);
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  for (const slug of new Set(slugs)) revalidatePath(`/blog/${slug}`);
}
