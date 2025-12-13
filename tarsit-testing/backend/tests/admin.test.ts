/**
 * Admin Endpoints Tests
 * Tests all admin-only endpoints
 */

const { expectStatus, expectData, runTest } = require('../utils/test-helpers');

async function testAdmin(context) {
  const { api } = context;
  const results: TestResult[] = [];

  // Test: GET /api/admin/dashboard/real-time
  results.push(await runTest('GET /admin/dashboard/real-time - Real-time stats', async () => {
    if (!context.tokens.adminToken) {
      throw new Error('No admin token available');
    }
    const response = await api.get('/admin/dashboard/real-time', {
      headers: { Authorization: `Bearer ${context.tokens.adminToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.overview, 'Overview should exist');
    expect(data.realTime, 'Real-time data should exist');
  }));

  // Test: GET /api/admin/users
  results.push(await runTest('GET /admin/users - List all users', async () => {
    if (!context.tokens.adminToken) {
      throw new Error('No admin token available');
    }
    const response = await api.get('/admin/users?page=1&limit=20', {
      headers: { Authorization: `Bearer ${context.tokens.adminToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.users, 'Users should exist');
    expect(Array.isArray(data.users), 'Users should be an array');
  }));

  // Test: GET /api/admin/businesses
  results.push(await runTest('GET /admin/businesses - List all businesses', async () => {
    if (!context.tokens.adminToken) {
      throw new Error('No admin token available');
    }
    const response = await api.get('/admin/businesses?page=1&limit=20', {
      headers: { Authorization: `Bearer ${context.tokens.adminToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.businesses, 'Businesses should exist');
  }));

  // Test: GET /api/admin/reviews
  results.push(await runTest('GET /admin/reviews - List all reviews', async () => {
    if (!context.tokens.adminToken) {
      throw new Error('No admin token available');
    }
    const response = await api.get('/admin/reviews?page=1&limit=20', {
      headers: { Authorization: `Bearer ${context.tokens.adminToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.reviews, 'Reviews should exist');
  }));

  // Test: GET /api/admin/system/health
  results.push(await runTest('GET /admin/system/health - System health', async () => {
    if (!context.tokens.adminToken) {
      throw new Error('No admin token available');
    }
    const response = await api.get('/admin/system/health', {
      headers: { Authorization: `Bearer ${context.tokens.adminToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.status, 'Status should exist');
    expect(data.database, 'Database info should exist');
  }));

  // Test: GET /api/admin/insights/ai
  results.push(await runTest('GET /admin/insights/ai - AI insights', async () => {
    if (!context.tokens.adminToken) {
      throw new Error('No admin token available');
    }
    const response = await api.get('/admin/insights/ai', {
      headers: { Authorization: `Bearer ${context.tokens.adminToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.businessTrends || data.customerSentiment, 'AI insights should exist');
  }));

  // Test: GET /api/admin/audit-logs
  results.push(await runTest('GET /admin/audit-logs - Audit logs', async () => {
    if (!context.tokens.adminToken) {
      throw new Error('No admin token available');
    }
    const response = await api.get('/admin/audit-logs?page=1&limit=20', {
      headers: { Authorization: `Bearer ${context.tokens.adminToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.logs || data.pagination, 'Audit logs should exist');
  }));

  // Test: POST /api/admin/reports/generate
  results.push(await runTest('POST /admin/reports/generate - Generate report', async () => {
    if (!context.tokens.adminToken) {
      throw new Error('No admin token available');
    }
    const response = await api.post('/admin/reports/generate', {
      type: 'user-activity',
    }, {
      headers: { Authorization: `Bearer ${context.tokens.adminToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.type === 'user-activity', `Expected type 'user-activity', got '${data.type}'`);
  }));

  // Test: PATCH /api/admin/users/:id
  results.push(await runTest('PATCH /admin/users/:id - Update user', async () => {
    if (!context.tokens.adminToken || context.testData.userIds.length === 0) {
      throw new Error('No user to update');
    }
    const userId = context.testData.userIds[0];
    const response = await api.patch(`/admin/users/${userId}`, {
      verified: true,
    }, {
      headers: { Authorization: `Bearer ${context.tokens.adminToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.verified).toBe(true);
  }));

  // Test: PATCH /api/admin/businesses/:id
  results.push(await runTest('PATCH /admin/businesses/:id - Update business', async () => {
    if (!context.tokens.adminToken || context.testData.businessIds.length === 0) {
      throw new Error('No business to update');
    }
    const businessId = context.testData.businessIds[0];
    const response = await api.patch(`/admin/businesses/${businessId}`, {
      verified: true,
      featured: true,
    }, {
      headers: { Authorization: `Bearer ${context.tokens.adminToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.verified).toBe(true);
  }));

  return results;
}

module.exports = { testAdmin };
