'use client';

/*
 * /capital-solutions — the hub the nav dropdown's first item points at, and the
 * page the six program pages cross-link back to.
 *
 * The WordPress source (https://kibadvisors.com/capital-solutions/) puts all six
 * programs on this one page. Here it's an index: the framing copy, which is
 * verbatim, plus a card per program. The programs themselves are
 * /capital-solutions/<slug>, rendered by ../ProgramPage.tsx.
 *
 * Same construction as every other route here — see ProgramPage.tsx for the
 * note on the `!` modifiers and home.css's unlayered rules.
 */

import dynamic from 'next/dynamic';
import '../home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import HeroBlobs from '@/components/HeroBlobs/HeroBlobs';
import HeroReveal from '@/components/HeroReveal/HeroReveal';
import { TestimonialsSection } from '@/components/ui/testimonial-v2';
import { useMotionPreference } from '@/lib/useMotionPreference';
import {
  PROGRAMS,
  DECISION_FACTORS,
  DECISION_LEAD,
  DECISION_PHILOSOPHY,
  HUB_INTRO,
  HUB_QUESTIONS
} from './solutions-data';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

/* Placeholder, like the program heroes — but this one is the 2600x2000 cut, so
   it's the only hero on the site that isn't upscaling. See solutions-data.ts. */
const HERO_IMAGE = '/img/hero/owner-cafe-laptop.webp';
const HERO_IMAGE_ALT = 'A business owner working through her options';

function Check({ color = '#6d94f5' }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
  );
}

