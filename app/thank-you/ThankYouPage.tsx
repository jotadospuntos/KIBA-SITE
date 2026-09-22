'use client';

/*
 * /thank-you — where every GoHighLevel form redirects after submission.
 * Migrated off public/legacy/thank-you.html.
 *
 * THIS URL IS CONFIGURED INSIDE GHL, on each form's "On Submit → Redirect" (see
 * CLAUDE.md). Changing the path here would break every form on the site
 * silently, because nothing in this repo links to it.
 *
 * It offers the round-robin calendar so someone who just submitted can book
 * immediately rather than waiting for the callback.
 */

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import '../home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import { TestimonialsSection } from '@/components/ui/testimonial-v2';
import { useMotionPreference } from '@/lib/useMotionPreference';
import { ROUND_ROBIN_CALENDAR, loadGhlEmbedScript } from '@/lib/ghl';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

export default function ThankYouPage() {
  const { forceMotion } = useMotionPreference();
  useEffect(() => { loadGhlEmbedScript(); }, []);

  return (
    <>
      <SiteNav />

      <header className="hero" style={{ padding: '76px 0 84px' }}>
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap">
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
            <Reveal className="reveal mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5" /></svg>
            </Reveal>
            <div className="eyebrow hero-eyebrow">Submission Received</div>
            <SplitText
              tag="h1"
              splitType="words, chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              duration={1.1}
              delay={16}
              ease="power3.out"
              forceMotion={forceMotion}
            >
              Thank you &mdash; we&rsquo;ve<br />got your details.
            </SplitText>
            <Reveal as="p" className="hero-sub reveal" style={{ margin: '20px auto 32px', transitionDelay: '0.10s' }}>
              A member of our team will review your information and reach out within 24&ndash;72
              hours. Prefer to talk sooner? Pick a time that works for you right below.
            </Reveal>
            <Reveal className="cta-row reveal" style={{ marginBottom: 0, justifyContent: 'center', transitionDelay: '0.18s' }}>
              <a href="#book" className="btn btn-primary">Start the Conversation</a>
              <a href="tel:2512108445" className="btn btn-ghost">Call Our Team</a>
            </Reveal>
          </div>
        </div>
      </header>

      <section id="book">
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Schedule A Call</div>
            <h2>Book time with our team</h2>
            <p>Choose a slot that suits you &mdash; no pressure, no obligation.</p>
          </Reveal>
          <Reveal className="reveal mx-auto max-w-[900px] overflow-hidden rounded-[16px] bg-white p-3 ring-1 ring-line sm:p-5">
            <iframe
              src={ROUND_ROBIN_CALENDAR}
              scrolling="no"
              title="Book a call with a KIBA advisor"
              className="h-[720px] w-full rounded-[12px] border-0"
            />
          </Reveal>
        </div>
      </section>

      <TestimonialsSection
        heading="Trusted through every step"
        intro="Business owners and referral partners on what it’s actually like to work with KIBA."
      />

      <section className="cta-band" id="talk">
        <GradientBlob />
        <Reveal className="wrap cta-band-inner reveal">
          <h2>Questions in the meantime?</h2>
          <p>Our team is here to help &mdash; reach out any time.</p>
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
