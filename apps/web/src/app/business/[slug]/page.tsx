import { generateSEOMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import BusinessDetailClient from './BusinessDetailClient';

type PageProps = {
  params: { slug: string };
};

async function fetchFromSameOrigin(path: string): Promise<Response> {
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3001';
  const forwardedProto = h.get('x-forwarded-proto') ?? 'http';
  const isLocalHost =
    host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('::1');
  const proto = isLocalHost ? 'http' : forwardedProto;
  const baseUrl = `${proto}://${host}`;
  return fetch(`${baseUrl}${path}`, { cache: 'no-store' });
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const res = await fetchFromSameOrigin(`/api/businesses/slug/${encodeURIComponent(params.slug)}`);
    if (res.ok) {
      const business = await res.json();
      return generateSEOMetadata({
        title: `${business.name} - ${business.category?.name || 'Business'} | Tarsit`,
        description: business.description || `Book appointments and contact ${business.name} in ${business.city}, ${business.state}. Read reviews and get directions.`,
        url: `https://tarsit.com/business/${params.slug}`,
        type: 'profile',
        image: business.coverImage || business.logoImage || '/og-image.jpg',
        keywords: [
          business.name,
          business.category?.name || '',
          business.city,
          business.state,
          'local business',
          'book appointment',
          'reviews',
        ].filter(Boolean),
      });
    }
  } catch {
    // Fall back to default metadata
  }
  
  return generateSEOMetadata({
    title: 'Business Details | Tarsit',
    description: 'View business details, read reviews, and book appointments on Tarsit.',
  });
}

export default async function BusinessDetailPage({ params }: PageProps) {
  const slug = params.slug;

  let initialBusiness = null;
  try {
    const res = await fetchFromSameOrigin(`/api/businesses/slug/${encodeURIComponent(slug)}`);
    if (res.ok) {
      initialBusiness = await res.json();
    }
  } catch {
    // If the server-side fetch fails, the client component will fall back to client fetching.
  }

  return (
    <BusinessDetailClient slug={slug} initialBusiness={initialBusiness} initialBusinessHours={[]} />
  );
}
