import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import OpenAI from 'openai';

const prisma = new PrismaClient();
console.log('🔌 Connecting to database...');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Sample businesses to create
const sampleBusinesses = [
  {
    name: "Sofia's Boutique",
    slug: 'sofias-boutique',
    description: 'A charming boutique offering curated fashion pieces, handmade accessories, and unique home décor items. We specialize in supporting local artisans and sustainable fashion.',
    categoryName: 'Home Services',
    addressLine1: '123 Main Street',
    city: 'Brooklyn',
    state: 'NY',
    zipCode: '11201',
    phone: '(718) 555-0101',
    email: 'hello@sofiasboutique.com',
    website: 'https://sofiasboutique.com',
    priceRange: 'MODERATE',
    latitude: 40.6892,
    longitude: -73.9857,
    services: [
      { name: 'Personal Styling', description: 'One-on-one styling consultation', price: 75, duration: 60 },
      { name: 'Gift Wrapping', description: 'Beautiful custom gift wrapping service', price: 5, duration: 10 },
      { name: 'Alterations', description: 'Basic clothing alterations', price: 25, duration: 30 },
    ],
    imagePrompt: 'A cozy boutique storefront with elegant fashion display in window, warm lighting, vintage-modern aesthetic, professional photography, daytime',
  },
  {
    name: "Classic Cuts Barbershop",
    slug: 'classic-cuts-barbershop',
    description: 'Traditional barbershop with a modern twist. Expert barbers providing precision haircuts, hot towel shaves, and beard grooming in a relaxed atmosphere.',
    categoryName: 'Beauty & Personal Care',
    addressLine1: '456 Oak Avenue',
    city: 'Manhattan',
    state: 'NY',
    zipCode: '10001',
    phone: '(212) 555-0202',
    email: 'info@classiccuts.com',
    website: 'https://classiccuts.com',
    priceRange: 'MODERATE',
    latitude: 40.7484,
    longitude: -73.9857,
    services: [
      { name: 'Classic Haircut', description: 'Traditional scissor or clipper cut', price: 35, duration: 30 },
      { name: 'Hot Towel Shave', description: 'Luxurious straight razor shave with hot towels', price: 40, duration: 45 },
      { name: 'Beard Trim', description: 'Shape and maintain your beard', price: 20, duration: 20 },
      { name: 'Kids Haircut', description: 'Haircut for children under 12', price: 25, duration: 20 },
    ],
    imagePrompt: 'A classic barbershop interior with vintage barber chairs, mirrors, warm wood tones, professional photography, inviting atmosphere',
  },
  {
    name: "Color Splash Paint Shop",
    slug: 'color-splash-paint-shop',
    description: 'Your neighborhood paint experts! We carry premium paints, stains, and supplies. Our color consultants help you find the perfect shade for any project.',
    categoryName: 'Home Services',
    addressLine1: '789 Industrial Blvd',
    city: 'Queens',
    state: 'NY',
    zipCode: '11101',
    phone: '(718) 555-0303',
    email: 'paint@colorsplash.com',
    website: 'https://colorsplashpaint.com',
    priceRange: 'BUDGET',
    latitude: 40.7433,
    longitude: -73.9425,
    services: [
      { name: 'Color Consultation', description: 'Expert help choosing the right colors', price: 0, duration: 30 },
      { name: 'Paint Mixing', description: 'Custom color matching and mixing', price: 10, duration: 15 },
      { name: 'Tool Rental', description: 'Rent sprayers, ladders, and equipment', price: 25, duration: 0 },
    ],
    imagePrompt: 'A paint store interior with colorful paint cans on shelves, color swatches on wall, bright and organized, professional retail photography',
  },
  {
    name: "Sunrise Café & Bakery",
    slug: 'sunrise-cafe-bakery',
    description: 'Artisan bakery and cozy café serving fresh-baked pastries, specialty coffee, and light breakfast fare. All items made fresh daily with locally sourced ingredients.',
    categoryName: 'Food & Dining',
    addressLine1: '234 Sunrise Lane',
    city: 'Brooklyn',
    state: 'NY',
    zipCode: '11215',
    phone: '(718) 555-0404',
    email: 'hello@sunrisecafe.com',
    website: 'https://sunrisecafe.com',
    priceRange: 'BUDGET',
    latitude: 40.6626,
    longitude: -73.9872,
    services: [
      { name: 'Catering', description: 'Pastry platters for events', price: 50, duration: 0 },
      { name: 'Custom Cakes', description: 'Made-to-order celebration cakes', price: 65, duration: 0 },
      { name: 'Coffee Subscription', description: 'Weekly fresh roasted beans delivery', price: 30, duration: 0 },
    ],
    imagePrompt: 'A charming café interior with pastry display case, espresso machine, warm lighting, wooden tables, cozy atmosphere, professional food photography',
  },
  {
    name: "Green Thumb Garden Center",
    slug: 'green-thumb-garden-center',
    description: 'Full-service garden center with plants, flowers, gardening supplies, and expert advice. We help both beginners and experienced gardeners create beautiful outdoor spaces.',
    categoryName: 'Home Services',
    addressLine1: '567 Garden Way',
    city: 'Staten Island',
    state: 'NY',
    zipCode: '10301',
    phone: '(718) 555-0505',
    email: 'grow@greenthumb.com',
    website: 'https://greenthumbgarden.com',
    priceRange: 'MODERATE',
    latitude: 40.6424,
    longitude: -74.0764,
    services: [
      { name: 'Garden Design', description: 'Professional landscape design consultation', price: 100, duration: 90 },
      { name: 'Plant Care Workshop', description: 'Learn essential plant care skills', price: 35, duration: 120 },
      { name: 'Delivery & Planting', description: 'We deliver and plant for you', price: 50, duration: 60 },
    ],
    imagePrompt: 'A garden center with lush green plants, flowers, outdoor nursery area, greenhouse visible, natural lighting, professional photography',
  },
];