export default function CapitalSolutionsPage() {
  const { forceMotion } = useMotionPreference();

  return (
    <>
      <SiteNav />

      <header className="hero">
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap"><div className="hero-inner">
          <div>
            <div className="eyebrow hero-eyebrow">Capital Solutions</div>
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
              The right capital &mdash;<br />not just more options.
            </SplitText>
            <Reveal as="p" className="hero-sub reveal" style={{ transitionDelay: '0.10s' }}>
              We don&rsquo;t start with loan products. We start with your business &mdash; because
              just because money is available doesn&rsquo;t mean it&rsquo;s the right move.
            </Reveal>
            <Reveal as="ul" className="klist on-dark reveal" style={{ maxWidth: '470px', margin: '0 0 30px', transitionDelay: '0.18s' }}>
              <li><Check />Six programs, and an honest answer on which one fits.</li>
              <li><Check />Sometimes the right answer is not to borrow at all.</li>
            </Reveal>
            <Reveal className="cta-row reveal" style={{ marginBottom: 0, transitionDelay: '0.26s' }}>
              <a href="/book-rr" className="btn btn-primary">Book a Consultation</a>
              <a href="tel:2512108445" className="btn btn-ghost">Call Our Team</a>
            </Reveal>
          </div>
          <HeroBlobs>
            <svg className="blob" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
            <HeroReveal className="hero-reveal" image={HERO_IMAGE} alt={HERO_IMAGE_ALT} />
          </HeroBlobs>
        </div></div>
      </header>

      {/* One size doesn't fit anyone */}
      <section>
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">One Size Doesn&rsquo;t Fit Anyone</div>
            <h2>Different businesses need different tools at different stages</h2>
          </Reveal>
          <Reveal className="reveal mx-auto max-w-[820px] rounded-[16px] border border-line bg-white p-9 sm:p-11">
            <p className="mt-0! mb-7! text-[16.5px] leading-relaxed text-slate">{HUB_INTRO}</p>
            <h3 className="mb-5! font-heading text-[17px] font-semibold text-ink">
              Before anything else, we work through
            </h3>
            <ul className="klist klist-2">
              {HUB_QUESTIONS.map((question) => (
                <li key={question}><Check color="#2563eb" />{question}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* The six programs, 3 + 3 */}
      <section className="section-alt">
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">The Programs</div>
            <h2>Six ways to fund a business</h2>
            <p>Each one is genuinely better than the others in some situations and worse in most. Start wherever you like &mdash; we&rsquo;ll tell you if you&rsquo;re in the wrong place.</p>
          </Reveal>
          <div className="benefits-grid" style={{ marginBottom: '24px' }}>
            {PROGRAMS.slice(0, 3).map((program) => (
              <Reveal
                as="a"
                href={`/capital-solutions/${program.slug}`}
                className="benefit-card reveal"
                style={{ textDecoration: 'none', display: 'block' }}
                key={program.slug}
              >
                <h3>{program.navTitle}</h3>
                <p>{program.navDesc}</p>
              </Reveal>
            ))}
          </div>
          <div className="benefits-grid">
            {PROGRAMS.slice(3).map((program) => (
              <Reveal
                as="a"
                href={`/capital-solutions/${program.slug}`}
                className="benefit-card reveal"
                style={{ textDecoration: 'none', display: 'block' }}
                key={program.slug}
              >
                <h3>{program.navTitle}</h3>
                <p>{program.navDesc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How we decide */}
      <section className="relative overflow-hidden bg-navy-deep! py-24!">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue/40 blur-[180px]" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-soft/25 blur-[180px]" />
        </div>
        <div className="wrap relative z-10">
          <Reveal className="reveal mx-auto max-w-[760px] text-center">
            <div className="eyebrow mb-4 text-blue-soft">How We Decide What&rsquo;s Right</div>
            <h2 className="mx-auto! font-serif text-[clamp(24px,3.2vw,36px)] font-normal leading-snug text-white">
              {DECISION_LEAD}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70">
              Deciding whether borrowing makes sense at all matters more than which product you can
              get approved for. These are the four things the recommendation actually turns on.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DECISION_FACTORS.map((factor, i) => (
              <Reveal
                className="reveal rounded-[14px] bg-white/[0.06] px-6 py-7 text-center ring-1 ring-white/15"
                style={{ transitionDelay: `${i * 0.08}s` }}
                key={factor}
              >
                <svg className="mx-auto mb-3 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5" /></svg>
                <div className="font-heading text-[15.5px] font-semibold text-white">{factor}</div>
              </Reveal>
            ))}
          </div>

          <Reveal className="reveal mt-12 text-center" style={{ transitionDelay: '0.1s' }}>
            <p className="mx-auto max-w-2xl text-[16.5px] leading-relaxed text-white/80">
              {DECISION_PHILOSOPHY}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Testimonials. Every page on this site carries this section - see
          CLAUDE.md "Testimonials". Content is lib/testimonials.ts; only the
          heading is per-page. */}
      <TestimonialsSection
        heading="Owners who chose with clarity"
        intro="Business owners and referral partners on what it’s actually like to work with KIBA."
      />

      {/* Start with clarity */}
      <section className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-gradient-to-br from-white via-paper to-ivory bg-transparent! py-0!">
        <svg
          className="pointer-events-none absolute right-[6%] top-1/2 w-[150px] -translate-y-1/2 opacity-[0.18] sm:w-[220px]"
          viewBox="0 0 152 172"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="hubTriFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#6d94f5" />
            </linearGradient>
          </defs>
          <path fill="url(#hubTriFill)" d="M76 0 L152 172 H0 Z" />
        </svg>
        <Reveal className="reveal relative z-10 max-w-[760px] px-6 py-[70px] text-center">
          <div className="font-serif text-[clamp(24px,3.4vw,36px)] leading-[1.3] text-navy-deep">Clarity first. Capital second. Stewardship always.</div>
          <div className="mt-3 font-sans text-[15px] leading-relaxed text-slate">Access to capital matters, but clarity matters more.</div>
        </Reveal>
      </section>

      <section className="cta-band" id="talk">
        <GradientBlob />
        <Reveal className="wrap cta-band-inner reveal">
          <h2>Start with clarity</h2>
          <p>Book a time with a KIBA advisor and find out which of these actually fits &mdash; or whether the right move is to wait.</p>
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
