/**
 * Messages & Chats Endpoints Tests
 * Tests messaging functionality
 */

const { expectStatus, expectData, expect, runTest } = require('../utils/test-helpers');
const { getExistingBusiness } = require('../utils/test-data');

async function testMessages(context) {
  const { api, prisma } = context;
  const results: TestResult[] = [];

  // Test: GET /api/chats - List chats
  results.push(await runTest('GET /chats - List user chats', async () => {
    if (!context.tokens.customerToken) {
      throw new Error('No customer token available');
    }
    const response = await api.get('/chats?page=1&limit=20', {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(Array.isArray(data.chats || data), 'Chats should be an array');
  }));

  // Test: POST /api/chats - Create chat
  results.push(await runTest('POST /chats - Create new chat', async () => {
    if (!context.tokens.customerToken) {
      throw new Error('No customer token available');
    }
    const existingBusiness = await getExistingBusiness(prisma, api);

    const response = await api.post('/chats', {
      businessId: existingBusiness.id,
    }, {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    // May return existing chat (409) or create new (201)
    if (response.status === 409) {
      return; // Chat already exists, that's fine
    }
    expectStatus(response, 201);
    const data = expectData(response);
    expect(data.id, 'Message ID should exist');
  }));

  // Test: GET /api/messages/:chatId - Get messages for a chat
  // The correct endpoint is GET /messages/:chatId, not GET /chats/:id/messages
  results.push(await runTest('GET /messages/:chatId - Get chat messages', async () => {
    if (!context.tokens.customerToken) {
      throw new Error('No customer token available');
    }
    // First get a chat
    const chatsResponse = await api.get('/chats?limit=1', {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    const chatsData = expectData(chatsResponse);
    const chats = chatsData.chats || chatsData.data || chatsData;
    if (!chats || (Array.isArray(chats) && chats.length === 0)) {
      throw new Error('No chats available for testing');
    }
    const chatId = Array.isArray(chats) ? chats[0].id : chats.id;

    // Use the correct endpoint: /messages/:chatId
    const response = await api.get(`/messages/${chatId}?page=1&limit=50`, {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    expectStatus(response, 200);
    const data = expectData(response);
    expect(Array.isArray(data.messages || data.data || data), 'Messages should be an array');
  }));

  // Test: POST /api/messages - Send message
  results.push(await runTest('POST /messages - Send text message', async () => {
    if (!context.tokens.customerToken) {
      throw new Error('No customer token available');
    }
    // Get or create a chat
    const existingBusiness = await getExistingBusiness(prisma, api);
    let chatResponse = await api.post('/chats', {
      businessId: existingBusiness.id,
    }, {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });

    const chatId = chatResponse.data.id || (chatResponse.status === 409 ?
      (await api.get('/chats', {
        headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
      })).data.chats?.[0]?.id : null);

    if (!chatId) {
      throw new Error('Could not get chat ID');
    }

    const response = await api.post('/messages', {
      chatId,
      content: 'Test message from automated testing',
      type: 'TEXT',
    }, {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    expectStatus(response, 201);
    const data = expectData(response);
    expect(data.id, 'Message ID should exist');
    expect(data.content === 'Test message from automated testing', `Expected content 'Test message from automated testing', got '${data.content}'`);
    context.testData.messageIds.push(data.id);
  }));

  // Test: PATCH /api/messages/:chatId/mark-as-read - Mark all messages in a chat as read
  // The correct endpoint is PATCH /messages/:chatId/mark-as-read
  results.push(await runTest('PATCH /messages/:chatId/mark-as-read - Mark messages as read', async () => {
    if (!context.tokens.customerToken) {
      throw new Error('No customer token available');
    }
    // Get a chat first
    const chatsResponse = await api.get('/chats?limit=1', {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    const chatsData = expectData(chatsResponse);
    const chats = chatsData.chats || chatsData.data || chatsData;
    if (!chats || (Array.isArray(chats) && chats.length === 0)) {
      throw new Error('No chats available for testing');
    }
    const chatId = Array.isArray(chats) ? chats[0].id : chats.id;

    // Use the correct endpoint: /messages/:chatId/mark-as-read
    const response = await api.patch(`/messages/${chatId}/mark-as-read`, {}, {
      headers: { Authorization: `Bearer ${context.tokens.customerToken}` },
    });
    expectStatus(response, 200);
  }));

  return results;
}

module.exports = { testMessages };
