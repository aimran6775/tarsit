import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header, Footer } from '@/components/layout';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import { generateSEOMetadata } from '@/lib/seo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = generateSEOMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} bg-neutral-950 text-white antialiased`}>
        <Providers>
          <PerformanceMonitor />
          <div className="flex flex-col min-h-screen page-enter">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
