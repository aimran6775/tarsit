import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Currency data with exchange rates to USD (as of Jan 2026 - update periodically)
const currencies = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    exchangeRateToUSD: 1.0,
  },
  {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'د.إ',
    symbolPosition: 'before',
    decimalPlaces: 2,
    exchangeRateToUSD: 0.2723, // 1 AED = 0.27 USD
  },
  {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: '﷼',
    symbolPosition: 'before',
    decimalPlaces: 2,
    exchangeRateToUSD: 0.2667, // 1 SAR = 0.27 USD
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    symbolPosition: 'before',
    decimalPlaces: 2,
    exchangeRateToUSD: 1.27, // 1 GBP = 1.27 USD
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    symbolPosition: 'before',
    decimalPlaces: 2,
    exchangeRateToUSD: 1.09, // 1 EUR = 1.09 USD
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    exchangeRateToUSD: 0.74, // 1 CAD = 0.74 USD
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    exchangeRateToUSD: 0.65, // 1 AUD = 0.65 USD
  },
  {
    code: 'PKR',
    name: 'Pakistani Rupee',
    symbol: '₨',
    symbolPosition: 'before',
    decimalPlaces: 0, // Usually no decimals for PKR
    exchangeRateToUSD: 0.0036, // 1 PKR = 0.0036 USD
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    symbolPosition: 'before',
    decimalPlaces: 2,
    exchangeRateToUSD: 0.012, // 1 INR = 0.012 USD
  },
];

// Region data
const regions = [
  {
    code: 'AE',
    name: 'United Arab Emirates',
    nativeName: 'الإمارات العربية المتحدة',
    defaultLanguage: 'en',
    supportedLangs: ['en', 'ar'],
    currencyCode: 'AED',
    timezone: 'Asia/Dubai',
    isRTL: false, // Default to English (LTR), RTL applied when Arabic selected
    flagEmoji: '🇦🇪',
    phoneCode: '+971',
    order: 1,
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    nativeName: 'المملكة العربية السعودية',
    defaultLanguage: 'ar',
    supportedLangs: ['ar', 'en'],
    currencyCode: 'SAR',
    timezone: 'Asia/Riyadh',
    isRTL: true,
    flagEmoji: '🇸🇦',
    phoneCode: '+966',
    order: 2,
  },
  {
    code: 'US',
    name: 'United States',
    nativeName: 'United States',
    defaultLanguage: 'en',
    supportedLangs: ['en', 'es'],
    currencyCode: 'USD',
    timezone: 'America/New_York',
    isRTL: false,
    flagEmoji: '🇺🇸',
    phoneCode: '+1',
    order: 3,
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    nativeName: 'United Kingdom',
    defaultLanguage: 'en',
    supportedLangs: ['en'],
    currencyCode: 'GBP',
    timezone: 'Europe/London',
    isRTL: false,
    flagEmoji: '🇬🇧',
    phoneCode: '+44',
    order: 4,
  },
  {
    code: 'CA',
    name: 'Canada',
    nativeName: 'Canada',
    defaultLanguage: 'en',
    supportedLangs: ['en', 'fr'],
    currencyCode: 'CAD',
    timezone: 'America/Toronto',
    isRTL: false,
    flagEmoji: '🇨🇦',
    phoneCode: '+1',
    order: 5,
  },
  {
    code: 'AU',
    name: 'Australia',
    nativeName: 'Australia',
    defaultLanguage: 'en',
    supportedLangs: ['en'],
    currencyCode: 'AUD',
    timezone: 'Australia/Sydney',
    isRTL: false,
    flagEmoji: '🇦🇺',
    phoneCode: '+61',
    order: 6,
  },
  {
    code: 'DE',
    name: 'Germany',
    nativeName: 'Deutschland',
    defaultLanguage: 'de',
    supportedLangs: ['de', 'en'],
    currencyCode: 'EUR',
    timezone: 'Europe/Berlin',
    isRTL: false,
    flagEmoji: '🇩🇪',
    phoneCode: '+49',
    order: 7,
  },
  {
    code: 'FR',
    name: 'France',
    nativeName: 'France',
    defaultLanguage: 'fr',
    supportedLangs: ['fr', 'en'],
    currencyCode: 'EUR',
    timezone: 'Europe/Paris',
    isRTL: false,
    flagEmoji: '🇫🇷',
    phoneCode: '+33',
    order: 8,
  },
  {
    code: 'ES',
    name: 'Spain',
    nativeName: 'España',
    defaultLanguage: 'es',
    supportedLangs: ['es', 'en'],
    currencyCode: 'EUR',
    timezone: 'Europe/Madrid',
    isRTL: false,
    flagEmoji: '🇪🇸',
    phoneCode: '+34',
    order: 9,
  },
  {
    code: 'PK',
    name: 'Pakistan',
    nativeName: 'پاکستان',
    defaultLanguage: 'en',
    supportedLangs: ['en', 'ur'],
    currencyCode: 'PKR',
    timezone: 'Asia/Karachi',
    isRTL: false, // Default to English, RTL when Urdu selected
    flagEmoji: '🇵🇰',
    phoneCode: '+92',
    order: 10,
  },
  {
    code: 'IN',
    name: 'India',
    nativeName: 'भारत',
    defaultLanguage: 'en',
    supportedLangs: ['en', 'hi'],
    currencyCode: 'INR',
    timezone: 'Asia/Kolkata',
    isRTL: false,
    flagEmoji: '🇮🇳',
    phoneCode: '+91',
    order: 11,
  },
];

async function seedRegions() {
  console.log('🌍 Seeding currencies and regions...\n');

  // Create currencies first
  console.log('💰 Creating currencies...');
  const currencyMap: Record<string, string> = {};

  for (const currency of currencies) {
    const created = await prisma.currency.upsert({
      where: { code: currency.code },
      update: {
        ...currency,
        lastRateUpdate: new Date(),
      },
      create: {
        ...currency,
        lastRateUpdate: new Date(),
      },
    });
    currencyMap[currency.code] = created.id;
    console.log(`  ✓ ${currency.code} - ${currency.name} (${currency.symbol})`);
  }

  console.log('\n🗺️  Creating regions...');

  for (const region of regions) {
    const { currencyCode, ...regionData } = region;
    const currencyId = currencyMap[currencyCode];

    if (!currencyId) {
      console.error(`  ✗ Currency ${currencyCode} not found for region ${region.code}`);
      continue;
    }

    await prisma.region.upsert({
      where: { code: region.code },
      update: {
        ...regionData,
        currencyId,
      },
      create: {
        ...regionData,
        currencyId,
      },
    });
    console.log(`  ✓ ${region.flagEmoji} ${region.code} - ${region.name} (${currencyCode})`);
  }

  console.log('\n✅ Regions and currencies seeded successfully!');

  // Print summary
  const totalRegions = await prisma.region.count();
  const totalCurrencies = await prisma.currency.count();
  console.log(`\n📊 Summary:`);
  console.log(`   - ${totalCurrencies} currencies`);
  console.log(`   - ${totalRegions} regions`);
}

// Run if executed directly
seedRegions()
  .catch((e) => {
    console.error('Error seeding regions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { seedRegions };
