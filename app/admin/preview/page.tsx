import { requireAdminUser } from '@/lib/admin/access';
import PreviewClient from './PreviewClient';

/*
 * /admin/preview — the editor's "Preview" tab. Outside the (protected) route
 * group so the admin header doesn't sit on top of the article, but it checks
 * the session itself like every admin page.
 */
export const dynamic = 'force-dynamic';

export default async function PreviewPage() {
  await requireAdminUser('editor');
  return <PreviewClient />;
}
