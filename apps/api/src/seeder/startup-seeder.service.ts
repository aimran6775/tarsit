import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CUSTOMER' | 'BUSINESS_OWNER';
  phone?: string;
}

interface TestBusiness {
  name: string;
  slug: string;
  description: string;
  categorySlug: string;
  ownerEmail: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  priceRange: 'BUDGET' | 'MODERATE' | 'EXPENSIVE';
  latitude: number;
  longitude: number;
  services: Array<{ name: string; price: number; duration: number }>;
}

interface Category {
  name: string;
  slug: string;
  icon: string;
  description: string;
  order: number;
}

@Injectable()
export class StartupSeederService implements OnModuleInit {
  private readonly logger = new Logger(StartupSeederService.name);
  private readonly testPassword = 'abdullah1234!';

  private readonly testUsers: TestUser[] = [
    {
      email: 'admin@tarsit.com',
      password: this.testPassword,
      firstName: 'Admin',
      lastName: 'Tarsit',
      role: 'ADMIN',
    },
    {
      email: 'testcustomer@tarsit.com',
      password: this.testPassword,
      firstName: 'Test',
      lastName: 'Customer',
      role: 'CUSTOMER',
    },
    {
      email: 'testowner@tarsit.com',
      password: this.testPassword,
      firstName: 'Test',
      lastName: 'Owner',
      role: 'BUSINESS_OWNER',
      phone: '+14155550001',
    },
  ];

  private readonly categories: Category[] = [
    { name: 'Electronics Repair', slug: 'electronics-repair', icon: '📱', description: 'Phone, tablet, computer repair services', order: 1 },
    { name: 'Automotive', slug: 'automotive', icon: '🚗', description: 'Car repair, maintenance, detailing', order: 2 },
    { name: 'Beauty & Wellness', slug: 'beauty-wellness', icon: '💇', description: 'Salons, spas, barbershops', order: 3 },
    { name: 'Home Services', slug: 'home-services', icon: '🏠', description: 'Plumbing, electrical, cleaning', order: 4 },
    { name: 'Food & Dining', slug: 'food-dining', icon: '🍽️', description: 'Restaurants, cafes, catering', order: 5 },
    { name: 'Professional Services', slug: 'professional-services', icon: '💼', description: 'Legal, accounting, consulting', order: 6 },
    { name: 'Fitness & Health', slug: 'fitness-health', icon: '💪', description: 'Gyms, personal training, yoga', order: 7 },
    { name: 'Pet Services', slug: 'pet-services', icon: '🐾', description: 'Grooming, veterinary, pet sitting', order: 8 },
    { name: 'Education & Tutoring', slug: 'education-tutoring', icon: '📚', description: 'Tutoring, music lessons, courses', order: 9 },
    { name: 'Construction & Renovation', slug: 'construction-renovation', icon: '🔨', description: 'Contractors, painters, remodeling', order: 10 },
  ];

