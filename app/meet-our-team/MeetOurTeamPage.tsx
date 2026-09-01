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

import dynamic from 'next/dynamic';
import '../home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import HeroBlobs from '@/components/HeroBlobs/HeroBlobs';
import HeroReveal from '@/components/HeroReveal/HeroReveal';
import { TeamSectionBlock } from '@/components/ui/team-section-block-shadcnui';
import { useMotionPreference } from '@/lib/useMotionPreference';
import { TEAM } from './team-data';

/* Code-split for the same reason as the homepage: SplitText pulls in GSAP
   (~86KB), which would otherwise sit in this route's first-load bundle. ssr
   stays true so the <h1> is still server-rendered - it's the page's main
   heading. */
const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

/* The one hero photo cut for this panel (2600x2000) - see the note in
   app/HomePage.tsx. The other photos in public/img/hero/ are 800px wide, cut
   for small tiles, and visibly soft when stretched to a ~640x700 panel. Shared
   with the homepage hero until there's a real photo of the team to put here. */
const HERO_IMAGE = '/img/hero/owner-cafe-laptop.webp';
const HERO_IMAGE_ALT = 'A KIBA advisor meeting with a business owner';

export default function MeetOurTeamPage() {
  /* Passed to SplitText so the headline reveal honors ?motion=1 like every
     other animated component here. */
  const { forceMotion } = useMotionPreference();

  return (
    <>
      <SiteNav />

      {/* Same hero as the homepage, structurally: watermark, split-text headline,
          the cursor-parallax blobs and the angled clip-path image panel that
          bleeds to the right viewport edge. The panel is what makes this hero
          full-height - .hero's own padding is left alone, because .hero-visual's
          -76px/-96px margins are tuned to it. */}
      <header className="hero">
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap"><div className="hero-inner">
          <div>
            <div className="eyebrow hero-eyebrow">Our Team</div>
            <SplitText
              tag="h1"
              /* 'words, chars', not 'chars': each char is an inline-block, so
                 without the word wrapper the browser can break mid-word. */
              splitType="words, chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              duration={1.1}
              delay={18}
              ease="power3.out"
              forceMotion={forceMotion}
            >
              Meet the team behind<br />every funding decision.
            </SplitText>
            {/* The headline animates via SplitText; everything under it fades up
                behind it on a hand-set stagger. home.css only ships nth-child
                delays for the grids, so the delays are inline here. */}
            <Reveal as="p" className="hero-sub reveal" style={{ transitionDelay: '0.10s' }}>
              A small, experienced team you actually talk to. Every client works directly with the
              people below &mdash; from the first conversation through funding.
            </Reveal>
            <Reveal as="ul" className="klist on-dark reveal" style={{ maxWidth: '470px', margin: '0 0 30px', transitionDelay: '0.18s' }}>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>One point of contact from first call through funding.</li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>Over 50 years of combined lending experience.</li>
            </Reveal>
            <Reveal className="cta-row reveal" style={{ marginBottom: 0, transitionDelay: '0.26s' }}>
              <a href="/book-rr" className="btn btn-primary">Book a Consultation</a>
              <a href="tel:2512108445" className="btn btn-ghost">Call Our Team</a>
            </Reveal>
          </div>
          <HeroBlobs>
            <svg className="blob" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
            <HeroReveal className="hero-reveal" image={HERO_IMAGE} alt={HERO_IMAGE_ALT} />
          </HeroBlobs>
        </div></div>
      </header>

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

      {/* The company line. The homepage renders this as a navy .band; here it's a
          light band instead, because it sits between the navy team section and
          the navy CTA band and would otherwise read as one unbroken block of
          navy. Built with Tailwind rather than reusing home.css's `.band` rules,
          since those are shared with the homepage and must not change there. The
          triangle is the same shape, recolored from white-on-navy to blue-on-paper.

          `py-0!` and `bg-transparent!` beat home.css's unlayered
          `section{ padding:96px 0; background-color:#ffffff }` — see the note in
          components/ui/team-section-block-shadcnui.tsx. */}
      <section className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-gradient-to-br from-white via-paper to-ivory bg-transparent! py-0!">
        {/* Same triangle as the navy band, but filled with the brand blue ramp
            instead of flat white — at 0.18 it reads as a deliberate mark on the
            light background rather than a smudge. Narrower on phones, where a
            fixed 220px would crowd the text. */}
        <svg
          className="pointer-events-none absolute right-[6%] top-1/2 w-[150px] -translate-y-1/2 opacity-[0.18] sm:w-[220px]"
          viewBox="0 0 152 172"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="bandTriFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#6d94f5" />
            </linearGradient>
          </defs>
          <path fill="url(#bandTriFill)" d="M76 0 L152 172 H0 Z" />
        </svg>
        <Reveal className="reveal relative z-10 max-w-[720px] px-6 py-[70px] text-center">
          <div className="font-serif text-[clamp(24px,3.4vw,36px)] leading-[1.3] text-navy-deep">Clarity first. Capital second. Stewardship always.</div>
          <div className="mt-3 font-sans text-[15px] leading-relaxed text-slate">The principles behind every client we serve and every professional we partner with.</div>
        </Reveal>
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
