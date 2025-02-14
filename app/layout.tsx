import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { DM_Mono, Hanken_Grotesk } from 'next/font/google';
import './globals.css';

const hankenSans = Hanken_Grotesk({
  variable: '--font-hanken-sans',
  subsets: ['latin'],
});

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'minotor',
  description: 'A lightweight client-side public transit routing library.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${hankenSans.variable} ${dmMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
