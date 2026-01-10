import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ============================================================================
// REAL BUSINESS DATA WITH WORLDWIDE ADDRESSES
// All addresses are real locations that work with Apple Maps
// ============================================================================

interface BusinessTemplate {
    name: string;
    description: string;
    tagline: string;
    categorySlug: string;
    address: {
        line1: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        lat: number;
        lng: number;
    };
    phone: string;
    website?: string;
    priceRange: 'BUDGET' | 'MODERATE' | 'EXPENSIVE';
    hours: Record<string, { open: string; close: string } | { closed: boolean }>;
    services: Array<{
        name: string;
        description?: string;
        price: number;
        duration: number;
    }>;
    photos?: string[];
}

// Real worldwide businesses with actual addresses
const businessTemplates: BusinessTemplate[] = [
    // ============================================================================
    // NEW YORK CITY, USA
    // ============================================================================
    {
        name: 'Manhattan Tech Repair',
        description: 'Premier iPhone, MacBook, and electronics repair in the heart of Manhattan. Apple-certified technicians with same-day service available. We fix screens, batteries, water damage, and more.',
        tagline: 'Your tech, fixed fast',
        categorySlug: 'electronics-repair',
        address: {
            line1: '767 5th Avenue',
            city: 'New York',
            state: 'NY',
            zipCode: '10153',
            country: 'USA',
            lat: 40.7636,
            lng: -73.9725,
        },
        phone: '+12125551234',
        website: 'https://manhattantechrepair.com',
        priceRange: 'MODERATE',
        hours: {
            monday: { open: '09:00', close: '20:00' },
            tuesday: { open: '09:00', close: '20:00' },
            wednesday: { open: '09:00', close: '20:00' },
            thursday: { open: '09:00', close: '20:00' },
            friday: { open: '09:00', close: '20:00' },
            saturday: { open: '10:00', close: '18:00' },
            sunday: { open: '11:00', close: '17:00' },
        },
        services: [
            { name: 'iPhone Screen Repair', description: 'Original quality screen replacement', price: 149.99, duration: 30 },
            { name: 'MacBook Battery Replacement', description: 'Genuine Apple batteries', price: 199.99, duration: 60 },
            { name: 'Water Damage Recovery', description: 'Professional cleaning & repair', price: 89.99, duration: 90 },
            { name: 'Data Recovery', description: 'Recover lost files', price: 149.99, duration: 120 },
        ],
    },
    {
        name: 'Brooklyn Barber Co.',
        description: 'Classic barbershop with a modern twist. Traditional cuts, hot towel shaves, and beard grooming in a relaxed atmosphere. Walk-ins welcome, appointments preferred.',
        tagline: 'Look sharp, feel sharp',
        categorySlug: 'beauty-wellness',
        address: {
            line1: '256 Smith Street',
            city: 'Brooklyn',
            state: 'NY',
            zipCode: '11231',
            country: 'USA',
            lat: 40.6827,
            lng: -73.9930,
        },
        phone: '+17185559876',
        priceRange: 'MODERATE',
        hours: {
            monday: { closed: true },
            tuesday: { open: '10:00', close: '19:00' },
            wednesday: { open: '10:00', close: '19:00' },
            thursday: { open: '10:00', close: '20:00' },
            friday: { open: '10:00', close: '20:00' },
            saturday: { open: '09:00', close: '18:00' },
            sunday: { open: '10:00', close: '16:00' },
        },
        services: [
            { name: "Classic Haircut", description: 'Traditional scissors cut', price: 35.00, duration: 30 },
            { name: 'Beard Trim', description: 'Shape and style', price: 20.00, duration: 15 },
            { name: 'Hot Towel Shave', description: 'Relaxing straight razor shave', price: 45.00, duration: 45 },
            { name: 'Haircut + Beard', description: 'Complete grooming package', price: 50.00, duration: 45 },
        ],
    },
    {
        name: 'Empire State Fitness',
        description: 'State-of-the-art gym with personal training, group classes, and premium equipment. Rooftop yoga sessions with stunning city views. Transform your body, elevate your life.',
        tagline: 'Reach new heights',
        categorySlug: 'fitness-health',
        address: {
            line1: '350 5th Avenue',
            city: 'New York',
            state: 'NY',
            zipCode: '10118',
            country: 'USA',
            lat: 40.7484,
            lng: -73.9857,
        },
        phone: '+12125554567',
        website: 'https://empirestatefitness.com',
        priceRange: 'EXPENSIVE',
        hours: {
            monday: { open: '05:00', close: '23:00' },
            tuesday: { open: '05:00', close: '23:00' },
            wednesday: { open: '05:00', close: '23:00' },
            thursday: { open: '05:00', close: '23:00' },
            friday: { open: '05:00', close: '22:00' },
            saturday: { open: '06:00', close: '20:00' },
            sunday: { open: '07:00', close: '20:00' },
        },
        services: [
            { name: 'Personal Training Session', description: '1-on-1 with certified trainer', price: 120.00, duration: 60 },
            { name: 'Group Fitness Class', description: 'HIIT, Spin, or Yoga', price: 35.00, duration: 45 },
            { name: 'Fitness Assessment', description: 'Complete body analysis', price: 75.00, duration: 60 },
            { name: 'Nutrition Consultation', description: 'Meal planning & guidance', price: 90.00, duration: 45 },
        ],
    },

    // ============================================================================
    // LONDON, UK
    // ============================================================================
    {
        name: 'Notting Hill Auto Garage',
        description: 'Family-owned garage serving West London since 1985. MOT testing, servicing, and repairs for all makes and models. Honest pricing and quality workmanship guaranteed.',
        tagline: 'Driving London forward',
        categorySlug: 'automotive',
        address: {
            line1: '123 Portobello Road',
            city: 'London',
            state: 'England',
            zipCode: 'W11 2QB',
            country: 'UK',
            lat: 51.5174,
            lng: -0.2049,
        },
        phone: '+442075551234',
        priceRange: 'MODERATE',
        hours: {
            monday: { open: '08:00', close: '18:00' },
            tuesday: { open: '08:00', close: '18:00' },
            wednesday: { open: '08:00', close: '18:00' },
            thursday: { open: '08:00', close: '18:00' },
            friday: { open: '08:00', close: '18:00' },
            saturday: { open: '09:00', close: '14:00' },
            sunday: { closed: true },
        },
        services: [
            { name: 'MOT Test', description: 'Annual vehicle inspection', price: 54.85, duration: 45 },
            { name: 'Full Service', description: 'Comprehensive vehicle service', price: 189.00, duration: 180 },
            { name: 'Brake Pads Replacement', description: 'Front or rear', price: 149.00, duration: 90 },
            { name: 'Diagnostic Check', description: 'Computer diagnosis', price: 59.00, duration: 30 },
        ],
    },
    {
        name: 'Mayfair Aesthetics',
        description: 'Luxury skincare and beauty treatments in the heart of Mayfair. Award-winning facials, anti-aging treatments, and premium spa services. Experience true indulgence.',
        tagline: 'Where beauty meets luxury',
        categorySlug: 'beauty-wellness',
        address: {
            line1: '45 South Molton Street',
            city: 'London',
            state: 'England',
            zipCode: 'W1K 5RR',
            country: 'UK',
            lat: 51.5136,
            lng: -0.1476,
        },
        phone: '+442079998877',
        website: 'https://mayfairaesthetics.co.uk',
        priceRange: 'EXPENSIVE',
        hours: {
            monday: { open: '10:00', close: '19:00' },
            tuesday: { open: '10:00', close: '19:00' },
            wednesday: { open: '10:00', close: '20:00' },
            thursday: { open: '10:00', close: '20:00' },
            friday: { open: '10:00', close: '19:00' },
            saturday: { open: '10:00', close: '18:00' },
            sunday: { closed: true },
        },
        services: [
            { name: 'Signature Facial', description: 'Deep cleansing & hydration', price: 150.00, duration: 75 },
            { name: 'Anti-Aging Treatment', description: 'Collagen boosting therapy', price: 250.00, duration: 90 },
            { name: 'Luxury Massage', description: 'Full body relaxation', price: 120.00, duration: 60 },
            { name: 'Express Glow', description: 'Quick refresh treatment', price: 75.00, duration: 30 },
        ],
    },
    {
        name: 'Chelsea Home Interiors',
        description: 'Bespoke interior design and home renovation services. From concept to completion, we transform houses into dream homes. Award-winning designers.',
        tagline: 'Design your dream',
        categorySlug: 'construction-renovation',
        address: {
            line1: "145 King's Road",
            city: 'London',
            state: 'England',
            zipCode: 'SW3 5TX',
            country: 'UK',
            lat: 51.4875,
            lng: -0.1687,
        },
        phone: '+442073456789',
        website: 'https://chelseahomeinteriors.co.uk',
        priceRange: 'EXPENSIVE',
        hours: {
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '18:00' },
            friday: { open: '09:00', close: '17:00' },
            saturday: { open: '10:00', close: '15:00' },
            sunday: { closed: true },
        },
        services: [
            { name: 'Design Consultation', description: 'Initial concept meeting', price: 150.00, duration: 90 },
            { name: 'Room Redesign', description: 'Complete room transformation', price: 2500.00, duration: 0 },
            { name: 'Kitchen Renovation', description: 'Full kitchen remodel', price: 15000.00, duration: 0 },
            { name: 'Home Staging', description: 'For property sale', price: 500.00, duration: 0 },
        ],
    },

    // ============================================================================
    // TOKYO, JAPAN
    // ============================================================================
    {
        name: 'Shibuya Tech Lab',
        description: 'Cutting-edge electronics repair in Shibuya. Specialists in smartphone, laptop, and gaming console repairs. English-speaking staff available.',
        tagline: 'Technology perfected',
        categorySlug: 'electronics-repair',
        address: {
            line1: '21-1 Udagawacho',
            city: 'Tokyo',
            state: 'Shibuya',
            zipCode: '150-0042',
            country: 'Japan',
            lat: 35.6595,
            lng: 139.6999,
        },
        phone: '+81354551234',
        priceRange: 'MODERATE',
        hours: {
            monday: { open: '10:00', close: '21:00' },
            tuesday: { open: '10:00', close: '21:00' },
            wednesday: { open: '10:00', close: '21:00' },
            thursday: { open: '10:00', close: '21:00' },
            friday: { open: '10:00', close: '22:00' },
            saturday: { open: '10:00', close: '22:00' },
            sunday: { open: '11:00', close: '20:00' },
        },
        services: [
            { name: 'iPhone Screen Repair', description: 'Same-day service', price: 12000, duration: 30 },
            { name: 'Nintendo Switch Repair', description: 'Joy-Con drift fix', price: 5000, duration: 45 },
            { name: 'Laptop Screen Replacement', description: 'All brands', price: 18000, duration: 60 },
            { name: 'PS5 Cleaning Service', description: 'Dust removal & thermal paste', price: 8000, duration: 60 },
        ],
    },
    {
        name: 'Ginza Wellness Spa',
        description: 'Traditional Japanese spa experience in Ginza. Onsen-inspired treatments, shiatsu massage, and rejuvenating therapies in a serene setting.',
        tagline: 'Find your inner peace',
        categorySlug: 'beauty-wellness',
        address: {
            line1: '4-6-16 Ginza',
            city: 'Tokyo',
            state: 'Chuo',
            zipCode: '104-0061',
            country: 'Japan',
            lat: 35.6721,
            lng: 139.7636,
        },
        phone: '+81335551234',
        website: 'https://ginzawellness.jp',
        priceRange: 'EXPENSIVE',
        hours: {
            monday: { open: '10:00', close: '22:00' },
            tuesday: { open: '10:00', close: '22:00' },
            wednesday: { open: '10:00', close: '22:00' },
            thursday: { open: '10:00', close: '22:00' },
            friday: { open: '10:00', close: '23:00' },
            saturday: { open: '09:00', close: '23:00' },
            sunday: { open: '09:00', close: '21:00' },
        },
        services: [
            { name: 'Shiatsu Massage', description: 'Traditional pressure point therapy', price: 15000, duration: 60 },
            { name: 'Facial Treatment', description: 'Japanese skincare ritual', price: 18000, duration: 75 },
            { name: 'Full Body Aromatherapy', description: 'Relaxing oil massage', price: 20000, duration: 90 },
            { name: 'Couples Package', description: 'Shared relaxation experience', price: 35000, duration: 120 },
        ],
    },
    {
        name: 'Harajuku Pet Paradise',
        description: 'Premium pet grooming and care services in Harajuku. Dog and cat grooming, pet hotel, and accessories shop. We treat your pets like family.',
        tagline: 'Pawsitively perfect',
        categorySlug: 'pet-services',
        address: {
            line1: '1-14-30 Jingumae',
            city: 'Tokyo',
            state: 'Shibuya',
            zipCode: '150-0001',
            country: 'Japan',
            lat: 35.6702,
            lng: 139.7025,
        },
        phone: '+81364551234',
        priceRange: 'MODERATE',
        hours: {
            monday: { open: '10:00', close: '19:00' },
            tuesday: { open: '10:00', close: '19:00' },
            wednesday: { closed: true },
            thursday: { open: '10:00', close: '19:00' },
            friday: { open: '10:00', close: '19:00' },
            saturday: { open: '09:00', close: '18:00' },
            sunday: { open: '09:00', close: '18:00' },
        },
        services: [
            { name: 'Small Dog Grooming', description: 'Bath, cut & nail trim', price: 6000, duration: 90 },
            { name: 'Large Dog Grooming', description: 'Full grooming service', price: 10000, duration: 120 },
            { name: 'Cat Grooming', description: 'Gentle care for cats', price: 8000, duration: 60 },
            { name: 'Pet Hotel (per night)', description: 'Overnight care', price: 5000, duration: 0 },
        ],
    },

    // ============================================================================
    // PARIS, FRANCE
    // ============================================================================
    {
        name: 'Le Marais Café',
        description: 'Charming Parisian café in the historic Le Marais district. Artisan coffee, fresh croissants, and French pastries. Perfect for people-watching.',
        tagline: "L'art de vivre",
        categorySlug: 'food-dining',
        address: {
            line1: '35 Rue des Francs Bourgeois',
            city: 'Paris',
            state: 'Île-de-France',
            zipCode: '75004',
            country: 'France',
            lat: 48.8566,
            lng: 2.3609,
        },
        phone: '+33142551234',
        priceRange: 'MODERATE',
        hours: {
            monday: { open: '07:30', close: '19:00' },
            tuesday: { open: '07:30', close: '19:00' },
            wednesday: { open: '07:30', close: '19:00' },
            thursday: { open: '07:30', close: '19:00' },
            friday: { open: '07:30', close: '20:00' },
            saturday: { open: '08:00', close: '20:00' },
            sunday: { open: '08:00', close: '18:00' },
        },
        services: [
            { name: 'Espresso', description: 'Italian-style coffee', price: 2.50, duration: 5 },
            { name: 'Croissant', description: 'Fresh baked daily', price: 2.00, duration: 0 },
            { name: 'Petit Déjeuner', description: 'Complete breakfast', price: 12.00, duration: 30 },
            { name: 'Lunch Formule', description: 'Main + dessert', price: 18.00, duration: 45 },
        ],
    },
    {
        name: 'Atelier Beauté Paris',
        description: 'Exclusive beauty salon on the Champs-Élysées. French beauty expertise with the latest techniques. Hair styling, makeup, and skincare by master artists.',
        tagline: 'La beauté à la française',
        categorySlug: 'beauty-wellness',
        address: {
            line1: '92 Avenue des Champs-Élysées',
            city: 'Paris',
            state: 'Île-de-France',
            zipCode: '75008',
            country: 'France',
            lat: 48.8716,
            lng: 2.3026,
        },
        phone: '+33153551234',
        website: 'https://atelierbeauteparis.fr',
        priceRange: 'EXPENSIVE',
        hours: {
            monday: { closed: true },
            tuesday: { open: '10:00', close: '19:00' },
            wednesday: { open: '10:00', close: '19:00' },
            thursday: { open: '10:00', close: '20:00' },
            friday: { open: '10:00', close: '20:00' },
            saturday: { open: '09:00', close: '19:00' },
            sunday: { closed: true },
        },
        services: [
            { name: 'Coupe Femme', description: 'Women haircut & styling', price: 95.00, duration: 60 },
            { name: 'Coloration', description: 'Professional hair color', price: 120.00, duration: 90 },
            { name: 'Maquillage Jour', description: 'Daytime makeup', price: 75.00, duration: 45 },
            { name: 'Soin Visage Premium', description: 'Luxury facial', price: 150.00, duration: 75 },
        ],
    },
    {
        name: 'Paris Piano Academy',
        description: 'Premier music school in the 16th arrondissement. Piano, violin, and voice lessons for all ages and levels. Conservatory-trained instructors.',
        tagline: 'Discover your musical soul',
        categorySlug: 'education-tutoring',
        address: {
            line1: '28 Avenue Foch',
            city: 'Paris',
            state: 'Île-de-France',
            zipCode: '75116',
            country: 'France',
            lat: 48.8711,
            lng: 2.2845,
        },
        phone: '+33145551234',
        website: 'https://parispianoacademy.fr',
        priceRange: 'MODERATE',
        hours: {
            monday: { open: '09:00', close: '21:00' },
            tuesday: { open: '09:00', close: '21:00' },
            wednesday: { open: '09:00', close: '21:00' },
            thursday: { open: '09:00', close: '21:00' },
            friday: { open: '09:00', close: '20:00' },
            saturday: { open: '09:00', close: '18:00' },
            sunday: { closed: true },
        },
        services: [
            { name: 'Piano Lesson', description: 'Private 1-on-1 instruction', price: 65.00, duration: 60 },
            { name: 'Violin Lesson', description: 'All levels welcome', price: 70.00, duration: 60 },
            { name: 'Voice Training', description: 'Classical & contemporary', price: 60.00, duration: 45 },
            { name: 'Trial Lesson', description: 'First lesson discount', price: 30.00, duration: 30 },
        ],
    },

    // ============================================================================
    // SYDNEY, AUSTRALIA
    // ============================================================================
    {
        name: 'Bondi Beach Fitness',
        description: 'Outdoor fitness training with ocean views. Beach bootcamps, surfing lessons, and personal training. Train like a true Aussie!',
        tagline: 'Fit by the sea',
        categorySlug: 'fitness-health',
        address: {
            line1: '180 Campbell Parade',
            city: 'Sydney',
            state: 'NSW',
            zipCode: '2026',
            country: 'Australia',
            lat: -33.8908,
            lng: 151.2743,
        },
        phone: '+61293551234',
        website: 'https://bondibeachfitness.com.au',
        priceRange: 'MODERATE',
        hours: {
            monday: { open: '05:30', close: '19:00' },
            tuesday: { open: '05:30', close: '19:00' },
            wednesday: { open: '05:30', close: '19:00' },
            thursday: { open: '05:30', close: '19:00' },
            friday: { open: '05:30', close: '18:00' },
            saturday: { open: '06:00', close: '17:00' },
            sunday: { open: '07:00', close: '16:00' },
        },
        services: [
            { name: 'Beach Bootcamp', description: 'Group fitness on the sand', price: 30.00, duration: 45 },
            { name: 'Personal Training', description: '1-on-1 beach session', price: 90.00, duration: 60 },
            { name: 'Surf Lesson', description: 'Learn to ride waves', price: 80.00, duration: 90 },
            { name: 'Sunrise Yoga', description: 'Ocean-side meditation', price: 25.00, duration: 60 },
        ],
    },
    {
        name: 'Sydney Harbour Cruises',
        description: 'Luxury boat charters and harbour cruises. Private events, corporate functions, and romantic sunset cruises with stunning Opera House views.',
        tagline: 'Sail into the sunset',
        categorySlug: 'professional-services',
        address: {
            line1: '6 Circular Quay West',
            city: 'Sydney',
            state: 'NSW',
            zipCode: '2000',
            country: 'Australia',
            lat: -33.8568,
            lng: 151.2093,
        },
        phone: '+61292551234',
        website: 'https://sydneyharbourcruises.com.au',
        priceRange: 'EXPENSIVE',
        hours: {
            monday: { open: '09:00', close: '21:00' },
            tuesday: { open: '09:00', close: '21:00' },
            wednesday: { open: '09:00', close: '21:00' },
            thursday: { open: '09:00', close: '21:00' },
            friday: { open: '09:00', close: '23:00' },
            saturday: { open: '08:00', close: '23:00' },
            sunday: { open: '08:00', close: '21:00' },
        },
        services: [
            { name: 'Sunset Cruise', description: '2-hour harbour experience', price: 150.00, duration: 120 },
            { name: 'Private Charter (4hr)', description: 'Exclusive boat hire', price: 1500.00, duration: 240 },
            { name: 'Lunch Cruise', description: 'Dining on the water', price: 120.00, duration: 90 },
            { name: 'Fireworks Cruise', description: 'Special events', price: 200.00, duration: 180 },
        ],
    },
    {
        name: 'Surry Hills Vet Clinic',
        description: 'Compassionate veterinary care in inner Sydney. Full medical services, surgery, dental care, and emergency treatment. We love your pets as much as you do.',
        tagline: 'Caring for your family',
        categorySlug: 'pet-services',
        address: {
            line1: '456 Crown Street',
            city: 'Sydney',
            state: 'NSW',
            zipCode: '2010',
            country: 'Australia',
            lat: -33.8858,
            lng: 151.2123,
        },
        phone: '+61291551234',
        website: 'https://surryhillsvet.com.au',
        priceRange: 'MODERATE',
        hours: {
            monday: { open: '08:00', close: '19:00' },
            tuesday: { open: '08:00', close: '19:00' },
            wednesday: { open: '08:00', close: '19:00' },
            thursday: { open: '08:00', close: '19:00' },
            friday: { open: '08:00', close: '18:00' },
            saturday: { open: '09:00', close: '14:00' },
            sunday: { closed: true },
        },
        services: [
            { name: 'Health Check', description: 'Complete examination', price: 85.00, duration: 30 },
            { name: 'Vaccination', description: 'Core vaccines', price: 120.00, duration: 20 },
            { name: 'Dental Cleaning', description: 'Professional cleaning', price: 350.00, duration: 90 },
            { name: 'Desexing', description: 'Spay/neuter surgery', price: 450.00, duration: 60 },
        ],
    },

    // ============================================================================
    // DUBAI, UAE
    // ============================================================================
    {
        name: 'Dubai Marina Auto Spa',
        description: 'Luxury car detailing and maintenance in Dubai Marina. Premium wash, ceramic coating, and interior restoration. VIP collection & delivery available.',
        tagline: 'Perfection in every detail',
        categorySlug: 'automotive',
        address: {
            line1: 'Marina Walk, Tower 1',
            city: 'Dubai',
            state: 'Dubai',
            zipCode: '',
            country: 'UAE',
            lat: 25.0760,
            lng: 55.1408,
        },
        phone: '+97145551234',
        website: 'https://dubaimarinaautospa.ae',
        priceRange: 'EXPENSIVE',
        hours: {
            monday: { open: '08:00', close: '20:00' },
            tuesday: { open: '08:00', close: '20:00' },
            wednesday: { open: '08:00', close: '20:00' },
            thursday: { open: '08:00', close: '20:00' },
            friday: { open: '14:00', close: '20:00' },
            saturday: { open: '08:00', close: '20:00' },
            sunday: { open: '08:00', close: '20:00' },
        },
        services: [
            { name: 'Premium Wash', description: 'Hand wash & wax', price: 150.00, duration: 60 },
            { name: 'Full Detail', description: 'Interior & exterior', price: 500.00, duration: 240 },
            { name: 'Ceramic Coating', description: '3-year protection', price: 2500.00, duration: 480 },
            { name: 'Paint Correction', description: 'Scratch removal', price: 1000.00, duration: 360 },
        ],
    },
    {
        name: 'JBR Home Maintenance',
        description: 'Professional home maintenance and repair services in Jumeirah Beach Residence. AC repair, plumbing, electrical, and handyman services. Same-day response.',
        tagline: 'Your home, our priority',
        categorySlug: 'home-services',
        address: {
            line1: 'JBR Walk, Rimal Tower',
            city: 'Dubai',
            state: 'Dubai',
            zipCode: '',
            country: 'UAE',
            lat: 25.0766,
            lng: 55.1329,
        },
        phone: '+97144551234',
        priceRange: 'MODERATE',
        hours: {
            monday: { open: '08:00', close: '18:00' },
            tuesday: { open: '08:00', close: '18:00' },
            wednesday: { open: '08:00', close: '18:00' },
            thursday: { open: '08:00', close: '18:00' },
            friday: { open: '09:00', close: '17:00' },
            saturday: { open: '09:00', close: '17:00' },
            sunday: { open: '08:00', close: '18:00' },
        },
        services: [
            { name: 'AC Service', description: 'Cleaning & maintenance', price: 150.00, duration: 60 },
            { name: 'Plumbing Repair', description: 'Leaks & blockages', price: 200.00, duration: 60 },
            { name: 'Electrical Work', description: 'Fixes & installations', price: 180.00, duration: 60 },
            { name: 'Handyman (per hour)', description: 'General repairs', price: 100.00, duration: 60 },
        ],
    },
    {
        name: 'Downtown Dubai Legal',
        description: 'Full-service law firm in Downtown Dubai. Corporate law, real estate, immigration, and personal injury. Multilingual team serving international clients.',
        tagline: 'Excellence in law',
        categorySlug: 'professional-services',
        address: {
            line1: 'Burj Khalifa Boulevard, Tower 2',
            city: 'Dubai',
            state: 'Dubai',
            zipCode: '',
            country: 'UAE',
            lat: 25.1972,
            lng: 55.2744,
        },
        phone: '+97143551234',
        website: 'https://downtowndubailegal.ae',
        priceRange: 'EXPENSIVE',
        hours: {
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '18:00' },
            friday: { closed: true },
            saturday: { open: '10:00', close: '14:00' },
            sunday: { open: '09:00', close: '18:00' },
        },
        services: [
            { name: 'Legal Consultation', description: 'Initial case review', price: 500.00, duration: 60 },
            { name: 'Contract Review', description: 'Document analysis', price: 1000.00, duration: 0 },
            { name: 'Visa Assistance', description: 'Immigration support', price: 2000.00, duration: 0 },
            { name: 'Company Formation', description: 'Business setup', price: 5000.00, duration: 0 },
        ],
    },

    // ============================================================================
    // SAN FRANCISCO, USA
    // ============================================================================
    {
        name: 'Mission District Coffee',
        description: 'Specialty coffee roasters in the heart of the Mission. Single-origin beans, pour-over, and espresso drinks. Cozy workspace with free WiFi.',
        tagline: 'Coffee with character',
        categorySlug: 'food-dining',
        address: {
            line1: '2299 Mission Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94110',
            country: 'USA',
            lat: 37.7599,
            lng: -122.4185,
        },
        phone: '+14155559999',
        priceRange: 'BUDGET',
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
            { name: 'Pour Over', description: 'Single origin', price: 5.50, duration: 5 },
            { name: 'Latte', description: 'Espresso + steamed milk', price: 5.00, duration: 3 },
            { name: 'Cold Brew', description: '16-hour steep', price: 5.00, duration: 2 },
            { name: 'Pastry', description: 'Fresh baked daily', price: 4.00, duration: 0 },
        ],
    },
    {
        name: 'SOMA Tech Solutions',
        description: 'Business IT support and consulting in South of Market. Network setup, cloud migration, cybersecurity, and 24/7 support for startups and enterprises.',
        tagline: 'Tech that works',
        categorySlug: 'professional-services',
        address: {
            line1: '600 Townsend Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94103',
            country: 'USA',
            lat: 37.7706,
            lng: -122.4016,
        },
        phone: '+14155558888',
        website: 'https://somatechsolutions.com',
        priceRange: 'MODERATE',
        hours: {
            monday: { open: '08:00', close: '18:00' },
            tuesday: { open: '08:00', close: '18:00' },
            wednesday: { open: '08:00', close: '18:00' },
            thursday: { open: '08:00', close: '18:00' },
            friday: { open: '08:00', close: '17:00' },
            saturday: { closed: true },
            sunday: { closed: true },
        },
        services: [
            { name: 'IT Consultation', description: 'Business assessment', price: 150.00, duration: 60 },
            { name: 'Network Setup', description: 'Office infrastructure', price: 500.00, duration: 240 },
            { name: 'Cloud Migration', description: 'Move to cloud', price: 2000.00, duration: 0 },
            { name: 'Monthly Support', description: 'Ongoing IT support', price: 500.00, duration: 0 },
        ],
    },
    {
        name: 'Pacific Heights Tutoring',
        description: 'Private tutoring for K-12 and test prep. SAT, ACT, and AP exam specialists. Experienced teachers from top universities. In-home and online sessions.',
        tagline: 'Unlock your potential',
        categorySlug: 'education-tutoring',
        address: {
            line1: '2400 Fillmore Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94115',
            country: 'USA',
            lat: 37.7906,
            lng: -122.4340,
        },
        phone: '+14155557777',
        website: 'https://pacificheightstutoring.com',
        priceRange: 'EXPENSIVE',
        hours: {
            monday: { open: '09:00', close: '20:00' },
            tuesday: { open: '09:00', close: '20:00' },
            wednesday: { open: '09:00', close: '20:00' },
            thursday: { open: '09:00', close: '20:00' },
            friday: { open: '09:00', close: '18:00' },
            saturday: { open: '10:00', close: '16:00' },
            sunday: { closed: true },
        },
        services: [
            { name: 'Math Tutoring', description: 'All levels', price: 100.00, duration: 60 },
            { name: 'SAT Prep', description: 'Test strategies', price: 125.00, duration: 90 },
            { name: 'Essay Coaching', description: 'College applications', price: 150.00, duration: 60 },
            { name: 'Academic Assessment', description: 'Learning evaluation', price: 200.00, duration: 90 },
        ],
    },
];

