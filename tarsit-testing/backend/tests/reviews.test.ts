/**
 * Reviews Endpoints Tests
 * Tests all review-related endpoints
 */

const { expectStatus, expectData, expect, runTest } = require('../utils/test-helpers');
const { getExistingBusiness, getTestBusiness } = require('../utils/test-data');

async function testReviews(context) {
  const { api, prisma } = context;
  const results: TestResult[] = [];

  // Test: GET /api/reviews - List reviews
  results.push(await runTest('GET /reviews - List all reviews', async () => {
    const response = await api.get('/reviews?page=1&limit=10');
    expectStatus(response, 200);
    const data = expectData(response);
    expect(Array.isArray(data.data || data.reviews || data), 'Reviews should be an array');
  }));

  // Test: GET /api/reviews?businessId=:id - Get reviews for business
  results.push(await runTest('GET /reviews - Get reviews for business', async () => {
    const existingBusiness = await getExistingBusiness(prisma, api);
    const response = await api.get(`/reviews?businessId=${existingBusiness.id}`);
    expectStatus(response, 200);
    const data = expectData(response);
    expect(Array.isArray(data.data || data.reviews || data), 'Reviews should be an array');
  }));

  // Test: POST /api/reviews - Create review
  // Create review on the TEST BUSINESS owned by testowner@tarsit.com
  // so that businessOwnerToken (testowner) can respond to it
  results.push(await runTest('POST /reviews - Create review', async () => {
    if (!context.tokens.customerToken) {
      throw new Error('No customer token available');
    }
    // Use the test business owned by testowner@tarsit.com
    const testBusiness = await getTestBusiness(prisma);

    const response = await api.post('/reviews', {
      businessId: testBusiness.id,
      rating: 5,
      title: 'Great service!',
      comment: 'This is a test review created during testing.',
    }, {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    expectStatus(response, 201);
    const data = expectData(response);
    expect(data.id, 'Review ID should exist');
    expect(data.rating === 5, `Expected rating 5, got ${data.rating}`);
    context.testData.reviewIds.push(data.id);
  }));

  // Test: POST /api/reviews/:id/respond - Respond to review
  // Note: The API returns 201 when creating a response
  results.push(await runTest('POST /reviews/:id/respond - Business owner response', async () => {
    if (!context.tokens.businessOwnerToken || context.testData.reviewIds.length === 0) {
      throw new Error('No review to respond to');
    }
    const reviewId = context.testData.reviewIds[0];
    const response = await api.post(`/reviews/${reviewId}/respond`, {
      response: 'Thank you for your feedback!',
    }, {
      headers: { Authorization: `Bearer ${context.tokens.businessOwnerToken}` },
    });
    // Accept both 200 and 201 as valid
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Expected status 200 or 201, got ${response.status}. Response: ${JSON.stringify(response.data)}`);
    }
    const data = expectData(response);
    expect(data.response, 'Response should exist');
  }));

  // Test: DELETE /api/reviews/:id/respond - Delete response
  // Note: The API returns 204 No Content for delete operations
  results.push(await runTest('DELETE /reviews/:id/respond - Delete response', async () => {
    if (!context.tokens.businessOwnerToken || context.testData.reviewIds.length === 0) {
      throw new Error('No review with response to delete');
    }
    const reviewId = context.testData.reviewIds[0];
    const response = await api.delete(`/reviews/${reviewId}/respond`, {
      headers: { Authorization: `Bearer ${context.tokens.businessOwnerToken}` },
    });
    // Accept both 200 and 204 as valid
    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`Expected status 200 or 204, got ${response.status}. Response: ${JSON.stringify(response.data)}`);
    }
  }));

  // Test: GET /api/reviews/:id - Get single review
  results.push(await runTest('GET /reviews/:id - Get single review', async () => {
    let reviewId;
    if (context.testData.reviewIds.length === 0) {
      // Try to get any existing review
      const reviewsResponse = await api.get('/reviews?limit=1');
      const data = reviewsResponse.data;
      const reviews = data.reviews || (Array.isArray(data) ? data : [data]);
      if (!reviews || (Array.isArray(reviews) && reviews.length === 0)) {
        throw new Error('No reviews available for testing');
      }
      reviewId = Array.isArray(reviews) ? reviews[0].id : reviews.id;
    } else {
      reviewId = context.testData.reviewIds[0];
    }

    const response = await api.get(`/reviews/${reviewId}`);
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.id === reviewId, `Expected review ID ${reviewId}, got ${data.id}`);
  }));

  return results;
}

module.exports = { testReviews };
