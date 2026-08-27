'use client';

/*
 * Homepage redesign, migrated from the static public/legacy/v2.html into a real
 * React route. Markup is a faithful JSX conversion and v3.css is the original
 * <style> block verbatim, so it renders pixel-identically to /v2 - that
 * equivalence is what makes it safe to swap in real React components one at a
 * time, verifying each against /v2 with a pixel diff.
 *
 * Swapped so far: the hero headline (components/SplitText), the hero image
 * panel (components/HeroReveal), and the shared nav + footer
 * (components/SiteNav, components/SiteFooter - extracted so the next migrated
 * route reuses them rather than copy-pasting the markup), and the scroll
 * reveal (components/Reveal).
 *
 * Deliberately NOT swapped:
 * - BorderGlow. components/BorderGlow exists, but it renders a hardcoded <div>
 *   (5 of the 14 glow cards are <a href> links), and its inner wrapper's
 *   display:flex/overflow:auto breaks .solution-visual's margin-top:auto. Using
 *   it would need a polymorphic-element fork, a display:contents neutralizer, a
 *   skipped stylesheet and 6 tuned values re-passed as props - i.e. a heavier
 *   fork than the vanilla implementation in legacy-behaviors.js, for identical
 *   output. Not worth it.
 * - shadcn NavigationMenu/Sheet/Accordion for the nav. They ship styled for
 *   light/dark semantic tokens and would need rewriting for the navy nav. The
 *   real gaps in the hand-rolled nav are a focus trap in the mobile sheet,
 *   arrow-key navigation in the dropdown, and focus restore on close - all
 *   fixable in place without the restyle risk.
 */

import { useEffect, useRef } from 'react';
import './v3.css';
import { initLegacyBehaviors, initBorderGlow } from './legacy-behaviors';
import dynamic from 'next/dynamic';
import HeroReveal from '@/components/HeroReveal/HeroReveal';
import SiteNav from '@/components/SiteNav/SiteNav';
import Reveal from '@/components/Reveal/Reveal';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import { useMotionPreference } from '@/lib/useMotionPreference';

/* Code-split: SplitText pulls in GSAP (~86KB), which would otherwise land in
   this route's first-load bundle and delay hydration for an animation that only
   matters after paint. ssr stays true so the <h1> text is still in the
   server-rendered HTML - it's the page's main heading, so it must not be
   client-only. */
const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

/* Hero image for the clip-path reveal panel, at 2600x2000.
 *
 * Sized deliberately, and NOT interchangeable with the other photos in
 * public/img/hero/ - those were cut for 200x132 DriftWall tiles at 800px wide,
 * which background-size:cover then upscaled ~1.65x here, rendering soft.
 *
 * The panel bleeds to the right viewport edge while the left column stays fixed,
 * so its size is `viewport/2 - 81` wide by ~880 tall - i.e. the aspect swings
 * from 0.64 (portrait, at 1280px) through 1.00 (square, at 1920px) to 1.36
 * (landscape, at 2560px). 2600x2000 is the compromise: mildly landscape, and
 * still downscaling at 2x DPR on a 2560px-wide viewport (which needs 2398x1760).
 * Replacing this photo means re-cutting at roughly these dimensions. */
const HERO_IMAGE = '/img/hero/owner-cafe-laptop.webp';
const HERO_IMAGE_ALT = 'A small business owner working on a laptop at her counter';

declare global {
  interface Window {
    /* Set before the legacy behaviors run; they read it to decide whether to
       honor prefers-reduced-motion. See the ?motion=1 escape hatch below. */
    __forceMotion?: boolean;
  }
}

/* Only the GoHighLevel iframe resizer is loaded at runtime now. GSAP used to be
   fetched from a CDN here too; it's a bundled npm dependency since the headline
   moved to the real SplitText component. */
const GHL_EMBED_SRC = 'https://link.msgsndr.com/js/form_embed.js';

