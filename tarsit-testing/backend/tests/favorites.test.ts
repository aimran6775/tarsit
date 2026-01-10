/**
 * Favorites Endpoints Tests
 */

const { expectStatus, expectData, expect, runTest } = require('../utils/test-helpers');
const { getExistingBusiness } = require('../utils/test-data');

async function testFavorites(context) {
  const { api, prisma } = context;
  const results: TestResult[] = [];

  // Test: GET /api/favorites - List favorites
  results.push(await runTest('GET /favorites - List user favorites', async () => {
    if (!context.tokens.customerToken) {
      throw new Error('No customer token available');
    }
    const response = await api.get('/favorites?page=1&limit=20', {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(Array.isArray(data.favorites || data), 'Favorites should be an array');
  }));

  // Test: POST /api/favorites - Add favorite
  results.push(await runTest('POST /favorites - Add business to favorites', async () => {
    if (!context.tokens.customerToken) {
      throw new Error('No customer token available');
    }
    const existingBusiness = await getExistingBusiness(prisma);
    
    const response = await api.post('/favorites', {
      businessId: existingBusiness.id,
    }, {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    // May return 400 if already favorited, which is acceptable
    if (response.status === 400) {
      return; // Already favorited
    }
    expectStatus(response, 201);
    const data = expectData(response);
    expect(data.id, 'Favorite ID should exist');
  }));

  // Test: DELETE /api/favorites/business/:businessId
  results.push(await runTest('DELETE /favorites/business/:id - Remove favorite', async () => {
    if (!context.tokens.customerToken) {
      throw new Error('No customer token available');
    }
    const existingBusiness = await getExistingBusiness(prisma);
    
    const response = await api.delete(`/favorites/business/${existingBusiness.id}`, {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    // May return 404 if not favorited, which is acceptable
    if (response.status === 404) {
      return;
    }
    expectStatus(response, 200);
  }));

  return results;
}

module.exports = { testFavorites };
