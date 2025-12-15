#!/usr/bin/env node

/**
 * Tarsit Backend Comprehensive Testing Suite
 * Tests every API endpoint, database operation, and functionality
 */

require('ts-node/register/transpile-only');
const dotenv = require('dotenv');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../apps/api/.env') });

const API_URL = process.env.API_URL || 'http://localhost:4000/api';
// Use production database for real-time testing
const TEST_DATABASE_URL = process.env.DATABASE_URL;

// Keep production database
process.env.DATABASE_URL = TEST_DATABASE_URL;

// Import test modules
const { createApiClient, runTest, expectStatus, expectData } = require('./utils/test-helpers');
const { createTestUsers, getExistingBusiness } = require('./utils/test-data');
const { createTestDatabase, setupTestDatabase, cleanupTestDatabase } = require('./config/test-database');
const { testAuth } = require('./tests/auth.test');
const { testBusinesses } = require('./tests/businesses.test');
const { testReviews } = require('./tests/reviews.test');
const { testSearch } = require('./tests/search.test');
const { testMessages } = require('./tests/messages.test');
const { testAppointments } = require('./tests/appointments.test');
const { testUploads } = require('./tests/uploads.test');
const { testAdmin } = require('./tests/admin.test');
const { testCategories } = require('./tests/categories.test');
const { testHealth } = require('./tests/health.test');
const { testFavorites } = require('./tests/favorites.test');
const { testServices } = require('./tests/services.test');

// Set test database URL for Prisma
process.env.DATABASE_URL = TEST_DATABASE_URL;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function printHeader() {
  console.log('\n');
  log('╔══════════════════════════════════════════════════════════════╗', colors.cyan);
  log('║         TARSIT BACKEND COMPREHENSIVE TESTING SUITE          ║', colors.cyan);
  log('╚══════════════════════════════════════════════════════════════╝', colors.cyan);
  console.log();
  log(`API URL: ${API_URL}`, colors.gray);
  const dbUrl = TEST_DATABASE_URL || 'Not configured';
  const maskedUrl = dbUrl === 'Not configured' ? dbUrl : dbUrl.replace(/:[^:@]+@/, ':****@');
  log(`Test Database: ${maskedUrl}`, colors.gray);
  console.log();
}

function printTestResult(result, index, total) {
  const icon = result.passed ? '✓' : '✗';
  const color = result.passed ? colors.green : colors.red;
  const status = result.passed ? 'PASS' : 'FAIL';
  const duration = `${result.duration}ms`;
  
  log(`  [${index}/${total}] ${icon} ${result.name}`, color);
  log(`      ${status} (${duration})`, colors.gray);
  
  if (!result.passed && result.error) {
    log(`      Error: ${result.error}`, colors.red);
    if (result.details) {
      const detailsStr = typeof result.details === 'string' 
        ? result.details 
        : JSON.stringify(result.details, null, 2);
      log(`      Details: ${detailsStr.substring(0, 200)}`, colors.yellow);
    }
  }
}

function printSuiteSummary(suite) {
  const passRate = ((suite.passed / suite.tests.length) * 100).toFixed(1);
  const color = suite.failed === 0 ? colors.green : colors.red;
  
  log(`\n${suite.name}:`, colors.cyan);
  log(`  Tests: ${suite.tests.length} | Passed: ${suite.passed} | Failed: ${suite.failed} | ${passRate}%`, color);
  log(`  Duration: ${suite.duration}ms`, colors.gray);
}

function printFinalSummary(summary) {
  console.log('\n');
  log('╔══════════════════════════════════════════════════════════════╗', colors.cyan);
  log('║                      TEST SUMMARY                            ║', colors.cyan);
  log('╚══════════════════════════════════════════════════════════════╝', colors.cyan);
  console.log();
  
  const passRate = ((summary.passed / summary.totalTests) * 100).toFixed(1);
  const color = summary.failed === 0 ? colors.green : colors.red;
  
  log(`Total Tests: ${summary.totalTests}`, colors.cyan);
  log(`Passed: ${summary.passed}`, colors.green);
  log(`Failed: ${summary.failed}`, summary.failed > 0 ? colors.red : colors.green);
  log(`Pass Rate: ${passRate}%`, color);
  log(`Total Duration: ${summary.duration}ms`, colors.gray);
  console.log();
  
  // Print suite summaries
  summary.suites.forEach(suite => {
    printSuiteSummary(suite);
  });
  
  // Print failed tests
  if (summary.failed > 0) {
    console.log();
    log('Failed Tests:', colors.red);
    summary.suites.forEach(suite => {
      suite.tests.filter(t => !t.passed).forEach(test => {
        log(`  ✗ ${test.name}`, colors.red);
        if (test.error) {
          log(`    ${test.error}`, colors.yellow);
        }
      });
    });
  }
  
  console.log();
  
  if (summary.failed === 0) {
    log('🎉 All tests passed! Backend is fully functional.', colors.green);
    process.exit(0);
  } else {
    log(`⚠️  ${summary.failed} test(s) failed. Please review the errors above.`, colors.red);
    process.exit(1);
  }
}

