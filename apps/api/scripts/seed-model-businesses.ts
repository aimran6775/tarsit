import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: 'your_openai_api_key_here
});

// ============================================================================
// DEMO USER CREDENTIALS - These users can log in to the system
// ============================================================================
const demoUsers = [
  {
    email: 'sofia@tarsit.com',
    password: 'Sofia2024!',
    firstName: 'Sofia',
    lastName: 'Martinez',
    phone: '+1 (718) 555-0101',
    role: 'BUSINESS_OWNER' as const,
  },
  {
    email: 'marcus@tarsit.com',
    password: 'Marcus2024!',
    firstName: 'Marcus',
    lastName: 'Johnson',
    phone: '+1 (212) 555-0202',
    role: 'BUSINESS_OWNER' as const,
  },
  {
    email: 'david@tarsit.com',
    password: 'David2024!',
    firstName: 'David',
    lastName: 'Chen',
    phone: '+1 (718) 555-0303',
    role: 'BUSINESS_OWNER' as const,
  },
  {
    email: 'emma@tarsit.com',
    password: 'Emma2024!',
    firstName: 'Emma',
    lastName: 'Thompson',
    phone: '+1 (718) 555-0404',
    role: 'BUSINESS_OWNER' as const,
  },
  {
    email: 'michael@tarsit.com',
    password: 'Michael2024!',
    firstName: 'Michael',
    lastName: 'Rivera',
    phone: '+1 (718) 555-0505',
    role: 'BUSINESS_OWNER' as const,
  },
  // Regular customers for reviews
  {
    email: 'customer1@tarsit.com',
    password: 'Customer2024!',
    firstName: 'Sarah',
    lastName: 'Williams',
    phone: '+1 (917) 555-1001',
    role: 'CUSTOMER' as const,
  },
  {
    email: 'customer2@tarsit.com',
    password: 'Customer2024!',
    firstName: 'James',
    lastName: 'Brown',
    phone: '+1 (917) 555-1002',
    role: 'CUSTOMER' as const,
  },
  {
    email: 'customer3@tarsit.com',
    password: 'Customer2024!',
    firstName: 'Lisa',
    lastName: 'Davis',
    phone: '+1 (917) 555-1003',
    role: 'CUSTOMER' as const,
  },
];

