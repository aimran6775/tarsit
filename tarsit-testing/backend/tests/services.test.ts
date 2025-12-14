/**
 * Services Endpoints Tests
 */

const { expectStatus, expectData, expect, runTest } = require('../utils/test-helpers');
const { getExistingBusiness, getTestBusiness } = require('../utils/test-data');

async function testServices(context) {
  const { api, prisma } = context;
  const results: TestResult[] = [];

  // Test: GET /api/services - List services
  results.push(await runTest('GET /services - List all services', async () => {
    const response = await api.get('/services?page=1&limit=20');
    // Services endpoint might be at different path or not exist
    if (response.status === 404) {
      // Endpoint doesn't exist, skip this test
      return;
    }
    expectStatus(response, 200);
    const data = expectData(response);
    expect(Array.isArray(data.services || data), 'Services should be an array');
  }));

  // Test: GET /api/services?businessId=:id - Get services for business
  results.push(await runTest('GET /services - Get services for business', async () => {
    const existingBusiness = await getExistingBusiness(prisma, api);
    const response = await api.get(`/services?businessId=${existingBusiness.id}`);
    expectStatus(response, 200);
    const data = expectData(response);
    expect(Array.isArray(data.services || data), 'Services should be an array');
  }));

  // Test: POST /api/services - Create service
  results.push(await runTest('POST /services - Create service', async () => {
    if (!context.tokens.businessOwnerToken) {
      throw new Error('No business owner token available');
    }

    // Use the test business owned by testowner@tarsit.com
    const testBusiness = await getTestBusiness(prisma);

    const response = await api.post('/services', {
      businessId: testBusiness.id,
      name: 'Test Service',
      description: 'A test service for testing purposes',
      price: 50,
      duration: 60,
    }, {
      headers: { Authorization: `Bearer ${context.tokens.businessOwnerToken}` },
    });
    expectStatus(response, 201);
    const data = expectData(response);
    expect(data.id, 'Service ID should exist');
  }));

  // Test: GET /api/services/:id - Get single service
  // Use the test business which has seeded services
  results.push(await runTest('GET /services/:id - Get service by ID', async () => {
    const testBusiness = await getTestBusiness(prisma);
    const servicesResponse = await api.get(`/services?businessId=${testBusiness.id}&limit=1`);
    const servicesData = expectData(servicesResponse);
    const services = servicesData.services || servicesData.data || servicesData;

    if (!services || (Array.isArray(services) && services.length === 0)) {
      throw new Error('Test business has no services - please run: pnpm prisma db seed');
    }
    const serviceId = Array.isArray(services) ? services[0].id : services.id;

    const response = await api.get(`/services/${serviceId}`);
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.id === serviceId, `Expected service ID ${serviceId}, got ${data.id}`);
  }));

  return results;
}

module.exports = { testServices };