async function main() {
  printHeader();
  
  const startTime = Date.now();
  const prisma = createTestDatabase();
  const api = createApiClient(API_URL);
  
  // Test context
  const context = {
    api,
    prisma,
    tokens: {},
    testData: {
      userIds: [],
      businessIds: [],
      reviewIds: [],
      messageIds: [],
      appointmentIds: [],
    },
  };
  
  try {
    // Skip test database setup - using production database
    log('Using production database for tests...', colors.blue);
    
  // Create test users
  log('Creating test users...', colors.blue);
  try {
    const testUsers = await createTestUsers(prisma, api);
    context.tokens.customerToken = testUsers.customer.token;
    context.tokens.businessOwnerToken = testUsers.businessOwner.token;
    if (testUsers.admin.token) {
      context.tokens.adminToken = testUsers.admin.token;
    }
    context.testData.userIds.push(
      testUsers.customer.id,
      testUsers.businessOwner.id,
    );
    if (testUsers.admin.id) {
      context.testData.userIds.push(testUsers.admin.id);
    }
    context.testData.businessIds.push(testUsers.businessOwner.businessId);
    log('✓ Test users created', colors.green);
  } catch (error) {
    log(`⚠️  Could not create test users: ${error.message}`, colors.yellow);
    log('   Some tests may be skipped', colors.yellow);
  }
    
    // Define test suites
    const testSuites = [
      { name: 'Health Checks', testFn: () => testHealth(context) },
      { name: 'Categories', testFn: () => testCategories(context) },
      { name: 'Authentication', testFn: () => testAuth(context) },
      { name: 'Businesses', testFn: () => testBusinesses(context) },
      { name: 'Search', testFn: () => testSearch(context) },
      { name: 'Reviews', testFn: () => testReviews(context) },
      { name: 'Messages & Chats', testFn: () => testMessages(context) },
      { name: 'Appointments', testFn: () => testAppointments(context) },
      { name: 'Favorites', testFn: () => testFavorites(context) },
      { name: 'Services', testFn: () => testServices(context) },
      { name: 'Uploads', testFn: () => testUploads(context) },
      { name: 'Admin', testFn: () => testAdmin(context) },
    ];
    
    const suites = [];
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    
    // Run each test suite
    for (const suite of testSuites) {
      log(`\nRunning ${suite.name} tests...`, colors.blue);
      const suiteStart = Date.now();
      
      try {
        const results = await suite.testFn();
        const suiteDuration = Date.now() - suiteStart;
        const passed = results.filter(r => r.passed).length;
        const failed = results.filter(r => !r.passed).length;
        
        results.forEach((result, index) => {
          printTestResult(result, index + 1, results.length);
        });
        
        suites.push({
          name: suite.name,
          tests: results,
          passed,
          failed,
          duration: suiteDuration,
        });
        
        totalTests += results.length;
        totalPassed += passed;
        totalFailed += failed;
      } catch (error) {
        log(`✗ Suite failed: ${error.message}`, colors.red);
        suites.push({
          name: suite.name,
          tests: [],
          passed: 0,
          failed: 1,
          duration: 0,
        });
        totalFailed++;
      }
    }
    
    // Cleanup test data
    log('\nCleaning up test data...', colors.blue);
    await cleanupTestDatabase(prisma, context.testData);
    
    // Print final summary
    const totalDuration = Date.now() - startTime;
    const summary = {
      totalTests,
      passed: totalPassed,
      failed: totalFailed,
      duration: totalDuration,
      suites,
    };
    
    printFinalSummary(summary);
    
  } catch (error) {
    log(`\n✗ Fatal error: ${error.message}`, colors.red);
    if (error.stack) {
      log(error.stack, colors.yellow);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
main().catch(error => {
  log(`\n✗ Unhandled error: ${error.message}`, colors.red);
  process.exit(1);
});
