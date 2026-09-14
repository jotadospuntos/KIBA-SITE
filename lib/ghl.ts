/*
 * GoHighLevel embed IDs, in one place so a calendar can't be silently swapped.
 *
 * These are NOT interchangeable — each is a different calendar in GHL and
 * routes to different people:
 *
 *  - ROUND_ROBIN is the shared advisor calendar. /book-rr and /thank-you both
 *    use it, as their legacy pages did.
 *  - The homepage's #talk band and /contact-us use Michael's personal calendar
 *    (see app/HomePage.tsx), which is what the legacy homepage used. Worth
 *    confirming that's intended for a generic Contact page rather than the
 *    round robin — flagged, not changed.
 *  - Each advisor page uses that advisor's own calendar; see
 *    app/advisors/advisors-data.ts.
 *
 * Embeds need this resize script or they size wrongly, and they do not render
 * in sandboxes — verify on a deploy.
 */

export const GHL_EMBED_SRC = 'https://link.msgsndr.com/js/form_embed.js';

export const ROUND_ROBIN_CALENDAR =
  'https://api.leadconnectorhq.com/widget/booking/qW1qoVt7AzggAsq61CrM';

/* Appends the GHL resize script once. Safe to call from several components on
   one page and under StrictMode's double-invoke. */
export function loadGhlEmbedScript() {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`script[data-src="${GHL_EMBED_SRC}"]`)) return;
  const el = document.createElement('script');
  el.src = GHL_EMBED_SRC;
  el.async = true;
  el.dataset.src = GHL_EMBED_SRC;
  document.body.appendChild(el);
}
