/**
 * Search Endpoints Tests
 * Tests search functionality
 */

const { expectStatus, expectData, expect, runTest } = require('../utils/test-helpers');

async function testSearch(context) {
  const { api } = context;
  const results: TestResult[] = [];

  // Test: GET /api/search - Basic search
  results.push(await runTest('GET /search - Basic search query', async () => {
    const response = await api.get('/search?q=salon&page=1&limit=10');
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.businesses, 'Businesses should exist');
    expect(Array.isArray(data.businesses), 'Businesses should be an array');
  }));

  // Test: GET /api/search - Location-based search
  results.push(await runTest('GET /search - Location-based search', async () => {
    // Use city parameter instead of location
    const response = await api.get('/search?q=restaurant&city=San Francisco&page=1');
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.businesses, 'Businesses should exist');
  }));

  // Test: GET /api/search - With coordinates
  results.push(await runTest('GET /search - With latitude/longitude', async () => {
    const response = await api.get('/search?latitude=37.7749&longitude=-122.4194&radius=10&page=1');
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.businesses, 'Businesses should exist');
  }));

  // Test: GET /api/search - With filters
  results.push(await runTest('GET /search - With filters (category, rating, price)', async () => {
    // First get a category
    const categoriesResponse = await api.get('/categories');
    const categories = expectData(categoriesResponse, 'categories') || expectData(categoriesResponse);
    if (!categories || (Array.isArray(categories) && categories.length === 0)) {
      throw new Error('No categories found');
    }
    const categorySlug = Array.isArray(categories) ? categories[0]?.slug : categories?.slug;

    const response = await api.get(`/search?categorySlug=${categorySlug}&minRating=4&priceRange=MODERATE&page=1`);
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.businesses, 'Businesses should exist');
  }));

  // Test: GET /api/search - Sort options
  results.push(await runTest('GET /search - Sort by rating', async () => {
    const response = await api.get('/search?sortBy=rating&page=1');
    expectStatus(response, 200);
    expectStatus(response, 200);
  }));

  results.push(await runTest('GET /search - Sort by distance', async () => {
    const response = await api.get('/search?sortBy=distance&latitude=37.7749&longitude=-122.4194&page=1');
    expectStatus(response, 200);
    expectStatus(response, 200);
  }));

  // Test: GET /api/search - Empty results
  results.push(await runTest('GET /search - No results query', async () => {
    const response = await api.get('/search?q=nonexistentbusinessxyz123&page=1');
    expectStatus(response, 200);
    const data = expectData(response);
    expect(Array.isArray(data.businesses), 'Businesses should be an array');
  }));

  return results;
}

module.exports = { testSearch };