// ============================================================================
// COMPLETE BUSINESS DATA
// ============================================================================
const businesses = [
  {
    ownerEmail: 'sofia@tarsit.com',
    name: "Sofia's Boutique",
    slug: 'sofias-boutique',
    description: `Welcome to Sofia's Boutique, Brooklyn's premier destination for curated fashion and unique finds! 

We're a family-owned boutique that has been serving the Brooklyn community since 2018. Our carefully selected collection features:

• Sustainable and eco-friendly fashion from emerging designers
• Handcrafted jewelry and accessories from local artisans  
• Vintage-inspired pieces with modern appeal
• Home décor items that add character to any space

What sets us apart is our commitment to supporting independent creators and providing personalized styling advice. Our team believes that great style shouldn't cost the earth, which is why we prioritize ethical sourcing and sustainable practices.

Visit us for a unique shopping experience where every piece tells a story.`,
    categoryName: 'Shopping & Retail',
    categoryIcon: '🛍️',
    addressLine1: '245 Court Street',
    city: 'Brooklyn',
    state: 'NY',
    zipCode: '11201',
    phone: '(718) 555-0101',
    email: 'hello@sofiasboutique.com',
    website: 'https://sofiasboutique.com',
    priceRange: 'MODERATE',
    latitude: 40.6892,
    longitude: -73.9942,
    hours: {
      monday: { open: '10:00', close: '19:00' },
      tuesday: { open: '10:00', close: '19:00' },
      wednesday: { open: '10:00', close: '19:00' },
      thursday: { open: '10:00', close: '20:00' },
      friday: { open: '10:00', close: '20:00' },
      saturday: { open: '10:00', close: '18:00' },
      sunday: { open: '12:00', close: '17:00' },
    },
    services: [
      { name: 'Personal Styling Session', description: 'One-on-one consultation with our style experts to curate your perfect wardrobe', price: 75, duration: 60 },
      { name: 'Wardrobe Assessment', description: 'In-home wardrobe review and organization tips', price: 150, duration: 120 },
      { name: 'Gift Wrapping', description: 'Complimentary elegant gift wrapping for all purchases', price: 0, duration: 5 },
      { name: 'Alterations Coordination', description: 'We coordinate with trusted local tailors for perfect fits', price: 25, duration: 15 },
    ],
    imagePrompt: 'A charming boutique storefront with elegant fashion display in large window, warm lighting, vintage-modern aesthetic, Brooklyn brownstone neighborhood, professional photography',
  },
  {
    ownerEmail: 'marcus@tarsit.com',
    name: 'Classic Cuts Barbershop',
    slug: 'classic-cuts-barbershop',
    description: `Step into Classic Cuts Barbershop and experience the perfect blend of traditional barbering and modern style in the heart of Manhattan.

Founded by Marcus Johnson, a third-generation barber, Classic Cuts has been a neighborhood institution since 2015. We specialize in:

• Precision haircuts tailored to your face shape and lifestyle
• Traditional hot towel straight razor shaves
• Expert beard sculpting and maintenance
• Modern fades and contemporary styles

Our shop features vintage barber chairs, a relaxed atmosphere, and complimentary beverages. We believe a trip to the barbershop should be more than just a haircut – it's a ritual of self-care and community.

All our barbers are licensed professionals with years of experience, and we use only premium products to ensure your hair and skin receive the best care possible.

Walk-ins welcome, appointments preferred.`,
    categoryName: 'Beauty & Personal Care',
    categoryIcon: '💈',
    addressLine1: '428 Amsterdam Avenue',
    city: 'New York',
    state: 'NY',
    zipCode: '10024',
    phone: '(212) 555-0202',
    email: 'book@classiccuts.nyc',
    website: 'https://classiccuts.nyc',
    priceRange: 'MODERATE',
    latitude: 40.7831,
    longitude: -73.9712,
    hours: {
      monday: { open: '09:00', close: '19:00' },
      tuesday: { open: '09:00', close: '19:00' },
      wednesday: { open: '09:00', close: '19:00' },
      thursday: { open: '09:00', close: '20:00' },
      friday: { open: '09:00', close: '20:00' },
      saturday: { open: '08:00', close: '18:00' },
      sunday: { open: '10:00', close: '16:00' },
    },
    services: [
      { name: 'Classic Haircut', description: 'Precision cut with clippers and scissors, includes wash and style', price: 40, duration: 30 },
      { name: 'Hot Towel Shave', description: 'Traditional straight razor shave with hot towels and premium products', price: 45, duration: 45 },
      { name: 'Beard Trim & Shape', description: 'Expert beard grooming and shaping', price: 25, duration: 20 },
      { name: 'Haircut + Beard Combo', description: 'Complete grooming package', price: 55, duration: 45 },
      { name: 'Kids Haircut (Under 12)', description: 'Patient, friendly service for young gentlemen', price: 28, duration: 25 },
      { name: 'Senior Haircut (65+)', description: 'Discounted rate for our senior clients', price: 32, duration: 30 },
    ],
    imagePrompt: 'A classic barbershop interior with vintage barber chairs, large mirrors, warm wood tones, professional photography, inviting masculine atmosphere, Upper West Side Manhattan',
  },
  {
    ownerEmail: 'david@tarsit.com',
    name: 'Color Splash Paint & Supply',
    slug: 'color-splash-paint-supply',
    description: `Color Splash Paint & Supply has been Queens' trusted paint destination since 2012. We're more than just a paint store – we're your partners in bringing color to life!

Our team of color consultants brings decades of combined experience to help you:

• Choose the perfect colors for any project
• Select the right paint type and finish for your needs
• Match existing colors with precision computerized color matching
• Plan your project from start to finish

We carry premium brands including Benjamin Moore, Sherwin-Williams, and eco-friendly options. Our extensive inventory includes:

- Interior and exterior paints
- Stains and finishes
- Brushes, rollers, and applicators
- Primers and prep materials
- Specialty coatings

For contractors: Ask about our professional discount program and delivery services!

Color Splash – Where Your Vision Comes to Life`,
    categoryName: 'Home & Garden',
    categoryIcon: '🎨',
    addressLine1: '31-15 Queens Boulevard',
    city: 'Long Island City',
    state: 'NY',
    zipCode: '11101',
    phone: '(718) 555-0303',
    email: 'info@colorsplashpaint.com',
    website: 'https://colorsplashpaint.com',
    priceRange: 'BUDGET',
    latitude: 40.7433,
    longitude: -73.9425,
    hours: {
      monday: { open: '07:00', close: '18:00' },
      tuesday: { open: '07:00', close: '18:00' },
      wednesday: { open: '07:00', close: '18:00' },
      thursday: { open: '07:00', close: '18:00' },
      friday: { open: '07:00', close: '18:00' },
      saturday: { open: '08:00', close: '17:00' },
      sunday: { open: '09:00', close: '14:00' },
    },
    services: [
      { name: 'Color Consultation', description: 'Free expert advice on color selection for your project', price: 0, duration: 30 },
      { name: 'Computer Color Matching', description: 'Precise color matching from any sample', price: 15, duration: 15 },
      { name: 'Paint Mixing', description: 'Custom tinting to your exact specifications', price: 0, duration: 10 },
      { name: 'Equipment Rental', description: 'Sprayers, ladders, and professional tools', price: 35, duration: 0 },
      { name: 'Contractor Delivery', description: 'Free delivery on orders over $200', price: 0, duration: 0 },
    ],
    imagePrompt: 'A paint store interior with colorful paint cans organized on shelves, color swatches displayed on wall, bright lighting, clean organized retail space, professional photography',
  },
  {
    ownerEmail: 'emma@tarsit.com',
    name: 'Sunrise Café & Bakery',
    slug: 'sunrise-cafe-bakery',
    description: `Welcome to Sunrise Café & Bakery, where every morning feels like a fresh start! ☀️

Nestled in the heart of Park Slope, we've been Brooklyn's go-to spot for artisan baked goods and exceptional coffee since 2016. Owner Emma Thompson, a Culinary Institute of America graduate, brings her passion for baking to every item we create.

Our specialties include:

🥐 Fresh-baked croissants and pastries (baked on-site daily!)
☕ Specialty coffee drinks using locally roasted beans
🍞 Artisan breads made with organic flour
🥗 Fresh breakfast and lunch options
🎂 Custom celebration cakes

Everything is made from scratch using locally-sourced, seasonal ingredients whenever possible. We're committed to sustainability and use compostable packaging.

Whether you're grabbing your morning coffee, settling in for a remote work session, or celebrating a special occasion with one of our custom cakes, Sunrise is your sunny spot in Brooklyn.

Free Wi-Fi • Outdoor seating • Dog-friendly patio`,
    categoryName: 'Food & Dining',
    categoryIcon: '☕',
    addressLine1: '372 7th Avenue',
    city: 'Brooklyn',
    state: 'NY',
    zipCode: '11215',
    phone: '(718) 555-0404',
    email: 'hello@sunrisecafebk.com',
    website: 'https://sunrisecafebk.com',
    priceRange: 'BUDGET',
    latitude: 40.6681,
    longitude: -73.9806,
    hours: {
      monday: { open: '06:30', close: '18:00' },
      tuesday: { open: '06:30', close: '18:00' },
      wednesday: { open: '06:30', close: '18:00' },
      thursday: { open: '06:30', close: '18:00' },
      friday: { open: '06:30', close: '19:00' },
      saturday: { open: '07:00', close: '19:00' },
      sunday: { open: '07:00', close: '17:00' },
    },
    services: [
      { name: 'Custom Celebration Cakes', description: 'Personalized cakes for birthdays, weddings, and special events', price: 65, duration: 0 },
      { name: 'Catering Platters', description: 'Pastry and sandwich platters for meetings and events', price: 75, duration: 0 },
      { name: 'Coffee Subscription', description: 'Weekly bag of our house-roasted beans delivered', price: 22, duration: 0 },
      { name: 'Baking Classes', description: 'Monthly hands-on classes (check schedule)', price: 85, duration: 180 },
    ],
    imagePrompt: 'A cozy café interior with pastry display case showing croissants and cakes, espresso machine, warm lighting, wooden tables, exposed brick, Park Slope Brooklyn aesthetic, professional food photography',
  },
  {
    ownerEmail: 'michael@tarsit.com',
    name: 'Green Thumb Garden Center',
    slug: 'green-thumb-garden-center',
    description: `Green Thumb Garden Center – Growing Together Since 2010! 🌱

Located on Staten Island's beautiful North Shore, we're a family-owned garden center dedicated to helping New Yorkers create and maintain beautiful outdoor spaces.

Owner Michael Rivera brings over 20 years of horticultural experience and a genuine passion for helping both novice and experienced gardeners succeed.

What we offer:

🌸 Extensive selection of plants, flowers, and shrubs
🌳 Trees and ornamentals suited for NYC climate
🥬 Organic vegetable starts and herb gardens  
🪴 Indoor plants and succulents
🧰 Quality tools, soils, and supplies
💧 Irrigation systems and pond supplies

Our knowledgeable staff can help you with:
- Plant selection for sun, shade, or container gardens
- Landscape design consultations
- Pest and disease diagnosis
- Seasonal planting guides

We host free weekend workshops throughout the growing season. Check our events calendar!

Green Thumb – Where Gardens Begin`,
    categoryName: 'Home & Garden',
    categoryIcon: '🌱',
    addressLine1: '1150 Forest Avenue',
    city: 'Staten Island',
    state: 'NY',
    zipCode: '10310',
    phone: '(718) 555-0505',
    email: 'grow@greenthumbsi.com',
    website: 'https://greenthumbsi.com',
    priceRange: 'MODERATE',
    latitude: 40.6301,
    longitude: -74.1165,
    hours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '08:00', close: '18:00' },
      sunday: { open: '09:00', close: '17:00' },
    },
    services: [
      { name: 'Landscape Design Consultation', description: 'Professional garden planning and design advice', price: 125, duration: 90 },
      { name: 'Plant Health Diagnosis', description: 'Free assessment of plant problems and treatment recommendations', price: 0, duration: 15 },
      { name: 'Potting Service', description: 'We repot your plants with premium soil', price: 15, duration: 20 },
      { name: 'Delivery & Installation', description: 'We deliver and plant large items', price: 75, duration: 60 },
      { name: 'Garden Workshops', description: 'Free weekend classes on seasonal topics', price: 0, duration: 60 },
    ],
    imagePrompt: 'A garden center with lush green plants and colorful flowers, outdoor nursery area with greenhouse visible, natural lighting, Staten Island New York, professional photography',
  },
];

