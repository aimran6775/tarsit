import { PriceRange, PrismaClient, UserRole } from '@prisma/client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Load environment variables from apps/api/.env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type DemoUser = {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
};

type DemoBusiness = {
  ownerEmail: string;
  name: string;
  categorySlug: string;
  description: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  website?: string;
  priceRange: PriceRange;
};

async function clearDatabase(): Promise<void> {
  // Delete in dependency order (children -> parents)
  await prisma.tarsMessage.deleteMany();
  await prisma.tarsConversation.deleteMany();
  await prisma.tarsMemory.deleteMany();
  await prisma.tarsActionQueue.deleteMany();
  await prisma.tarsSettings.deleteMany();
  await prisma.tarsUsage.deleteMany();

  await prisma.adminAuditLog.deleteMany();
  await prisma.emailLog.deleteMany();

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
  await prisma.businessHours.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.business.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}

function getSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl = requireEnv('SUPABASE_URL');
  const supabaseServiceKey = requireEnv('SUPABASE_SERVICE_KEY');

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function findSupabaseUserIdByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<string | null> {
  const perPage = 200;

  for (let page = 1; page < 100; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found?.id) return found.id;

    if (data.users.length < perPage) return null;
  }

  return null;
}

async function createSupabaseAndLocalUser(params: {
  supabase: SupabaseClient;
  demoUser: DemoUser;
  password: string;
  passwordHash: string;
}): Promise<{ prismaUserId: string; supabaseUserId: string }> {
  const { supabase, demoUser, password, passwordHash } = params;

  const forceRecreate = process.env.DEMO_FORCE_RECREATE_USERS === 'true';

  if (forceRecreate) {
    const existingId = await findSupabaseUserIdByEmail(supabase, demoUser.email);
    if (existingId) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existingId);
      if (deleteError) throw deleteError;
    }
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: demoUser.email,
    password,
    email_confirm: true,
    phone: demoUser.phone,
    user_metadata: {
      firstName: demoUser.firstName,
      lastName: demoUser.lastName,
      role: demoUser.role,
    },
  });

  if (error || !data.user?.id) {
    throw error ?? new Error('Supabase user creation failed');
  }

  const prismaUser = await prisma.user.create({
    data: {
      email: demoUser.email,
      phone: demoUser.phone,
      passwordHash,
      firstName: demoUser.firstName,
      lastName: demoUser.lastName,
      role: demoUser.role,
      verified: true,
      provider: 'supabase',
      providerId: data.user.id,
      active: true,
    },
    select: { id: true },
  });

  return { prismaUserId: prismaUser.id, supabaseUserId: data.user.id };
}

