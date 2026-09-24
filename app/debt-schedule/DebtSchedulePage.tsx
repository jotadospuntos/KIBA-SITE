'use client';

/*
 * /debt-schedule. TWO DELIBERATE DEPARTURES FROM THE REST OF THE SITE, both
 * decided by the human and recorded in CLAUDE.md:
 *
 * 1. NO TESTIMONIAL SECTION. Same exception as the legal pages: a scrolling
 *    wall of client praise in the middle of someone entering their debts reads
 *    wrong. The CTA band stays, with its id="talk" so the nav's button works.
 *
 * 2. A COMPACT HERO (`hero-compact`), not the site-wide 880px one. The form is
 *    the page; a full-height navy band would push it below the fold for
 *    nothing. No image panel either. The reset lives in home.css next to the
 *    ONE HERO HEIGHT rule.
 */

import dynamic from 'next/dynamic';
import '../home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import DebtScheduleForm, { TimeEstimate } from '@/components/debt-schedule/DebtScheduleForm';
import { useMotionPreference } from '@/lib/useMotionPreference';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

export default function DebtSchedulePage() {
  const { forceMotion } = useMotionPreference();

  return (
    <>
      <SiteNav />

      <header className="hero hero-compact" style={{ padding: '76px 0 68px' }}>
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap">
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px' }}>
            <div className="eyebrow hero-eyebrow">Bank-ready funding starts here</div>
            <SplitText
              tag="h1"
              splitType="words, chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              duration={1.1}
              delay={14}
              ease="power3.out"
              forceMotion={forceMotion}
            >
              Your business debt schedule
            </SplitText>
            <Reveal as="p" className="hero-sub reveal" style={{ transitionDelay: '0.10s', maxWidth: '600px' }}>
              A short list of the loans, lines, and cards held in your business&rsquo;s name. It gives your
              KIBA advisor an accurate picture of your obligations before we structure your funding.
            </Reveal>
            <Reveal className="reveal" style={{ transitionDelay: '0.18s' }}>
              <TimeEstimate />
            </Reveal>
          </div>
        </div>
      </header>

      <section className="bg-paper! py-14! sm:py-20!">
        <div className="wrap">
          <div className="mx-auto max-w-[760px]">
            <DebtScheduleForm forceMotion={forceMotion} />
          </div>
        </div>
      </section>

      {/* Keeps id="talk" so the nav's "Let's Talk" button isn't dead here. */}
      <section className="cta-band" id="talk">
        <GradientBlob />
        <Reveal className="wrap cta-band-inner reveal">
          <h2>Questions about any of this?</h2>
          <p>If you&rsquo;re not sure how to list something, call or email and we&rsquo;ll walk you through it.</p>
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