// ============================================================================
// SAMPLE REVIEWS DATA
// ============================================================================
const reviewsData = [
  // Sofia's Boutique reviews
  {
    businessSlug: 'sofias-boutique',
    reviews: [
      { customerEmail: 'customer1@tarsit.com', rating: 5, title: 'Hidden gem in Brooklyn!', comment: 'I found the most beautiful handmade earrings here. Sofia herself helped me pick out the perfect gift for my sister. The personal attention and unique selection make this place special. Will definitely be back!' },
      { customerEmail: 'customer2@tarsit.com', rating: 5, title: 'Amazing styling session', comment: 'Booked a personal styling session and it was worth every penny. They really listened to my style preferences and helped me build a capsule wardrobe. The sustainable focus is a huge plus!' },
      { customerEmail: 'customer3@tarsit.com', rating: 4, title: 'Great selection, slightly pricey', comment: 'Love the curated collection and the vintage-inspired pieces. Prices are a bit higher than fast fashion but the quality justifies it. Friendly staff and beautiful store.' },
    ],
  },
  // Classic Cuts reviews
  {
    businessSlug: 'classic-cuts-barbershop',
    reviews: [
      { customerEmail: 'customer1@tarsit.com', rating: 5, title: 'Best barbershop in NYC!', comment: 'Marcus and his team are absolute pros. Been coming here for 3 years and never had a bad cut. The hot towel shave is an experience everyone should try at least once. Great atmosphere too!' },
      { customerEmail: 'customer2@tarsit.com', rating: 5, title: 'Finally found my barber', comment: 'After years of mediocre haircuts, I finally found Classic Cuts. They actually listen to what you want and deliver consistently. The attention to detail on my beard trim is unmatched.' },
      { customerEmail: 'customer3@tarsit.com', rating: 4, title: 'Top notch but book ahead', comment: 'Excellent haircuts and great vibe. Only downside is they get busy so walk-ins might have to wait. Definitely recommend booking an appointment, especially on weekends.' },
    ],
  },
  // Color Splash reviews
  {
    businessSlug: 'color-splash-paint-supply',
    reviews: [
      { customerEmail: 'customer1@tarsit.com', rating: 5, title: 'Saved my renovation!', comment: 'The color matching service is incredible. Brought in a tiny chip from my existing wall and they matched it perfectly. Staff really knows their products and helped me choose the right primer too.' },
      { customerEmail: 'customer2@tarsit.com', rating: 5, title: 'Great for contractors', comment: 'Been using Color Splash for all my projects. The contractor discount program is generous, delivery is reliable, and David always makes sure I have what I need. Highly recommend!' },
      { customerEmail: 'customer3@tarsit.com', rating: 4, title: 'Helpful and well-stocked', comment: 'Good selection of quality paints and supplies. The free color consultation helped me avoid a costly mistake with my living room color. Fair prices and knowledgeable staff.' },
    ],
  },
  // Sunrise Café reviews
  {
    businessSlug: 'sunrise-cafe-bakery',
    reviews: [
      { customerEmail: 'customer1@tarsit.com', rating: 5, title: 'The croissants are life-changing!', comment: 'These are hands-down the best croissants in Brooklyn. Perfectly flaky and buttery. I drive 20 minutes just for these. The lavender latte is also amazing. My happy place! ☀️' },
      { customerEmail: 'customer2@tarsit.com', rating: 5, title: 'Perfect remote work spot', comment: 'Great Wi-Fi, excellent coffee, and they don\'t rush you out. The avocado toast is substantial and delicious. Emma always remembers my order. This place feels like home.' },
      { customerEmail: 'customer3@tarsit.com', rating: 5, title: 'Custom cake was a hit!', comment: 'Ordered a custom birthday cake and it exceeded all expectations. Not only was it gorgeous, but it tasted incredible. Everyone at the party wanted to know where I got it. Thank you Sunrise!' },
    ],
  },
  // Green Thumb reviews
  {
    businessSlug: 'green-thumb-garden-center',
    reviews: [
      { customerEmail: 'customer1@tarsit.com', rating: 5, title: 'Plant paradise!', comment: 'As a beginner gardener, I was intimidated but the staff here made me feel welcome. Michael spent 30 minutes helping me pick plants that would actually survive in my shady backyard. Everything is thriving!' },
      { customerEmail: 'customer2@tarsit.com', rating: 5, title: 'Best garden center in the area', comment: 'Great selection of native plants and organic options. The weekend workshops are fantastic and free! Learned so much about composting. Will be a customer for life.' },
      { customerEmail: 'customer3@tarsit.com', rating: 4, title: 'Quality plants, fair prices', comment: 'Healthy plants at reasonable prices. Much better quality than the big box stores. The only reason for 4 stars is they can get busy on weekends but that\'s a testament to how good they are!' },
    ],
  },
];

