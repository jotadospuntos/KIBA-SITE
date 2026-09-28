/*
 * The site's public origin. Every canonical, og:url and og:image is written as
 * a path and resolved against this (via `metadataBase` in app/layout.tsx), so
 * moving the site to another domain is this one line.
 *
 * Still go.kibadvisors.com until the main-domain launch; the launch flips it
 * to https://kibadvisors.com.
 */
export const SITE_URL = 'https://go.kibadvisors.com';
