import { Fragment } from 'react';

/*
 * Trust marquee, replacing the '#marqueeTrack' line in
 * the since-removed app/v3/legacy-behaviors.js, which was `marqueeTrack.innerHTML +=
 * marqueeTrack.innerHTML`, i.e. React's own DOM mutated behind its back after
 * mount. Guarded from re-running only by the `inited` ref in page.tsx; a second
 * invocation would have quadrupled the content.
 *
 * The duplication is required, not decorative: @keyframes marqueeScroll
 * animates the track to translateX(-50%), which only loops seamlessly if the
 * track holds exactly two copies of the item list. So the items render twice
 * here - once as data, not as a DOM side effect.
 *
 * Because the copies are now server-rendered, the marquee is correct before
 * hydration instead of running the animation over a single copy for the first
 * frames (which showed as the strip scrolling into empty space and snapping).
 *
 * The whole section is aria-hidden, so the duplicate text isn't announced.
 */

type MarqueeItem = { label: string; path: string };

/* `path` is the icon's SVG path data; every icon shares the same 24x24
   stroke-based frame. */
const ITEMS: MarqueeItem[] = [
  { label: '$100M+ Capital Accessed', path: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
  { label: '25+ Years Experience', path: 'CLOCK' },
  { label: '500+ Deals Funded', path: 'M4 20V8l5-3 6 3 5-3v12l-5 3-6-3-5 3Z' },
  { label: '50+ States Served', path: 'GLOBE' },
  { label: 'Bank-Ready Guidance', path: 'M4 12.5l5 5L20 6.5' },
  { label: 'SBA-Preferred Process', path: 'M4 12.5l5 5L20 6.5' }
];

/* Two icons are circle+path composites rather than a single path, so they get
   rendered as special cases instead of being forced into the `path` field. */
function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path === 'CLOCK' ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </>
      ) : path === 'GLOBE' ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18M3 12h18" />
        </>
      ) : (
        <path d={path} />
      )}
    </svg>
  );
}

export default function TrustMarquee() {
  return (
    <section className="marquee-section" aria-hidden="true">
      <div className="marquee-track" id="marqueeTrack">
        {/* Two passes: see the translateX(-50%) note above. */}
        {[0, 1].map((copy) => (
          <Fragment key={copy}>
            {ITEMS.map((item, i) => (
              <Fragment key={i}>
                <div className="marquee-item"><Icon path={item.path} />{item.label}</div>
                <div className="marquee-dot"></div>
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
