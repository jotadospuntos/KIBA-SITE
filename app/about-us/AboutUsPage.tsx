'use client';

/*
 * /about-us — adapted from https://kibadvisors.com/about-us/ (see
 * app/about-us/about-content.ts for what is verbatim and what isn't).
 *
 * Third real app/ route. Same construction as /meet-our-team: the shared nav,
 * footer and Reveal, the homepage's hero (SplitText + HeroBlobs + HeroReveal)
 * and the .hero / .btn / .section-head / .benefit-card shells from home.css,
 * with Tailwind only for the two sections home.css has no shell for.
 *
 * The `!` modifiers on those two sections are load-bearing — home.css is
 * unlayered and beats Tailwind's layered utilities. The full explanation is in
 * components/ui/team-section-block-shadcnui.tsx; the short version is that
 * `section{padding:96px 0;background-color:#fff}` and `h1,h2,h3{margin:0}` win
 * over `py-24`, `bg-navy-deep` and `mx-auto` unless they're marked.
 */

import dynamic from 'next/dynamic';
import '../home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import HeroBlobs from '@/components/HeroBlobs/HeroBlobs';
import HeroReveal from '@/components/HeroReveal/HeroReveal';
import { useMotionPreference } from '@/lib/useMotionPreference';
import { VALUES, OUTCOMES, SERVICES, CLIENT_PROFILE } from './about-content';

/* Code-split, same as the other two routes: SplitText pulls in GSAP (~86KB).
   ssr stays true so the <h1> is server-rendered. */
const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

/* An advisor sitting down with clients — the closest thing in public/img/hero/
   to what this page is about. Note it's 800x533, cut for the small tiles the
   old homepage used, so it upscales in this panel; owner-cafe-laptop.webp is
   the only photo cut at 2600x2000 for it, and it's already the hero on both
   other routes. Worth re-cutting a proper 2600x2000 version of this shot. */
const HERO_IMAGE = '/img/hero/couple-consultation.webp';
const HERO_IMAGE_ALT = 'A KIBA advisor walking two business owners through their options';

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
  );
}

