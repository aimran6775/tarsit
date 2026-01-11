/**
 * Global Features Test Script
 * Tests all internationalization features: regions, languages, currencies, Tars AI
 * 
 * Usage: npx ts-node scripts/test-global-features.ts
 */

const API_URL = process.env.API_URL || 'http://localhost:4001/api';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    results.push({
      name,
      passed: true,
      message: '✓ Passed',
      duration: Date.now() - start,
    });
    console.log(`✅ ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({
      name,
      passed: false,
      message: `✗ Failed: ${message}`,
      duration: Date.now() - start,
    });
    console.log(`❌ ${name}: ${message}`);
  }
}

async function fetchJSON(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// ============================================
// REGION TESTS
// ============================================

async function testRegions() {
  console.log('\n📍 REGION TESTS\n');

  await runTest('GET /regions - List all regions', async () => {
    const data = await fetchJSON('/regions');
    if (!data.regions || data.regions.length === 0) {
      throw new Error('No regions returned');
    }
    console.log(`   Found ${data.regions.length} regions`);
  });

  await runTest('GET /regions/with-counts - Regions with business counts', async () => {
    const data = await fetchJSON('/regions/with-counts');
    if (!data.regions) {
      throw new Error('No regions returned');
    }
    const withBusinesses = data.regions.filter((r: any) => r.businessCount > 0);
    console.log(`   ${withBusinesses.length} regions have businesses`);
  });

  await runTest('GET /regions/detect - IP-based region detection', async () => {
    const data = await fetchJSON('/regions/detect');
    if (!data.regionCode) {
      throw new Error('No region detected');
    }
    console.log(`   Detected region: ${data.regionCode} (${data.region?.name || 'Unknown'})`);
  });

  await runTest('GET /regions/AE - Get specific region', async () => {
    const data = await fetchJSON('/regions/AE');
    if (data.code !== 'AE') {
      throw new Error('Wrong region returned');
    }
    console.log(`   UAE: ${data.name}, Currency: ${data.currency?.code}`);
  });

  await runTest('GET /regions/AE/languages - Region languages', async () => {
    const data = await fetchJSON('/regions/AE/languages');
    if (!data.languages || data.languages.length === 0) {
      throw new Error('No languages returned');
    }
    console.log(`   UAE supports: ${data.languages.map((l: any) => l.code).join(', ')}`);
  });

  await runTest('GET /regions/US/featured - Featured businesses', async () => {
    const data = await fetchJSON('/regions/US/featured?limit=3');
    console.log(`   ${data.total} featured businesses in US`);
  });

  await runTest('GET /regions/US/popular-categories - Popular categories', async () => {
    const data = await fetchJSON('/regions/US/popular-categories?limit=5');
    console.log(`   ${data.total} popular categories in US`);
  });

  await runTest('GET /regions/US/stats - Region statistics', async () => {
    const data = await fetchJSON('/regions/US/stats');
    console.log(`   US: ${data.stats?.totalBusinesses || 0} businesses, ${data.stats?.totalReviews || 0} reviews`);
  });
}

// ============================================
// CURRENCY TESTS
// ============================================

async function testCurrencies() {
  console.log('\n💰 CURRENCY TESTS\n');

  await runTest('GET /currencies - List all currencies', async () => {
    const data = await fetchJSON('/currencies');
    if (!data.currencies || data.currencies.length === 0) {
      throw new Error('No currencies returned');
    }
    console.log(`   Found ${data.currencies.length} currencies`);
  });

  await runTest('GET /currencies/convert - Convert USD to AED', async () => {
    const data = await fetchJSON('/currencies/convert?from=USD&to=AED&amount=100');
    if (typeof data.convertedAmount !== 'number') {
      throw new Error('No converted amount');
    }
    console.log(`   $100 USD = ${data.convertedAmount.toFixed(2)} AED`);
  });

  await runTest('GET /currencies/AED - Get specific currency', async () => {
    const data = await fetchJSON('/currencies/AED');
    if (data.code !== 'AED') {
      throw new Error('Wrong currency returned');
    }
    console.log(`   AED: ${data.name}, Symbol: ${data.symbol}`);
  });
}

// ============================================
// SEARCH WITH REGION TESTS
// ============================================

async function testRegionalSearch() {
  console.log('\n🔍 REGIONAL SEARCH TESTS\n');

  await runTest('GET /search with X-Region-Code header', async () => {
    const data = await fetchJSON('/search?q=restaurant', {
      headers: {
        'X-Region-Code': 'AE',
        'X-Language-Code': 'en',
      },
    });
    console.log(`   Found ${data.total || 0} results`);
  });

  await runTest('GET /search/trending with region', async () => {
    const data = await fetchJSON('/search/trending', {
      headers: {
        'X-Region-Code': 'US',
      },
    });
    console.log(`   ${data.businesses?.length || 0} trending businesses`);
  });
}

// ============================================
// TARS AI TESTS
// ============================================

async function testTarsAI() {
  console.log('\n🤖 TARS AI LOCALIZATION TESTS\n');

  await runTest('POST /tars/chat - English response', async () => {
    const data = await fetchJSON('/tars/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
        sessionId: 'test-session-en',
        language: 'en',
      }),
    });
    if (!data.message) {
      throw new Error('No response message');
    }
    console.log(`   Response: "${data.message.substring(0, 50)}..."`);
  });

  await runTest('POST /tars/chat - Arabic response', async () => {
    const data = await fetchJSON('/tars/chat', {
      method: 'POST',
      headers: {
        'X-Language-Code': 'ar',
      },
      body: JSON.stringify({
        message: 'مرحبا',
        sessionId: 'test-session-ar',
        language: 'ar',
      }),
    });
    if (!data.message) {
      throw new Error('No response message');
    }
    // Check if response contains Arabic characters
    const hasArabic = /[\u0600-\u06FF]/.test(data.message);
    console.log(`   Response contains Arabic: ${hasArabic}`);
    console.log(`   Response: "${data.message.substring(0, 50)}..."`);
  });

  await runTest('POST /tars/chat - With region context', async () => {
    const data = await fetchJSON('/tars/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Find me a restaurant',
        sessionId: 'test-session-region',
        language: 'en',
        regionCode: 'AE',
      }),
    });
    if (!data.message) {
      throw new Error('No response message');
    }
    console.log(`   Response: "${data.message.substring(0, 60)}..."`);
  });
}

// ============================================
// TRANSLATION TESTS
// ============================================

async function testTranslations() {
  console.log('\n🌐 TRANSLATION API TESTS\n');

  await runTest('POST /translations/translate - English to Arabic', async () => {
    const data = await fetchJSON('/translations/translate', {
      method: 'POST',
      body: JSON.stringify({
        text: 'Welcome to our restaurant',
        targetLanguage: 'ar',
        sourceLanguage: 'en',
      }),
    });
    if (!data.translatedText) {
      throw new Error('No translation returned');
    }
    console.log(`   Translation: "${data.translatedText}"`);
  });

  await runTest('POST /translations/detect - Detect language', async () => {
    const data = await fetchJSON('/translations/detect', {
      method: 'POST',
      body: JSON.stringify({
        text: 'مرحبا بكم في مطعمنا',
      }),
    });
    if (!data.detectedLanguage) {
      throw new Error('Language not detected');
    }
    console.log(`   Detected: ${data.detectedLanguage} (confidence: ${data.confidence || 'N/A'})`);
  });
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('        TARSIT GLOBAL FEATURES TEST SUITE');
  console.log(`        API: ${API_URL}`);
  console.log('═══════════════════════════════════════════════════════');

  try {
    await testRegions();
    await testCurrencies();
    await testRegionalSearch();
    await testTarsAI();
    await testTranslations();
  } catch (error) {
    console.error('\n⚠️ Test suite error:', error);
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('                    TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalTime = results.reduce((acc, r) => acc + r.duration, 0);

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total time: ${totalTime}ms`);
  console.log(`📊 Success rate: ${((passed / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed tests:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`   - ${r.name}: ${r.message}`);
      });
  }

  console.log('\n═══════════════════════════════════════════════════════\n');

  // Exit with error code if any tests failed
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
