import Reveal from '@/components/Reveal/Reveal';

/*
 * Shared site footer (brand column + social + link columns).
 *
 * Extracted verbatim out of app/v3/page.tsx so the next migrated route reuses
 * this instead of copy-pasting the markup - the same drift trap the legacy
 * public/legacy/*.html pages fell into (see CLAUDE.md "Golden rules").
 *
 * The four link columns animate in on scroll via <Reveal>, which renders the
 * column div itself (not a wrapper) so v3.css's
 * `.footer-grid .reveal:nth-child(n)` stagger delays still line up.
 *
 * Rendered output is byte-for-byte the same as the inline version it replaced,
 * so /v3 still pixel-diffs clean against /v2.
 */

export default function SiteFooter() {
  return (
    <footer>
    <div className="footer-top-line" aria-hidden="true"></div>
    <div className="wrap">
      <div className="footer-grid">
        <Reveal className="footer-col footer-brand reveal">
          <a className="logo-mark" href="https://kibadvisors.com" aria-label="Kingdom Impact Business Advisors home"><svg viewBox="0 0 1500 736.33" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ height: '34px', width: 'auto' }}>
                <g fill="#ffffff">
                  <polygon points="515.23 206.04 439.07 206.04 327.41 356.49 327.41 206.04 262.93 206.04 262.93 535.9 270.41 535.9 370.86 400.41 456.36 531.23 533.92 531.23 410.57 346.68 515.23 206.04" />
                  <rect x="555.4" y="265.56" width="64.47" height="64.59" />
                  <rect x="555.4" y="389.95" width="64.47" height="141.27" />
                  <path d="M912.12,389.9c-9.5-13.56-22.65-23.6-39.48-30.14,8.72-8.72,14.88-18.76,18.46-30.12,3.57-11.38,5.37-22.98,5.37-34.81s-2.1-23.06-6.32-33.64c-4.2-10.6-10.51-20.01-18.91-28.26-8.41-8.26-19-14.8-31.78-19.64-12.77-4.82-27.87-7.23-45.32-7.23h-127.54v124.1h64.47v-64.3h59.34c14.02,0,24.77,3.66,32.24,10.97,7.48,7.33,11.21,15.97,11.21,25.94v.33c-.09,15.02-12.53,27.06-27.56,27.06h-75.24v59.8h67c15.94,0,32.11-.3,45.69,9.71,11.14,8.22,19.08,22.35,19.08,36.26,0,10.9-3.74,19.54-11.21,25.92-7.48,6.4-18.39,9.58-32.71,9.58h-87.84v-81.47h-64.47v141.27h149.04c19.62,0,36.35-2.4,50.23-7.23,13.85-4.83,25.31-11.36,34.35-19.62,9.02-8.26,15.64-17.76,19.84-28.51,4.22-10.75,6.32-22.2,6.32-34.35,0-20.86-4.76-38.08-14.26-51.62Z" />
                </g>
                <path fill="#2563eb" d="M1088.49,200.43h-7.01l-148.58,330.79h304.16l-148.58-330.79ZM1083.36,470.03l-73.36,47.66,75.22-171,75.24,171-73.82-47.66h-3.27Z" />
              </svg></a>
          <div className="footer-social">
            <a href="https://www.linkedin.com/company/kingdomimpactbusinessadvisors/" target="_blank" rel="noopener noreferrer" aria-label="KIBA on LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" /></svg></a>
            <a href="https://www.facebook.com/kibadvisors" target="_blank" rel="noopener noreferrer" aria-label="KIBA on Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.87v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" /></svg></a>
          </div>
          <p className="footer-copy">&copy; 2026 Kingdom Impact Business Advisors. All rights reserved.</p>
        </Reveal>

        <Reveal className="footer-col reveal">
          <h3>Solutions</h3>
          <ul>
            <li><a href="/business-acquisitions">Business Acquisitions</a></li>
            <li><a href="/book-rr">Book a Consultation</a></li>
            <li><a href="/referral-partners">Referral Partners</a></li>
          </ul>
        </Reveal>

        <Reveal className="footer-col reveal">
          <h3>Company</h3>
          <ul>
            <li><a href="https://kibadvisors.com">About</a></li>
            <li><a href="#talk">Contact</a></li>
            <li><a href="https://kibadvisors.com/privacy-policy/">Privacy Policy</a></li>
            <li><a href="https://kibadvisors.com/terms-and-conditions/">Terms &amp; Conditions</a></li>
          </ul>
        </Reveal>

        <Reveal className="footer-col reveal">
          <h3>Get in Touch</h3>
          <ul>
            <li><a href="tel:2512108445">251-210-8445</a></li>
            <li><a href="mailto:info@kibadvisors.com">info@kibadvisors.com</a></li>
          </ul>
        </Reveal>
      </div>
    </div>
    </footer>
  );
}
