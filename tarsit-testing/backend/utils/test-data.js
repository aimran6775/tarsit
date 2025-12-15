/**
 * JS shim for test data generators (mirrors test-data.ts)
 * Provides helpers to log in seeded accounts and fetch seeded entities.
 */

const TEST_ACCOUNTS = {
  admin: { email: 'admin@tarsit.com', password: 'Tarsit1234!', role: 'ADMIN' },
  customer: { email: 'testcustomer@tarsit.com', password: 'Tarsit1234!', role: 'CUSTOMER' },
  businessOwner: { email: 'testowner@tarsit.com', password: 'Tarsit1234!', role: 'BUSINESS_OWNER' },
};

async function loginTestAccount(api, accountType) {
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

async function createTestUsers(prisma, api) {
  console.log('   🔐 Logging into permanent test accounts...');

  const customerLogin = await loginTestAccount(api, 'customer');
  console.log('   ✓ Customer logged in');

  const businessOwnerLogin = await loginTestAccount(api, 'businessOwner');
  console.log('   ✓ Business owner logged in');

  let businessId = null;
  try {
    const business = await prisma.business.findFirst({
      where: { owner: { email: 'testowner@tarsit.com' } },
    });
    if (business) {
      businessId = business.id;
      console.log('   ✓ Test business found');
    }
  } catch (error) {
    const bizResponse = await api.get('/businesses?limit=1', {
      headers: { Authorization: `Bearer ${businessOwnerLogin.token}` },
    });
    if (bizResponse.data?.data?.[0]) {
      businessId = bizResponse.data.data[0].id;
    }
  }

  let adminToken = null;
  let adminUser = null;
  try {
    const adminLogin = await loginTestAccount(api, 'admin');
    adminToken = adminLogin.token;
    adminUser = adminLogin.user;
    console.log('   ✓ Admin logged in');
  } catch (error) {
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
      businessId,
    },
    admin: {
      id: adminUser?.id || 'skip',
      email: TEST_ACCOUNTS.admin.email,
      token: adminToken,
    },
  };
}

async function getExistingBusiness(prisma, api) {
  try {
    const response = await api.get('/businesses?limit=1&page=1');
    if (response.status === 200) {
      const responseData = response.data;

      if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
        return responseData.data[0];
      }
      if (responseData.businesses && Array.isArray(responseData.businesses) && responseData.businesses.length > 0) {
        return responseData.businesses[0];
      }
      if (Array.isArray(responseData) && responseData.length > 0) {
        return responseData[0];
      }
      if (responseData && responseData.id) {
        return responseData;
      }
    }
  } catch (error) {
    // ignore and fallback to Prisma
  }

  const business = await prisma.business.findFirst({
    where: { active: true },
    include: { category: true },
  });
  if (business) return business;

  throw new Error('No businesses found in database for read tests');
}

async function getExistingUser(prisma) {
  const user = await prisma.user.findFirst({ where: { active: true } });
  if (!user) throw new Error('No users found in database for read tests');
  return user;
}

async function getTestBusiness(prisma) {
  const business = await prisma.business.findFirst({ where: { owner: { email: 'testowner@tarsit.com' } } });
  if (!business) throw new Error('Test business not found. Please run: pnpm prisma db seed');
  return business;
}

async function getFirstCategoryId(prisma, api) {
  try {
    const category = await prisma.category.findFirst();
    if (category) return category.id;
  } catch (error) {
    // ignore and fallback to API
  }

  const response = await api.get('/categories');
  if (response.data?.data?.[0]?.id) return response.data.data[0].id;
  if (response.data?.[0]?.id) return response.data[0].id;

  throw new Error('No categories found');
}

module.exports = {
  createTestUsers,
  getExistingBusiness,
  getExistingUser,
  getTestBusiness,
  getFirstCategoryId,
};
