#!/usr/bin/env node

/**
 * Tarsit Backend Comprehensive Testing Suite
 * Tests every API endpoint, database operation, and functionality
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

// Import all test modules
import { testAuth } from './tests/auth.test.js';
import { testBusinesses } from './tests/businesses.test.js';
import { testReviews } from './tests/reviews.test.js';
import { testSearch } from './tests/search.test.js';
import { testMessages } from './tests/messages.test.js';
import { testAppointments } from './tests/appointments.test.js';
import { testUploads } from './tests/uploads.test.js';
import { testAdmin } from './tests/admin.test.js';
import { testCategories } from './tests/categories.test.js';
import { testHealth } from './tests/health.test.js';
import { testFavorites } from './tests/favorites.test.js';
import { testServices } from './tests/services.test.js';

// Import utilities
import { createApiClient } from './utils/test-helpers.js';
import { createTestDatabase, setupTestDatabase, cleanupTestDatabase } from './config/test-database.js';
import { createTestUsers } from './utils/test-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../apps/api/.env') });

const API_URL = process.env.API_URL || 'http://localhost:4000/api';
// Use the same database for testing (tests clean up after themselves)
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || 
  'postgresql://user:password@localhost:5432/tarsit_test';

// DATABASE_URL will be set in main() before creating Prisma client

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

function log(message: string, color: string = colors.reset) {
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

function printTestResult(result: TestResult, index: number, total: number) {
  const icon = result.passed ? '✓' : '✗';
  const color = result.passed ? colors.green : colors.red;
  const status = result.passed ? 'PASS' : 'FAIL';
  const duration = `${result.duration}ms`;
  
  log(`  [${index}/${total}] ${icon} ${result.name}`, color);
  log(`      ${status} (${duration})`, colors.gray);
  
  if (!result.passed && result.error) {
    log(`      Error: ${result.error}`, colors.red);
    if (result.details) {
      log(`      Details: ${JSON.stringify(result.details, null, 2).substring(0, 200)}`, colors.yellow);
    }
  }
}

function printSuiteSummary(suite: TestSuite) {
  const passRate = ((suite.passed / suite.tests.length) * 100).toFixed(1);
  const color = suite.failed === 0 ? colors.green : colors.red;
  
  log(`\n${suite.name}:`, colors.cyan);
  log(`  Tests: ${suite.tests.length} | Passed: ${suite.passed} | Failed: ${suite.failed} | ${passRate}%`, color);
  log(`  Duration: ${suite.duration}ms`, colors.gray);
}

function printFinalSummary(summary: TestSummary) {
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
  
  // Set DATABASE_URL before creating Prisma client
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
  }
  
  const startTime = Date.now();
  const prisma = createTestDatabase();
  const api = createApiClient(API_URL);
  
  // Test context
  const context: ApiTestContext = {
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
    // Setup test database
    await setupTestDatabase();
    
    // Create test users
    log('Creating test users...', colors.blue);
    try {
      // Wait longer to avoid rate limits from previous runs
      await new Promise(resolve => setTimeout(resolve, 3000));
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
      if (testUsers.admin.id && testUsers.admin.id !== 'skip') {
        context.testData.userIds.push(testUsers.admin.id);
      }
      context.testData.businessIds.push(testUsers.businessOwner.businessId);
      log('✓ Test users created', colors.green);
    } catch (error: any) {
      log(`⚠️  Could not create test users: ${error.message}`, colors.yellow);
      if (error.message.includes('Rate limited')) {
        log('   Waiting 10 seconds and retrying...', colors.yellow);
        await new Promise(resolve => setTimeout(resolve, 10000));
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
          if (testUsers.admin.id && testUsers.admin.id !== 'skip') {
            context.testData.userIds.push(testUsers.admin.id);
          }
          context.testData.businessIds.push(testUsers.businessOwner.businessId);
          log('✓ Test users created (retry successful)', colors.green);
        } catch (retryError: any) {
          log(`⚠️  Retry also failed: ${retryError.message}`, colors.yellow);
          log('   Some tests may be skipped', colors.yellow);
        }
      } else {
        log('   Some tests may be skipped', colors.yellow);
      }
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
    
    const suites: TestSuite[] = [];
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
      } catch (error: any) {
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
    
  } catch (error: any) {
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
