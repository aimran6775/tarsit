/**
 * Test Helper Utilities
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { TestResult } from '../../shared/types.js';

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
export async function runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
  const start = Date.now();
  try {
    await testFn();
    const duration = Date.now() - start;
    return { name, passed: true, duration };
  } catch (error: any) {
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
export function expectStatus(response: AxiosResponse, expectedStatus: number): void {
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
export function expectData(response: AxiosResponse, key?: string): any {
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
export function expect(condition: any, message?: string): void {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Assert value equals expected
 */
export function expectEqual(actual: any, expected: any, message?: string): void {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

/**
 * Assert value is truthy
 */
export function expectTruthy(value: any, message?: string): void {
  if (!value) {
    throw new Error(message || 'Expected truthy value');
  }
}

/**
 * Assert response has property
 */
export function expectProperty(obj: any, property: string): void {
  if (!(property in obj)) {
    throw new Error(`Missing property: ${property}`);
  }
}

/**
 * Wait helper
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate test email
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@test.tarsit.com`;
}

/**
 * Generate test password
 * Must be at least 8 characters with uppercase, lowercase, number, and special character
 * Cannot contain common weak passwords like "password", "admin", etc.
 */
export function generateTestPassword(): string {
  return 'TestP@ss2024!';
}
