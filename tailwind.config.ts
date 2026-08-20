import type { Config } from 'tailwindcss';

// Design tokens ported from the legacy site's `:root` CSS custom properties
// (see public/legacy/referral-partners.html) so new React pages stay visually
// consistent with anything still served from public/legacy/ during the migration.
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'navy-deep': '#020062',
        'navy-soft': '#0025ae',
        blue: '#2563eb',
        'blue-soft': '#6d94f5',
        ivory: '#eef2f8',
        paper: '#f7f7fb',
        cream: '#f8f4ee',
        ink: '#0d0b2e',
        slate: '#5b5f7a',
        'slate-light': '#9497b3',
        line: '#e3e3ee',
      },
      fontFamily: {
        sans: ['Instrument Sans', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        heading: ['General Sans', 'Instrument Sans', 'sans-serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '16px',
        sm: '12px',
      },
      boxShadow: {
        soft: '0 40px 70px -40px rgba(2,0,98,0.22), 0 10px 26px -16px rgba(2,0,98,0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
