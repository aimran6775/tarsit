/**
 * Appointments Endpoints Tests
 * Tests appointment booking functionality
 */

const { expectStatus, expectData, expect, runTest } = require('../utils/test-helpers');
const { getExistingBusiness } = require('../utils/test-data');

async function testAppointments(context) {
  const { api, prisma } = context;
  const results: TestResult[] = [];

  // Test: GET /api/appointments - List appointments
  results.push(await runTest('GET /appointments - List user appointments', async () => {
    if (!context.tokens.customerToken) {
      throw new Error('No customer token available');
    }
    const response = await api.get('/appointments?page=1&limit=20', {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(Array.isArray(data.appointments || data), 'Appointments should be an array');
  }));

  // Test: POST /api/appointments - Create appointment
  results.push(await runTest('POST /appointments - Create appointment', async () => {
    if (!context.tokens.customerToken) {
      throw new Error('No customer token available');
    }
    const existingBusiness = await getExistingBusiness(prisma, api);
    
    // Check if business has services
    const businessResponse = await api.get(`/businesses/${existingBusiness.id}`);
    const business = expectData(businessResponse);
    const services = business.services || [];
    
    if (services.length === 0) {
      throw new Error('Business has no services - cannot create appointment');
    }

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    futureDate.setHours(10, 0, 0, 0); // 10 AM

    const response = await api.post('/appointments', {
      businessId: existingBusiness.id,
      serviceId: services[0].id,
      date: futureDate.toISOString(),
      notes: 'Test appointment from automated testing',
    }, {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    expectStatus(response, 201);
    const data = expectData(response);
    expect(data.id, 'Appointment ID should exist');
    context.testData.appointmentIds.push(data.id);
  }));

  // Test: GET /api/appointments/:id - Get single appointment
  results.push(await runTest('GET /appointments/:id - Get appointment', async () => {
    if (!context.tokens.customerToken || context.testData.appointmentIds.length === 0) {
      throw new Error('No appointment to retrieve');
    }
    const appointmentId = context.testData.appointmentIds[0];
    const response = await api.get(`/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.id === appointmentId, `Expected appointment ID ${appointmentId}, got ${data.id}`);
  }));

  // Test: PATCH /api/appointments/:id - Update appointment
  results.push(await runTest('PATCH /appointments/:id - Update appointment', async () => {
    if (!context.tokens.customerToken || context.testData.appointmentIds.length === 0) {
      throw new Error('No appointment to update');
    }
    const appointmentId = context.testData.appointmentIds[0];
    const response = await api.patch(`/appointments/${appointmentId}`, {
      notes: 'Updated notes',
    }, {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(data.notes === 'Updated notes', `Expected 'Updated notes', got '${data.notes}'`);
  }));

  // Test: DELETE /api/appointments/:id - Cancel appointment
  results.push(await runTest('DELETE /appointments/:id - Cancel appointment', async () => {
    if (!context.tokens.customerToken || context.testData.appointmentIds.length === 0) {
      throw new Error('No appointment to cancel');
    }
    const appointmentId = context.testData.appointmentIds[0];
    const response = await api.delete(`/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    expectStatus(response, 200);
    context.testData.appointmentIds.shift();
  }));

  return results;
}

module.exports = { testAppointments };
