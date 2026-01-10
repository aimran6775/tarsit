import { generateSEOMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = generateSEOMetadata({
  title: 'About Us - Our Mission to Empower Local Businesses | Tarsit',
  description: 'Learn about Tarsit\'s mission to connect communities with local businesses. Discover how we help small businesses thrive in the digital world with AI-powered discovery and seamless booking.',
  url: 'https://tarsit.com/about',
  keywords: [
    'about tarsit',
    'local business platform',
    'small business support',
    'community marketplace',
    'business discovery',
    'our mission',
  ],
});

export default function AboutPage() {
  return <AboutPageClient />;
}
