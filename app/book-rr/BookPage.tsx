'use client';

/*
 * /book-rr — the round-robin booking page, migrated off
 * public/legacy/book-rr.html.
 *
 * This is the single most linked-to page on the site: the footer, the nav's
 * "Let's Talk" fallbacks and nearly every CTA point here. Its calendar is the
 * SHARED round robin, not any one advisor's — see lib/ghl.ts.
 *
 * ("rr" in the slug is round-robin. The URL is kept as-is because it's the
 * target of every existing link and any ad traffic.)
 */

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import '../home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import { TestimonialsSection } from '@/components/ui/testimonial-v2';
import { FaqAccordion } from '@/components/ui/faq-accordion';
import { useMotionPreference } from '@/lib/useMotionPreference';
import { WHAT_TO_EXPECT, TRUST_STATS } from '@/lib/what-to-expect';
import { ROUND_ROBIN_CALENDAR, loadGhlEmbedScript } from '@/lib/ghl';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
  );
}

export default function BookPage() {
  const { forceMotion } = useMotionPreference();
  useEffect(() => { loadGhlEmbedScript(); }, []);

  return (
    <>
      <SiteNav />

      <header className="hero">
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap"><div className="hero-inner">
          <div>
            <div className="eyebrow hero-eyebrow">Meet With Our Team</div>
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
              Book a call with<br />a KIBA advisor.
            </SplitText>
            <Reveal as="p" className="hero-sub reveal" style={{ transitionDelay: '0.10s' }}>
              Pick a time that works for you and you&rsquo;ll be matched with one of our advisors
              &mdash; no pressure, no obligation, just clear guidance on your next step.
            </Reveal>
            <Reveal as="ul" className="klist on-dark reveal" style={{ maxWidth: '470px', margin: '0 0 30px', transitionDelay: '0.18s' }}>
              <li><Check />No pressure, no obligation on any option we present.</li>
              <li><Check />Straightforward answers so you can move forward with confidence.</li>
            </Reveal>
            <Reveal className="cta-row reveal" style={{ marginBottom: 0, transitionDelay: '0.26s' }}>
              <a href="#book" className="btn btn-primary">Book a Consultation</a>
              <a href="tel:2512108445" className="btn btn-ghost">Call Our Team</a>
            </Reveal>
            <Reveal className="stat-row reveal" style={{ transitionDelay: '0.32s' }}>
              {TRUST_STATS.map((stat) => (
                <div className="stat" key={stat.label}>
                  <div className="stat-num">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </Reveal>
          </div>

          <Reveal className="form-card reveal" style={{ transitionDelay: '0.14s' }}>
            <div className="eyebrow form-card-eyebrow">Schedule A Call</div>
            <h3>Pick a time that works</h3>
            <p>Choose a slot below and you&rsquo;ll be matched with an available advisor &mdash; no pressure, no obligation.</p>
            <div className="form-embed">
              <iframe
                src={ROUND_ROBIN_CALENDAR}
                scrolling="no"
                title="Book a call with a KIBA advisor"
              />
            </div>
            <div className="form-footnote">Your information is kept private and secure.</div>
          </Reveal>
        </div></div>
      </header>

      {/* Anchor target for the hero CTA on narrow screens, where the calendar
          sits below the fold rather than beside the copy. */}
      <section className="section-alt" id="book">
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">What To Expect</div>
            <h2>What happens on your call</h2>
            <p>A straightforward, no-pressure conversation about your goals &mdash; and an honest read on your best next step.</p>
          </Reveal>
          <div className="benefits-grid">
            {WHAT_TO_EXPECT.map((item, i) => (
              <Reveal className="benefit-card reveal" key={item.title}>
                <div className="benefit-icon"><span style={{ fontFamily: "'General Sans','Instrument Sans',sans-serif", fontWeight: '700', fontSize: '19px', color: '#fff' }}>{i + 1}</span></div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FaqAccordion />

      <TestimonialsSection
        heading="Trusted through every step"
        intro="Business owners and referral partners on what it’s actually like to work with KIBA."
      />

      <section className="cta-band" id="talk">
        <GradientBlob />
        <Reveal className="wrap cta-band-inner reveal">
          <h2>Ready to talk it through?</h2>
          <p>Book a time that works for you &mdash; or call our team directly. No hidden fees, no surprises.</p>
          <div className="cta-band-actions">
            <a href="#book" className="btn btn-primary">Book a Call</a>
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
