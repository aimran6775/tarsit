/**
 * Uploads Endpoints Tests
 * Tests image upload functionality
 */

const { expectStatus, expectData, expect, runTest } = require('../utils/test-helpers');
const FormData = require('form-data');

async function testUploads(context) {
  const { api } = context;
  const results: TestResult[] = [];

  // Test: POST /api/uploads/image - Upload single image
  results.push(
    await runTest('POST /uploads/image - Upload single image', async () => {
      if (!context.tokens.customerToken) {
        throw new Error('No auth token available');
      }

      // Create a simple test image (1x1 PNG)
      const testImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', testImageBuffer, {
        filename: 'test.png',
        contentType: 'image/png',
      });
      form.append('folder', 'test');

      const response = await api.post('/uploads/image', form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${context.tokens.customerToken}`,
        },
      });

      // May fail if Supabase Storage not configured, which is acceptable
      if (response.status === 500 || response.status === 503) {
        throw new Error('Upload service not configured (Supabase)');
      }
      expectStatus(response, 201);
      const data = expectData(response);
      expect(data.url, 'Image URL should exist');
    })
  );

  // Test: POST /api/uploads/images - Upload multiple images
  results.push(
    await runTest('POST /uploads/images - Upload multiple images', async () => {
      if (!context.tokens.customerToken) {
        throw new Error('No auth token available');
      }

      const testImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const FormData = require('form-data');
      const form = new FormData();
      form.append('files', testImageBuffer, {
        filename: 'test1.png',
        contentType: 'image/png',
      });
      form.append('files', testImageBuffer, {
        filename: 'test2.png',
        contentType: 'image/png',
      });
      form.append('folder', 'test');

      const response = await api.post('/uploads/images', form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${context.tokens.customerToken}`,
        },
      });

      if (response.status === 500 || response.status === 503) {
        throw new Error('Upload service not configured (Supabase)');
      }
      expectStatus(response, 201);
      const data = expectData(response);
      expect(Array.isArray(data.images || data), 'Images should be an array');
    })
  );

  return results;
}

module.exports = { testUploads };
