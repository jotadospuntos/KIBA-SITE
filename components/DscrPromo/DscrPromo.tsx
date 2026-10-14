'use client';

/*
 * Homepage band that sends visitors to /dscr-calculator: copy on the left, an
 * illustrative result card on the right. Tailwind on a plain <section>, so
 * home.css's bare `section` rule (96px padding, white) is the band itself and
 * the navy panel sits inside it.
 *
 * The example figures are labelled as an example and follow lib/dscr/calc.ts
 * exactly: EBITDA = net income + interest + depreciation (314,000), debt
 * service = monthly payments x 12 (220,800), DSCR = 314,000 / 220,800 = 1.42x.
 * No "lenders want X" line - that's a lending claim (see CLAUDE.md).
 */

import Reveal from '@/components/Reveal/Reveal';

const EXAMPLE = {
  rows: [
    { label: 'Net income', value: '$214,000' },
    { label: '+ Interest', value: '$38,500' },
    { label: '+ Depreciation', value: '$61,500' }
  ],
  ebitda: '$314,000',
  debtService: '$220,800',
  dscr: '1.42x',
  /* Bar widths: debt service as a share of EBITDA (220,800 / 314,000). */
  debtShare: '70%'
};

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#6d94f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
  );
}

export default function DscrPromo() {
  return (
    <section>
      <div className="wrap">
        <div className="relative grid items-center gap-12 overflow-hidden rounded-[28px] bg-navy-deep px-7 py-12 sm:px-12 md:py-16 min-[900px]:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-16">
          <svg className="pointer-events-none absolute -right-16 -bottom-24 w-[360px] opacity-[0.07]" viewBox="0 0 152 172" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#6d94f5" d="M76 0 L152 172 H0 Z" /></svg>

          <Reveal className="reveal relative">
            <div className="eyebrow text-blue-soft">Free Tool &middot; DSCR Calculator</div>
            <h2 className="mt-4 text-[clamp(28px,3.4vw,40px)] leading-[1.12] text-white">
              Know your DSCR before a lender does.
            </h2>
            <p className="mt-4 mb-7 max-w-[500px] font-sans text-[16.5px] leading-relaxed text-white/75">
              Debt service coverage is one of the first numbers a lender looks at. Work out yours
              in two steps and walk into the conversation knowing where you stand.
            </p>
            <ul className="klist on-dark" style={{ maxWidth: '470px', margin: '0 0 32px' }}>
              <li><Check />Takes about two minutes with your latest tax return.</li>
              <li><Check />The same calculation our advisors run on a client&rsquo;s file.</li>
              <li><Check />Free, with no obligation.</li>
            </ul>
            <a href="/dscr-calculator" className="btn btn-primary">
              Calculate Your DSCR
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </Reveal>

          {/* Decorative preview: the real tool is one click away, so this is
              aria-hidden rather than a second, fake calculator for screen
              readers to stumble through. */}
          <Reveal
            className="reveal relative w-full max-w-[420px] min-[900px]:justify-self-end rounded-[20px] bg-white p-7 shadow-[0_40px_70px_-30px_rgba(0,0,0,0.5)] sm:p-8"
            style={{ transitionDelay: '0.12s' }}
            aria-hidden="true"
          >
            <div className="flex items-center justify-between">
              <span className="font-sans text-[14.5px] font-semibold text-ink">Your DSCR</span>
              <span className="rounded-full bg-paper px-3 py-1 font-mono text-[11px] tracking-[0.12em] text-slate uppercase">Example</span>
            </div>

            <dl className="mt-6 space-y-2.5 font-sans text-[14.5px]">
              {EXAMPLE.rows.map((row) => (
                <div className="flex justify-between" key={row.label}>
                  <dt className="text-slate">{row.label}</dt>
                  <dd className="m-0 text-ink tabular-nums">{row.value}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-line pt-2.5 font-semibold">
                <dt className="text-ink">EBITDA</dt>
                <dd className="m-0 text-ink tabular-nums">{EXAMPLE.ebitda}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate">Annual debt service</dt>
                <dd className="m-0 text-ink tabular-nums">{EXAMPLE.debtService}</dd>
              </div>
            </dl>

            <div className="mt-6 space-y-2">
              <div className="h-2.5 rounded-full bg-blue" />
              <div className="h-2.5 rounded-full bg-blue-soft/45" style={{ width: EXAMPLE.debtShare }} />
            </div>

            <div className="mt-6 flex items-end justify-between rounded-2xl bg-paper px-5 py-4">
              <span className="font-sans text-[13px] leading-snug text-slate">EBITDA &divide;<br />annual debt service</span>
              <span className="font-heading text-[40px] leading-none font-semibold text-navy-deep tabular-nums">{EXAMPLE.dscr}</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
