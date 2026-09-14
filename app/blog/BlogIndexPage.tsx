'use client';

/*
 * /blog — the post index. Same construction as every other route here: shared
 * nav/footer/Reveal, the homepage hero, and the site's testimonial section
 * (every page carries one — see CLAUDE.md "Testimonials").
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
import { POSTS, readingTime } from './posts';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

/* Placeholder like the other heroes; 800x533 so it upscales in this panel.
   See CLAUDE.md — replacements want ~2600x2000. */
const HERO_IMAGE = '/img/hero/owner-reviewing.webp';
const HERO_IMAGE_ALT = 'A business owner reading through their numbers';

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
  );
}

export default function BlogIndexPage() {
  const { forceMotion } = useMotionPreference();

  return (
    <>
      <SiteNav />

      <header className="hero">
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap"><div className="hero-inner">
          <div>
            <div className="eyebrow hero-eyebrow">Blog</div>
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
              Clear thinking on<br />capital decisions.
            </SplitText>
            <Reveal as="p" className="hero-sub reveal" style={{ transitionDelay: '0.10s' }}>
              Practical writing for business owners weighing whether to borrow, when to borrow, and
              what to do first.
            </Reveal>
            <Reveal as="ul" className="klist on-dark reveal" style={{ maxWidth: '470px', margin: '0 0 30px', transitionDelay: '0.18s' }}>
              <li><Check />No pitches &mdash; just how these decisions actually work.</li>
              <li><Check />Written by the advisors who sit in the meetings.</li>
            </Reveal>
            <Reveal className="cta-row reveal" style={{ marginBottom: 0, transitionDelay: '0.26s' }}>
              <a href="/book-rr" className="btn btn-primary">Book a Consultation</a>
              <a href="/contact-us" className="btn btn-ghost">Contact Us</a>
            </Reveal>
          </div>
          <HeroBlobs>
            <svg className="blob" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
            <HeroReveal className="hero-reveal" image={HERO_IMAGE} alt={HERO_IMAGE_ALT} />
          </HeroBlobs>
        </div></div>
      </header>

      <section>
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Latest</div>
            <h2>Articles</h2>
            <p>Short reads on cash flow, business credit and financing readiness.</p>
          </Reveal>

          <div className="benefits-grid">
            {POSTS.map((post) => (
              <Reveal
                as="a"
                href={`/blog/${post.slug}`}
                className="benefit-card reveal"
                style={{ textDecoration: 'none', display: 'block' }}
                key={post.slug}
              >
                <div className="mb-4! inline-block rounded-full bg-[#f2f4f7] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-navy-soft ring-1 ring-line">
                  {post.category}
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className="mt-5! flex items-center gap-2 text-[13px] text-slate">
                  <time dateTime={post.date}>{post.dateLabel}</time>
                  <span aria-hidden="true">&middot;</span>
                  <span>{readingTime(post)} min read</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection
        heading="Trusted through every step"
        intro="Business owners and referral partners on what it’s actually like to work with KIBA."
      />

      <section className="cta-band" id="talk">
        <GradientBlob />
        <Reveal className="wrap cta-band-inner reveal">
          <h2>Have a question the blog didn&rsquo;t answer?</h2>
          <p>Book a time with a KIBA advisor and get a straight answer about your own situation.</p>
          <div className="cta-band-actions">
            <a href="/book-rr" className="btn btn-primary">Book a Consultation</a>
            <a href="/capital-solutions" className="btn btn-ghost">See Capital Solutions</a>
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
