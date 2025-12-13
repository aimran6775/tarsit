/**
 * Test Data Generators
 * Creates realistic test data for testing
 */

const { PrismaClient } = require('@prisma/client');
const { generateTestEmail, generateTestPassword } = require('./test-helpers');

/**
 * Create test users
 */
async function createTestUsers(prisma, api) {
  const customerEmail = generateTestEmail();
  const businessOwnerEmail = generateTestEmail();
  const adminEmail = generateTestEmail();
  const password = generateTestPassword();

  // Create customer
  const customerSignup = await api.post('/auth/signup', {
    email: customerEmail,
    password,
    firstName: 'Test',
    lastName: 'Customer',
    role: 'CUSTOMER',
  });

  const customerLogin = await api.post('/auth/login', {
    email: customerEmail,
    password,
  });

  // Create business owner
  // First get a category
  const categoriesResponse = await api.get('/categories');
  const categories = categoriesResponse.data.categories || categoriesResponse.data;
  if (!categories || (Array.isArray(categories) && categories.length === 0)) {
    throw new Error('No categories found - cannot create business owner');
  }
  const categoryId = Array.isArray(categories) ? categories[0].id : categories.id;

  const businessOwnerSignup = await api.post('/auth/signup-business', {
    email: businessOwnerEmail,
    password,
    firstName: 'Test',
    lastName: 'BusinessOwner',
    business: {
      name: 'Test Business',
      description: 'A test business for testing purposes',
      categoryId,
      addressLine1: '123 Test Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      phone: '+14155551234',
    },
  });

  const businessOwnerLogin = await api.post('/auth/login', {
    email: businessOwnerEmail,
    password,
  });

  // Get admin user (or create if doesn't exist)
  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: password, // In real test, hash this properly
        firstName: 'Test',
        lastName: 'Admin',
        role: 'ADMIN',
        verified: true,
        active: true,
      },
    });
  }

  // Try to login as admin (may fail if password doesn't match)
  let adminToken = null;
  try {
    const adminLogin = await api.post('/auth/login', {
      email: admin.email,
      password: password,
    });
    adminToken = adminLogin.data.accessToken;
  } catch (error) {
    // Admin may have different password, that's okay
    console.log('      ⚠️  Could not login as admin (may need to set password)', colors.yellow);
  }

  return {
    customer: {
      id: customerSignup.data.user.id,
      email: customerEmail,
      token: customerLogin.data.accessToken,
    },
    businessOwner: {
      id: businessOwnerSignup.data.user.id,
      email: businessOwnerEmail,
      token: businessOwnerLogin.data.accessToken,
      businessId: businessOwnerSignup.data.business.id,
    },
    admin: {
      id: admin.id,
      email: admin.email,
      token: adminToken,
    },
  };
}

/**
 * Get existing business for read tests
 */
async function getExistingBusiness(prisma) {
  const business = await prisma.business.findFirst({
    where: { active: true },
    include: { category: true },
  });
  if (!business) {
    throw new Error('No businesses found in database for read tests');
  }
  return business;
}

/**
 * Get existing user for read tests
 */
async function getExistingUser(prisma) {
  const user = await prisma.user.findFirst({
    where: { active: true },
  });
  if (!user) {
    throw new Error('No users found in database for read tests');
  }
  return user;
}

module.exports = {
  createTestUsers,
  getExistingBusiness,
  getExistingUser,
};
