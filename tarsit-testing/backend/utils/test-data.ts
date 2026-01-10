/**
 * Test Data Generators
 * Uses permanent test accounts from the database
 * See TEST_ACCOUNTS.md for full documentation
 */

// ============================================================================
// PERMANENT TEST ACCOUNTS
// These accounts are created by prisma seed and should always exist
// ============================================================================
const TEST_ACCOUNTS = {
  admin: {
    email: 'admin@tarsit.com',
    password: 'Tarsit1234!',
    role: 'ADMIN',
  },
  customer: {
    email: 'testcustomer@tarsit.com',
    password: 'Tarsit1234!',
    role: 'CUSTOMER',
  },
  businessOwner: {
    email: 'testowner@tarsit.com',
    password: 'Tarsit1234!',
    role: 'BUSINESS_OWNER',
  },
};

/**
 * Login with a permanent test account
 */
async function loginTestAccount(api: any, accountType: 'admin' | 'customer' | 'businessOwner') {
  const account = TEST_ACCOUNTS[accountType];
  const response = await api.post('/auth/login', {
    email: account.email,
    password: account.password,
  });

  if (response.status !== 200) {
    throw new Error(`Failed to login ${accountType}: ${JSON.stringify(response.data)}`);
  }

  return {
    token: response.data.accessToken,
    user: response.data.user,
  };
}

/**
 * Get test users by logging into permanent accounts
 * No longer creates ephemeral users - uses seeded accounts
 */
async function createTestUsers(prisma: any, api: any) {
  console.log('   🔐 Logging into permanent test accounts...');

  // Login customer
  const customerLogin = await loginTestAccount(api, 'customer');
  console.log('   ✓ Customer logged in');

  // Login business owner and get their business
  const businessOwnerLogin = await loginTestAccount(api, 'businessOwner');
  console.log('   ✓ Business owner logged in');

  // Get the test business owned by testowner@tarsit.com
  let businessId: string | null = null;
  try {
    const business = await prisma.business.findFirst({
      where: { owner: { email: 'testowner@tarsit.com' } },
    });
    if (business) {
      businessId = business.id;
      console.log('   ✓ Test business found');
    }
  } catch (error) {
    // Try API fallback
    const bizResponse = await api.get('/businesses?limit=1', {
      headers: { Authorization: `Bearer ${businessOwnerLogin.token}` },
    });
    if (bizResponse.data?.data?.[0]) {
      businessId = bizResponse.data.data[0].id;
    }
  }

  // Login admin
  let adminToken: string | null = null;
  let adminUser: any = null;
  try {
    const adminLogin = await loginTestAccount(api, 'admin');
    adminToken = adminLogin.token;
    adminUser = adminLogin.user;
    console.log('   ✓ Admin logged in');
  } catch (error: any) {
    console.log(`   ⚠ Admin login failed: ${error.message}`);
    adminUser = { id: 'skip', email: TEST_ACCOUNTS.admin.email };
  }

  return {
    customer: {
      id: customerLogin.user.id,
      email: TEST_ACCOUNTS.customer.email,
      token: customerLogin.token,
    },
    businessOwner: {
      id: businessOwnerLogin.user.id,
      email: TEST_ACCOUNTS.businessOwner.email,
      token: businessOwnerLogin.token,
      businessId: businessId,
    },
    admin: {
      id: adminUser?.id || 'skip',
      email: TEST_ACCOUNTS.admin.email,
      token: adminToken,
    },
  };
}

/**
 * Get existing business for read tests
 * Uses API first, falls back to Prisma if needed
 */
async function getExistingBusiness(prisma: any, api: any) {
  // Always use API first (more reliable and doesn't require direct DB access)
  try {
    const response = await api.get('/businesses?limit=1&page=1');
    if (response.status === 200) {
      const responseData = response.data;

      // Handle { data: [...], meta: {...} } structure
      if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
        return responseData.data[0];
      }

      // Handle { businesses: [...] } structure
      if (responseData.businesses && Array.isArray(responseData.businesses) && responseData.businesses.length > 0) {
        return responseData.businesses[0];
      }

      // Handle direct array
      if (Array.isArray(responseData) && responseData.length > 0) {
        return responseData[0];
      }

      // Handle single object with id
      if (responseData && responseData.id) {
        return responseData;
      }
    }
  } catch (error) {
    // API failed, try Prisma
  }

  // Fallback to Prisma
  try {
    const business = await prisma.business.findFirst({
      where: { active: true },
      include: { category: true },
    });
    if (business) {
      return business;
    }
  } catch (prismaError) {
    // Prisma also failed
  }

  throw new Error('No businesses found in database for read tests');
}

/**
 * Get existing user for read tests
 */
async function getExistingUser(prisma: any) {
  const user = await prisma.user.findFirst({
    where: { active: true },
  });
  if (!user) {
    throw new Error('No users found in database for read tests');
  }
  return user;
}

/**
 * Get test business owned by testowner@tarsit.com
 */
async function getTestBusiness(prisma: any) {
  const business = await prisma.business.findFirst({
    where: { owner: { email: 'testowner@tarsit.com' } },
  });
  if (!business) {
    throw new Error('Test business not found. Please run: pnpm prisma db seed');
  }
  return business;
}

/**
 * Get first category ID
 */
async function getFirstCategoryId(prisma: any, api: any) {
  try {
    const category = await prisma.category.findFirst();
    if (category) {
      return category.id;
    }
  } catch (error) {
    // If Prisma fails, try API
  }

  try {
    const response = await api.get('/categories');
    const categories = response.data?.data || response.data?.categories || response.data;
    if (Array.isArray(categories) && categories.length > 0) {
      return categories[0].id;
    }
  } catch (error) {
    // API also failed
  }

  throw new Error('No categories found. Please seed the database first.');
}

module.exports = {
  TEST_ACCOUNTS,
  createTestUsers,
  loginTestAccount,
  getExistingBusiness,
  getExistingUser,
  getTestBusiness,
  getFirstCategoryId,
};