async function generateImage(prompt: string, businessSlug: string): Promise<string> {
  try {
    console.log(`  🎨 Generating image for ${businessSlug}...`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned');
    }

    // For now, we'll store the OpenAI URL directly
    // In production, you'd upload to Supabase Storage
    console.log(`  ✅ Image generated for ${businessSlug}`);
    return imageUrl;
  } catch (error) {
    console.error(`  ❌ Failed to generate image for ${businessSlug}:`, error);
    // Return a placeholder if image generation fails
    return `https://placehold.co/1024x1024/4f46e5/white?text=${encodeURIComponent(businessSlug)}`;
  }
}

async function main() {
  console.log('🏪 Starting sample business generation...\n');

  // Create or find a demo user to own the businesses
  let demoUser = await prisma.user.findUnique({
    where: { email: 'demo@tarsit.com' },
  });

  if (!demoUser) {
    console.log('👤 Creating demo business owner...');
    const hashedPassword = await bcrypt.hash('demo123456', 10);
    demoUser = await prisma.user.create({
      data: {
        email: 'demo@tarsit.com',
        firstName: 'Demo',
        lastName: 'Owner',
        passwordHash: hashedPassword,
        role: 'BUSINESS_OWNER',
        verified: true,
        provider: 'local',
      },
    });
    console.log('  ✅ Demo user created\n');
  } else {
    console.log('👤 Using existing demo user\n');
  }

  // Get existing categories
  const categories = await prisma.category.findMany();
  console.log(`📂 Found ${categories.length} categories\n`);

  // Create each business
  for (const businessData of sampleBusinesses) {
    console.log(`\n🏢 Creating "${businessData.name}"...`);

    // Check if business already exists
    const existing = await prisma.business.findUnique({
      where: { slug: businessData.slug },
    });

    if (existing) {
      console.log(`  ⏭️  Business "${businessData.name}" already exists, skipping...`);
      continue;
    }

    // Find or create category
    let category = categories.find(c => c.name === businessData.categoryName);
    if (!category) {
      console.log(`  📁 Creating category "${businessData.categoryName}"...`);
      category = await prisma.category.create({
        data: {
          name: businessData.categoryName,
          slug: businessData.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          icon: '🏪',
          description: `${businessData.categoryName} services`,
        },
      });
      categories.push(category);
    }

    // Generate image
    const imageUrl = await generateImage(businessData.imagePrompt, businessData.slug);

    // Create business
    const business = await prisma.business.create({
      data: {
        ownerId: demoUser.id,
        name: businessData.name,
        slug: businessData.slug,
        description: businessData.description,
        categoryId: category.id,
        addressLine1: businessData.addressLine1,
        city: businessData.city,
        state: businessData.state,
        zipCode: businessData.zipCode,
        country: 'USA',
        latitude: businessData.latitude,
        longitude: businessData.longitude,
        phone: businessData.phone,
        email: businessData.email,
        website: businessData.website,
        priceRange: businessData.priceRange as any,
        rating: Math.round((4 + Math.random()) * 10) / 10, // 4.0 - 5.0
        reviewCount: Math.floor(Math.random() * 50) + 10,
        verified: true,
        active: true,
        featured: Math.random() > 0.5,
        hours: {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '10:00', close: '16:00' },
          sunday: { open: null, close: null },
        },
      },
    });

    console.log(`  ✅ Business created: ${business.id}`);

    // Create photo
    await prisma.photo.create({
      data: {
        businessId: business.id,
        url: imageUrl,
        caption: `${businessData.name} storefront`,
        featured: true,
        order: 0,
      },
    });
    console.log(`  📸 Photo added`);

    // Create services
    for (const service of businessData.services) {
      await prisma.service.create({
        data: {
          businessId: business.id,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          active: true,
        },
      });
    }
    console.log(`  🛠️  ${businessData.services.length} services added`);

    // Create a sample review
    await prisma.review.create({
      data: {
        businessId: business.id,
        userId: demoUser.id,
        rating: 5,
        title: 'Excellent service!',
        comment: `Amazing experience at ${businessData.name}. Highly recommended for anyone looking for quality service and friendly staff.`,
      },
    });
    console.log(`  ⭐ Sample review added`);
  }

  console.log('\n\n✅ Sample business generation complete!');
  console.log('📊 Summary:');
  
  const businessCount = await prisma.business.count();
  const photoCount = await prisma.photo.count();
  const serviceCount = await prisma.service.count();
  
  console.log(`   - Businesses: ${businessCount}`);
  console.log(`   - Photos: ${photoCount}`);
  console.log(`   - Services: ${serviceCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
