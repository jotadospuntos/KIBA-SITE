'use client';

/*
 * /contact-us — the live WordPress site has a real Contact page and this repo
 * only had a `#talk` anchor, so this closes that gap.
 *
 * Copy comes from https://kibadvisors.com/contact-us/: the "We're Here to Help"
 * subheading, the invitation line and the office hours are verbatim from there.
 * OFFICE HOURS (Mon–Fri, 8:30 AM – 5:00 PM) appeared nowhere else in this repo
 * before this page.
 *
 * The booking calendar is the SHARED round robin (the one /book-rr uses), not
 * any single advisor's — a generic Contact page should reach whoever is
 * available. Contact and booking are therefore one page rather than a page that
 * points at another page. GHL iframes don't render in sandboxes; verify on a
 * deploy.
 */

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import '../home.css';
import SiteNav from '@/components/SiteNav/SiteNav';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Reveal from '@/components/Reveal/Reveal';
import GradientBlob from '@/components/GradientBlob/GradientBlob';
import HeroBlobs from '@/components/HeroBlobs/HeroBlobs';
import HeroReveal from '@/components/HeroReveal/HeroReveal';
import { TestimonialsSection } from '@/components/ui/testimonial-v2';
import { FaqAccordion } from '@/components/ui/faq-accordion';
import { useMotionPreference } from '@/lib/useMotionPreference';
import { ROUND_ROBIN_CALENDAR, loadGhlEmbedScript } from '@/lib/ghl';

const SplitText = dynamic(() => import('@/components/SplitText/SplitText'), { ssr: true });

/* KIBA's own branded interior render, supplied by the business. Deliberately
   NOT put through the tone grade the composite heroes use - that would shift
   the brand blue in the logo. Cropped flush right so the logo sits as close to
   the middle of the frame as the source allows. */
const HERO_IMAGE = '/img/hero/kiba-office-lobby.webp';
const HERO_IMAGE_ALT = 'The KIBA office lounge, with the KIBA sign on the wall';

/* The SHARED round-robin calendar, the same one /book-rr uses — not any single
   advisor's. A generic Contact page should reach whoever is available. */

const CONTACTS = [
  {
    label: 'Call us',
    value: '251-210-8445',
    href: 'tel:2512108445',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.8 2Z" /></svg>
    )
  },
  {
    label: 'Email us',
    value: 'info@kibadvisors.com',
    href: 'mailto:info@kibadvisors.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
    )
  },
  {
    label: 'Office hours',
    value: 'Mon – Fri, 8:30 AM – 5:00 PM',
    href: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
    )
  }
];

export default function ContactUsPage() {
  const { forceMotion } = useMotionPreference();

  useEffect(() => { loadGhlEmbedScript(); }, []);

  return (
    <>
      <SiteNav />

      <header className="hero">
        <svg className="hero-watermark" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
        <div className="wrap"><div className="hero-inner">
          <div>
            <div className="eyebrow hero-eyebrow">Contact Us</div>
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
              We&rsquo;re here<br />to help.
            </SplitText>
            <Reveal as="p" className="hero-sub reveal" style={{ transitionDelay: '0.10s' }}>
              Have questions or need assistance? Our team is ready to support you every step of the
              way. Get in touch today!
            </Reveal>
            <Reveal className="cta-row reveal" style={{ marginBottom: 0, transitionDelay: '0.18s' }}>
              <a href="tel:2512108445" className="btn btn-primary">Call 251-210-8445</a>
              <a href="#book" className="btn btn-ghost">Book a Time</a>
            </Reveal>
          </div>
          <HeroBlobs>
            <svg className="blob" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#2563eb" d="M76 0 L152 172 H0 Z" /></svg>
            <HeroReveal className="hero-reveal" image={HERO_IMAGE} alt={HERO_IMAGE_ALT} />
          </HeroBlobs>
        </div></div>
      </header>

      {/* Reach us */}
      <section>
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Reach Us</div>
            <h2>Three ways to start a conversation</h2>
            <p>A real person answers. No call centre, no ticket queue.</p>
          </Reveal>
          <div className="benefits-grid">
            {CONTACTS.map((c) => (
              <Reveal className="benefit-card reveal" key={c.label}>
                <div className="mb-5! flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#f2f4f7] ring-1 ring-line [&_svg]:h-5 [&_svg]:w-5">
                  {c.icon}
                </div>
                <h3>{c.label}</h3>
                {c.href ? (
                  <p>
                    <a href={c.href} className="font-semibold text-navy-soft no-underline hover:underline">
                      {c.value}
                    </a>
                  </p>
                ) : (
                  <p>{c.value}</p>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Booking calendar */}
      <section className="section-alt" id="book">
        <div className="wrap">
          <Reveal className="section-head reveal">
            <div className="eyebrow">Book a Time</div>
            <h2>Pick a slot that suits you</h2>
            <p>No pressure, no obligation &mdash; and an honest answer either way.</p>
          </Reveal>
          <Reveal className="reveal mx-auto max-w-[900px] overflow-hidden rounded-[16px] bg-white p-3 ring-1 ring-line sm:p-5">
            <iframe
              src={ROUND_ROBIN_CALENDAR}
              scrolling="no"
              title="Schedule a conversation with KIBA"
              className="h-[720px] w-full rounded-[12px] border-0"
            />
          </Reveal>
        </div>
      </section>

      <FaqAccordion />

      <TestimonialsSection
        heading="Trusted through every step"
        intro="Business owners and referral partners on what it’s actually like to work with KIBA."
      />

      {/* The motto band, same treatment as the other routes. */}
      <section className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-gradient-to-br from-white via-paper to-ivory bg-transparent! py-0!">
        <svg
          className="pointer-events-none absolute right-[6%] top-1/2 w-[150px] -translate-y-1/2 opacity-[0.18] sm:w-[220px]"
          viewBox="0 0 152 172"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="contactTriFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#6d94f5" />
            </linearGradient>
          </defs>
          <path fill="url(#contactTriFill)" d="M76 0 L152 172 H0 Z" />
        </svg>
        <Reveal className="reveal relative z-10 max-w-[760px] px-6 py-[70px] text-center">
          <div className="font-serif text-[clamp(24px,3.4vw,36px)] leading-[1.3] text-navy-deep">Clarity first. Capital second. Stewardship always.</div>
          <div className="mt-3 font-sans text-[15px] leading-relaxed text-slate">Access to capital matters, but clarity matters more.</div>
        </Reveal>
      </section>

      <section className="cta-band" id="talk">
        <GradientBlob />
        <Reveal className="wrap cta-band-inner reveal">
          <h2>Start the conversation</h2>
          <p>Tell us where your business is headed and we&rsquo;ll walk you through your real options.</p>
          <div className="cta-band-actions">
            <a href="#book" className="btn btn-primary">Book a Consultation</a>
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
