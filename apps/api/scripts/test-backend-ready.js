#!/usr/bin/env node

/**
 * Backend Readiness Test Script
 * 
 * This script tests if the backend is fully functional and ready for use.
 * It performs comprehensive checks on all critical endpoints and services.
 * 
 * Usage:
 *   node scripts/test-backend-ready.js
 *   node scripts/test-backend-ready.js --url=http://localhost:4000
 * 
 * Environment Variables:
 *   API_URL - The base URL of the API (default: http://localhost:4000)
 *   TEST_EMAIL - Email for test user (default: test@example.com)
 *   TEST_PASSWORD - Password for test user (default: Test123456!)
 */

const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || process.argv.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:4000';
const BASE_URL = `${API_URL}/api`;
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test123456!';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: [],
};

let authToken = null;
let testBusinessId = null;
let testUserId = null;

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(name, status, details = '') {
  const statusColor = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.yellow;
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⊘';
  log(`  ${icon} ${name}`, statusColor);
  if (details) {
    log(`    ${details}`, colors.cyan);
  }
  
  results.tests.push({ name, status, details });
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else results.skipped++;
}

function logSection(title) {
  log(`\n${colors.bright}═══ ${title} ═══${colors.reset}`, colors.blue);
}

async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
}

// Test functions
async function testHealthEndpoints() {
  logSection('Health Check Endpoints');
  
  // Basic health check
  const health = await makeRequest('GET', '/health');
  if (health.success && health.data.status === 'ok') {
    logTest('Basic health check', 'PASS', `Uptime: ${Math.round(health.data.uptime)}s`);
  } else {
    logTest('Basic health check', 'FAIL', JSON.stringify(health.error));
    return false;
  }
  
  // Detailed health check
  const detailed = await makeRequest('GET', '/health/detailed');
  if (detailed.success) {
    const dbStatus = detailed.data.checks?.database?.status;
    logTest('Detailed health check', 'PASS', `Database: ${dbStatus}`);
  } else {
    logTest('Detailed health check', 'FAIL');
  }
  
  // Readiness check
  const ready = await makeRequest('GET', '/health/ready');
  if (ready.success && ready.data.status === 'ready') {
    logTest('Readiness check', 'PASS', 'All services ready');
  } else {
    logTest('Readiness check', 'FAIL', 'Services not ready');
    return false;
  }
  
  return true;
}

async function testSwaggerDocs() {
  logSection('API Documentation');
  
  try {
    const response = await axios.get(`${API_URL}/api/docs`);
    if (response.status === 200) {
      logTest('Swagger documentation', 'PASS', `Available at ${API_URL}/api/docs`);
      return true;
    }
  } catch (error) {
    logTest('Swagger documentation', 'FAIL', error.message);
  }
  return false;
}