// ============================================================================
// IMAGE GENERATION
// ============================================================================
async function generateImage(prompt: string, businessSlug: string): Promise<string> {
  try {
    console.log(`  🎨 Generating AI image for ${businessSlug}...`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned');
    }

    console.log(`  ✅ AI image generated successfully`);
    return imageUrl;
  } catch (error: any) {
    console.error(`  ⚠️ AI image generation failed: ${error.message}`);
    // Fallback to high-quality Unsplash images
    const fallbacks: Record<string, string> = {
      'sofias-boutique': 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1024&q=80',
      'classic-cuts-barbershop': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1024&q=80',
      'color-splash-paint-supply': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1024&q=80',
      'sunrise-cafe-bakery': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1024&q=80',
      'green-thumb-garden-center': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1024&q=80',
    };
    return fallbacks[businessSlug] || `https://placehold.co/1024x1024/4f46e5/white?text=${encodeURIComponent(businessSlug)}`;
  }
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================
async function main() {
  console.log('🌱 ═══════════════════════════════════════════════════════════');
  console.log('   TARSIT - MODEL BUSINESS DATA SEEDING');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Step 1: Clean existing sample data (keep other data intact)
  console.log('🗑️  Cleaning existing sample business data...');
  
  const existingSlugs = businesses.map(b => b.slug);
  const existingBusinesses = await prisma.business.findMany({
    where: { slug: { in: existingSlugs } },
    select: { id: true },
  });
  
  if (existingBusinesses.length > 0) {
    const businessIds = existingBusinesses.map(b => b.id);
    await prisma.review.deleteMany({ where: { businessId: { in: businessIds } } });
    await prisma.photo.deleteMany({ where: { businessId: { in: businessIds } } });
    await prisma.service.deleteMany({ where: { businessId: { in: businessIds } } });
    await prisma.favorite.deleteMany({ where: { businessId: { in: businessIds } } });
    await prisma.appointment.deleteMany({ where: { businessId: { in: businessIds } } });
    await prisma.message.deleteMany({ where: { chat: { businessId: { in: businessIds } } } });
    await prisma.chat.deleteMany({ where: { businessId: { in: businessIds } } });
    await prisma.business.deleteMany({ where: { id: { in: businessIds } } });
    console.log(`  ✅ Removed ${existingBusinesses.length} existing sample businesses\n`);
  }

  // Step 2: Create users
  console.log('👥 Creating demo users...\n');
  const createdUsers: Record<string, any> = {};
  
  for (const userData of demoUsers) {
    let user = await prisma.user.findUnique({ where: { email: userData.email } });
    
    if (!user) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: userData.role,
          verified: true,
          active: true,
          provider: 'local',
        },
      });
      console.log(`  ✅ Created: ${userData.firstName} ${userData.lastName} (${userData.email})`);
    } else {
      // Update password in case it changed
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      user = await prisma.user.update({
        where: { email: userData.email },
        data: { passwordHash: hashedPassword },
      });
      console.log(`  📝 Updated: ${userData.firstName} ${userData.lastName} (${userData.email})`);
    }
    
    createdUsers[userData.email] = user;
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📋 USER CREDENTIALS (Save these!):');
  console.log('═══════════════════════════════════════════════════════════════');
  for (const userData of demoUsers) {
    console.log(`  📧 ${userData.email}`);
    console.log(`     Password: ${userData.password}`);
    console.log(`     Role: ${userData.role}`);
    console.log('');
  }
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Step 3: Create categories
  console.log('📂 Creating categories...\n');
  const categoryMap: Record<string, any> = {};
  
  for (const business of businesses) {
    if (!categoryMap[business.categoryName]) {
      let category = await prisma.category.findUnique({
        where: { slug: business.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      });
      
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: business.categoryName,
            slug: business.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            icon: business.categoryIcon,
            description: `${business.categoryName} businesses and services`,
            active: true,
          },
        });
        console.log(`  ✅ Created category: ${business.categoryName}`);
      }
      
      categoryMap[business.categoryName] = category;
    }
  }

  // Step 4: Create businesses with AI images
  console.log('\n🏢 Creating model businesses...\n');
  
  for (const businessData of businesses) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📍 ${businessData.name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const owner = createdUsers[businessData.ownerEmail];
    const category = categoryMap[businessData.categoryName];
    
    // Generate AI image
    const imageUrl = await generateImage(businessData.imagePrompt, businessData.slug);

    // Create business
    const business = await prisma.business.create({
      data: {
        ownerId: owner.id,
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
        rating: 0, // Will be calculated from reviews
        reviewCount: 0,
        verified: true,
        active: true,
        featured: true,
        hours: businessData.hours,
      },
    });
    console.log(`  ✅ Business created`);

    // Create photo
    await prisma.photo.create({
      data: {
        businessId: business.id,
        url: imageUrl,
        caption: `${businessData.name} - Main Photo`,
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

    // Add reviews
    const businessReviews = reviewsData.find(r => r.businessSlug === businessData.slug);
    if (businessReviews) {
      let totalRating = 0;
      for (const review of businessReviews.reviews) {
        const customer = createdUsers[review.customerEmail];
        await prisma.review.create({
          data: {
            businessId: business.id,
            userId: customer.id,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
          },
        });
        totalRating += review.rating;
      }
      
      // Update business rating
      const avgRating = totalRating / businessReviews.reviews.length;
      await prisma.business.update({
        where: { id: business.id },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: businessReviews.reviews.length,
        },
      });
      console.log(`  ⭐ ${businessReviews.reviews.length} reviews added (avg: ${avgRating.toFixed(1)})`);
    }
  }

  // Summary
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('✅ MODEL BUSINESS DATA SEEDING COMPLETE!');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const businessCount = await prisma.business.count();
  const userCount = await prisma.user.count();
  const reviewCount = await prisma.review.count();
  const serviceCount = await prisma.service.count();
  
  console.log('📊 Database Statistics:');
  console.log(`   • Total Users: ${userCount}`);
  console.log(`   • Total Businesses: ${businessCount}`);
  console.log(`   • Total Services: ${serviceCount}`);
  console.log(`   • Total Reviews: ${reviewCount}`);
  
  console.log('\n🔑 Login Credentials Summary:');
  console.log('   Business Owners:');
  for (const userData of demoUsers.filter(u => u.role === 'BUSINESS_OWNER')) {
    console.log(`   • ${userData.email} / ${userData.password}`);
  }
  console.log('\n   Customers:');
  for (const userData of demoUsers.filter(u => u.role === 'CUSTOMER')) {
    console.log(`   • ${userData.email} / ${userData.password}`);
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
