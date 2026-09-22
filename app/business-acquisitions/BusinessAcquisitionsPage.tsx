'use client';

/*
 * /business-acquisitions — the acquisition-financing campaign landing page,
 * migrated off public/legacy/business-acquisitions.html.
 *
 * KEPT SEPARATE FROM /capital-solutions/business-acquisition-loans ON PURPOSE.
 * This is where that campaign's ad traffic lands and it has its own angle (a
 * strategic-assessment booking with Michael, the Green Card lending note, the
 * deal-focused stat row). The program page is the evergreen explainer. Merging
 * them is a deliberate decision, not cleanup — see CLAUDE.md.
 *
 * Its calendar is Michael's, as the legacy page had it — not the round robin.
 */

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import '../home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import Counter from '@/components/Counter/Counter';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import { TestimonialsSection } from '@/components/ui/testimonial-v2';
import { FaqAccordion } from '@/components/ui/faq-accordion';
import { useMotionPreference } from '@/lib/useMotionPreference';
import { loadGhlEmbedScript } from '@/lib/ghl';
import { getAdvisor } from '../advisors/advisors-data';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

const SOLUTIONS = [
  'SBA Loans',
  'Term Loans',
  'Acquisition Loans',
  'Asset-Backed Lines',
  'Debt Restructuring'
];

const WHY = [
  {
    title: 'Personalized Guidance',
    body: 'We take the time to understand your business, financial position and goals before recommending a path forward.'
  },
  {
    title: 'Advisor-First Approach',
    body: 'We walk you through your options, explain the pros and cons, and provide honest feedback — not sales pressure.'
  },
  {
    title: 'Underwriting-Level Preparation',
    body: 'We help you understand what needs to be in place before pursuing financing, so you can move forward from a stronger position.'
  },
  {
    title: 'Long-Term Thinking',
    body: 'We look beyond today’s funding need and consider how a financial decision can affect your business down the road.'
  }
];

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
  );
}

export default function BusinessAcquisitionsPage() {
  const { forceMotion } = useMotionPreference();
  useEffect(() => { loadGhlEmbedScript(); }, []);

  /* The page books with Michael specifically; reuse his record rather than
     re-declaring the calendar URL here. */
  const michael = getAdvisor('michael-sylkatis')!;

  return (
    <>
      <SiteNav />

      <header className="hero">
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap"><div className="hero-inner">
          <div>
            <div className="eyebrow hero-eyebrow">Business Acquisition Funding</div>
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
              More than funding.<br />Clear guidance.
            </SplitText>
            <Reveal as="p" className="hero-sub reveal" style={{ transitionDelay: '0.10s' }}>
              We provide acquisition-focused financing solutions so you can secure the right
              capital, close with confidence, and scale your impact.
            </Reveal>
            <Reveal as="ul" className="klist on-dark reveal" style={{ maxWidth: '470px', margin: '0 0 30px', transitionDelay: '0.18s' }}>
              <li><Check />Financing structured specifically for business acquisitions &mdash; not one-size-fits-all lending.</li>
              <li><Check />Acquisition term loans available for Non-US Citizen Green Card holders.</li>
            </Reveal>
            <Reveal className="cta-row reveal" style={{ marginBottom: 0, transitionDelay: '0.26s' }}>
              <a href="#book" className="btn btn-primary">Start the Conversation</a>
              <a href="tel:2512108445" className="btn btn-ghost">Call Our Team</a>
            </Reveal>
            <Reveal className="stat-row reveal" style={{ transitionDelay: '0.32s' }}>
              <div className="stat"><Counter className="stat-num" to={25} suffix="+" /><div className="stat-label">Years Experience</div></div>
              <div className="stat"><Counter className="stat-num" to={500} suffix="+" /><div className="stat-label">Deals Funded</div></div>
              <div className="stat"><Counter className="stat-num" to={100} prefix="$" suffix="M+" /><div className="stat-label">Capital Accessed</div></div>
              <div className="stat"><Counter className="stat-num" to={50} suffix="+" /><div className="stat-label">States Served</div></div>
            </Reveal>
          </div>

          <Reveal className="form-card reveal" style={{ transitionDelay: '0.14s' }}>
            <div className="eyebrow form-card-eyebrow">Strategic Assessment</div>
            <h3>Book time with Michael</h3>
            <p>Talk through the deal in front of you and what it would actually take to finance it.</p>
            <div className="form-embed">
              <iframe
                src={michael.schedulerUrl}
                scrolling="no"
                title={`Book a strategic assessment with ${michael.name}`}
              />
            </div>
            <div className="form-footnote">Your information is kept private and secure.</div>
          </Reveal>
        </div></div>
      </header>

      <section id="book">
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Funding Solutions</div>
            <h2>Capital structured for the deal in front of you</h2>
            <p>Every acquisition is different. We match the financing to the deal &mdash; not the other way around.</p>
          </Reveal>
          <Reveal className="reveal mx-auto flex max-w-[820px] flex-wrap justify-center gap-3">
            {SOLUTIONS.map((item) => (
              <span
                key={item}
                className="rounded-full bg-[#f2f4f7] px-5 py-2.5 font-heading text-[14.5px] font-semibold text-navy-deep ring-1 ring-line"
              >
                {item}
              </span>
            ))}
          </Reveal>
          <p className="mt-7 text-center text-[14.5px] text-slate">
            Acquisition Term Loans available for Non-US Citizen Green Card holders.
          </p>
        </div>
      </section>

      <section className="section-alt">
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Why Work With KIBA?</div>
            <h2>More than funding. Clear guidance.</h2>
            <p>Acquiring a business is one of the biggest financial decisions you&rsquo;ll make. We help you make it with confidence.</p>
          </Reveal>
          <div className="grid-2">
            {WHY.map((item, i) => (
              <Reveal className="benefit-card reveal" key={item.title}>
                <div className="benefit-icon"><span style={{ fontFamily: "'General Sans','Instrument Sans',sans-serif", fontWeight: '700', fontSize: '19px', color: '#fff' }}>{i + 1}</span></div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Meet your advisor */}
      <section>
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Meet Your Advisor</div>
            <h2>{michael.name} &mdash; {michael.title}</h2>
          </Reveal>
          <Reveal className="reveal mx-auto flex max-w-[820px] flex-col items-center gap-8 rounded-[16px] bg-white p-9 text-center ring-1 ring-line sm:flex-row sm:p-11 sm:text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={michael.photo}
              alt={michael.name}
              width={256}
              height={256}
              className="h-32 w-32 shrink-0 rounded-full object-cover ring-1 ring-line"
            />
            <div>
              <p className="m-0! text-[16px] leading-relaxed text-slate">
                Michael helps business owners navigate acquisitions, growth, and capital strategy
                with clarity and confidence. As Founder of Kingdom Impact Business Advisors, he
                provides thoughtful, client-focused guidance designed to help business owners make
                informed decisions for their businesses and families.
              </p>
              <a href={`/advisors/${michael.slug}`} className="btn btn-primary mt-7">
                Start the Conversation
              </a>
            </div>
          </Reveal>
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
          <h2>Ready to talk?</h2>
          <p>Schedule your strategic assessment with Michael &mdash; no pressure, no obligation.</p>
          <div className="cta-band-actions">
            <a href="#book" className="btn btn-primary">Start the Conversation</a>
            <a href="/capital-solutions/business-acquisition-loans" className="btn btn-ghost">How Acquisition Loans Work</a>
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
