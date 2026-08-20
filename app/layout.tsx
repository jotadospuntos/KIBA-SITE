import type { Metadata } from 'next';
import './globals.css';

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
      </head>
      <body className="font-body">{children}</body>
    </html>
  );
}
