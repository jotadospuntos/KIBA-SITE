'use client';

/*
 * Homepage redesign, migrated from the static public/legacy/v2.html into a real
 * React route. Markup is a faithful JSX conversion and v3.css is the original
 * <style> block verbatim, so it renders pixel-identically to /v2 - that
 * equivalence is what makes it safe to swap in real React components one at a
 * time, verifying each against /v2 with a pixel diff.
 *
 * Swapped so far: the hero headline (components/SplitText) and the hero image
 * panel (components/HeroReveal).
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
import { useMotionPreference } from '@/lib/useMotionPreference';

/* Code-split: SplitText pulls in GSAP (~86KB), which would otherwise land in
   this route's first-load bundle and delay hydration for an animation that only
   matters after paint. ssr stays true so the <h1> text is still in the
   server-rendered HTML - it's the page's main heading, so it must not be
   client-only. */
const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

/* Hero image for the clip-path reveal panel. Any of the 9 photos in
   public/img/hero/ will work - swapping this one line changes it. */
const HERO_IMAGE = '/img/hero/couple-consultation.webp';
const HERO_IMAGE_ALT = 'Business owners reviewing financing terms with a KIBA advisor';

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
      <nav id="siteNav"><div className="nav-inner"><a className="logo-mark" href="https://kibadvisors.com" aria-label="Kingdom Impact Business Advisors home"><img src="/img/kiba-logo.png" alt="Kingdom Impact Business Advisors" width="263" height="120" /></a><div className="nav-menu" id="navMenu">
        <div className="nav-menu-item" id="solutionsItem">
          <button className="nav-menu-trigger" id="solutionsTrigger" type="button" aria-expanded="false" aria-controls="solutionsPanel">Solutions<svg className="nav-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></button>
          <div className="nav-dropdown" id="solutionsPanel">
            <a className="nav-dropdown-item" href="/business-acquisitions"><span className="nav-dropdown-title">Business Acquisitions</span><span className="nav-dropdown-desc">Financing to acquire an existing business.</span></a>
            <a className="nav-dropdown-item" href="/book-rr"><span className="nav-dropdown-title">Book a Consultation</span><span className="nav-dropdown-desc">Schedule time with an advisor to map out your options.</span></a>
          </div>
        </div>
        <a className="nav-menu-link" href="https://kibadvisors.com">About</a>
        <a className="nav-menu-link" href="/referral-partners">Partners</a>
        <a className="nav-menu-link" href="#talk">Contact</a>
      </div>
      <div className="nav-right">
        <a className="nav-phone" href="tel:2512108445">251-210-8445</a>
        <a className="btn btn-primary" href="#talk" style={{ padding: '11px 22px', fontSize: '14.5px' }}>Let&rsquo;s Talk</a>
        <button className="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="mobileMenu" aria-label="Open menu">
          <svg className="nav-toggle-icon nav-toggle-icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          <svg className="nav-toggle-icon nav-toggle-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      </div>
      <div className="mobile-menu" id="mobileMenu" hidden>
        <div className="mobile-menu-inner">
          <button className="mobile-accordion-trigger" id="mobileSolutionsTrigger" type="button" aria-expanded="false" aria-controls="mobileSolutionsPanel">Solutions<svg className="nav-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></button>
          <div className="mobile-accordion-panel" id="mobileSolutionsPanel" hidden>
            <a href="/business-acquisitions"><span className="nav-dropdown-title">Business Acquisitions</span><span className="nav-dropdown-desc">Financing to acquire an existing business.</span></a>
            <a href="/book-rr"><span className="nav-dropdown-title">Book a Consultation</span><span className="nav-dropdown-desc">Schedule time with an advisor to map out your options.</span></a>
          </div>
          <a className="mobile-menu-link" href="https://kibadvisors.com">About</a>
          <a className="mobile-menu-link" href="/referral-partners">Partners</a>
          <a className="mobile-menu-link" href="#talk">Contact</a>
          <div className="mobile-menu-ctas">
            <a className="btn btn-ghost" href="tel:2512108445">251-210-8445</a>
            <a className="btn btn-primary" href="#talk">Let&rsquo;s Talk</a>
          </div>
        </div>
      </div>
      </nav><header className="hero">

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
          <div className="section-head reveal">
            <div className="eyebrow">Funding Paths</div>
            <h2>Capital solutions built around how your business works</h2>
            <p>Every business raises capital differently. Here&rsquo;s where most of our clients start.</p>
          </div>
          <div className="solutions-row row-3">
            <a href="/book-rr" className="solution-card reveal border-glow-card"><span className="edge-light"></span>
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
            </a>
            <a href="/business-acquisitions" className="solution-card is-cream reveal border-glow-card"><span className="edge-light"></span>
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
            </a>
            <a href="/book-rr" className="solution-card reveal border-glow-card"><span className="edge-light"></span>
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
            </a>
          </div>
          <div className="solutions-row row-2">
            <a href="/referral-partners" className="solution-card is-cream reveal border-glow-card"><span className="edge-light"></span>
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
            </a>
            <a href="/book-rr" className="solution-card reveal border-glow-card"><span className="edge-light"></span>
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
            </a>
          </div>
        </div>
      </section><section className="image-band">
        <div className="band">

          <div className="bg"></div>
          <div className="ov"></div>
          <svg className="bandtri" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#ffffff" d="M76 0 L152 172 H0 Z" /></svg>
          <div className="content reveal">
            <div className="big">Clarity first. Capital second. Stewardship always.</div>
            <div className="sub">The principles behind every client we serve and every professional we partner with.</div>
          </div>
        </div>
      </section><section className="section-alt">
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">How It Works</div>
            <h2>Funding, made straightforward</h2>
            <p>Three steps between where your business is today and the capital it needs to grow.</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card reveal border-glow-card"><span className="edge-light"></span><div className="benefit-icon"><span style={{ fontFamily: "'General Sans','Instrument Sans',sans-serif", fontWeight: '700', fontSize: '19px', color: '#fff' }}>1</span></div><h3>Tell us about your business</h3><p>A short conversation about your goals, your numbers, and what you&rsquo;re trying to accomplish.</p></div>
            <div className="benefit-card reveal border-glow-card"><span className="edge-light"></span><div className="benefit-icon"><span style={{ fontFamily: "'General Sans','Instrument Sans',sans-serif", fontWeight: '700', fontSize: '19px', color: '#fff' }}>2</span></div><h3>We build your strategy</h3><p>We structure a bank-ready funding plan matched to your business &mdash; not a one-size-fits-all pitch.</p></div>
            <div className="benefit-card reveal border-glow-card"><span className="edge-light"></span><div className="benefit-icon"><span style={{ fontFamily: "'General Sans','Instrument Sans',sans-serif", fontWeight: '700', fontSize: '19px', color: '#fff' }}>3</span></div><h3>Get matched &amp; funded</h3><p>We connect you with the right lender and stay with you through closing &mdash; start to finish.</p></div>
          </div>
        </div>
      </section><section>
        <div className="wrap">
          <div className="section-head reveal">
            <div className="eyebrow">Who We Work With</div>
            <h2>Whether you&rsquo;re raising capital or referring a client</h2>
            <p>Two paths in. The same standard of care either way.</p>
          </div>
          <div className="grid-2">
            <a href="/book-rr" className="benefit-card reveal border-glow-card" style={{ textDecoration: 'none', display: 'block' }}><span className="edge-light"></span>
              <div className="benefit-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V8l5-3 6 3 5-3v12l-5 3-6-3-5 3Z" /><path d="M9 5v12M15 8v12" /></svg></div>
              <h3>I&rsquo;m a business owner</h3>
              <p>Book a call with a KIBA advisor and find out what you actually qualify for &mdash; no pressure, no obligation.</p>
            </a>
            <a href="/referral-partners" className="benefit-card reveal border-glow-card" style={{ textDecoration: 'none', display: 'block' }}><span className="edge-light"></span>
              <div className="benefit-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><circle cx="17.5" cy="8.5" r="2.6" /><path d="M15.5 14.2c2.8.4 5 2.5 5 5.8" /></svg></div>
              <h3>I&rsquo;m a referral partner</h3>
              <p>CPAs, bankers, and advisors &mdash; give your clients thoughtful, well-structured guidance without leaving the relationship.</p>
            </a>
          </div>
        </div>
      </section><section className="testimonial-section">
        <div className="wrap">
          <div className="section-head reveal"><div className="eyebrow">What Our Clients &amp; Partners Say</div></div>
          <div className="testimonial-carousel reveal" id="testimonialCarousel">
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
          </div>
        </div>
      </section><section className="cta-band" id="talk">
        <div className="blob-canvas-wrap" aria-hidden="true"><canvas id="blobCanvas"></canvas></div>
        <div className="wrap cta-band-inner reveal">
          <h2>Let&rsquo;s talk about your next move</h2>
          <p>Book a time with a KIBA advisor and find out what your business qualifies for.</p>
          <div className="talk-card border-glow-card"><span className="edge-light"></span><div className="talk-embed">
            <iframe src="https://api.leadconnectorhq.com/widget/booking/hNVlyN1rtNcxpWkSshP8" scrolling="no" title="Schedule a conversation with KIBA"></iframe>
          </div></div>
          <div className="contact-row" style={{ marginTop: '36px' }}>
            <a className="contact-item" href="tel:2512108445"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.8 2Z" /></svg>251-210-8445</a>
            <a className="contact-item" href="mailto:info@kibadvisors.com"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>info@kibadvisors.com</a>
          </div>
        </div>
      </section>
      <footer>
      <div className="footer-top-line" aria-hidden="true"></div>
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-col footer-brand reveal">
            <a className="logo-mark" href="https://kibadvisors.com" aria-label="Kingdom Impact Business Advisors home"><svg viewBox="0 0 1500 736.33" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ height: '34px', width: 'auto' }}>
                  <g fill="#ffffff">
                    <polygon points="515.23 206.04 439.07 206.04 327.41 356.49 327.41 206.04 262.93 206.04 262.93 535.9 270.41 535.9 370.86 400.41 456.36 531.23 533.92 531.23 410.57 346.68 515.23 206.04" />
                    <rect x="555.4" y="265.56" width="64.47" height="64.59" />
                    <rect x="555.4" y="389.95" width="64.47" height="141.27" />
                    <path d="M912.12,389.9c-9.5-13.56-22.65-23.6-39.48-30.14,8.72-8.72,14.88-18.76,18.46-30.12,3.57-11.38,5.37-22.98,5.37-34.81s-2.1-23.06-6.32-33.64c-4.2-10.6-10.51-20.01-18.91-28.26-8.41-8.26-19-14.8-31.78-19.64-12.77-4.82-27.87-7.23-45.32-7.23h-127.54v124.1h64.47v-64.3h59.34c14.02,0,24.77,3.66,32.24,10.97,7.48,7.33,11.21,15.97,11.21,25.94v.33c-.09,15.02-12.53,27.06-27.56,27.06h-75.24v59.8h67c15.94,0,32.11-.3,45.69,9.71,11.14,8.22,19.08,22.35,19.08,36.26,0,10.9-3.74,19.54-11.21,25.92-7.48,6.4-18.39,9.58-32.71,9.58h-87.84v-81.47h-64.47v141.27h149.04c19.62,0,36.35-2.4,50.23-7.23,13.85-4.83,25.31-11.36,34.35-19.62,9.02-8.26,15.64-17.76,19.84-28.51,4.22-10.75,6.32-22.2,6.32-34.35,0-20.86-4.76-38.08-14.26-51.62Z" />
                  </g>
                  <path fill="#2563eb" d="M1088.49,200.43h-7.01l-148.58,330.79h304.16l-148.58-330.79ZM1083.36,470.03l-73.36,47.66,75.22-171,75.24,171-73.82-47.66h-3.27Z" />
                </svg></a>
            <div className="footer-social">
              <a href="https://www.linkedin.com/company/kingdomimpactbusinessadvisors/" target="_blank" rel="noopener noreferrer" aria-label="KIBA on LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" /></svg></a>
              <a href="https://www.facebook.com/kibadvisors" target="_blank" rel="noopener noreferrer" aria-label="KIBA on Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.87v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" /></svg></a>
            </div>
            <p className="footer-copy">&copy; 2026 Kingdom Impact Business Advisors. All rights reserved.</p>
          </div>

          <div className="footer-col reveal">
            <h3>Solutions</h3>
            <ul>
              <li><a href="/business-acquisitions">Business Acquisitions</a></li>
              <li><a href="/book-rr">Book a Consultation</a></li>
              <li><a href="/referral-partners">Referral Partners</a></li>
            </ul>
          </div>

          <div className="footer-col reveal">
            <h3>Company</h3>
            <ul>
              <li><a href="https://kibadvisors.com">About</a></li>
              <li><a href="#talk">Contact</a></li>
              <li><a href="https://kibadvisors.com/privacy-policy/">Privacy Policy</a></li>
              <li><a href="https://kibadvisors.com/terms-and-conditions/">Terms &amp; Conditions</a></li>
            </ul>
          </div>

          <div className="footer-col reveal">
            <h3>Get in Touch</h3>
            <ul>
              <li><a href="tel:2512108445">251-210-8445</a></li>
              <li><a href="mailto:info@kibadvisors.com">info@kibadvisors.com</a></li>
            </ul>
          </div>
        </div>
      </div>
      </footer>
    </>
  );
}
