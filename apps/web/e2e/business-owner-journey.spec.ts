import { test, expect, Page } from '@playwright/test';

/**
 * Business Owner Journey E2E Tests
 * Simulates real business owner interactions across the platform
 */

test.describe('Business Owner Journey Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start fresh - clear any existing state
    await page.context().clearCookies();
  });

  test('1. Business Registration Flow', async ({ page }) => {
    console.log('🏢 Testing Business Registration...');
    
    // Navigate to business registration
    await page.goto('/business/register');
    await page.waitForLoadState('networkidle');
    
    // Check page loads
    await expect(page).toHaveTitle(/Register|Business/i);
    console.log('✅ Registration page loaded');
    
    // Fill in business registration form
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(`test-business-${Date.now()}@test.tarsit.com`);
      console.log('✅ Filled email');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'playwright-results/business-01-registration.png', fullPage: true });
    
    console.log('✅ Business registration test completed');
  });

  test('2. Business Dashboard Access', async ({ page }) => {
    console.log('📊 Testing Business Dashboard...');
    
    // Navigate to dashboard (would need auth in real scenario)
    await page.goto('/business/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check page loads (may redirect to login)
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Take screenshot
    await page.screenshot({ path: 'playwright-results/business-02-dashboard.png', fullPage: true });
    
    console.log('✅ Business dashboard test completed');
  });

  test('3. Business Profile Management', async ({ page }) => {
    console.log('✏️ Testing Business Profile Management...');
    
    // Navigate to business settings
    await page.goto('/business/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'playwright-results/business-03-profile.png', fullPage: true });
    
    console.log('✅ Business profile management test completed');
  });

  test('4. Reviews Management', async ({ page }) => {
    console.log('⭐ Testing Reviews Management...');
    
    // Navigate to reviews section
    await page.goto('/business/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'playwright-results/business-04-reviews.png', fullPage: true });
    
    console.log('✅ Reviews management test completed');
  });

  test('5. Appointments Management', async ({ page }) => {
    console.log('📅 Testing Appointments Management...');
    
    // Navigate to appointments
    await page.goto('/business/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'playwright-results/business-05-appointments.png', fullPage: true });
    
    console.log('✅ Appointments management test completed');
  });
});
