import type { Metadata, Viewport } from 'next';
import { Poppins, Lato, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

export const metadata: Metadata = {
  title: {
    default: 'KCA ICT Helpdesk',
    template: '%s | KCA ICT Helpdesk',
  },
  description: 'Student IT Helpdesk System for KCA University ICT Directorate',
  keywords: ['KCA University', 'ICT Helpdesk', 'IT Support', 'Ticket System'],
  authors: [{ name: 'KCA University ICT Directorate' }],
  creator: 'KCA University ICT Directorate',
  publisher: 'KCA University',
  robots: 'noindex, nofollow',
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    siteName: 'KCA ICT Helpdesk',
    title: 'KCA ICT Helpdesk',
    description: 'Student IT Helpdesk System for KCA University ICT Directorate',
  },
};

export const viewport: Viewport = {
  themeColor: '#192C57',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-lato',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${lato.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-surface text-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}