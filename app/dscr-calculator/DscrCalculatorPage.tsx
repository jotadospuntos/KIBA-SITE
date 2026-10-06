'use client';

/*
 * /dscr-calculator — the calculator's own page. Laid out like /book-rr: the
 * tool sits in the hero's right column (where other pages have the image
 * panel), so it's above the fold on desktop and the site-wide hero height is
 * kept. Like /book-rr the hero grows past 880px when slide 2 is open; that's
 * min-height doing its job, not a bug.
 *
 * The calculator itself is components/dscr/DscrCalculator, which is built to
 * be dropped into any page (and later the embed route).
 */

import dynamic from 'next/dynamic';
import '../home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import DscrCalculator from '@/components/dscr/DscrCalculator';
import { TestimonialsSection } from '@/components/ui/testimonial-v2';
import { useMotionPreference } from '@/lib/useMotionPreference';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
  );
}

/* Definitions only. No "lenders want 1.25+" style thresholds: those are
   lending claims and need to come from the business. */
const EXPLAINERS = [
  {
    title: 'What DSCR measures',
    body: 'Debt service coverage ratio compares what your business earns to what it owes in loan payments each year, with a 25% cushion on the payments. A 1.00x means earnings cover the payments plus that cushion.'
  },
  {
    title: 'Why EBITDA',
    body: 'EBITDA starts from net income and adds back interest and depreciation, so it shows the cash your operations generate before financing costs and non-cash expenses.'
  },
  {
    title: 'Why the payments',
    body: 'Annual debt service is every monthly loan payment added up and multiplied by twelve, then by 1.25 for the cushion. Daily and weekly MCA debits are converted to a monthly figure first.'
  }
];

export default function DscrCalculatorPage() {
  const { forceMotion } = useMotionPreference();

  return (
    <>
      <SiteNav />

      <header className="hero">
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap"><div className="hero-inner">
          {/* Pinned to the top in the two-column layout: step two makes the card
              much taller than this copy, and centred it floated halfway down.
              (Sticky was tried; .hero's overflow clipping defeats it.) */}
          <div className="min-[921px]:self-start min-[921px]:pt-10">
            <div className="eyebrow hero-eyebrow">Free DSCR Calculator</div>
            <SplitText
              tag="h1"
              splitType="words, chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              duration={1.1}
              delay={18}
              ease="power3.out"
              forceMotion={forceMotion}
            >
              Know your DSCR<br />before a lender does.
            </SplitText>
            <Reveal as="p" className="hero-sub reveal" style={{ transitionDelay: '0.10s' }}>
              Debt service coverage is one of the first numbers a lender looks at. Work out yours in two
              steps: your EBITDA from your latest tax return, then your monthly debt payments.
            </Reveal>
            <Reveal as="ul" className="klist on-dark reveal" style={{ maxWidth: '470px', margin: 0, transitionDelay: '0.18s' }}>
              <li><Check />Takes about two minutes, with your tax return in front of you.</li>
              <li><Check />The math runs in your browser. Nothing is sent to us.</li>
              <li><Check />Stuck on a number? &ldquo;Need help?&rdquo; on step two shows your options.</li>
            </Reveal>
          </div>

          <Reveal className="reveal" style={{ transitionDelay: '0.14s', position: 'relative', zIndex: 1 }}>
            <DscrCalculator forceMotion={forceMotion} />
          </Reveal>
        </div></div>
      </header>

      <section className="section-alt">
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">How It Works</div>
            <h2>What goes into the number</h2>
            <p>The same calculation our advisors run when they review a client&rsquo;s file.</p>
          </Reveal>
          <div className="benefits-grid">
            {EXPLAINERS.map((item, i) => (
              <Reveal className="benefit-card reveal" key={item.title}>
                <div className="benefit-icon"><span style={{ fontFamily: "'General Sans','Instrument Sans',sans-serif", fontWeight: '700', fontSize: '19px', color: '#fff' }}>{i + 1}</span></div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection
        heading="Trusted through every step"
        intro="Business owners and referral partners on what it’s actually like to work with KIBA."
      />

      <section className="cta-band" id="talk">
        <GradientBlob />
        <Reveal className="wrap cta-band-inner reveal">
          <h2>Want a second pair of eyes on it?</h2>
          <p>Talk your numbers through with a KIBA advisor &mdash; no pressure, no obligation.</p>
          <div className="cta-band-actions">
            <a href="/book-rr" className="btn btn-primary">Start the Conversation</a>
            <a href="tel:2512108445" className="btn btn-ghost">Call Our Team</a>
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
