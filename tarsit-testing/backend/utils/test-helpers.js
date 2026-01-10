/**
 * Test Helper Utilities
 */

const axios = require('axios');

/**
 * Create API client for testing
 */
function createApiClient(baseURL) {
  return axios.create({
    baseURL,
    timeout: 30000,
    validateStatus: () => true, // Don't throw on any status
  });
}

/**
 * Run a test and return result
 */
async function runTest(name, testFn) {
  const start = Date.now();
  try {
    await testFn();
    const duration = Date.now() - start;
    return { name, passed: true, duration };
  } catch (error) {
    const duration = Date.now() - start;
    return {
      name,
      passed: false,
      duration,
      error: error.message || String(error),
      details: error.response?.data || error.stack,
    };
  }
}

/**
 * Assert response status
 */
function expectStatus(response, expectedStatus) {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}. ` +
      `Response: ${JSON.stringify(response.data)}`,
    );
  }
}

/**
 * Assert response has data
 */
function expectData(response, key) {
  if (!response.data) {
    throw new Error('Response has no data');
  }
  if (key && !response.data[key]) {
    throw new Error(`Response data missing key: ${key}`);
  }
  return key ? response.data[key] : response.data;
}

/**
 * Assert response has property
 */
function expectProperty(obj, property) {
  if (!(property in obj)) {
    throw new Error(`Missing property: ${property}`);
  }
}

/**
 * Wait helper
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate test email
 */
function generateTestEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@test.tarsit.com`;
}

/**
 * Generate test password
 */
function generateTestPassword() {
  return 'TestPassword123!';
}

module.exports = {
  createApiClient,
  runTest,
  expectStatus,
  expectData,
  expectProperty,
  wait,
  generateTestEmail,
  generateTestPassword,
};