/* Appends a script once and resolves when it has loaded. */
function loadScriptOnce(src: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === '1') resolve();
      else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error(src)));
      }
      return;
    }
    const el = document.createElement('script');
    el.src = src;
    el.async = false;
    el.dataset.src = src;
    el.addEventListener('load', () => {
      el.dataset.loaded = '1';
      resolve();
    });
    el.addEventListener('error', () => reject(new Error(src)));
    document.body.appendChild(el);
  });
}

export default function V3Page() {
  /* Guards against React 18 StrictMode double-invoking the effect in dev, which
     would otherwise attach every listener and rAF loop twice. */
  const inited = useRef(false);

  /* Passed down to SplitText so the headline reveal honors ?motion=1 the same
     way HeroReveal and the legacy behaviors do. */
  const { forceMotion } = useMotionPreference();

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

    /* Preview escape hatch, same as the static page: motion respects the
       visitor's prefers-reduced-motion setting unless ?motion=1 is passed. */
    try {
      window.__forceMotion = new URLSearchParams(window.location.search).get('motion') === '1';
      if (window.__forceMotion) document.documentElement.classList.add('force-motion');
    } catch {
      window.__forceMotion = false;
    }

    let cancelled = false;

    (async () => {
      try {
        await loadScriptOnce(GHL_EMBED_SRC);
      } catch {
        /* no-op: only needed to size the GHL iframe */
      }
      if (cancelled) return;
      initLegacyBehaviors();
      initBorderGlow();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SiteNav /><header className="hero">

        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap"><div className="hero-inner">
          <div>
            <div className="eyebrow hero-eyebrow">Kingdom Impact Business Advisors</div>
            <SplitText
              tag="h1"
              id="heroHeadline"
              /* 'words, chars' not 'chars': each char becomes an inline-block, so
                 without a word wrapper the browser can break between any two
                 letters (it split "business's" across lines). */
              splitType="words, chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              duration={1.1}
              delay={18}
              ease="power3.out"
              forceMotion={forceMotion}
            >
              Funding and guidance<br />to power your business&rsquo;s<br />next move.
            </SplitText>
            <p className="hero-sub">We help business owners secure bank-ready capital and make confident financing decisions &mdash; backed by decades of lending experience and a commitment to doing what&rsquo;s right for every client.</p>
            <ul className="klist on-dark" style={{ maxWidth: '470px', margin: '0 0 30px' }}>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>Straight answers on what you actually qualify for.</li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>One point of contact from application through funding.</li>
            </ul>
            <div className="cta-row"><a href="#talk" className="btn btn-primary">Get Funded</a><a href="tel:2512108445" className="btn btn-ghost">Call Our Team</a></div>
            <div className="stat-row">
              <div className="stat"><div className="stat-num" data-count-to="25" data-prefix="" data-suffix="+">25+</div><div className="stat-label">Years Experience</div></div>
              <div className="stat"><div className="stat-num" data-count-to="500" data-prefix="" data-suffix="+">500+</div><div className="stat-label">Deals Funded</div></div>
              <div className="stat"><div className="stat-num" data-count-to="100" data-prefix="$" data-suffix="M+">$100M+</div><div className="stat-label">Capital Accessed</div></div>
              <div className="stat"><div className="stat-num" data-count-to="50" data-prefix="" data-suffix="+">50+</div><div className="stat-label">States Served</div></div>
            </div>
          </div>
          <div className="hero-visual" id="heroVisual">
            <div className="cursor-blob" style={{ width: '180px', height: '180px', top: '-40px', left: '-50px', background: 'radial-gradient(circle,rgba(37,99,235,0.55),transparent 70%)' }} data-depth="18"></div>
            <div className="cursor-blob" style={{ width: '140px', height: '140px', bottom: '-30px', right: '-30px', background: 'radial-gradient(circle,rgba(109,148,245,0.5),transparent 70%)' }} data-depth="28"></div>
            <svg className="blob" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
            <HeroReveal className="hero-reveal" image={HERO_IMAGE} alt={HERO_IMAGE_ALT} />
          </div>
        </div></div>
      </header><section className="marquee-section" aria-hidden="true">
        <div className="marquee-track" id="marqueeTrack">
          <div className="marquee-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>$100M+ Capital Accessed</div>
          <div className="marquee-dot"></div>
          <div className="marquee-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>25+ Years Experience</div>
          <div className="marquee-dot"></div>
          <div className="marquee-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V8l5-3 6 3 5-3v12l-5 3-6-3-5 3Z" /></svg>500+ Deals Funded</div>
          <div className="marquee-dot"></div>
          <div className="marquee-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18" /></svg>50+ States Served</div>
          <div className="marquee-dot"></div>
          <div className="marquee-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>Bank-Ready Guidance</div>
          <div className="marquee-dot"></div>
          <div className="marquee-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>SBA-Preferred Process</div>
          <div className="marquee-dot"></div>
        </div>
      </section><section>
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Funding Paths</div>
            <h2>Capital solutions built around how your business works</h2>
            <p>Every business raises capital differently. Here&rsquo;s where most of our clients start.</p>
          </Reveal>
          <div className="solutions-row row-3">
            <Reveal as="a" href="/book-rr" className="solution-card reveal border-glow-card"><span className="edge-light"></span>
              <div className="solution-card-top">
                <div className="solution-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V8l5-3 6 3 5-3v12l-5 3-6-3-5 3Z" /><path d="M9 5v12M15 8v12" /></svg></div>
                <span className="solution-arrow"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg></span>
              </div>
              <h3>SBA Loans</h3>
              <p>Low-interest term loans backed by the Small Business Administration, structured to close.</p>
              <div className="solution-visual">
                <div className="mock-approval">
                  <div className="mock-approval-top"><span className="mock-check">&#10003;</span>SBA Loan Approved</div>
                  <div className="mock-approval-amount">$750,000</div>
                  <div className="mock-approval-sub">10-yr term &middot; 6.25% rate</div>
                </div>
              </div>
            </Reveal>
            <Reveal as="a" href="/business-acquisitions" className="solution-card is-cream reveal border-glow-card"><span className="edge-light"></span>
              <div className="solution-card-top">
                <div className="solution-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" /></svg></div>
                <span className="solution-arrow"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg></span>
              </div>
              <h3>Business Acquisition Financing</h3>
              <p>Secure the right capital stack to close on a business acquisition with confidence.</p>
              <div className="solution-visual">
                <div className="mock-chart-label">Deal value trending <strong>+38%</strong></div>
                <div className="mock-bars"><span style={{ height: '30%' }}></span><span style={{ height: '45%' }}></span><span style={{ height: '55%' }}></span><span style={{ height: '72%' }}></span><span style={{ height: '95%' }}></span></div>
              </div>
            </Reveal>
            <Reveal as="a" href="/book-rr" className="solution-card reveal border-glow-card"><span className="edge-light"></span>
              <div className="solution-card-top">
                <div className="solution-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
                <span className="solution-arrow"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg></span>
              </div>
              <h3>Working Capital &amp; Line of Credit</h3>
              <p>Only pay for what you use, with revolving credit lines sized to your monthly revenue.</p>
              <div className="solution-visual">
                <div className="mock-cal-row"><span>Available Balance</span><strong>$220,000</strong></div>
                <div className="mock-progress"><div className="mock-progress-fill" style={{ width: '64%' }}></div></div>
                <div className="mock-days"><span></span><span></span><span className="is-active"></span><span></span><span></span><span></span><span></span></div>
              </div>
            </Reveal>
          </div>
          <div className="solutions-row row-2">
            <Reveal as="a" href="/referral-partners" className="solution-card is-cream reveal border-glow-card"><span className="edge-light"></span>
              <div className="solution-card-top">
                <div className="solution-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><circle cx="17.5" cy="8.5" r="2.6" /><path d="M15.5 14.2c2.8.4 5 2.5 5 5.8" /></svg></div>
                <span className="solution-arrow"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg></span>
              </div>
              <h3>Referral Partner Program</h3>
              <p>CPAs, bankers, and advisors &mdash; give your clients thoughtful, well-structured guidance without leaving the relationship.</p>
              <div className="solution-visual">
                <div className="mock-network">
                  <svg viewBox="0 0 120 64" fill="none"><circle cx="14" cy="32" r="8" fill="#e7eefd" stroke="#2563eb" strokeWidth="2" /><circle cx="60" cy="14" r="8" fill="#2563eb" /><circle cx="60" cy="50" r="8" fill="#e7eefd" stroke="#2563eb" strokeWidth="2" /><circle cx="106" cy="32" r="8" fill="#6d94f5" /><path d="M20 30 L54 16M20 34 L54 48M68 15 L100 30M68 49 L100 34" stroke="#b5c9fb" strokeWidth="2" /></svg>
                  <div className="mock-network-badge">Trusted by CPAs<span>&amp; community bankers</span></div>
                </div>
              </div>
            </Reveal>
            <Reveal as="a" href="/book-rr" className="solution-card reveal border-glow-card"><span className="edge-light"></span>
              <div className="solution-card-top">
                <div className="solution-icon"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg></div>
                <span className="solution-arrow"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg></span>
              </div>
              <h3>Book an Advisor</h3>
              <p>Talk through your options with a KIBA advisor before you apply anywhere &mdash; no pressure, no obligation.</p>
              <div className="solution-visual">
                <div className="mock-booking-row"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>Next available</div>
                <div className="mock-booking-time">Tomorrow &middot; 10:00 AM</div>
                <div className="mock-booking-btn">Book Now <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg></div>
              </div>
            </Reveal>
          </div>
        </div>
      </section><section className="image-band">
        <div className="band">

          <div className="bg"></div>
          <div className="ov"></div>
          <svg className="bandtri" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#ffffff" d="M76 0 L152 172 H0 Z" /></svg>
          <Reveal className="content reveal">
            <div className="big">Clarity first. Capital second. Stewardship always.</div>
            <div className="sub">The principles behind every client we serve and every professional we partner with.</div>
          </Reveal>
        </div>
      </section><section className="section-alt">
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">How It Works</div>
            <h2>Funding, made straightforward</h2>
            <p>Three steps between where your business is today and the capital it needs to grow.</p>
          </Reveal>
          <div className="benefits-grid">
            <Reveal className="benefit-card reveal border-glow-card"><span className="edge-light"></span><div className="benefit-icon"><span style={{ fontFamily: "'General Sans','Instrument Sans',sans-serif", fontWeight: '700', fontSize: '19px', color: '#fff' }}>1</span></div><h3>Tell us about your business</h3><p>A short conversation about your goals, your numbers, and what you&rsquo;re trying to accomplish.</p></Reveal>
            <Reveal className="benefit-card reveal border-glow-card"><span className="edge-light"></span><div className="benefit-icon"><span style={{ fontFamily: "'General Sans','Instrument Sans',sans-serif", fontWeight: '700', fontSize: '19px', color: '#fff' }}>2</span></div><h3>We build your strategy</h3><p>We structure a bank-ready funding plan matched to your business &mdash; not a one-size-fits-all pitch.</p></Reveal>
            <Reveal className="benefit-card reveal border-glow-card"><span className="edge-light"></span><div className="benefit-icon"><span style={{ fontFamily: "'General Sans','Instrument Sans',sans-serif", fontWeight: '700', fontSize: '19px', color: '#fff' }}>3</span></div><h3>Get matched &amp; funded</h3><p>We connect you with the right lender and stay with you through closing &mdash; start to finish.</p></Reveal>
          </div>
        </div>
      </section><section>
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Who We Work With</div>
            <h2>Whether you&rsquo;re raising capital or referring a client</h2>
            <p>Two paths in. The same standard of care either way.</p>
          </Reveal>
          <div className="grid-2">
            <Reveal as="a" href="/book-rr" className="benefit-card reveal border-glow-card" style={{ textDecoration: 'none', display: 'block' }}><span className="edge-light"></span>
              <div className="benefit-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V8l5-3 6 3 5-3v12l-5 3-6-3-5 3Z" /><path d="M9 5v12M15 8v12" /></svg></div>
              <h3>I&rsquo;m a business owner</h3>
              <p>Book a call with a KIBA advisor and find out what you actually qualify for &mdash; no pressure, no obligation.</p>
            </Reveal>
            <Reveal as="a" href="/referral-partners" className="benefit-card reveal border-glow-card" style={{ textDecoration: 'none', display: 'block' }}><span className="edge-light"></span>
              <div className="benefit-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><circle cx="17.5" cy="8.5" r="2.6" /><path d="M15.5 14.2c2.8.4 5 2.5 5 5.8" /></svg></div>
              <h3>I&rsquo;m a referral partner</h3>
              <p>CPAs, bankers, and advisors &mdash; give your clients thoughtful, well-structured guidance without leaving the relationship.</p>
            </Reveal>
          </div>
        </div>
      </section><section className="testimonial-section">
        <div className="wrap">
          <Reveal className="section-head reveal"><div className="eyebrow">What Our Clients &amp; Partners Say</div></Reveal>
          <Reveal className="testimonial-carousel reveal" id="testimonialCarousel">
            <div className="testimonial-viewport">
              <div className="testimonial-track" id="testimonialTrack">
                <div className="testimonial-slide">
                  <div className="testimonial-card border-glow-card"><span className="edge-light"></span>
                    <div className="quote-mark">&ldquo;</div>
                    <p className="quote">Michael worked tirelessly with us to obtain our SBA loan and helped us understand the process throughout. He made an otherwise stressful process easy and successful! Highly recommend his services!</p>
                    <div className="testimonial-attrib"><strong>Business Owner</strong> &mdash; SBA Loan Client</div>
                  </div>
                </div>
                <div className="testimonial-slide">
                  <div className="testimonial-card border-glow-card"><span className="edge-light"></span>
                    <div className="quote-mark">&ldquo;</div>
                    <p className="quote">Michael &amp; Barbara helped us navigate the complexities of an SBA loan. They were patient and proficient with their work, and made the process extremely easy. I would work with them again.</p>
                    <div className="testimonial-attrib"><strong>Business Owner</strong> &mdash; SBA Loan Client</div>
                  </div>
                </div>
                <div className="testimonial-slide">
                  <div className="testimonial-card border-glow-card"><span className="edge-light"></span>
                    <div className="quote-mark">&ldquo;</div>
                    <p className="quote">We continue to work with Michael because of his deep experience in the lending space and his genuine commitment to doing what&rsquo;s right for each client. That level of integrity is why we confidently refer our clients to him.</p>
                    <div className="testimonial-attrib"><strong>Paul Childers</strong> &mdash; RivenWay Business Solutions</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="testimonial-controls">
              <button className="testimonial-arrow" id="testimonialPrev" aria-label="Previous testimonial"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg></button>
              <div className="testimonial-dots" id="testimonialDots"></div>
              <button className="testimonial-arrow" id="testimonialNext" aria-label="Next testimonial"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg></button>
            </div>
          </Reveal>
        </div>
      </section><section className="cta-band" id="talk">
        <div className="blob-canvas-wrap" aria-hidden="true"><canvas id="blobCanvas"></canvas></div>
        <Reveal className="wrap cta-band-inner reveal">
          <h2>Let&rsquo;s talk about your next move</h2>
          <p>Book a time with a KIBA advisor and find out what your business qualifies for.</p>
          <div className="talk-card border-glow-card"><span className="edge-light"></span><div className="talk-embed">
            <iframe src="https://api.leadconnectorhq.com/widget/booking/hNVlyN1rtNcxpWkSshP8" scrolling="no" title="Schedule a conversation with KIBA"></iframe>
          </div></div>
          <div className="contact-row" style={{ marginTop: '36px' }}>
            <a className="contact-item" href="tel:2512108445"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.8 2Z" /></svg>251-210-8445</a>
            <a className="contact-item" href="mailto:info@kibadvisors.com"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>info@kibadvisors.com</a>
          </div>
        </Reveal>
      </section>
      <SiteFooter />
    </>
  );
}
