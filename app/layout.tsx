import type { Metadata } from 'next';
import './globals.css';

/* Meta Pixel ID, as used by every legacy page before the migration. */
const META_PIXEL_ID = '1653996785650157';

export const metadata: Metadata = {
  title: 'Kingdom Impact Business Advisors',
  description: 'Kingdom Impact Business Advisors — funding and advisory for growing businesses.',
};

// Same font stack as the legacy pages (see public/legacy/*.html <head>):
// Instrument Sans/Serif + IBM Plex Mono/Sans from Google Fonts, General Sans
// from Fontshare (not on Google Fonts, so it can't go through next/font/google).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@500&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@500,600,700&display=swap"
        />
        {/* Meta Pixel. Every legacy HTML page carried this in its <head>; when
            those pages became React routes it was lost, so it lives here once
            and therefore covers every page.

            A PLAIN INLINE <script>, not next/script: with `strategy` the tag
            never reached the DOM here and only the <noscript> fallback fired,
            which is exactly backwards. This is byte-identical to what the
            legacy pages ran, and it is verifiable — window.fbq is defined.

            A single PageView is correct because every internal link on this
            site is a real <a href>, so each navigation is a full document load.
            If anything is ever moved to client-side routing, this needs a
            route-change listener or those views stop being counted. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`
          }}
        />
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1" />`
          }}
        />
      </head>
      <body className="font-body">
        {children}
      </body>
    </html>
  );
}
