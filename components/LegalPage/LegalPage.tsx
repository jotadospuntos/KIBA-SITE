'use client';

/*
 * Shared layout for the legal pages (Privacy Policy, and Terms & Conditions
 * when its text arrives). Content comes in as a `LegalDoc`; this file owns
 * only the typography and chrome, so the legal text itself lives in one
 * verbatim data file per document and is never entangled with markup.
 *
 * TWO DELIBERATE DEPARTURES FROM THE REST OF THE SITE:
 *
 * 1. NO TESTIMONIAL SECTION. CLAUDE.md says every page carries one; legal pages
 *    are the exception. A scrolling wall of client praise in the middle of a
 *    privacy policy undercuts the document and reads as a marketing insert on
 *    something people come to for compliance information.
 *
 * 2. NO IMAGE HERO. A compact navy band with the title and the revision date,
 *    because the date is the thing a reader is actually looking for.
 *
 * The CTA band at the bottom stays, and keeps its `id="talk"` — the shared
 * nav's "Let's Talk" button targets that anchor on every page, so dropping it
 * would leave a dead button up in the header.
 */

import dynamic from 'next/dynamic';
import '../../app/home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import { useMotionPreference } from '@/lib/useMotionPreference';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'dl'; items: { term: string; def: string }[] };

export type LegalSection = {
  heading: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  title: string;
  /* Shown under the title, e.g. "Updated on June 17th, 2026". */
  updated: string;
  /* Paragraphs before the first heading. */
  intro: string[];
  sections: LegalSection[];
};

/* Stable anchor ids so the contents list can link to each section, and so a
   deep link into a specific clause keeps working. */
function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function BlockView({ block }: { block: LegalBlock }) {
  if (block.type === 'ul') {
    return (
      <ul className="mb-6! ml-5! list-disc space-y-2 text-[16px] leading-[1.7] text-slate marker:text-blue">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === 'dl') {
    return (
      <dl className="mb-6! space-y-4">
        {block.items.map((item) => (
          <div key={item.term}>
            <dt className="font-heading text-[15.5px] font-semibold text-ink">{item.term}</dt>
            <dd className="m-0! text-[16px] leading-[1.7] text-slate">{item.def}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return <p className="mb-5! text-[16px] leading-[1.7] text-slate">{block.text}</p>;
}

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const { forceMotion } = useMotionPreference();

  return (
    <>
      <SiteNav />

      <header className="hero" style={{ padding: '76px 0 68px' }}>
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap">
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px' }}>
            <div className="eyebrow hero-eyebrow">Legal</div>
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
              {doc.title}
            </SplitText>
            <Reveal as="p" className="hero-sub reveal" style={{ transitionDelay: '0.10s' }}>
              {doc.updated}
            </Reveal>
          </div>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="mx-auto max-w-[760px]">
            {/* Contents. A policy this long is hard to navigate without it, and
                it gives support a way to link straight to a clause. */}
            <Reveal className="reveal mb-12 rounded-[16px] bg-[#f2f4f7] p-7 ring-1 ring-line sm:p-8">
              <h2 className="mb-4! font-heading text-[15px] font-semibold uppercase tracking-[0.12em] text-navy-soft">
                Contents
              </h2>
              <ol className="m-0! list-none p-0! space-y-2">
                {doc.sections.map((section) => (
                  <li key={section.heading}>
                    <a
                      href={`#${slugify(section.heading)}`}
                      className="text-[15.5px] leading-snug text-navy-deep underline decoration-line underline-offset-4 hover:decoration-blue"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal className="reveal" style={{ transitionDelay: '0.06s' }}>
              {doc.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mb-5! text-[16.5px] leading-[1.7] text-ink">
                  {paragraph}
                </p>
              ))}

              {doc.sections.map((section) => (
                <section key={section.heading} aria-labelledby={slugify(section.heading)}>
                  <h2
                    id={slugify(section.heading)}
                    /* scroll-mt keeps the heading clear of the sticky nav when
                       a contents link jumps to it. */
                    className="mb-4! mt-12! scroll-mt-28 font-heading text-[clamp(20px,2.4vw,25px)] font-semibold tracking-tight text-ink"
                  >
                    {section.heading}
                  </h2>
                  {section.blocks.map((block, i) => (
                    <BlockView key={i} block={block} />
                  ))}
                </section>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Keeps id="talk" so the nav's "Let's Talk" button isn't dead here. */}
      <section className="cta-band" id="talk">
        <GradientBlob />
        <Reveal className="wrap cta-band-inner reveal">
          <h2>Questions about any of this?</h2>
          <p>Our team is here to help &mdash; reach out any time.</p>
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
