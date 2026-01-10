import { Metadata } from 'next';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  siteName?: string;
  locale?: string;
  keywords?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

/**
 * Generate SEO metadata for pages
 */
export function generateSEOMetadata({
  title = 'Tarsit - AI-Powered Marketplace for Local Services',
  description = 'Discover local service businesses with AI-powered search, chat instantly, and book appointments. Helping small businesses thrive in the digital world.',
  image = '/og-image.jpg',
  url = 'https://tarsit.com',
  type = 'website',
  siteName = 'Tarsit',
  locale = 'en_US',
  keywords = [
    'local business',
    'small business',
    'service directory',
    'appointments',
    'business discovery',
    'AI marketplace',
    'service marketplace',
  ],
  noindex = false,
  nofollow = false,
}: SEOProps = {}): Metadata {
  const metadata: Metadata = {
    title,
    description,
    keywords,
    authors: [{ name: 'Tarsit' }],
    creator: 'Tarsit',
    publisher: 'Tarsit',
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      locale,
      url,
      title,
      description,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@tarsit',
      site: '@tarsit',
    },
    alternates: {
      canonical: url,
    },
    verification: {
      // Add verification codes when available
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
    },
  };

  return metadata;
}

/**
 * Generate structured data (JSON-LD) for businesses
 */
export function generateBusinessStructuredData(business: {
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.zipCode,
      addressCountry: business.address.country,
    },
    telephone: business.phone,
    ...(business.website && { url: business.website }),
    ...(business.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: business.rating,
        reviewCount: business.reviewCount || 0,
      },
    }),
    ...(business.image && { image: business.image }),
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
