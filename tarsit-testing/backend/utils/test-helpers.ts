/**
 * Test Helper Utilities
 */

const axios = require('axios');

/**
 * Create API client for testing
 */
export function createApiClient(baseURL: string): AxiosInstance {
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
  // If key is provided but doesn't exist, check if data itself is an array (for direct array responses)
  if (key && !response.data[key]) {
    // Some APIs return arrays directly, not wrapped in an object
    if (Array.isArray(response.data)) {
      return response.data;
    }
    throw new Error(`Response data missing key: ${key}`);
  }
  return key ? response.data[key] : response.data;
}

/**
 * Assert a condition (like Jest's expect)
 */
function expect(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Assert value equals expected
 */
function expectEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

/**
 * Assert value is truthy
 */
function expectTruthy(value, message) {
  if (!value) {
    throw new Error(message || 'Expected truthy value');
  }
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
 * Must be at least 8 characters with uppercase, lowercase, number, and special character
 * Cannot contain common weak passwords like "password", "admin", etc.
 */
function generateTestPassword() {
  return 'TestP@ss2024!';
}

module.exports = {
  createApiClient,
  runTest,
  expectStatus,
  expectData,
  expectProperty,
  expect,
  expectEqual,
  expectTruthy,
  wait,
  generateTestEmail,
  generateTestPassword,
};
