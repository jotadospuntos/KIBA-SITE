'use client';

/*
 * /referral-partners — the recruitment page for CPAs, bankers and advisors,
 * migrated off public/legacy/referral-partners.html. This is the equivalent of
 * kibadvisors.com/referral-partner/ (singular), and it's linked from the nav.
 *
 * Not to be confused with /partners/<slug>, which are the co-branded landing
 * pages an individual partner sends their own clients to. This page recruits
 * partners; those pages serve a partner's clients.
 *
 * Its calendar is Michael's, as the legacy page had it.
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
import { TRUST_STATS } from '@/lib/what-to-expect';
import { loadGhlEmbedScript } from '@/lib/ghl';
import { getAdvisor } from '../advisors/advisors-data';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

const FOR_CLIENTS = [
  {
    title: 'Clarity on capital',
    body: 'A clear understanding of when capital makes sense — and when it doesn’t.'
  },
  { title: 'A strategic roadmap', body: 'A clear plan and next steps instead of guesswork.' },
  {
    title: 'Options that fit reality',
    body: 'Financing options that align with their actual financial reality.'
  },
  {
    title: 'Reinforced advisory role',
    body: 'Guidance that reinforces — never replaces — your advisory role.'
  }
];

const PROMISES = [
  'Communicate with transparency and professionalism',
  'Provide clear, thoughtful feedback you can stand behind',
  'Avoid overpromising or forcing deals',
  'Protect long-term relationships over short-term outcomes'
];

function Check({ color = '#6d94f5' }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
  );
}

export default function ReferralPartnersPage() {
  const { forceMotion } = useMotionPreference();
  useEffect(() => { loadGhlEmbedScript(); }, []);

  const michael = getAdvisor('michael-sylkatis')!;

  return (
    <>
      <SiteNav />

      <header className="hero">
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap"><div className="hero-inner">
          <div>
            <div className="eyebrow hero-eyebrow">Referral Partners</div>
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
              A trusted capital &amp; advisory<br />partner for financial professionals.
            </SplitText>
            <Reveal as="p" className="hero-sub reveal" style={{ transitionDelay: '0.10s' }}>
              We support the professionals business owners already trust &mdash; partnering with
              CPAs, bankers, and advisors who want their clients to receive thoughtful,
              well-structured, bank-ready guidance.
            </Reveal>
            <Reveal as="ul" className="klist on-dark reveal" style={{ maxWidth: '470px', margin: '0 0 30px', transitionDelay: '0.18s' }}>
              <li><Check />Strengthen your client&rsquo;s position and readiness for capital.</li>
              <li><Check />Keep you exactly where you belong &mdash; at the center of the relationship.</li>
            </Reveal>
            <Reveal className="cta-row reveal" style={{ marginBottom: 0, transitionDelay: '0.26s' }}>
              <a href="#talk-to-us" className="btn btn-primary">Start the Conversation</a>
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
            <div className="eyebrow form-card-eyebrow">Start The Conversation</div>
            <h3>Let&rsquo;s find a time to talk</h3>
            <p>A short call about how we can support your clients &mdash; and how the relationship works.</p>
            <div className="form-embed">
              <iframe
                src={michael.schedulerUrl}
                scrolling="no"
                title="Book a partner conversation with KIBA"
              />
            </div>
            <div className="form-footnote">Your information is kept private and secure.</div>
          </Reveal>
        </div></div>
      </header>

      <section>
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Why Professionals Partner With Us</div>
            <h2>A disciplined, transparent partner &mdash; not another lender in the room</h2>
            <p>We serve as a seamless extension of your firm, handling the complex work of capital positioning and lender navigation with underwriting-level precision &mdash; so you don&rsquo;t have to.</p>
          </Reveal>
          <div className="benefits-grid">
            {['We don’t compete.', 'We don’t confuse your client.', 'And we never undermine the trust you’ve built.'].map((line, i) => (
              <Reveal className="benefit-card reveal" key={line}>
                <div className="benefit-icon"><span style={{ fontFamily: "'General Sans','Instrument Sans',sans-serif", fontWeight: '700', fontSize: '19px', color: '#fff' }}>{i + 1}</span></div>
                <h3>{line}</h3>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">For Your Clients</div>
            <h2>How this helps you serve your clients better</h2>
            <p>When you introduce us, you give your clients more than access to capital &mdash; you give them clarity.</p>
          </Reveal>
          <div className="grid-2">
            {FOR_CLIENTS.map((item, i) => (
              <Reveal className="benefit-card reveal" key={item.title}>
                <div className="benefit-icon"><span style={{ fontFamily: "'General Sans','Instrument Sans',sans-serif", fontWeight: '700', fontSize: '19px', color: '#fff' }}>{i + 1}</span></div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Relationship-First. Always.</div>
            <h2>Referrals are earned, not assumed</h2>
            <p>Integrity isn&rsquo;t a talking point &mdash; it&rsquo;s how we operate. Our firm is relationship-driven, not volume-driven, and every engagement is handled with care and discretion.</p>
          </Reveal>
          <Reveal className="reveal mx-auto max-w-[820px] rounded-[16px] border border-line bg-white p-9 sm:p-11">
            <ul className="klist klist-2">
              {PROMISES.map((item) => (
                <li key={item}><Check color="#2563eb" />{item}</li>
              ))}
            </ul>
            <p className="mt-8! text-center font-serif text-[19px] leading-relaxed text-navy-deep">
              We don&rsquo;t just help clients access capital. We help them access it the right way.
            </p>
          </Reveal>
        </div>
      </section>

      <TestimonialsSection
        heading="Trusted through every step"
        intro="Business owners and referral partners on what it’s actually like to work with KIBA."
      />

      <section className="cta-band" id="talk-to-us">
        <GradientBlob />
        <Reveal className="wrap cta-band-inner reveal" id="talk">
          <h2>Start the conversation</h2>
          <p>Let&rsquo;s find a time to talk about how we can support your clients.</p>
          <div className="cta-band-actions">
            <a href={`/advisors/${michael.slug}`} className="btn btn-primary">Start the Conversation</a>
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
