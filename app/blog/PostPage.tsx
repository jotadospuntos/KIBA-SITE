'use client';

/*
 * The article template, shared by every /blog/<slug> page.
 *
 * The hero here is deliberately NOT the two-column image hero the rest of the
 * site uses: an article needs its title, byline and date up front, and the
 * clip-path photo panel would push all of that below the fold with no
 * editorial payoff. It keeps the navy band, the watermark and the SplitText
 * headline, so it still reads as the same site.
 *
 * The body is the post's structured document (lib/blog/doc.ts), rendered by
 * lib/blog/render.tsx — never raw HTML — so the typography lives in one place.
 * Also used by the dashboard's live preview, which passes `preview`.
 */

import dynamic from 'next/dynamic';
import '../home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import { TestimonialsSection } from '@/components/ui/testimonial-v2';
import { useMotionPreference } from '@/lib/useMotionPreference';
import { PostBody } from '@/lib/blog/render';
import type { PostSummary, PublicPost } from '@/lib/blog/queries';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

export default function PostPage({
  post,
  others,
  preview
}: {
  post: PublicPost;
  others: PostSummary[];
  /* Dashboard preview: a banner on top, so nobody mistakes it for the live page. */
  preview?: string;
}) {
  const { forceMotion } = useMotionPreference();

  return (
    <>
      {preview && (
        <div className="sticky top-0 z-[100] bg-amber-400 px-4 py-2 text-center text-[14px] font-semibold text-ink">
          {preview}
        </div>
      )}
      <SiteNav />

      <header className="hero" style={{ padding: '76px 0 72px' }}>
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap">
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px' }}>
            {post.category && <div className="eyebrow hero-eyebrow">{post.category}</div>}
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
              {post.title}
            </SplitText>
            <Reveal
              className="reveal mt-7! flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-white/70"
              style={{ transitionDelay: '0.12s' }}
            >
              <span className="text-white">{post.author}</span>
              <span aria-hidden="true">&middot;</span>
              <time dateTime={post.publishedAt}>{post.dateLabel}</time>
              <span aria-hidden="true">&middot;</span>
              <span>{post.readingMinutes} min read</span>
            </Reveal>
          </div>
        </div>
      </header>

      <section>
        <div className="wrap">
          <Reveal className="reveal mx-auto max-w-[760px]">
            <article>
              <PostBody doc={post.body} />
            </article>

            <div className="mt-14 rounded-[16px] bg-[#f2f4f7] p-8 ring-1 ring-line sm:p-10">
              <h2 className="mb-3! font-heading text-[20px] font-semibold text-navy-deep">
                Wondering how this applies to your business?
              </h2>
              <p className="mb-7! text-[15.5px] leading-relaxed text-slate">
                Book a conversation with a KIBA advisor. You&rsquo;ll get a straight answer about
                your own numbers &mdash; including if the answer is to wait.
              </p>
              <a href="/book-rr" className="btn btn-primary">Start the Conversation</a>
            </div>
          </Reveal>
        </div>
      </section>

      {others.length ? (
        <section className="section-alt">
          <div className="wrap">
            <Reveal className="section-head reveal">
              <div className="eyebrow">Keep Reading</div>
              <h2>More from the blog</h2>
            </Reveal>
            <div className="grid-2">
              {others.map((other) => (
                <Reveal
                  as="a"
                  href={`/blog/${other.slug}`}
                  className="benefit-card reveal"
                  style={{ textDecoration: 'none', display: 'block' }}
                  key={other.slug}
                >
                  {other.category && (
                    <div className="mb-4! inline-block rounded-full bg-[#f2f4f7] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-navy-soft ring-1 ring-line">
                      {other.category}
                    </div>
                  )}
                  <h3>{other.title}</h3>
                  <p>{other.excerpt}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <TestimonialsSection
        heading="Trusted through every step"
        intro="Business owners and referral partners on what it’s actually like to work with KIBA."
      />

      <section className="cta-band" id="talk">
        <GradientBlob />
        <Reveal className="wrap cta-band-inner reveal">
          <h2>Let&rsquo;s talk about your next move</h2>
          <p>Book a time with a KIBA advisor and find out what your business qualifies for.</p>
          <div className="cta-band-actions">
            <a href="/book-rr" className="btn btn-primary">Start the Conversation</a>
            <a href="/blog" className="btn btn-ghost">Back to the Blog</a>
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
