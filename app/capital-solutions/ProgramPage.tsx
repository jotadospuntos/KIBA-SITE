'use client';

/*
 * The shared layout for all six /capital-solutions/<program> pages.
 *
 * There is deliberately ONE component rather than six near-identical page
 * files: the programs differ only in copy, so the structure lives here and the
 * words live in solutions-data.ts. Adding a seventh program is a new entry in
 * that array plus a nav line - no new layout code. (This is also what CLAUDE.md
 * asks for in place of the legacy pages' config-block hack.)
 *
 * Built from the same pieces as /about-us and /meet-our-team: the homepage hero
 * (SplitText + HeroBlobs + HeroReveal), the shared nav/footer/Reveal, and
 * home.css's .section-head / .benefit-card / .klist shells. Tailwind only for
 * the navy "straight talk" band, which home.css has no shell for.
 *
 * The `!` modifiers there are load-bearing - home.css is unlayered and beats
 * Tailwind's layered utilities. Full explanation in
 * components/ui/team-section-block-shadcnui.tsx.
 */

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import '../home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import HeroBlobs from '@/components/HeroBlobs/HeroBlobs';
import HeroReveal from '@/components/HeroReveal/HeroReveal';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { useMotionPreference } from '@/lib/useMotionPreference';
import {
  PROGRAMS,
  DECISION_FACTORS,
  DECISION_LEAD,
  DECISION_PHILOSOPHY,
  getProgram
} from './solutions-data';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

function Check({ color = '#6d94f5' }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
  );
}

/*
 * Takes the SLUG, not the Program object, and looks the object up here.
 *
 * This is a server/client boundary rule, not a style preference: [slug]/page.tsx
 * is a server component, and every prop it passes has to be serializable.
 * `Program.icon` is a Lucide component - a function - so passing the whole
 * object made the build hang and then fail trying to stringify it. Passing the
 * slug keeps functions on the client side of the boundary (and shrinks the RSC
 * payload, since the copy no longer gets serialized into the HTML twice).
 */
