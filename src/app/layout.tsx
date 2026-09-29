import type { Metadata, Viewport } from 'next';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Lato:wght@400;700;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-surface text-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}