async function main(): Promise<void> {
  if (process.env.ALLOW_DESTRUCTIVE_SEED !== 'true') {
    throw new Error('Refusing to run: set ALLOW_DESTRUCTIVE_SEED=true to wipe+seed the database.');
  }

  const demoPassword = process.env.DEMO_PASSWORD ?? 'Tars1234!';

  console.log('🌱 Demo seed starting...');
  console.log('🧹 Clearing database tables...');
  await clearDatabase();
  console.log('✅ Database cleared');

  console.log('📂 Seeding categories...');
  const categorySeeds = [
    { name: 'Electronics Repair', slug: 'electronics-repair', icon: '📱', order: 1 },
    { name: 'Automotive', slug: 'automotive', icon: '🚗', order: 2 },
    { name: 'Beauty & Wellness', slug: 'beauty-wellness', icon: '💇', order: 3 },
    { name: 'Home Services', slug: 'home-services', icon: '🏠', order: 4 },
    { name: 'Food & Dining', slug: 'food-dining', icon: '🍽️', order: 5 },
    { name: 'Fitness & Health', slug: 'fitness-health', icon: '💪', order: 6 },
    { name: 'Pet Services', slug: 'pet-services', icon: '🐾', order: 7 },
    { name: 'Education & Tutoring', slug: 'education-tutoring', icon: '📚', order: 8 },
  ] as const;

  const categories = await Promise.all(
    categorySeeds.map((c) =>
      prisma.category.create({
        data: {
          name: c.name,
          slug: c.slug,
          icon: c.icon,
          description: `Demo category: ${c.name}`,
          order: c.order,
          active: true,
        },
      })
    )
  );

  const categoryBySlug = new Map(categories.map((c) => [c.slug, c] as const));
  console.log(`✅ Created ${categories.length} categories`);

  console.log('👤 Creating Supabase + local users...');
  const supabase = getSupabaseAdminClient();
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const demoUsers: DemoUser[] = [
    { email: 'admin@tarsit.com', firstName: 'Admin', lastName: 'Tarsit', role: UserRole.ADMIN },
    {
      email: 'customer1@tarsit.com',
      firstName: 'Test',
      lastName: 'Customer One',
      role: UserRole.CUSTOMER,
    },
    {
      email: 'customer2@tarsit.com',
      firstName: 'Test',
      lastName: 'Customer Two',
      role: UserRole.CUSTOMER,
    },
    ...Array.from({ length: 10 }, (_, i) => ({
      email: `owner${i + 1}@tarsit.com`,
      firstName: 'Model',
      lastName: `Owner ${i + 1}`,
      role: UserRole.BUSINESS_OWNER,
      phone: `+15555550${String(100 + i).slice(-3)}`,
    })),
  ];

  const prismaUserIdByEmail = new Map<string, string>();

  for (const demoUser of demoUsers) {
    const { prismaUserId } = await createSupabaseAndLocalUser({
      supabase,
      demoUser,
      password: demoPassword,
      passwordHash,
    });
    prismaUserIdByEmail.set(demoUser.email.toLowerCase(), prismaUserId);
  }

  console.log(`✅ Created ${demoUsers.length} users (Supabase + Prisma)`);

  console.log('🏢 Creating 10 demo businesses...');
  const demoBusinesses: DemoBusiness[] = [
    {
      ownerEmail: 'owner1@tarsit.com',
      name: 'QuickFix Phone Repair',
      categorySlug: 'electronics-repair',
      description: 'Same-day screen repairs, battery replacements, and water-damage diagnostics.',
      addressLine1: '123 Market St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      latitude: 37.7749,
      longitude: -122.4194,
      phone: '+14155551001',
      website: 'https://example.com/quickfix',
      priceRange: PriceRange.MODERATE,
    },
    {
      ownerEmail: 'owner2@tarsit.com',
      name: 'Apex Auto Detail',
      categorySlug: 'automotive',
      description:
        'Interior deep clean, paint correction, ceramic coating, and maintenance washes.',
      addressLine1: '456 Sunset Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90028',
      latitude: 34.0522,
      longitude: -118.2437,
      phone: '+12135551002',
      website: 'https://example.com/apex-auto',
      priceRange: PriceRange.EXPENSIVE,
    },
    {
      ownerEmail: 'owner3@tarsit.com',
      name: 'Calm Leaf Wellness Studio',
      categorySlug: 'beauty-wellness',
      description: 'Massage, facials, and recovery sessions in a calm, boutique space.',
      addressLine1: '789 Broadway',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
      latitude: 40.7128,
      longitude: -74.006,
      phone: '+16465551003',
      website: 'https://example.com/calm-leaf',
      priceRange: PriceRange.EXPENSIVE,
    },
    {
      ownerEmail: 'owner4@tarsit.com',
      name: 'Spark Home Electric',
      categorySlug: 'home-services',
      description: 'Licensed electricians for outlets, lighting, panels, and smart-home installs.',
      addressLine1: '101 Congress Ave',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      latitude: 30.2672,
      longitude: -97.7431,
      phone: '+15125551004',
      website: 'https://example.com/spark-home',
      priceRange: PriceRange.MODERATE,
    },
    {
      ownerEmail: 'owner5@tarsit.com',
      name: 'Harbor Roast Coffee',
      categorySlug: 'food-dining',
      description: 'Small-batch roasts, espresso, and breakfast bites—fast and friendly.',
      addressLine1: '202 Pike St',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      latitude: 47.6062,
      longitude: -122.3321,
      phone: '+12065551005',
      website: 'https://example.com/harbor-roast',
      priceRange: PriceRange.BUDGET,
    },
    {
      ownerEmail: 'owner6@tarsit.com',
      name: 'Northside Strength Lab',
      categorySlug: 'fitness-health',
      description: 'Personal training, small group classes, and beginner-friendly coaching.',
      addressLine1: '303 Wacker Dr',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      latitude: 41.8781,
      longitude: -87.6298,
      phone: '+13125551006',
      website: 'https://example.com/strength-lab',
      priceRange: PriceRange.MODERATE,
    },
    {
      ownerEmail: 'owner7@tarsit.com',
      name: 'Paws & Claws Grooming',
      categorySlug: 'pet-services',
      description: 'Grooming, nail trims, deshedding, and puppy-first appointments.',
      addressLine1: '404 Biscayne Blvd',
      city: 'Miami',
      state: 'FL',
      zipCode: '33132',
      latitude: 25.7617,
      longitude: -80.1918,
      phone: '+13055551007',
      website: 'https://example.com/paws-claws',
      priceRange: PriceRange.MODERATE,
    },
    {
      ownerEmail: 'owner8@tarsit.com',
      name: 'Mile High Math Tutoring',
      categorySlug: 'education-tutoring',
      description: 'Middle school through college math tutoring with clear weekly plans.',
      addressLine1: '505 16th St',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      latitude: 39.7392,
      longitude: -104.9903,
      phone: '+13035551008',
      website: 'https://example.com/mile-high-math',
      priceRange: PriceRange.BUDGET,
    },
    {
      ownerEmail: 'owner9@tarsit.com',
      name: 'Beacon Home Cleaning',
      categorySlug: 'home-services',
      description: 'Reliable home cleaning with easy booking and consistent crews.',
      addressLine1: '606 Boylston St',
      city: 'Boston',
      state: 'MA',
      zipCode: '02116',
      latitude: 42.3601,
      longitude: -71.0589,
      phone: '+16175551009',
      website: 'https://example.com/beacon-clean',
      priceRange: PriceRange.MODERATE,
    },
    {
      ownerEmail: 'owner10@tarsit.com',
      name: 'Desert Bloom Wellness',
      categorySlug: 'beauty-wellness',
      description: 'Modern spa services and recovery treatments focused on consistency.',
      addressLine1: '707 Camelback Rd',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85016',
      latitude: 33.4484,
      longitude: -112.074,
      phone: '+16025551010',
      website: 'https://example.com/desert-bloom',
      priceRange: PriceRange.EXPENSIVE,
    },
  ];

  for (const [index, demoBusiness] of demoBusinesses.entries()) {
    const ownerId = prismaUserIdByEmail.get(demoBusiness.ownerEmail.toLowerCase());
    if (!ownerId) throw new Error(`Missing owner user for ${demoBusiness.ownerEmail}`);

    const category = categoryBySlug.get(demoBusiness.categorySlug);
    if (!category) throw new Error(`Missing category ${demoBusiness.categorySlug}`);

    const slug = slugify(demoBusiness.name);

    const services = [
      {
        name: 'Consultation',
        description: 'Quick assessment and plan.',
        price: 25,
        duration: 20,
        order: 1,
      },
      {
        name: 'Standard Service',
        description: 'Most common request.',
        price: 99,
        duration: 60,
        order: 2,
      },
      {
        name: 'Premium Service',
        description: 'Expanded service with extras.',
        price: 179,
        duration: 90,
        order: 3,
      },
    ];

    const hours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
      dayOfWeek,
      openTime: '09:00',
      closeTime: '17:00',
      isClosed: dayOfWeek === 0,
    }));

    await prisma.business.create({
      data: {
        ownerId,
        name: demoBusiness.name,
        slug,
        description: demoBusiness.description,
        categoryId: category.id,
        addressLine1: demoBusiness.addressLine1,
        city: demoBusiness.city,
        state: demoBusiness.state,
        zipCode: demoBusiness.zipCode,
        country: 'USA',
        latitude: demoBusiness.latitude,
        longitude: demoBusiness.longitude,
        phone: demoBusiness.phone,
        website: demoBusiness.website,
        priceRange: demoBusiness.priceRange,
        verified: true,
        active: true,
        featured: index < 3,
        messagingEnabled: true,
        showAbout: true,
        showServices: true,
        showPhotos: true,
        showReviews: true,
        showHours: true,
        showMap: true,
        showPhone: true,
        showWebsite: true,
        publicPagePrimaryCta: 'message',
        publicPageSectionOrder: ['hero', 'services', 'photos', 'reviews', 'hours', 'map'],
        services: { create: services },
        businessHours: { create: hours },
      },
    });
  }

  console.log('✅ Created 10 businesses with services/hours');
  console.log('🎉 Demo seed complete');
}

main()
  .catch((e) => {
    console.error('❌ Demo seed failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
