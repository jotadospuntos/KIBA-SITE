'use client';

/*
 * /tax-returns. Same two departures as /debt-schedule, both decided by the
 * human: NO TESTIMONIAL SECTION (an intake form for financial documents), and
 * a COMPACT HERO (`hero-compact`) so the form is above the fold. The CTA band
 * keeps id="talk".
 */

import dynamic from 'next/dynamic';
import { Clock } from 'lucide-react';
import '../home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import TaxReturnsForm from '@/components/tax-returns/TaxReturnsForm';
import { useMotionPreference } from '@/lib/useMotionPreference';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

export default function TaxReturnsPage() {
  const { forceMotion } = useMotionPreference();

  return (
    <>
      <SiteNav />

      <header className="hero hero-compact" style={{ padding: '76px 0 68px' }}>
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap">
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px' }}>
            <div className="eyebrow hero-eyebrow">Come to your call prepared</div>
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
              Share your tax returns
            </SplitText>
            <Reveal as="p" className="hero-sub reveal" style={{ transitionDelay: '0.10s', maxWidth: '600px' }}>
              Your most recent business and personal returns let your KIBA advisor understand your business
              before the call, and come ready with the loan programs that could fit.
            </Reveal>
            <Reveal className="reveal" style={{ transitionDelay: '0.18s' }}>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[13.5px] text-white/85 ring-1 ring-white/15">
                <Clock className="size-4" aria-hidden="true" />
                About 2 minutes with your PDFs handy
              </span>
            </Reveal>
          </div>
        </div>
      </header>

      <section className="bg-paper! py-14! sm:py-20!">
        <div className="wrap">
          <div className="mx-auto max-w-[760px]">
            <TaxReturnsForm />
          </div>
        </div>
      </section>

      {/* Keeps id="talk" so the nav's CTA isn't dead here. */}
      <section className="cta-band" id="talk">
        <GradientBlob />
        <Reveal className="wrap cta-band-inner reveal">
          <h2>Questions about which returns to send?</h2>
          <p>If you&rsquo;re not sure what to include, call or email and we&rsquo;ll tell you exactly what we need.</p>
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
