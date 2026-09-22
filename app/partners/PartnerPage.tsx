'use client';

/*
 * The shared layout for the co-branded /partners/<slug> landing pages,
 * replacing public/legacy/partners/*.html.
 *
 * These are lead-capture pages: a referral partner sends their client here, the
 * client fills in the GoHighLevel form, and GHL redirects them to /thank-you.
 * THAT REDIRECT IS CONFIGURED IN GHL, not here — see CLAUDE.md. Each partner has
 * their own form ID; they are not interchangeable.
 *
 * The hero's right column is the form rather than a photo, because the form is
 * the only thing this page is for.
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
import { getPartner } from './partners-data';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

const GHL_EMBED_SRC = 'https://link.msgsndr.com/js/form_embed.js';

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
  );
}

export default function PartnerPage({ slug }: { slug: string }) {
  const { forceMotion } = useMotionPreference();

  const partner = getPartner(slug);
  if (!partner) throw new Error(`Unknown partner: ${slug}`);

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
            {/* Co-brand badge: the partner's logo is the reason the visitor
                trusts this page, so it leads. */}
            <Reveal className="partner-badge reveal" style={{ maxWidth: 'fit-content' }}>
              <span className="partner-badge-label">In partnership with</span>
              <span className="partner-badge-divider" aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="partner-badge-logo" src={partner.logo} alt={partner.name} />
            </Reveal>
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
              Navigate financing with<br />clarity and confidence.
            </SplitText>
            <Reveal as="p" className="hero-sub reveal" style={{ transitionDelay: '0.10s' }}>
              {partner.shortName} recommends KIBA to the business owners they work with. Same
              standard of care, start to finish.
            </Reveal>
            <Reveal as="ul" className="klist on-dark reveal" style={{ maxWidth: '470px', margin: '0 0 30px', transitionDelay: '0.18s' }}>
              <li><Check />No pressure, no obligation on any option we present.</li>
              <li><Check />Straightforward answers so you can move forward with confidence.</li>
            </Reveal>
            <Reveal className="cta-row reveal" style={{ marginBottom: 0, transitionDelay: '0.26s' }}>
              <a href="#start" className="btn btn-primary">Start the Conversation</a>
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
            <div className="eyebrow form-card-eyebrow">Get Started</div>
            <h3>Tell us about your business</h3>
            <p>Share a few details and a member of our team will reach out within 24&ndash;72 hours to talk through your options.</p>
            <div className="form-embed">
              <iframe
                src={`https://api.leadconnectorhq.com/widget/form/${partner.ghlFormId}`}
                title={partner.ghlFormName}
                id={`inline-${partner.ghlFormId}`}
                data-form-id={partner.ghlFormId}
                data-layout-iframe-id={`inline-${partner.ghlFormId}`}
                data-form-name={partner.ghlFormName}
                scrolling="no"
              />
            </div>
            <div className="form-footnote">Your information is kept private and secure.</div>
          </Reveal>
        </div></div>
      </header>

      <section id="start">
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">What To Expect</div>
            <h2>You&rsquo;re in good hands</h2>
            <p>Every business we work with gets the same disciplined, transparent process &mdash; so you can move forward with confidence.</p>
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
          <h2>Ready to explore your options?</h2>
          <p>No pressure, no obligation &mdash; just clear, honest guidance on your next step.</p>
          <div className="cta-band-actions">
            <a href="#start" className="btn btn-primary">Start the Conversation</a>
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
