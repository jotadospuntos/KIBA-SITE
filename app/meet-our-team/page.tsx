import type { Metadata } from 'next';
import MeetOurTeamPage from './MeetOurTeamPage';

/*
 * /meet-our-team — a real app/ route (no public/legacy file, no rewrite entry).
 *
 * Server component purely so it can export metadata; the page itself is
 * MeetOurTeamPage.tsx, which has to be a client component for the animation
 * hooks. Same split as app/page.tsx.
 *
 * NOINDEX matches the rest of this subdomain and is deliberate: the team page
 * that search should find is the one on the kibadvisors.com WordPress site,
 * which this page's content is copied from. Two indexable copies of the same
 * bios on two domains would compete with each other. See CLAUDE.md
 * "Scope boundary" — flipping this is the human's call.
 */
export const metadata: Metadata = {
  title: 'Meet the Team — Kingdom Impact Business Advisors',
  description:
    'Meet the Kingdom Impact Business Advisors team: Michael Sylkatis, Barbara Sylkatis and Ariel Austria — the advisors who guide business owners through capital strategy, lending, and funding decisions.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://go.kibadvisors.com/meet-our-team' },
  openGraph: {
    type: 'website',
    url: 'https://go.kibadvisors.com/meet-our-team',
    title: 'Meet the Team — Kingdom Impact Business Advisors',
    description:
      'The advisors who guide business owners through capital strategy, lending, and funding decisions.',
    images: [{ url: 'https://go.kibadvisors.com/img/v2-preview.png', width: 1200, height: 630 }]
  }
};

export default function Page() {
  return <MeetOurTeamPage />;
}
