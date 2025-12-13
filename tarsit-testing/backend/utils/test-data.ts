/**
 * Test Data Generators
 * Creates realistic test data for testing
 */

const { generateTestEmail, generateTestPassword } = require('./test-helpers');

// Colors for logging (if needed)
const colors = {
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

/**
 * Create test users
 */
async function createTestUsers(prisma, api) {
  const customerEmail = generateTestEmail();
  const businessOwnerEmail = generateTestEmail();
  const adminEmail = generateTestEmail();
  const password = generateTestPassword();

  // Wait to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Create customer
  const customerSignup = await api.post('/auth/signup', {
    email: customerEmail,
    password,
    firstName: 'Test',
    lastName: 'Customer',
    role: 'CUSTOMER',
  });

  if (customerSignup.status === 429) {
    throw new Error('Rate limited - cannot create test users');
  }

  if (customerSignup.status !== 201) {
    throw new Error(`Customer signup failed: ${JSON.stringify(customerSignup.data)}`);
  }

  // Wait before login
  await new Promise(resolve => setTimeout(resolve, 500));

  const customerLogin = await api.post('/auth/login', {
    email: customerEmail,
    password,
  });

  if (customerLogin.status === 429) {
    throw new Error('Rate limited - cannot login test user');
  }

  if (customerLogin.status !== 200 || !customerLogin.data.accessToken) {
    throw new Error(`Customer login failed: ${JSON.stringify(customerLogin.data)}`);
  }

  // Create business owner
  const businessOwnerSignup = await api.post('/auth/signup-business', {
    email: businessOwnerEmail,
    password,
    firstName: 'Test',
    lastName: 'BusinessOwner',
    business: {
      name: 'Test Business',
      description: 'A test business for testing purposes',
      categoryId: await getFirstCategoryId(prisma, api),
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

  // Get admin user (or skip if Prisma fails - we'll use API to find one)
  let admin = null;
  let adminToken = null;
  
  try {
    admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
  } catch (error) {
    // Prisma failed, try to find admin via API or skip
      // Prisma failed, will skip admin tests
  }

  if (!admin) {
    // Try to create admin via API signup (if endpoint exists) or skip
    try {
      // For now, skip admin creation - tests will work without it
      admin = { id: 'skip', email: adminEmail };
    } catch (error) {
      // Skip admin tests
    }
  } else {
    // Try to login as admin
    try {
      const adminLogin = await api.post('/auth/login', {
        email: admin.email,
        password: password, // Try the test password
      });
      if (adminLogin.status === 200 && adminLogin.data.accessToken) {
        adminToken = adminLogin.data.accessToken;
      }
    } catch (error) {
      // Admin may have different password, that's okay - tests will skip
    }
  }

  // Handle different response structures
  const customerId = customerSignup.data?.user?.id || customerSignup.data?.id;
  const businessOwnerId = businessOwnerSignup.data?.user?.id || businessOwnerSignup.data?.id;
  const businessId = businessOwnerSignup.data?.business?.id || businessOwnerSignup.data?.businessId;

  if (!customerId || !customerLogin.data?.accessToken) {
    throw new Error(`Customer creation failed: ${JSON.stringify(customerSignup.data)}`);
  }

  if (!businessOwnerId || !businessOwnerLogin.data?.accessToken || !businessId) {
    throw new Error(`Business owner creation failed: ${JSON.stringify(businessOwnerSignup.data)}`);
  }

  return {
    customer: {
      id: customerId,
      email: customerEmail,
      token: customerLogin.data.accessToken,
    },
    businessOwner: {
      id: businessOwnerId,
      email: businessOwnerEmail,
      token: businessOwnerLogin.data.accessToken,
      businessId: businessId,
    },
    admin: {
      id: admin?.id || 'skip',
      email: admin?.email || adminEmail,
      token: adminToken,
    },
  };
}

/**
 * Get first category ID from database or API
 */
async function getFirstCategoryId(prisma, api) {
  try {
    const category = await prisma.category.findFirst();
    if (category) {
      return category.id;
    }
  } catch (error) {
    // If Prisma fails, try API
  }
  
  // Fallback to API
  try {
    const response = await api.get('/categories');
    const categories = response.data.categories || response.data;
    if (Array.isArray(categories) && categories.length > 0) {
      return categories[0].id;
    }
    if (categories && categories.id) {
      return categories.id;
    }
  } catch (error) {
    // API also failed
  }
  
  throw new Error('No categories found in database. Please seed categories first.');
}

/**
 * Get existing business for read tests
 * Uses API first, falls back to Prisma if needed
 */
async function getExistingBusiness(prisma, api) {
  // Always use API first (more reliable and doesn't require direct DB access)
  try {
    const response = await api.get('/businesses?limit=1&page=1');
    if (response.status === 200) {
      const data = response.data;
      const businesses = data.businesses || (Array.isArray(data) ? data : [data]);
      
      if (Array.isArray(businesses) && businesses.length > 0) {
        return businesses[0];
      }
      if (businesses && businesses.id) {
        return businesses;
      }
      if (data && data.id) {
        return data;
      }
    }
  } catch (error) {
    // API failed, try Prisma only if api is not available
    if (!api) {
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
    }
  }

  throw new Error('No businesses found in database for read tests');
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
