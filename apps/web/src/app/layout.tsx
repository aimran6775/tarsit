import { Footer, Header } from '@/components/layout';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { MessagesWidget } from '@/components/messages';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { generateSEOMetadata } from '@/lib/seo';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  ...generateSEOMetadata(),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tarsit',
  },
  formatDetection: {
    telephone: true,
  },
};

// Mobile viewport settings for better mobile experience
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA / iOS meta tags */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} antialiased transition-colors duration-300`}>
        <Providers>
          <ServiceWorkerRegistration />
          <PerformanceMonitor />
          <div className="flex flex-col min-h-screen page-enter">
            <Header />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
            <MessagesWidget />
          </div>
        </Providers>
      </body>
    </html>
  );
}
