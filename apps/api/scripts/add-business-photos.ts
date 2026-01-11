import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const businessPhotos: Record<string, { coverImage: string; photos: Array<{ url: string; caption: string }> }> = {
  'test-business-tarsit': {
    coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=600&fit=crop',
    photos: [
      { url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop', caption: 'Our workspace' },
      { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop', caption: 'Tech equipment' },
    ],
  },
  'quickfix-phone-repair': {
    coverImage: 'https://images.unsplash.com/photo-1621330396173-e41b1cafd17f?w=1200&h=600&fit=crop',
    photos: [
      { url: 'https://images.unsplash.com/photo-1621330396173-e41b1cafd17f?w=800&h=600&fit=crop', caption: 'Phone repair station' },
      { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop', caption: 'Professional tools' },
      { url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=600&fit=crop', caption: 'Screen repair' },
    ],
  },
  'elite-auto-care': {
    coverImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&h=600&fit=crop',
    photos: [
      { url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop', caption: 'Auto service bay' },
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop', caption: 'Engine work' },
      { url: 'https://images.unsplash.com/photo-1632823471565-1ecdf5c6da20?w=800&h=600&fit=crop', caption: 'Our garage' },
    ],
  },
  'bella-salon-spa': {
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop',
    photos: [
      { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop', caption: 'Salon interior' },
      { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop', caption: 'Hair styling' },
      { url: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&h=600&fit=crop', caption: 'Spa treatments' },
    ],
  },
  'bay-plumbing-pros': {
    coverImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1200&h=600&fit=crop',
    photos: [
      { url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=600&fit=crop', caption: 'Professional plumber' },
      { url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop', caption: 'Plumbing work' },
      { url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop', caption: 'Service van' },
    ],
  },
  'golden-gate-cafe': {
    coverImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=600&fit=crop',
    photos: [
      { url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop', caption: 'Cafe interior' },
      { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop', caption: 'Fresh coffee' },
      { url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop', caption: 'Latte art' },
    ],
  },
};

async function main() {
  console.log('📸 Adding photos to businesses...\n');

  for (const [slug, data] of Object.entries(businessPhotos)) {
    const business = await prisma.business.findUnique({
      where: { slug },
      include: { photos: true },
    });

    if (!business) {
      console.log(`⚠️ Business ${slug} not found, skipping`);
      continue;
    }

    // Update cover image
    await prisma.business.update({
      where: { id: business.id },
      data: { coverImage: data.coverImage },
    });
    console.log(`✅ Updated cover image for ${business.name}`);

    // Delete existing photos and add new ones
    await prisma.photo.deleteMany({
      where: { businessId: business.id },
    });

    await prisma.photo.createMany({
      data: data.photos.map((photo, idx) => ({
        businessId: business.id,
        url: photo.url,
        caption: photo.caption,
        order: idx,
        featured: idx === 0,
      })),
    });
    console.log(`📸 Added ${data.photos.length} photos to ${business.name}`);
  }

  console.log('\n✨ Photo update complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
