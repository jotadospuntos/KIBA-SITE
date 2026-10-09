import type { Metadata } from 'next';

/*
 * /admin — the staff dashboard. Plain Tailwind on the @theme tokens; it does
 * NOT import home.css, so none of that file's bare element rules (section,
 * button, footer) apply here. No animations either: this is a tool, not a
 * marketing page, so the site's motion checklist doesn't apply.
 *
 * Never indexed, never in the sitemap, disallowed in robots.txt.
 */
export const metadata: Metadata = {
  title: 'KIBA Admin',
  robots: { index: false, follow: false }
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-paper font-body text-ink">{children}</div>;
}
