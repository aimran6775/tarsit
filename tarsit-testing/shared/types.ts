/**
 * Shared types for Tarsit Testing Suite
 */

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  duration: number;
}

export interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  duration: number;
  suites: TestSuite[];
}

export interface TestConfig {
  apiUrl: string;
  frontendUrl: string;
  testDatabaseUrl: string;
  verbose: boolean;
  cleanup: boolean;
}