  private readonly testBusinesses: TestBusiness[] = [
    {
      name: 'Test Business Tarsit',
      slug: 'test-business-tarsit',
      description: 'Official test business for automated testing.',
      categorySlug: 'electronics-repair',
      ownerEmail: 'testowner@tarsit.com',
      addressLine1: '1 Test Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      phone: '+14155550001',
      priceRange: 'MODERATE',
      latitude: 37.7749,
      longitude: -122.4194,
      services: [
        { name: 'Test Service 1', price: 50.0, duration: 30 },
        { name: 'Test Service 2', price: 100.0, duration: 60 },
      ],
    },
    {
      name: 'QuickFix Phone Repair',
      slug: 'quickfix-phone-repair',
      description: 'Professional iPhone and Android repair. Screen replacements, battery fixes, and water damage repair.',
      categorySlug: 'electronics-repair',
      ownerEmail: 'testowner@tarsit.com',
      addressLine1: '123 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      phone: '+14155551000',
      priceRange: 'MODERATE',
      latitude: 37.7749,
      longitude: -122.4194,
      services: [
        { name: 'Screen Replacement', price: 89.99, duration: 45 },
        { name: 'Battery Replacement', price: 59.99, duration: 30 },
        { name: 'Water Damage Repair', price: 149.99, duration: 120 },
      ],
    },
    {
      name: 'Elite Auto Care',
      slug: 'elite-auto-care',
      description: 'Full-service auto repair and maintenance. ASE certified mechanics.',
      categorySlug: 'automotive',
      ownerEmail: 'testowner@tarsit.com',
      addressLine1: '456 Valencia Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94110',
      phone: '+14155551001',
      priceRange: 'MODERATE',
      latitude: 37.7649,
      longitude: -122.4294,
      services: [
        { name: 'Oil Change', price: 49.99, duration: 30 },
        { name: 'Brake Service', price: 199.99, duration: 90 },
        { name: 'Engine Diagnostic', price: 89.99, duration: 60 },
      ],
    },
    {
      name: 'Bella Salon & Spa',
      slug: 'bella-salon-spa',
      description: 'Upscale salon offering haircuts, coloring, and spa treatments.',
      categorySlug: 'beauty-wellness',
      ownerEmail: 'testowner@tarsit.com',
      addressLine1: '789 Union Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94133',
      phone: '+14155551002',
      priceRange: 'EXPENSIVE',
      latitude: 37.7849,
      longitude: -122.4094,
      services: [
        { name: "Women's Haircut", price: 85.0, duration: 60 },
        { name: 'Hair Coloring', price: 150.0, duration: 120 },
        { name: 'Spa Manicure', price: 45.0, duration: 45 },
      ],
    },
    {
      name: 'Bay Plumbing Pros',
      slug: 'bay-plumbing-pros',
      description: '24/7 emergency plumbing services. Licensed and insured.',
      categorySlug: 'home-services',
      ownerEmail: 'testowner@tarsit.com',
      addressLine1: '321 Mission Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      phone: '+14155551003',
      priceRange: 'MODERATE',
      latitude: 37.7949,
      longitude: -122.3994,
      services: [
        { name: 'Drain Cleaning', price: 129.99, duration: 60 },
        { name: 'Leak Repair', price: 199.99, duration: 90 },
        { name: 'Water Heater Install', price: 899.99, duration: 180 },
      ],
    },
    {
      name: 'Golden Gate Cafe',
      slug: 'golden-gate-cafe',
      description: 'Cozy neighborhood cafe serving fresh coffee, pastries, and lunch.',
      categorySlug: 'food-dining',
      ownerEmail: 'testowner@tarsit.com',
      addressLine1: '567 Haight Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94117',
      phone: '+14155551004',
      priceRange: 'BUDGET',
      latitude: 37.7549,
      longitude: -122.4494,
      services: [
        { name: 'Espresso Drinks', price: 4.5, duration: 5 },
        { name: 'Fresh Pastries', price: 3.5, duration: 0 },
        { name: 'Lunch Special', price: 12.99, duration: 15 },
      ],
    },
  ];

  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Only run seeding if explicitly enabled or in production
    const shouldSeed = this.configService.get<string>('SEED_ON_STARTUP') === 'true' || 
                       this.configService.get<string>('NODE_ENV') === 'production';
    
    if (!shouldSeed) {
      this.logger.log('Startup seeding disabled (set SEED_ON_STARTUP=true to enable)');
      return;
    }

    this.logger.log('🌱 Checking database seed status...');
    
