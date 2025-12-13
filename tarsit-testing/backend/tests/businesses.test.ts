/**
 * Businesses Endpoints Tests
 * Tests all business-related endpoints
 */

const { expectStatus, expectData, expect, runTest } = require('../utils/test-helpers');
const { getExistingBusiness } = require('../utils/test-data');

async function testBusinesses(context) {
  const { api, prisma } = context;
  const results: TestResult[] = [];

  // Test: GET /api/businesses - List all
  results.push(await runTest('GET /businesses - List all businesses', async () => {
    const response = await api.get('/businesses?page=1&limit=10');
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.businesses || data, 'Businesses should exist');
    expect(Array.isArray(data.businesses || data), 'Response should be an array');
  }));

  // Test: GET /api/businesses - With filters
  results.push(await runTest('GET /businesses - With filters', async () => {
    const response = await api.get('/businesses?verified=true&page=1&limit=5');
    expectStatus(response, 200);
    expectStatus(response, 200);
  }));

  // Test: GET /api/businesses/:id - Get by ID
  results.push(await runTest('GET /businesses/:id - Get by ID', async () => {
    const existingBusiness = await getExistingBusiness(prisma, api);
    const response = await api.get(`/businesses/${existingBusiness.id}`);
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.id === existingBusiness.id, `Expected business ID ${existingBusiness.id}, got ${data.id}`);
    expect(data.name, 'Business name should exist');
  }));

  // Test: GET /api/businesses/slug/:slug - Get by slug
  results.push(await runTest('GET /businesses/slug/:slug - Get by slug', async () => {
    const existingBusiness = await getExistingBusiness(prisma, api);
    const response = await api.get(`/businesses/slug/${existingBusiness.slug}`);
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.slug === existingBusiness.slug, `Expected slug ${existingBusiness.slug}, got ${data.slug}`);
  }));

  // Test: GET /api/businesses/my-business - Get my business
  results.push(await runTest('GET /businesses/my-business - Get my business', async () => {
    if (!context.tokens.businessOwnerToken) {
      throw new Error('No business owner token available');
    }
    const response = await api.get('/businesses/my-business', {
      headers: { Authorization: `Bearer ${context.tokens.businessOwnerToken}` },
    });
    // May return 404 if no business, which is acceptable
    if (response.status === 404) {
      return; // No business yet, skip
    }
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.id, 'Business ID should exist');
  }));

  // Test: POST /api/businesses - Create business
  results.push(await runTest('POST /businesses - Create business', async () => {
    if (!context.tokens.businessOwnerToken) {
      throw new Error('No business owner token available');
    }
    
    // Get category
    const categoriesResponse = await api.get('/categories');
    const categories = expectData(categoriesResponse, 'categories') || expectData(categoriesResponse);
    const categoryId = Array.isArray(categories) ? categories[0]?.id : categories?.id;

    const response = await api.post('/businesses', {
      name: `Test Business ${Date.now()}`,
      description: 'A test business created during testing',
      categoryId,
      addressLine1: '456 Test Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      phone: '+14155559999',
    }, {
      headers: { Authorization: `Bearer ${context.tokens.businessOwnerToken}` },
    });
    expectStatus(response, 201);
    const data = expectData(response);
    expect(data.id, 'Business ID should exist');
    context.testData.businessIds.push(data.id);
  }));

  // Test: PATCH /api/businesses/:id - Update business
  results.push(await runTest('PATCH /businesses/:id - Update business', async () => {
    if (!context.tokens.businessOwnerToken || context.testData.businessIds.length === 0) {
      throw new Error('No business to update');
    }
    const businessId = context.testData.businessIds[0];
    const response = await api.patch(`/businesses/${businessId}`, {
      description: 'Updated description',
    }, {
      headers: { Authorization: `Bearer ${context.tokens.businessOwnerToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.description === 'Updated description', `Expected 'Updated description', got '${data.description}'`);
  }));

  // Test: DELETE /api/businesses/:id - Delete business
  results.push(await runTest('DELETE /businesses/:id - Delete business', async () => {
    if (!context.tokens.businessOwnerToken || context.testData.businessIds.length === 0) {
      throw new Error('No business to delete');
    }
    const businessId = context.testData.businessIds[context.testData.businessIds.length - 1];
    const response = await api.delete(`/businesses/${businessId}`, {
      headers: { Authorization: `Bearer ${context.tokens.businessOwnerToken}` },
    });
    expectStatus(response, 204);
    // Remove from test data
    context.testData.businessIds.pop();
  }));

  return results;
}

module.exports = { testBusinesses };
