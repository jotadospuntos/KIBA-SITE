'use client';

/*
 * /meet-our-team — the KIBA team page, with content copied from
 * https://kibadvisors.com/meet-our-team/ (see app/meet-our-team/team-data.ts).
 *
 * This is the second real app/ route, so it reuses the shared pieces rather
 * than copying them: SiteNav, SiteFooter, Reveal, GradientBlob, and home.css.
 *
 * WHY IT IMPORTS home.css: the shared nav and footer are styled entirely by
 * that stylesheet (.nav-inner, .footer-grid, .btn, .wrap, .eyebrow, ...), so
 * any route using them has to load it. The page-specific bits below are
 * Tailwind, per CLAUDE.md — home.css is used here as the site chrome + the
 * existing .hero / .band / .cta-band shells, not extended with new rules.
 *
 * WHY THE TEAM SECTION IS WRAPPED IN `.dark`: TeamSectionBlock is written
 * against the shadcn semantic tokens only. app/globals.css maps those to KIBA's
 * navy palette under .dark (--background #020062, --card #0025ae,
 * --primary #6d94f5), so the wrapper is what makes the block render as a navy
 * band consistent with the homepage instead of a light-mode card grid.
 */

import '../home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import { TeamSectionBlock } from '@/components/ui/team-section-block-shadcnui';
import { TEAM } from './team-data';

export default function MeetOurTeamPage() {
  return (
    <>
      <SiteNav />

      <header className="hero">
        <div className="wrap">
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px' }}>
            <div className="eyebrow hero-eyebrow">Our Team</div>
            <h1>Meet the Team</h1>
            <p className="hero-sub" style={{ maxWidth: '620px' }}>
              A small, experienced team you actually talk to. Every client works directly with the
              people below &mdash; from the first conversation through funding.
            </p>
            <div className="cta-row" style={{ marginBottom: 0 }}>
              <a href="/book-rr" className="btn btn-primary">Book a Consultation</a>
              <a href="tel:2512108445" className="btn btn-ghost">Call Our Team</a>
            </div>
          </div>
        </div>
      </header>

      <div className="dark">
        <TeamSectionBlock
          eyebrow="Who You’ll Work With"
          heading="The people behind"
          headingAccent="Kingdom Impact Business Advisors"
          intro="Clients come to us for clarity and confidence in a decision — not to be sold a loan. Here’s who guides that process."
          members={TEAM}
          cta={{
            title: 'Start the Conversation',
            body: 'Tell us where your business is headed and we’ll walk you through your real options — no pressure, no obligation.',
            label: 'Book a Consultation',
            href: '/book-rr'
          }}
        />
      </div>

      {/* The company line, using the same image band the homepage uses for it. */}
      <section className="image-band">
        <div className="band">
          <div className="bg"></div>
          <div className="ov"></div>
          <svg className="bandtri" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#ffffff" d="M76 0 L152 172 H0 Z" /></svg>
          <Reveal className="content reveal">
            <div className="big">Clarity first. Capital second. Stewardship always.</div>
            <div className="sub">The principles behind every client we serve and every professional we partner with.</div>
          </Reveal>
        </div>
      </section>

      {/* #talk exists on every page with the shared nav — its "Let's Talk" button
          targets that anchor. Unlike the homepage this band links out to the
          booking page instead of embedding the GoHighLevel calendar, so the page
          doesn't need the external form_embed.js resizer. */}
      <section className="cta-band" id="talk">
        <GradientBlob />
        <Reveal className="wrap cta-band-inner reveal">
          <h2>Talk to a KIBA advisor</h2>
          <p>Book a time with the team and find out what your business qualifies for.</p>
          <div className="cta-band-actions">
            <a href="/book-rr" className="btn btn-primary">Book a Consultation</a>
            <a href="/referral-partners" className="btn btn-ghost">Refer a Client</a>
          </div>
          <div className="contact-row">
            <a className="contact-item" href="tel:2512108445"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.8 2Z" /></svg>251-210-8445</a>
            <a className="contact-item" href="mailto:info@kibadvisors.com"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>info@kibadvisors.com</a>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </>
  );
}