export default function AboutUsPage() {
  const { forceMotion } = useMotionPreference();

  return (
    <>
      <SiteNav />

      {/* Hero: the same construction as /meet-our-team. */}
      <header className="hero">
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap"><div className="hero-inner">
          <div>
            <div className="eyebrow hero-eyebrow">About Us</div>
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
              Built for business.<br />Grounded in faith.<br />Focused on impact.
            </SplitText>
            <p className="hero-sub">
              Kingdom Impact Business Advisors was born from a conviction that business was never
              meant to be just about numbers.
            </p>
            <ul className="klist on-dark" style={{ maxWidth: '470px', margin: '0 0 30px' }}>
              <li><Check />We tell the truth even when it&rsquo;s not the easiest answer.</li>
              <li><Check />Most advisors sell products. We prepare businesses.</li>
            </ul>
            <div className="cta-row" style={{ marginBottom: 0 }}>
              <a href="/book-rr" className="btn btn-primary">Book a Consultation</a>
              <a href="/meet-our-team" className="btn btn-ghost">Meet the Team</a>
            </div>
          </div>
          <HeroBlobs>
            <svg className="blob" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
            <HeroReveal className="hero-reveal" image={HERO_IMAGE} alt={HERO_IMAGE_ALT} />
          </HeroBlobs>
        </div></div>
      </header>

      {/* Why we exist */}
      <section>
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Why We Exist</div>
            <h2>Business was never meant to be just about numbers</h2>
            <p>KIBA started because of what we kept watching happen to good business owners on the other side of the table.</p>
          </Reveal>
          <div className="grid-2">
            <Reveal className="benefit-card reveal">
              <div className="benefit-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></svg></div>
              <h3>What we kept seeing</h3>
              <p>Too many business owners were treated like transactions instead of partners. They were rushed, misunderstood, overcharged, or pushed into financing that solved a short-term problem while creating long-term pain.</p>
            </Reveal>
            <Reveal className="benefit-card reveal">
              <div className="benefit-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" /><circle cx="12" cy="12" r="2.5" /></svg></div>
              <h3>Our vision</h3>
              <p>To transform the lending landscape by setting a new standard of truth, integrity, and service &mdash; creating a ripple effect where businesses flourish, employees grow, and communities thrive through Kingdom-centered stewardship.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Core values — 3 + 2, the way the homepage splits its solution rows */}
      <section className="section-alt">
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">What We Stand For</div>
            <h2>Five values that decide every call we make</h2>
            <p>Not wall art. These are the rules we apply when the easy answer and the right answer are different.</p>
          </Reveal>
          <div className="benefits-grid" style={{ marginBottom: '24px' }}>
            {VALUES.slice(0, 3).map((value, i) => (
              <Reveal className="benefit-card reveal" key={value.name}>
                <div className="benefit-icon"><span style={{ fontFamily: "'General Sans','Instrument Sans',sans-serif", fontWeight: '700', fontSize: '19px', color: '#fff' }}>{i + 1}</span></div>
                <h3>{value.name}</h3>
                <p>{value.body}</p>
              </Reveal>
            ))}
          </div>
          <div className="grid-2">
            {VALUES.slice(3).map((value, i) => (
              <Reveal className="benefit-card reveal" key={value.name}>
                <div className="benefit-icon"><span style={{ fontFamily: "'General Sans','Instrument Sans',sans-serif", fontWeight: '700', fontSize: '19px', color: '#fff' }}>{i + 4}</span></div>
                <h3>{value.name}</h3>
                <p>{value.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The difference + what we actually do. Navy, so it breaks up the two
          light sections around it - the same role the team grid's band plays on
          /meet-our-team. Tailwind, because home.css has no shell for it. */}
      <section className="relative overflow-hidden bg-navy-deep! py-24!">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue/40 blur-[180px]" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-soft/25 blur-[180px]" />
        </div>
        <div className="wrap relative z-10">
          <Reveal className="reveal mx-auto max-w-[760px] text-center">
            <div className="eyebrow mb-4 text-blue-soft">How We&rsquo;re Different</div>
            <h2 className="mx-auto! text-[clamp(26px,3.4vw,38px)] font-semibold leading-tight tracking-tight text-white">
              Most advisors focus on selling products.<br />
              <span className="text-blue-soft">We focus on preparing businesses.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70">
              Preparation is what changes the answer you get from a lender. It is most of the work,
              and it happens before anyone submits anything.
            </p>
          </Reveal>

          {/* What preparation buys you */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OUTCOMES.map((outcome) => (
              <Reveal
                className="reveal rounded-[14px] bg-white/[0.06] px-6 py-7 text-center ring-1 ring-white/15"
                key={outcome}
              >
                <svg className="mx-auto mb-3 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5" /></svg>
                <div className="font-heading text-[15.5px] font-semibold text-white">{outcome}</div>
              </Reveal>
            ))}
          </div>

          {/* Services */}
          <Reveal className="reveal mt-16 rounded-[18px] bg-white/[0.05] p-9 ring-1 ring-white/15 sm:p-11">
            <h3 className="mb-6! font-heading text-xl font-semibold text-white">What that looks like in practice</h3>
            <ul className="klist on-dark klist-2">
              {SERVICES.map((service) => (
                <li key={service}><Check />{service}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Who we serve */}
      <section>
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Who We Serve</div>
            <h2>We do our best work with owners who&hellip;</h2>
            <p>If this sounds like you, the conversation tends to go well.</p>
          </Reveal>
          <Reveal className="reveal mx-auto max-w-[820px] rounded-[16px] border border-line bg-white p-9 sm:p-11">
            <ul className="klist klist-2">
              {CLIENT_PROFILE.map((item) => (
                <li key={item}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* The motto, as the light band. Same treatment as /meet-our-team: light,
          because it sits between a navy CTA band and the rest of the page and
          would otherwise disappear into it. home.css's `.band` stays navy for
          the homepage - don't edit those rules to match this. */}
      <section className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-gradient-to-br from-white via-paper to-ivory bg-transparent! py-0!">
        <svg
          className="pointer-events-none absolute right-[6%] top-1/2 w-[150px] -translate-y-1/2 opacity-[0.18] sm:w-[220px]"
          viewBox="0 0 152 172"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="aboutTriFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#6d94f5" />
            </linearGradient>
          </defs>
          <path fill="url(#aboutTriFill)" d="M76 0 L152 172 H0 Z" />
        </svg>
        <Reveal className="reveal relative z-10 max-w-[760px] px-6 py-[70px] text-center">
          <div className="font-serif text-[clamp(24px,3.4vw,36px)] leading-[1.3] text-navy-deep">Clarity first. Capital second. Stewardship always.</div>
          <div className="mt-3 font-sans text-[15px] leading-relaxed text-slate">We don&rsquo;t just help businesses grow. We help owners lead well, steward wisely, and build with intention.</div>
        </Reveal>
      </section>

      {/* #talk — the shared nav's "Let's Talk" targets this anchor on every page. */}
      <section className="cta-band" id="talk">
        <GradientBlob />
        <Reveal className="wrap cta-band-inner reveal">
          <h2>Let&rsquo;s talk about your next move</h2>
          <p>Book a time with a KIBA advisor and find out what your business qualifies for.</p>
          <div className="cta-band-actions">
            <a href="/book-rr" className="btn btn-primary">Book a Consultation</a>
            <a href="/meet-our-team" className="btn btn-ghost">Meet the Team</a>
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
