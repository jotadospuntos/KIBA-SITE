import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kingdom Impact Business Advisors',
  description: 'Kingdom Impact Business Advisors — funding and advisory for growing businesses.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">{children}</body>
    </html>
  );
}
