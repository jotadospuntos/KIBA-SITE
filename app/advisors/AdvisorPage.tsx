'use client';

/*
 * The shared layout for all three /advisors/<slug> booking pages, replacing
 * public/legacy/advisors/*.html.
 *
 * The hero's right column is the advisor's own profile card rather than the
 * clip-path stock photo the other routes use — this page is about meeting one
 * specific person, so their face belongs there, and a generic stock image
 * beside a named advisor would be odd.
 *
 * THE CALENDAR IS PER-ADVISOR. Each has their own GoHighLevel booking URL (see
 * advisors-data.ts). GHL iframes need form_embed.js to size correctly and do
 * not render in sandboxes — verify on a deploy, not locally.
 */

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import '../home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import { TestimonialsSection } from '@/components/ui/testimonial-v2';
import { useMotionPreference } from '@/lib/useMotionPreference';
import { WHAT_TO_EXPECT, TRUST_STATS } from '@/lib/what-to-expect';
import { getAdvisor } from './advisors-data';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

const GHL_EMBED_SRC = 'https://link.msgsndr.com/js/form_embed.js';

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
  );
}

export default function AdvisorPage({ slug }: { slug: string }) {
  const { forceMotion } = useMotionPreference();

  const advisor = getAdvisor(slug);
  if (!advisor) throw new Error(`Unknown advisor: ${slug}`);

  /* Loads the GHL resizer once. Guarded against StrictMode's double-invoke. */
  const inited = useRef(false);
  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    if (document.querySelector(`script[data-src="${GHL_EMBED_SRC}"]`)) return;
    const el = document.createElement('script');
    el.src = GHL_EMBED_SRC;
    el.async = true;
    el.dataset.src = GHL_EMBED_SRC;
    document.body.appendChild(el);
  }, []);

  return (
    <>
      <SiteNav />

      <header className="hero">
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap"><div className="hero-inner">
          <div>
            <div className="eyebrow hero-eyebrow">Meet Your KIBA Advisor</div>
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
              Meet with<br />your advisor.
            </SplitText>
            <Reveal as="p" className="hero-sub reveal" style={{ transitionDelay: '0.10s' }}>
              {advisor.tagline}
            </Reveal>
            <Reveal as="ul" className="klist on-dark reveal" style={{ maxWidth: '470px', margin: '0 0 30px', transitionDelay: '0.18s' }}>
              <li><Check />No pressure, no obligation on the call.</li>
              <li><Check />Straightforward answers about your best next step.</li>
            </Reveal>
            <Reveal className="cta-row reveal" style={{ marginBottom: 0, transitionDelay: '0.26s' }}>
              <a href="#book" className="btn btn-primary">Start the Conversation</a>
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

          {/* The advisor, not a stock photo. */}
          <Reveal className="reveal" style={{ transitionDelay: '0.14s' }}>
            <div className="rounded-[20px] bg-white p-8 text-center ring-1 ring-line [box-shadow:0_40px_70px_-40px_rgba(2,0,98,0.45)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={advisor.photo}
                alt={advisor.name}
                width={256}
                height={256}
                className="mx-auto h-32 w-32 rounded-full object-cover ring-1 ring-line"
              />
              <h2 className="mt-6! font-heading text-[22px] font-semibold text-navy-deep">
                {advisor.name}
              </h2>
              <div className="mt-2! inline-block rounded-full bg-ivory px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-navy-soft">
                {advisor.title}
              </div>
              <p className="mt-5! text-[15px] leading-relaxed text-slate">{advisor.bio}</p>
            </div>
          </Reveal>
        </div></div>
      </header>

      {/* Booking */}
      <section id="book">
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Pick A Time That Works</div>
            <h2>Book directly with {advisor.name}</h2>
            <p>Choose a slot below and meet directly with your advisor &mdash; no pressure, no obligation.</p>
          </Reveal>
          <Reveal className="reveal mx-auto max-w-[900px] overflow-hidden rounded-[16px] bg-white p-3 ring-1 ring-line sm:p-5">
            <iframe
              src={advisor.schedulerUrl}
              scrolling="no"
              title={`Book a call with ${advisor.name}`}
              className="h-[720px] w-full rounded-[12px] border-0"
            />
          </Reveal>
          <p className="mt-5 text-center text-[13px] text-slate">
            Your information is kept private and secure.
          </p>
        </div>
      </section>

      {/* What to expect */}
      <section className="section-alt">
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
            <a href="#book" className="btn btn-primary">Start the Conversation</a>
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
