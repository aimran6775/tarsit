/**
 * Health Check Endpoints Tests
 */

const { expectStatus, expectData, expect, runTest } = require('../utils/test-helpers');

async function testHealth(context) {
  const { api } = context;
  const results: TestResult[] = [];

  // Test: GET /api/health
  results.push(await runTest('GET /health - Basic health check', async () => {
    const response = await api.get('/health');
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.status === 'ok', 'Status should be ok');
  }));

  // Test: GET /api/health/detailed
  results.push(await runTest('GET /health/detailed - Detailed health check', async () => {
    const response = await api.get('/health/detailed');
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.status, 'Status should exist');
    expect(data.database, 'Database info should exist');
  }));

  // Test: GET /api/health/ready
  results.push(await runTest('GET /health/ready - Readiness probe', async () => {
    const response = await api.get('/health/ready');
    expectStatus(response, 200);
  }));

  // Test: GET /api/health/live
  results.push(await runTest('GET /health/live - Liveness probe', async () => {
    const response = await api.get('/health/live');
    expectStatus(response, 200);
  }));

  return results;
}

module.exports = { testHealth };
