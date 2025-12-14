import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (in dev only)
  console.log('🗑️  Cleaning existing data...');
  await prisma.analytics.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.review.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.service.deleteMany();
  await prisma.business.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ============================================================================
  // SEED CATEGORIES
  // ============================================================================
  console.log('📂 Creating categories...');

  const categories = await Promise.all([
    // Main categories
    prisma.category.create({
      data: {
        name: 'Electronics Repair',
        slug: 'electronics-repair',
        icon: '📱',
        description: 'Phone, tablet, computer repair services',
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Automotive',
        slug: 'automotive',
        icon: '🚗',
        description: 'Car repair, maintenance, detailing',
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Beauty & Wellness',
        slug: 'beauty-wellness',
        icon: '💇',
        description: 'Salons, spas, barbershops',
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Home Services',
        slug: 'home-services',
        icon: '🏠',
        description: 'Plumbing, electrical, cleaning',
        order: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Food & Dining',
        slug: 'food-dining',
        icon: '🍽️',
        description: 'Restaurants, cafes, catering',
        order: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Professional Services',
        slug: 'professional-services',
        icon: '💼',
        description: 'Legal, accounting, consulting',
        order: 6,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Fitness & Health',
        slug: 'fitness-health',
        icon: '💪',
        description: 'Gyms, personal training, yoga',
        order: 7,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pet Services',
        slug: 'pet-services',
        icon: '🐾',
        description: 'Grooming, veterinary, pet sitting',
        order: 8,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Education & Tutoring',
        slug: 'education-tutoring',
        icon: '📚',
        description: 'Tutoring, music lessons, courses',
        order: 9,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Construction & Renovation',
        slug: 'construction-renovation',
        icon: '🔨',
        description: 'Contractors, painters, remodeling',
        order: 10,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories\n`);

  // ============================================================================
  // SEED USERS
  // ============================================================================
  console.log('👥 Creating users...');

  // Password must have: 8+ chars, uppercase, lowercase, number, special char
  // PERMANENT TEST PASSWORD - documented in tarsit-testing/TEST_ACCOUNTS.md
  const testPassword = 'Tarsit1234!';
  const hashedPassword = await bcrypt.hash(testPassword, 10);

  // ============================================================================
  // PERMANENT TEST ACCOUNTS (for automated testing)
  // ============================================================================
  console.log('🔐 Creating permanent test accounts...');

  const permanentTestAccounts = await Promise.all([
    // Admin test account
    prisma.user.create({
      data: {
        email: 'admin@tarsit.com',
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'Tarsit',
        role: 'ADMIN',
        verified: true,
      },
    }),
    // Customer test account
    prisma.user.create({
      data: {
        email: 'testcustomer@tarsit.com',
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'Customer',
        role: 'CUSTOMER',
        verified: true,
      },
    }),
    // Business owner test account
    prisma.user.create({
      data: {
        email: 'testowner@tarsit.com',
        phone: '+14155550001',
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'Owner',
        role: 'BUSINESS_OWNER',
        verified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${permanentTestAccounts.length} permanent test accounts\n`);

  // ============================================================================
  // SAMPLE USERS (additional data for realistic testing)
  // ============================================================================
  console.log('👥 Creating sample users...');

  const users = await Promise.all([
    // Additional business owners
    ...Array.from({ length: 4 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `owner${i + 1}@example.com`,
          phone: `+1555000${100 + i}`,
          passwordHash: hashedPassword,
          firstName: `Business`,
          lastName: `Owner ${i + 1}`,
          role: 'BUSINESS_OWNER',
          verified: true,
        },
      })
    ),
    // Additional customers
    ...Array.from({ length: 3 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `customer${i + 1}@example.com`,
          passwordHash: hashedPassword,
          firstName: `Customer`,
          lastName: `${i + 1}`,
          role: 'CUSTOMER',
          verified: true,
        },
      })
    ),
  ]);

  // Combine all users for later use
  const allUsers = [...permanentTestAccounts, ...users];

  console.log(`✅ Created ${allUsers.length} users total\n`);

  // ============================================================================
  // SEED BUSINESSES
  // ============================================================================
  console.log('🏢 Creating businesses...');

  // Get test owner for the primary test business
  const testOwner = permanentTestAccounts.find((u) => u.email === 'testowner@tarsit.com')!;
  const businessOwners = allUsers.filter((u) => u.role === 'BUSINESS_OWNER');
  const customers = allUsers.filter((u) => u.role === 'CUSTOMER');

  // San Francisco coordinates for realistic locations
  const sfLocations = [
    { lat: 37.7749, lng: -122.4194, area: 'Downtown SF' },
    { lat: 37.7849, lng: -122.4094, area: 'North Beach' },
    { lat: 37.7649, lng: -122.4294, area: 'Mission District' },
    { lat: 37.7949, lng: -122.3994, area: 'Fisherman\'s Wharf' },
    { lat: 37.7549, lng: -122.4494, area: 'Sunset District' },
  ];

  const businessData: Array<{
    name: string;
    category: string;
    description: string;
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    priceRange: 'BUDGET' | 'MODERATE' | 'EXPENSIVE';
    services: Array<{ name: string; price: number; duration: number }>;
  }> = [
      {
        name: 'QuickFix Phone Repair',
        category: categories[0].id,
        description: 'Professional iPhone and Android repair. Screen replacements, battery fixes, and water damage repair. Same-day service available.',
        addressLine1: '123 Market Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        phone: '+14155551000',
        priceRange: 'MODERATE',
        services: [
          { name: 'Screen Replacement', price: 89.99, duration: 45 },
          { name: 'Battery Replacement', price: 59.99, duration: 30 },
          { name: 'Water Damage Repair', price: 149.99, duration: 120 },
        ],
      },
      {
        name: 'Elite Auto Care',
        category: categories[1].id,
        description: 'Full-service auto repair and maintenance. ASE certified mechanics. Oil changes, brake service, engine diagnostics.',
        addressLine1: '456 Valencia Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94110',
        phone: '+14155551001',
        priceRange: 'MODERATE',
        services: [
          { name: 'Oil Change', price: 49.99, duration: 30 },
          { name: 'Brake Service', price: 199.99, duration: 90 },
          { name: 'Engine Diagnostic', price: 89.99, duration: 60 },
        ],
      },
      {
        name: 'Bella Salon & Spa',
        category: categories[2].id,
        description: 'Upscale salon offering haircuts, coloring, and spa treatments. Experienced stylists and relaxing atmosphere.',
        addressLine1: '789 Union Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94133',
        phone: '+14155551002',
        priceRange: 'EXPENSIVE',
        services: [
          { name: 'Women\'s Haircut', price: 85.00, duration: 60 },
          { name: 'Hair Coloring', price: 150.00, duration: 120 },
          { name: 'Spa Manicure', price: 45.00, duration: 45 },
        ],
      },
      {
        name: 'Bay Plumbing Pros',
        category: categories[3].id,
        description: '24/7 emergency plumbing services. Licensed and insured. Drain cleaning, pipe repair, water heater installation.',
        addressLine1: '321 Mission Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        phone: '+14155551003',
        priceRange: 'MODERATE',
        services: [
          { name: 'Drain Cleaning', price: 129.99, duration: 60 },
          { name: 'Leak Repair', price: 199.99, duration: 90 },
          { name: 'Water Heater Install', price: 899.99, duration: 180 },
        ],
      },
      {
        name: 'Golden Gate Cafe',
        category: categories[4].id,
        description: 'Cozy neighborhood cafe serving fresh coffee, pastries, and lunch. Free WiFi and outdoor seating.',
        addressLine1: '567 Haight Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94117',
        phone: '+14155551004',
        priceRange: 'BUDGET',
        services: [
          { name: 'Espresso Drinks', price: 4.50, duration: 5 },
          { name: 'Fresh Pastries', price: 3.50, duration: 0 },
          { name: 'Lunch Special', price: 12.99, duration: 15 },
        ],
      },
    ];

  const businesses = await Promise.all([
    // PERMANENT TEST BUSINESS (for automated testing)
    prisma.business.create({
      data: {
        name: 'Test Business Tarsit',
        slug: 'test-business-tarsit',
        description: 'Official test business for automated testing. This business belongs to testowner@tarsit.com.',
        categoryId: categories[0].id, // Electronics Repair
        ownerId: testOwner.id,
        addressLine1: '1 Test Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
        latitude: 37.7749,
        longitude: -122.4194,
        phone: '+14155550001',
        priceRange: 'MODERATE',
        verified: true,
        rating: 4.5,
        reviewCount: 0,
        appointmentsEnabled: true,
        appointmentDuration: 30,
        advanceBookingDays: 30,
        hours: {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '10:00', close: '16:00' },
          sunday: { closed: true },
        },
        services: {
          create: [
            { name: 'Test Service 1', price: 50.00, duration: 30, order: 0, bookable: true },
            { name: 'Test Service 2', price: 100.00, duration: 60, order: 1, bookable: true },
          ],
        },
      },
    }),
    // Sample businesses
    ...businessData.map((biz, index) =>
      prisma.business.create({
        data: {
          name: biz.name,
          slug: biz.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: biz.description,
          categoryId: biz.category,
          ownerId: businessOwners[index % businessOwners.length].id,
          addressLine1: biz.addressLine1,
          city: biz.city,
          state: biz.state,
          zipCode: biz.zipCode,
          country: 'USA',
          latitude: sfLocations[index % sfLocations.length].lat,
          longitude: sfLocations[index % sfLocations.length].lng,
          phone: biz.phone,
          priceRange: biz.priceRange,
          verified: index < 3, // First 3 are verified
          rating: 4 + Math.random(), // 4.0-5.0
          reviewCount: Math.floor(Math.random() * 50) + 10,
          hours: {
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '18:00' },
            friday: { open: '09:00', close: '18:00' },
            saturday: { open: '10:00', close: '16:00' },
            sunday: { closed: true },
          },
          services: {
            create: biz.services.map((service, idx) => ({
              name: service.name,
              price: service.price,
              duration: service.duration,
              order: idx,
            })),
          },
        },
      })
    ),
  ]);

  console.log(`✅ Created ${businesses.length} businesses\n`);

  // ============================================================================
  // SEED REVIEWS
  // ============================================================================
  console.log('⭐ Creating reviews...');

  const reviewTemplates = [
    {
      rating: 5,
      title: 'Excellent service!',
      comment: 'Very professional and quick. Highly recommend!',
    },
    {
      rating: 4,
      title: 'Great experience',
      comment: 'Good quality work, friendly staff. Will come back.',
    },
    {
      rating: 5,
      title: 'Best in the area',
      comment: 'Amazing service and fair prices. Can\'t ask for more!',
    },
    {
      rating: 4,
      title: 'Satisfied customer',
      comment: 'Did a good job, took a bit longer than expected but worth it.',
    },
  ];

  const reviews = [];
  for (const business of businesses) {
    for (let i = 0; i < 3; i++) {
      const template = reviewTemplates[i % reviewTemplates.length];
      const customer = customers[i % customers.length];

      reviews.push(
        await prisma.review.create({
          data: {
            businessId: business.id,
            userId: customer.id,
            rating: template.rating,
            title: template.title,
            comment: template.comment,
          },
        })
      );
    }
  }

  console.log(`✅ Created ${reviews.length} reviews\n`);

  // ============================================================================
  // SEED FAVORITES
  // ============================================================================
  console.log('❤️ Creating favorites...');

  const favorites = [];
  for (const customer of customers) {
    // Each customer favorites 2 random businesses
    const randomBusinesses = businesses
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    for (const business of randomBusinesses) {
      favorites.push(
        await prisma.favorite.create({
          data: {
            userId: customer.id,
            businessId: business.id,
          },
        })
      );
    }
  }

  console.log(`✅ Created ${favorites.length} favorites\n`);

  console.log('✨ Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${users.length} users`);
  console.log(`   - ${businesses.length} businesses`);
  console.log(`   - ${reviews.length} reviews`);
  console.log(`   - ${favorites.length} favorites`);
  console.log('\n🚀 Your database is ready to use!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
