/**
 * Categories Endpoints Tests
 */

const { expectStatus, expectData, expect, runTest } = require('../utils/test-helpers');

async function testCategories(context) {
  const { api } = context;
  const results: TestResult[] = [];

  // Test: GET /api/categories
  results.push(await runTest('GET /categories - List all categories', async () => {
    const response = await api.get('/categories');
    expectStatus(response, 200);
    const data = expectData(response, 'categories') || expectData(response);
    expect(Array.isArray(data), 'Categories should be an array');
    expect(data.length > 0, 'Should have at least one category');
  }));

  // Test: GET /api/categories/:id
  results.push(await runTest('GET /categories/:id - Get category by ID', async () => {
    // First get categories
    const categoriesResponse = await api.get('/categories');
    const categories = expectData(categoriesResponse, 'categories') || expectData(categoriesResponse);
    if (!categories || (Array.isArray(categories) && categories.length === 0)) {
      throw new Error('No categories found');
    }
    const categoryId = Array.isArray(categories) ? categories[0].id : categories.id;
    
    const response = await api.get(`/categories/${categoryId}`);
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.id === categoryId, `Expected category ID ${categoryId}, got ${data.id}`);
  }));

  // Test: GET /api/categories/slug/:slug
  results.push(await runTest('GET /categories/slug/:slug - Get category by slug', async () => {
    const categoriesResponse = await api.get('/categories');
    const categories = expectData(categoriesResponse, 'categories') || expectData(categoriesResponse);
    if (!categories || (Array.isArray(categories) && categories.length === 0)) {
      throw new Error('No categories found');
    }
    const categorySlug = Array.isArray(categories) ? categories[0].slug : categories.slug;
    
    const response = await api.get(`/categories/slug/${categorySlug}`);
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.slug === categorySlug, `Expected slug ${categorySlug}, got ${data.slug}`);
  }));

  return results;
}

module.exports = { testCategories };
