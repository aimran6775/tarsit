/**
 * Test Database Configuration
 * Sets up a separate test database that mirrors production schema
 */

const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../apps/api/.env') });

// Use the same database for testing (tests clean up after themselves)
// Or set TEST_DATABASE_URL env var to use a separate test database
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 
  process.env.DATABASE_URL ||
  'postgresql://user:password@localhost:5432/tarsit_test';

export const testDatabaseUrl = TEST_DATABASE_URL;

/**
 * Create test database connection
 */
export function createTestDatabase(): PrismaClient {
  // Ensure DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = testDatabaseUrl;
  }
  
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

/**
 * Setup test database (create if doesn't exist, run migrations)
 */
export async function setupTestDatabase(): Promise<void> {
  console.log('📦 Setting up test database...');
  console.log(`   Database: ${testDatabaseUrl.replace(/:[^:@]+@/, ':****@')}`);
  
  // Note: In production, you would:
  // 1. Create the test database if it doesn't exist
  // 2. Run migrations: pnpm prisma migrate deploy
  // 3. Seed with base data if needed
  
  console.log('✅ Test database ready');
}

/**
 * Cleanup test database (remove test data)
 */
export async function cleanupTestDatabase(prisma: PrismaClient, testDataIds: {
  userIds: string[];
  businessIds: string[];
  reviewIds: string[];
  messageIds: string[];
  appointmentIds: string[];
}): Promise<void> {
  console.log('🧹 Cleaning up test data...');
  
  try {
    // Delete in correct order (respecting foreign keys)
    if (testDataIds.appointmentIds.length > 0) {
      await prisma.appointment.deleteMany({
        where: { id: { in: testDataIds.appointmentIds } },
      });
    }
    
    if (testDataIds.messageIds.length > 0) {
      await prisma.message.deleteMany({
        where: { id: { in: testDataIds.messageIds } },
      });
    }
    
    if (testDataIds.reviewIds.length > 0) {
      await prisma.review.deleteMany({
        where: { id: { in: testDataIds.reviewIds } },
      });
    }
    
    if (testDataIds.businessIds.length > 0) {
      await prisma.business.deleteMany({
        where: { id: { in: testDataIds.businessIds } },
      });
    }
    
    if (testDataIds.userIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: testDataIds.userIds } },
      });
    }
    
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('⚠️  Error cleaning up test data:', error);
  }
}

module.exports = {
  testDatabaseUrl,
  createTestDatabase,
  setupTestDatabase,
  cleanupTestDatabase,
};