async function main() {
    console.log('🌍 Seeding realistic businesses with worldwide addresses...\n');

    // Get test password
    const testPassword = 'Tarsit1234!';
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Get existing categories
    const categories = await prisma.category.findMany();
    console.log(`📂 Found ${categories.length} categories\n`);

    if (categories.length === 0) {
        console.error('❌ No categories found. Run the main seed first!');
        process.exit(1);
    }

    // Create business owners for new businesses
    console.log('👥 Creating business owners...');
    const businessOwners = await Promise.all(
        businessTemplates.map((_, i) =>
            prisma.user.upsert({
                where: { email: `worldowner${i + 1}@tarsit.com` },
                update: {},
                create: {
                    email: `worldowner${i + 1}@tarsit.com`,
                    phone: `+1555${String(i + 100).padStart(7, '0')}`,
                    passwordHash: hashedPassword,
                    firstName: `Owner`,
                    lastName: `${i + 1}`,
                    role: 'BUSINESS_OWNER',
                    verified: true,
                },
            })
        )
    );
    console.log(`✅ Created ${businessOwners.length} business owners\n`);

    // Create businesses
    console.log('🏢 Creating businesses...');
    let created = 0;
    let skipped = 0;

    for (let i = 0; i < businessTemplates.length; i++) {
        const template = businessTemplates[i];
        const owner = businessOwners[i];

        // Find category
        const category = categories.find(c => c.slug === template.categorySlug);
        if (!category) {
            console.log(`⚠️  Skipping ${template.name} - category ${template.categorySlug} not found`);
            skipped++;
            continue;
        }

        // Generate slug
        const slug = template.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        // Check if business exists
        const existing = await prisma.business.findUnique({ where: { slug } });
        if (existing) {
            console.log(`⏭️  Skipping ${template.name} - already exists`);
            skipped++;
            continue;
        }

        // Create business with services
        await prisma.business.create({
            data: {
                name: template.name,
                slug,
                description: template.description,
                tagline: template.tagline,
                categoryId: category.id,
                ownerId: owner.id,
                addressLine1: template.address.line1,
                city: template.address.city,
                state: template.address.state,
                zipCode: template.address.zipCode,
                country: template.address.country,
                latitude: template.address.lat,
                longitude: template.address.lng,
                phone: template.phone,
                website: template.website,
                priceRange: template.priceRange,
                verified: true,
                active: true,
                rating: 4.0 + Math.random() * 0.9, // 4.0-4.9
                reviewCount: Math.floor(Math.random() * 100) + 10,
                appointmentsEnabled: true,
                appointmentDuration: 30,
                advanceBookingDays: 30,
                hours: template.hours,
                services: {
                    create: template.services.map((service, idx) => ({
                        name: service.name,
                        description: service.description,
                        price: service.price,
                        duration: service.duration,
                        order: idx,
                        bookable: service.duration > 0,
                    })),
                },
            },
        });

        console.log(`✅ Created: ${template.name} (${template.address.city}, ${template.address.country})`);
        created++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${created} businesses`);
    console.log(`   Skipped: ${skipped} businesses`);
    console.log(`\n🎉 Seeding complete!\n`);

    // Show locations summary
    console.log('🗺️  Business locations:');
    const locations = new Map<string, number>();
    for (const template of businessTemplates) {
        const key = `${template.address.city}, ${template.address.country}`;
        locations.set(key, (locations.get(key) || 0) + 1);
    }
    for (const [location, count] of locations) {
        console.log(`   ${location}: ${count} businesses`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
