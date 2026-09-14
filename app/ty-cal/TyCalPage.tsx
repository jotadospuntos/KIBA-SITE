'use client';

/*
 * /ty-cal — the post-booking confirmation, migrated off
 * public/legacy/ty-cal.html.
 *
 * LIKE /thank-you, THIS URL IS CONFIGURED IN GOHIGHLEVEL, as the calendar's
 * post-booking redirect. Nothing in this repo links to it, so renaming the path
 * would break silently.
 *
 * The distinction between the two: /thank-you is "you submitted a form, we'll
 * call you"; /ty-cal is "you booked a slot, here's how to prepare".
 */

import dynamic from 'next/dynamic';
import '../home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import { TestimonialsSection } from '@/components/ui/testimonial-v2';
import { useMotionPreference } from '@/lib/useMotionPreference';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

const NEXT_STEPS = [
  {
    title: 'Check your inbox',
    body: 'Look for a confirmation email with the call details and a calendar invite you can add with one click.'
  },
  {
    title: 'Have your documents handy',
    body: 'Recent financials, funding needs, or business details help us tailor the conversation and move faster.'
  },
  {
    title: 'Join a few minutes early',
    body: 'Click the link in your invite a couple minutes ahead of time so we can start right on schedule.'
  }
];

export default function TyCalPage() {
  const { forceMotion } = useMotionPreference();

  return (
    <>
      <SiteNav />

      <header className="hero" style={{ padding: '76px 0 84px' }}>
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap">
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
            <Reveal className="reveal mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 11h18M9 16l2 2 4-4" /></svg>
            </Reveal>
            <div className="eyebrow hero-eyebrow">Appointment Confirmed</div>
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
              You&rsquo;re booked &mdash;<br />we&rsquo;ll see you soon.
            </SplitText>
            <Reveal as="p" className="hero-sub reveal" style={{ margin: '20px auto 32px', transitionDelay: '0.10s' }}>
              A confirmation and calendar invite are on their way to your inbox, with a link to join
              the call. Here&rsquo;s how to make the most of our time together.
            </Reveal>
            <Reveal className="cta-row reveal" style={{ marginBottom: 0, justifyContent: 'center', transitionDelay: '0.18s' }}>
              <a href="/capital-solutions" className="btn btn-primary">Explore Capital Solutions</a>
              <a href="/blog" className="btn btn-ghost">Read the Blog</a>
            </Reveal>
          </div>
        </div>
      </header>

      <section>
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Before Your Call</div>
            <h2>Here&rsquo;s what happens next</h2>
            <p>A few quick things to check off before we talk.</p>
          </Reveal>
          <div className="benefits-grid">
            {NEXT_STEPS.map((step, i) => (
              <Reveal className="benefit-card reveal" key={step.title}>
                <div className="benefit-icon"><span style={{ fontFamily: "'General Sans','Instrument Sans',sans-serif", fontWeight: '700', fontSize: '19px', color: '#fff' }}>{i + 1}</span></div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
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
          <h2>Need to reschedule or have a question?</h2>
          <p>Life happens &mdash; just reach out and we&rsquo;ll take care of it.</p>
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