async function testAuthentication() {
  logSection('Authentication Flow');
  
  // Generate unique email for this test run
  const timestamp = Date.now();
  const testUserEmail = `test.user.${timestamp}@example.com`;
  
  // Test signup
  const signup = await makeRequest('POST', '/auth/signup', {
    email: testUserEmail,
    password: TEST_PASSWORD,
    firstName: 'Test',
    lastName: 'User',
  });
  
  if (signup.success && signup.data.user) {
    testUserId = signup.data.user.id;
    authToken = signup.data.accessToken;
    logTest('User signup', 'PASS', `Created user: ${testUserEmail}`);
  } else {
    // Try to login with existing user
    const login = await makeRequest('POST', '/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    
    if (login.success && login.data.accessToken) {
      authToken = login.data.accessToken;
      testUserId = login.data.user.id;
      logTest('User login (existing)', 'PASS', 'Using existing test account');
    } else {
      const errorMsg = signup.error ? JSON.stringify(signup.error).substring(0, 100) : 'Unknown error';
      logTest('Authentication', 'FAIL', `Signup failed: ${errorMsg}`);
      return false;
    }
  }
  
  // Test login with new account
  if (!authToken) {
    const login = await makeRequest('POST', '/auth/login', {
      email: testUserEmail,
      password: TEST_PASSWORD,
    });
    
    if (login.success && login.data.accessToken) {
      authToken = login.data.accessToken;
      logTest('User login', 'PASS', 'Token received');
    } else {
      logTest('User login', 'FAIL', JSON.stringify(login.error));
      return false;
    }
  }
  
  // Test protected endpoint
  const profile = await makeRequest('GET', '/auth/me');
  if (profile.success && profile.data.id) {
    logTest('Protected endpoint access', 'PASS', `User: ${profile.data.email}`);
  } else {
    logTest('Protected endpoint access', 'FAIL');
    return false;
  }
  
  return true;
}

async function testCategoriesEndpoint() {
  logSection('Categories');
  
  const categories = await makeRequest('GET', '/categories');
  if (categories.success && Array.isArray(categories.data)) {
    logTest('Get categories', 'PASS', `Found ${categories.data.length} categories`);
    return true;
  } else {
    logTest('Get categories', 'FAIL');
    return false;
  }
}

async function testBusinessEndpoints() {
  logSection('Business Operations');
  
  // Get all businesses
  const businesses = await makeRequest('GET', '/businesses');
  if (businesses.success) {
    logTest('Get businesses', 'PASS', `Found ${businesses.data.length || 0} businesses`);
  } else {
    logTest('Get businesses', 'FAIL');
    return false;
  }
  
  // Search businesses
  const search = await makeRequest('GET', '/businesses/search?query=test');
  if (search.success) {
    logTest('Search businesses', 'PASS');
  } else {
    logTest('Search businesses', 'FAIL');
  }
  
  // Create business (requires auth)
  const createBusiness = await makeRequest('POST', '/businesses', {
    name: `Test Business ${Date.now()}`,
    description: 'Test business for backend readiness check',
    categoryId: 1, // Assuming category 1 exists
    address: '123 Test St',
    city: 'Test City',
    country: 'Test Country',
    phone: '+1234567890',
  });
  
  if (createBusiness.success && createBusiness.data.id) {
    testBusinessId = createBusiness.data.id;
    logTest('Create business', 'PASS', `Business ID: ${testBusinessId}`);
  } else {
    logTest('Create business', 'FAIL', JSON.stringify(createBusiness.error));
  }
  
  // Get single business
  if (testBusinessId) {
    const getBusiness = await makeRequest('GET', `/businesses/${testBusinessId}`);
    if (getBusiness.success) {
      logTest('Get business by ID', 'PASS');
    } else {
      logTest('Get business by ID', 'FAIL');
    }
  }
  
  return true;
}

async function testReviewsEndpoint() {
  logSection('Reviews');
  
  if (!testBusinessId) {
    logTest('Reviews tests', 'SKIP', 'No test business available');
    return true;
  }
  
  // Create review
  const createReview = await makeRequest('POST', `/businesses/${testBusinessId}/reviews`, {
    rating: 5,
    comment: 'Great service! This is a test review.',
  });
  
  if (createReview.success) {
    logTest('Create review', 'PASS');
  } else {
    logTest('Create review', 'FAIL', JSON.stringify(createReview.error));
  }
  
  // Get reviews
  const reviews = await makeRequest('GET', `/businesses/${testBusinessId}/reviews`);
  if (reviews.success) {
    logTest('Get reviews', 'PASS', `Found ${reviews.data.length || 0} reviews`);
  } else {
    logTest('Get reviews', 'FAIL');
  }
  
  return true;
}

async function testAppointmentsEndpoint() {
  logSection('Appointments');
  
  if (!testBusinessId) {
    logTest('Appointments tests', 'SKIP', 'No test business available');
    return true;
  }
  
  // Create appointment
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  
  const createAppt = await makeRequest('POST', '/appointments', {
    businessId: testBusinessId,
    scheduledAt: tomorrow.toISOString(),
    notes: 'Test appointment',
  });
  
  if (createAppt.success) {
    logTest('Create appointment', 'PASS');
  } else {
    logTest('Create appointment', 'FAIL', JSON.stringify(createAppt.error));
  }
  
  // Get user appointments
  const appointments = await makeRequest('GET', '/appointments/user');
  if (appointments.success) {
    logTest('Get user appointments', 'PASS');
  } else {
    logTest('Get user appointments', 'FAIL');
  }
  
  return true;
}

async function testSearchEndpoint() {
  logSection('Search');
  
  const search = await makeRequest('GET', '/search?query=test&type=business');
  if (search.success) {
    logTest('Global search', 'PASS');
    return true;
  } else {
    logTest('Global search', 'FAIL');
    return false;
  }
}

async function testAnalyticsEndpoint() {
  logSection('Analytics');
  
  if (!testBusinessId) {
    logTest('Analytics tests', 'SKIP', 'No test business available');
    return true;
  }
  
  const analytics = await makeRequest('GET', `/analytics/business/${testBusinessId}`);
  if (analytics.success) {
    logTest('Get business analytics', 'PASS');
  } else {
    logTest('Get business analytics', 'FAIL');
  }
  
  return true;
}

async function cleanupTestData() {
  logSection('Cleanup');
  
  // Delete test business
  if (testBusinessId) {
    const deleteBusiness = await makeRequest('DELETE', `/businesses/${testBusinessId}`);
    if (deleteBusiness.success) {
      logTest('Delete test business', 'PASS');
    } else {
      logTest('Delete test business', 'FAIL', 'You may need to manually clean up test data');
    }
  }
}

async function printSummary() {
  logSection('Test Summary');
  
  const total = results.passed + results.failed + results.skipped;
  const passRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;
  
  log(`\nTotal Tests: ${total}`);
  log(`Passed: ${results.passed}`, colors.green);
  log(`Failed: ${results.failed}`, colors.red);
  log(`Skipped: ${results.skipped}`, colors.yellow);
  log(`Pass Rate: ${passRate}%\n`, passRate >= 80 ? colors.green : colors.red);
  
  if (results.failed === 0) {
    log('🎉 All tests passed! Backend is ready for use.', colors.green);
    return 0;
  } else {
    log('❌ Some tests failed. Please review the output above.', colors.red);
    return 1;
  }
}

// Main execution
async function main() {
  log(`\n${colors.bright}═══════════════════════════════════════════════════════${colors.reset}`);
  log(`${colors.bright}   TARSIT BACKEND READINESS TEST${colors.reset}`);
  log(`${colors.bright}═══════════════════════════════════════════════════════${colors.reset}`);
  log(`\nTesting API at: ${colors.cyan}${API_URL}${colors.reset}`);
  log(`Started at: ${new Date().toLocaleString()}\n`);
  
  try {
    // Run all tests in sequence
    const healthOk = await testHealthEndpoints();
    if (!healthOk) {
      log('\n❌ Health checks failed. Backend is not running or not healthy.', colors.red);
      process.exit(1);
    }
    
    await testSwaggerDocs();
    
    const authOk = await testAuthentication();
    if (!authOk) {
      log('\n❌ Authentication failed. Cannot proceed with protected endpoint tests.', colors.red);
      process.exit(1);
    }
    
    await testCategoriesEndpoint();
    await testBusinessEndpoints();
    await testReviewsEndpoint();
    await testAppointmentsEndpoint();
    await testSearchEndpoint();
    await testAnalyticsEndpoint();
    
    // Cleanup
    await cleanupTestData();
    
    // Print summary and exit
    const exitCode = await printSummary();
    process.exit(exitCode);
    
  } catch (error) {
    log(`\n❌ Unexpected error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
main();
