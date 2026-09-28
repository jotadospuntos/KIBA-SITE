/*
 * The site's public origin. Every canonical, og:url and og:image is written as
 * a path and resolved against this (via `metadataBase` in app/layout.tsx), so
 * moving the site to another domain is this one line.
 *
 * This was go.kibadvisors.com until the main-domain launch. go.kibadvisors.com
 * now 301s here (next.config.js), so old ad, partner and GHL links still land.
 */
export const SITE_URL = 'https://kibadvisors.com';