    try {
      await this.seedCategories();
      await this.seedUsers();
      await this.seedBusinesses();
      this.logger.log('✅ Startup seeding complete');
    } catch (error) {
      this.logger.error('❌ Startup seeding failed:', error);
    }
  }

  private async seedCategories() {
    for (const category of this.categories) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: category.slug },
      });

      if (!existing) {
        await this.prisma.category.create({ data: category });
        this.logger.log(`📂 Created category: ${category.name}`);
      }
    }
  }

  private async seedUsers() {
    const supabase = this.supabaseService.getClient();
    
    for (const testUser of this.testUsers) {
      // Check if user exists in local database
      let dbUser = await this.prisma.user.findUnique({
        where: { email: testUser.email },
      });

      // Check if user exists in Supabase Auth
      let supabaseUserId: string | null = null;
      
      try {
        // Try to sign in to check if user exists in Supabase
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testUser.email,
          password: testUser.password,
        });

        if (!signInError && signInData.user) {
          supabaseUserId = signInData.user.id;
          this.logger.log(`✅ User ${testUser.email} exists in Supabase Auth`);
        }
      } catch (e) {
        // User doesn't exist in Supabase, will create
      }

      // Create user in Supabase if not exists
      if (!supabaseUserId) {
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true,
          user_metadata: {
            first_name: testUser.firstName,
            last_name: testUser.lastName,
            role: testUser.role,
          },
        });

        if (createError) {
          // Check if it's a duplicate error
          if (createError.message?.toLowerCase().includes('already') || 
              (createError as any).status === 422) {
            this.logger.warn(`User ${testUser.email} may already exist in Supabase, trying to fetch...`);
            
            // Try to get the user via admin API
            const { data: listData } = await supabase.auth.admin.listUsers();
            const existingUser = listData?.users?.find(u => u.email === testUser.email);
            if (existingUser) {
              supabaseUserId = existingUser.id;
              
              // Update password in case it changed
              await supabase.auth.admin.updateUserById(existingUser.id, {
                password: testUser.password,
              });
              this.logger.log(`🔄 Updated password for ${testUser.email} in Supabase`);
            }
          } else {
            this.logger.error(`Failed to create Supabase user ${testUser.email}:`, createError);
            continue;
          }
        } else if (createData.user) {
          supabaseUserId = createData.user.id;
          this.logger.log(`👤 Created user ${testUser.email} in Supabase Auth`);
        }
      }

      // Create or update user in local database
      if (!dbUser && supabaseUserId) {
        const passwordHash = await bcrypt.hash(testUser.password, 10);
        dbUser = await this.prisma.user.create({
          data: {
            email: testUser.email,
            passwordHash,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            role: testUser.role,
            phone: testUser.phone,
            verified: true,
            provider: 'supabase',
            providerId: supabaseUserId,
          },
        });
        this.logger.log(`👤 Created user ${testUser.email} in database`);
      } else if (dbUser) {
        // Update password hash in case it changed
        const passwordHash = await bcrypt.hash(testUser.password, 10);
        await this.prisma.user.update({
          where: { id: dbUser.id },
          data: {
            passwordHash,
            providerId: supabaseUserId || dbUser.providerId,
          },
        });
        this.logger.log(`✅ User ${testUser.email} exists in database`);
      }
    }
  }

  private async seedBusinesses() {
    for (const bizData of this.testBusinesses) {
      // Check if business exists
      const existing = await this.prisma.business.findUnique({
        where: { slug: bizData.slug },
      });

      if (existing) {
        this.logger.log(`✅ Business ${bizData.name} already exists`);
        continue;
      }

      // Get category
      const category = await this.prisma.category.findUnique({
        where: { slug: bizData.categorySlug },
      });

      if (!category) {
        this.logger.warn(`⚠️ Category ${bizData.categorySlug} not found, skipping ${bizData.name}`);
        continue;
      }

      // Get owner
      const owner = await this.prisma.user.findUnique({
        where: { email: bizData.ownerEmail },
      });

      if (!owner) {
        this.logger.warn(`⚠️ Owner ${bizData.ownerEmail} not found, skipping ${bizData.name}`);
        continue;
      }

      // Create business
      await this.prisma.business.create({
        data: {
          name: bizData.name,
          slug: bizData.slug,
          description: bizData.description,
          categoryId: category.id,
          ownerId: owner.id,
          addressLine1: bizData.addressLine1,
          city: bizData.city,
          state: bizData.state,
          zipCode: bizData.zipCode,
          country: 'USA',
          latitude: bizData.latitude,
          longitude: bizData.longitude,
          phone: bizData.phone,
          priceRange: bizData.priceRange,
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
            create: bizData.services.map((service, idx) => ({
              name: service.name,
              price: service.price,
              duration: service.duration,
              order: idx,
              bookable: true,
            })),
          },
        },
      });

      this.logger.log(`🏢 Created business: ${bizData.name}`);
    }
  }
}
