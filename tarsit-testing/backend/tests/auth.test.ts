/**
 * Authentication Endpoints Tests
 * Tests all auth-related endpoints
 */

const { expectStatus, expectData, expect, runTest } = require('../utils/test-helpers');

async function testAuth(context) {
  const { api } = context;
  const results: TestResult[] = [];

  // Test: POST /api/auth/signup
  results.push(await runTest('POST /auth/signup - Customer signup', async () => {
    const uniqueEmail = `test-customer-${Date.now()}-${Math.random().toString(36).substring(7)}@test.tarsit.com`;
    const password = 'TestPassword123!@#';
    
    // Wait to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await api.post('/auth/signup', {
      email: uniqueEmail,
      password,
      firstName: 'Test',
      lastName: 'Customer',
      role: 'CUSTOMER',
    });
    
    if (response.status === 429) {
      throw new Error('Rate limited - skipping signup test');
    }
    
    expectStatus(response, 201);
    const data = expectData(response, 'user') || expectData(response);
    expect(data.email === uniqueEmail, `Expected email ${uniqueEmail}, got ${data.email}`);
    expect(data.id, 'User ID should exist');
    if (data.id && !context.testData.userIds.includes(data.id)) {
      context.testData.userIds.push(data.id);
    }
  }));

  // Test: POST /api/auth/signup-business
  results.push(await runTest('POST /auth/signup-business - Business owner signup', async () => {
    // First get a category ID from existing data
    const categoriesResponse = await api.get('/categories');
    const categories = expectData(categoriesResponse, 'categories') || expectData(categoriesResponse);
    if (!categories || (Array.isArray(categories) && categories.length === 0)) {
      throw new Error('No categories found - cannot test business signup');
    }
    const categoryId = Array.isArray(categories) ? categories[0].id : categories[0]?.id || categories.id;

    const uniqueEmail = `test-business-${Date.now()}-${Math.random().toString(36).substring(7)}@test.tarsit.com`;
    const password = 'TestPassword123!@#';
    
    // Wait to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const response = await api.post('/auth/signup-business', {
      email: uniqueEmail,
      password,
      firstName: 'Test',
      lastName: 'BusinessOwner',
      business: {
        name: `Test Business ${Date.now()}`,
        description: 'A test business for comprehensive testing',
        categoryId,
        addressLine1: '123 Test Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        phone: '+14155551234',
      },
    });
    
    if (response.status === 429) {
      throw new Error('Rate limited - skipping business signup test');
    }
    
    expectStatus(response, 201);
    const data = expectData(response);
    expect(data.user, 'User should exist');
    expect(data.business, 'Business should exist');
    if (data.user?.id && !context.testData.userIds.includes(data.user.id)) {
      context.testData.userIds.push(data.user.id);
    }
    if (data.business?.id && !context.testData.businessIds.includes(data.business.id)) {
      context.testData.businessIds.push(data.business.id);
    }
  }));

  // Test: POST /api/auth/login
  results.push(await runTest('POST /auth/login - Valid credentials', async () => {
    // Use existing user or create one
    const email = `test-login-${Date.now()}@test.tarsit.com`;
    const password = 'TestPassword123!';
    
    await api.post('/auth/signup', {
      email,
      password,
      firstName: 'Login',
      lastName: 'Test',
    });

    const response = await api.post('/auth/login', {
      email,
      password,
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.accessToken, 'Access token should exist');
    expect(data.refreshToken, 'Refresh token should exist');
    context.tokens.customerToken = data.accessToken;
  }));

  // Test: POST /api/auth/login - Invalid credentials
  results.push(await runTest('POST /auth/login - Invalid credentials', async () => {
    const response = await api.post('/auth/login', {
      email: 'nonexistent@test.tarsit.com',
      password: 'WrongPassword123!',
    });
    expectStatus(response, 401);
  }));

  // Test: GET /api/auth/me
  results.push(await runTest('GET /auth/me - Get current user', async () => {
    if (!context.tokens.customerToken) {
      throw new Error('No auth token available');
    }
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.email, 'Email should exist');
    expect(data.id, 'User ID should exist');
  }));

  // Test: GET /api/auth/me - Unauthorized
  results.push(await runTest('GET /auth/me - Unauthorized (no token)', async () => {
    const response = await api.get('/auth/me');
    expectStatus(response, 401);
  }));

  // Test: PATCH /api/auth/me
  results.push(await runTest('PATCH /auth/me - Update profile', async () => {
    if (!context.tokens.customerToken) {
      throw new Error('No auth token available');
    }
    const response = await api.patch('/auth/me', {
      firstName: 'Updated',
      lastName: 'Name',
    }, {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.firstName === 'Updated', `Expected 'Updated', got '${data.firstName}'`);
  }));

  // Test: POST /api/auth/refresh
  results.push(await runTest('POST /auth/refresh - Refresh token', async () => {
    if (!context.tokens.customerToken) {
      throw new Error('No auth token available');
    }
    // Get refresh token from login
    const loginResponse = await api.post('/auth/login', {
      email: `test-refresh-${Date.now()}@test.tarsit.com`,
      password: 'TestPassword123!@#',
    });
    await api.post('/auth/signup', {
      email: loginResponse.data.user?.email || `test-refresh-${Date.now()}@test.tarsit.com`,
      password: 'TestPassword123!@#',
      firstName: 'Refresh',
      lastName: 'Test',
    });
    
    const refreshResponse = await api.post('/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    expectStatus(refreshResponse, 200);
    expect(refreshResponse.data.accessToken, 'Access token should exist');
  }));

  // Test: POST /api/auth/forgot-password
  results.push(await runTest('POST /auth/forgot-password - Request reset', async () => {
    const response = await api.post('/auth/forgot-password', {
      email: 'test@test.tarsit.com',
    });
    expectStatus(response, 200);
  }));

  // Test: POST /api/auth/verify-email
  results.push(await runTest('POST /auth/verify-email - Invalid token', async () => {
    const response = await api.post('/auth/verify-email', {
      token: 'invalid-token',
    });
    expectStatus(response, 400);
  }));

  // Test: POST /api/auth/resend-verification
  results.push(await runTest('POST /auth/resend-verification - Resend email', async () => {
    const response = await api.post('/auth/resend-verification', {
      email: 'test@test.tarsit.com',
    });
    expectStatus(response, 200);
  }));

  return results;
}

module.exports = { testAuth };