export default function ProgramPage({ slug }: { slug: string }) {
  const { forceMotion } = useMotionPreference();

  const program = getProgram(slug);
  if (!program) throw new Error(`Unknown capital-solutions program: ${slug}`);

  /* The other five programs, in their canonical order, for the cross-links. */
  const others = PROGRAMS.filter((p) => p.slug !== program.slug);

  return (
    <>
      <SiteNav />

      {/* Hero - the site's standard one: watermark, two-column .hero-inner, the
          split-text headline, cursor-parallax blobs and the angled clip-path
          image panel. Don't touch .hero's padding to resize it; .hero-visual's
          -76px/-96px margins are tuned to it. */}
      <header className="hero">
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap"><div className="hero-inner">
          <div>
            <div className="eyebrow hero-eyebrow">Capital Solutions</div>
            <SplitText
              tag="h1"
              /* 'words, chars', not 'chars': each char is an inline-block, so
                 without the word wrapper the browser can break mid-word. */
              splitType="words, chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              duration={1.1}
              delay={18}
              ease="power3.out"
              forceMotion={forceMotion}
            >
              {program.headline.split('\n').map((line, i) => (
                <Fragment key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </Fragment>
              ))}
            </SplitText>
            {/* The headline animates via SplitText; everything under it fades up
                behind it on a hand-set stagger. */}
            <Reveal as="p" className="hero-sub reveal" style={{ transitionDelay: '0.10s' }}>
              {program.heroSub}
            </Reveal>
            <Reveal as="ul" className="klist on-dark reveal" style={{ maxWidth: '470px', margin: '0 0 30px', transitionDelay: '0.18s' }}>
              {program.heroBullets.map((bullet) => (
                <li key={bullet}><Check />{bullet}</li>
              ))}
            </Reveal>
            <Reveal className="cta-row reveal" style={{ marginBottom: 0, transitionDelay: '0.26s' }}>
              <a href="/book-rr" className="btn btn-primary">Book a Consultation</a>
              <a href="tel:2512108445" className="btn btn-ghost">Call Our Team</a>
            </Reveal>
          </div>
          <HeroBlobs>
            <svg className="blob" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
            <HeroReveal className="hero-reveal" image={program.heroImage} alt={program.heroImageAlt} />
          </HeroBlobs>
        </div></div>
      </header>

      {/* What it is */}
      <section>
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">What It Is</div>
            <h2>{program.name} in plain terms</h2>
            <p>{program.summary}</p>
          </Reveal>
          <Reveal className="reveal mx-auto max-w-[820px] rounded-[16px] border border-line bg-white p-9 sm:p-11">
            <p className="mt-0! mb-7! text-[16.5px] leading-relaxed text-slate">{program.expand}</p>
            <h3 className="mb-5! font-heading text-[17px] font-semibold text-ink">
              What it typically funds
            </h3>
            <ul className="klist klist-2">
              {program.usedFor.map((item) => (
                <li key={item}><Check color="#2563eb" />{item}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Whether it fits - the source page's "may make sense if" list, 2x2 */}
      <section className="section-alt">
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Is This The Right Tool?</div>
            <h2>This may make sense if&hellip;</h2>
            <p>Four things we look at before we recommend this over anything else on the list.</p>
          </Reveal>
          <div className="grid-2">
            {program.fit.map((point, i) => (
              <Reveal className="benefit-card reveal" key={point}>
                <div className="benefit-icon"><span style={{ fontFamily: "'General Sans','Instrument Sans',sans-serif", fontWeight: '700', fontSize: '19px', color: '#fff' }}>{i + 1}</span></div>
                <h3>{point}</h3>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Straight talk: when it isn't the right tool, and how we decide.
          Navy, so it breaks up the light sections either side of it. */}
      <section className="relative overflow-hidden bg-navy-deep! py-24!">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue/40 blur-[180px]" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-soft/25 blur-[180px]" />
        </div>
        <div className="wrap relative z-10">
          <Reveal className="reveal mx-auto max-w-[760px] text-center">
            <div className="eyebrow mb-4 text-blue-soft">Straight Talk</div>
            <h2 className="mx-auto! text-[clamp(26px,3.4vw,38px)] font-semibold leading-tight tracking-tight text-white">
              When this <span className="text-blue-soft">isn&rsquo;t</span> the right tool
            </h2>
          </Reveal>

          <Reveal
            className="reveal mx-auto mt-10 flex max-w-[760px] items-start gap-5 rounded-[18px] bg-white/[0.06] p-8 ring-1 ring-white/15 sm:p-10"
            style={{ transitionDelay: '0.08s' }}
          >
            <svg className="mt-1 h-7 w-7 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" /></svg>
            <p className="m-0 text-[17px] leading-relaxed text-white">{program.caution}</p>
          </Reveal>

          <Reveal className="reveal mt-16 text-center" style={{ transitionDelay: '0.12s' }}>
            <h3 className="mb-4! font-serif text-[clamp(21px,2.6vw,28px)] font-normal leading-snug text-white">
              {DECISION_LEAD}
            </h3>
            <p className="mx-auto max-w-xl text-[15.5px] leading-relaxed text-white/70">
              Whichever program you arrive asking about, these are the four things that actually
              decide the recommendation.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Cross-links to the other five programs, as a bento grid.
          Five cards over two rows of three: the fourth spans two columns so the
          grid fills exactly and doesn't read as a 3+2 with a hole in it. */}
      <section>
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Other Capital Solutions</div>
            <h2>Not sure this is the one?</h2>
            <p>Most clients arrive asking about one program and leave with a different answer. Here&rsquo;s the rest of the list.</p>
          </Reveal>
          <Reveal className="reveal">
            {/* No explicit grid-rows here on purpose: BentoGrid sets
                auto-rows-[16rem], and declaring rows would make them `auto`
                and collapse the cards to text height. Five cards with the
                fourth spanning two columns already fills exactly two rows. */}
            <BentoGrid>
              {others.map((other, i) => (
                <BentoCard
                  key={other.slug}
                  name={other.navTitle}
                  description={other.navDesc}
                  href={`/capital-solutions/${other.slug}`}
                  cta="Explore this program"
                  Icon={other.icon}
                  className={i === 3 ? 'md:col-span-2' : undefined}
                  background={
                    <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue/10 blur-3xl transition-opacity duration-300 group-hover:opacity-150" />
                  }
                />
              ))}
            </BentoGrid>
          </Reveal>
        </div>
      </section>

      {/* The motto, on the light band - same treatment as the other routes. */}
      <section className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-gradient-to-br from-white via-paper to-ivory bg-transparent! py-0!">
        <svg
          className="pointer-events-none absolute right-[6%] top-1/2 w-[150px] -translate-y-1/2 opacity-[0.18] sm:w-[220px]"
          viewBox="0 0 152 172"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="programTriFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#6d94f5" />
            </linearGradient>
          </defs>
          <path fill="url(#programTriFill)" d="M76 0 L152 172 H0 Z" />
        </svg>
        <Reveal className="reveal relative z-10 max-w-[760px] px-6 py-[70px] text-center">
          <div className="font-serif text-[clamp(24px,3.4vw,36px)] leading-[1.3] text-navy-deep">Clarity first. Capital second. Stewardship always.</div>
          <div className="mt-3 font-sans text-[15px] leading-relaxed text-slate">Access to capital matters, but clarity matters more.</div>
        </Reveal>
      </section>

      {/* #talk - the shared nav's "Let's Talk" targets this anchor everywhere. */}
      <section className="cta-band" id="talk">
        <GradientBlob />
        <Reveal className="wrap cta-band-inner reveal">
          <h2>Let&rsquo;s find out if this is the right fit</h2>
          <p>Book a time with a KIBA advisor. You&rsquo;ll get a straight answer on what your business actually qualifies for &mdash; and whether you should take it.</p>
          <div className="cta-band-actions">
            <a href="/book-rr" className="btn btn-primary">Book a Consultation</a>
            <a href="/capital-solutions" className="btn btn-ghost">See All Solutions</a>
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
