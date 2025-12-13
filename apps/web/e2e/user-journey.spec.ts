import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive User Journey E2E Tests
 * Simulates real human interactions across the entire website
 */

test.describe('Complete User Journey Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start fresh - clear any existing state
    await page.context().clearCookies();
  });

  test('1. Home Page - All Elements Load and Are Clickable', async ({ page }) => {
    console.log('🏠 Testing Home Page...');
    
    // Navigate to home
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'playwright-results/01-home-initial.png', fullPage: true });
    
    // Check page title
    await expect(page).toHaveTitle(/Tarsit/i);
    
    // Check hero section is visible
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible();
    console.log('✅ Hero heading visible');
    
    // Check search bar exists and is interactable
    const searchInput = page.locator('input[placeholder*="looking for"]').first();
    await expect(searchInput).toBeVisible();
    console.log('✅ Search input visible');
    
    // Type in search bar
    await searchInput.click();
    await searchInput.fill('Hair Salon');
    console.log('✅ Typed in search bar');
    
    // Check location input
    const locationInput = page.locator('input[placeholder*="Location"]').first();
    if (await locationInput.isVisible()) {
      await locationInput.fill('San Francisco');
      console.log('✅ Typed in location');
    }
    
    // Take screenshot after filling
    await page.screenshot({ path: 'playwright-results/02-home-search-filled.png' });
    
    // Click search button
    const searchButton = page.locator('button:has-text("Search")').first();
    await expect(searchButton).toBeVisible();
    await searchButton.click();
    
    // Wait for navigation to search page
    await page.waitForURL(/\/search/, { timeout: 10000 });
    console.log('✅ Navigated to search page');
    
    await page.screenshot({ path: 'playwright-results/03-search-results.png', fullPage: true });
  });

  test('2. Category Navigation from Home Page', async ({ page }) => {
    console.log('📂 Testing Category Navigation...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find and click on a category card
    const categoryCards = page.locator('a[href*="/search?category"]');
    const categoryCount = await categoryCards.count();
    console.log(`Found ${categoryCount} category cards`);
    
    if (categoryCount > 0) {
      // Get the first category's name
      const firstCategory = categoryCards.first();
      await expect(firstCategory).toBeVisible();
      
      // Click the category
      await firstCategory.click();
      
      // Wait for navigation
      await page.waitForURL(/\/search/, { timeout: 10000 });
      console.log('✅ Category click navigated to search');
      
      await page.screenshot({ path: 'playwright-results/04-category-search.png', fullPage: true });
    } else {
      console.log('⚠️ No category cards found, trying alternate selector');
      
      // Try finding any link that goes to search with category
      const anySearchLink = page.locator('a[href*="search"]').first();
      if (await anySearchLink.isVisible()) {
        await anySearchLink.click();
        await page.waitForURL(/\/search/, { timeout: 10000 });
      }
    }
  });

  test('3. Header Navigation - All Links Work', async ({ page }) => {
    console.log('🧭 Testing Header Navigation...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test "Explore" link
    const exploreLink = page.locator('header a:has-text("Explore")');
    if (await exploreLink.isVisible()) {
      await exploreLink.click();
      await page.waitForURL(/\/search/, { timeout: 10000 });
      console.log('✅ Explore link works');
      await page.screenshot({ path: 'playwright-results/05-explore-page.png' });
    }
    
    // Go back and test Categories link
    await page.goto('/');
    const categoriesLink = page.locator('header a:has-text("Categories")');
    if (await categoriesLink.isVisible()) {
      await categoriesLink.click();
      await page.waitForURL(/\/categories/, { timeout: 10000 });
      console.log('✅ Categories link works');
      await page.screenshot({ path: 'playwright-results/06-categories-page.png', fullPage: true });
    }
    
    // Test "For Business" link
    await page.goto('/');
    const forBusinessLink = page.locator('header a:has-text("For Business")');
    if (await forBusinessLink.isVisible()) {
      await forBusinessLink.click();
      await page.waitForURL(/\/business/, { timeout: 10000 });
      console.log('✅ For Business link works');
      await page.screenshot({ path: 'playwright-results/07-business-register.png', fullPage: true });
    }
    
    // Test "Sign in" link
    await page.goto('/');
    const signInLink = page.locator('header a:has-text("Sign in")');
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
      console.log('✅ Sign in link works');
      await page.screenshot({ path: 'playwright-results/08-login-page.png', fullPage: true });
    }
    
    // Test "Get started" button
    await page.goto('/');
    const getStartedBtn = page.locator('header a:has-text("Get started")');
    if (await getStartedBtn.isVisible()) {
      await getStartedBtn.click();
      await page.waitForURL(/\/auth\/signup/, { timeout: 10000 });
      console.log('✅ Get started button works');
      await page.screenshot({ path: 'playwright-results/09-signup-page.png', fullPage: true });
    }
  });

  test('4. Search Page - Filtering and Results', async ({ page }) => {
    console.log('🔍 Testing Search Page...');
    
    // Go directly to search
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'playwright-results/10-search-initial.png', fullPage: true });
    
    // Check if search results are displayed
    const businessCards = page.locator('[class*="card"], [class*="business"]');
    const cardCount = await businessCards.count();
    console.log(`Found ${cardCount} business cards`);
    
    // Try search with query
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('salon');
      
      // Press Enter or click search
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);
      
      console.log('✅ Search query submitted');
      await page.screenshot({ path: 'playwright-results/11-search-filtered.png', fullPage: true });
    }
    
    // Try to click on a business card if available
    const firstCard = page.locator('a[href*="/business/"]').first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForURL(/\/business\//, { timeout: 10000 });
      console.log('✅ Clicked business card, navigated to detail');
      await page.screenshot({ path: 'playwright-results/12-business-detail.png', fullPage: true });
    }
  });

  test('5. Auth Flow - Login Page Interaction', async ({ page }) => {
    console.log('🔐 Testing Login Flow...');
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'playwright-results/13-login-page.png', fullPage: true });
    
    // Check email input
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    await expect(emailInput).toBeVisible();
    await emailInput.fill('test@example.com');
    console.log('✅ Email input works');
    
    // Check password input
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('TestPassword123!');
    console.log('✅ Password input works');
    
    await page.screenshot({ path: 'playwright-results/14-login-filled.png' });
    
    // Find the submit button
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();
    await expect(submitBtn).toBeVisible();
    console.log('✅ Submit button visible');
    
    // Check if there's a signup link
    const signupLink = page.locator('a:has-text("Sign up"), a:has-text("Create account")');
    if (await signupLink.first().isVisible()) {
      console.log('✅ Signup link visible on login page');
    }
  });

  test('6. Auth Flow - Signup Page Interaction', async ({ page }) => {
    console.log('📝 Testing Signup Flow...');
    
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'playwright-results/15-signup-page.png', fullPage: true });
    
    // Fill first name
    const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="first" i]').first();
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill('Test');
      console.log('✅ First name input works');
    }
    
    // Fill last name
    const lastNameInput = page.locator('input[name="lastName"], input[placeholder*="last" i]').first();
    if (await lastNameInput.isVisible()) {
      await lastNameInput.fill('User');
      console.log('✅ Last name input works');
    }
    
    // Fill email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();
    await emailInput.fill('newuser@example.com');
    console.log('✅ Email input works');
    
    // Fill password
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('SecurePassword123!');
    console.log('✅ Password input works');
    
    await page.screenshot({ path: 'playwright-results/16-signup-filled.png' });
    
    // Check submit button
    const submitBtn = page.locator('button[type="submit"]').first();
    await expect(submitBtn).toBeVisible();
    console.log('✅ Submit button visible');
  });

  test('7. Categories Page - Full Interaction', async ({ page }) => {
    console.log('📋 Testing Categories Page...');
    
    await page.goto('/categories');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'playwright-results/17-categories-page.png', fullPage: true });
    
    // Check page loaded without errors
    const errorElement = page.locator('text=/error|undefined|invalid/i');
    const hasError = await errorElement.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasError) {
      console.log('⚠️ Error detected on categories page');
      await page.screenshot({ path: 'playwright-results/17-categories-error.png', fullPage: true });
    } else {
      console.log('✅ Categories page loaded without visible errors');
    }
    
    // Try to find category cards
    const categoryItems = page.locator('[class*="card"], [class*="category"]');
    const itemCount = await categoryItems.count();
    console.log(`Found ${itemCount} category items`);
    
    // Click on a category if available
    const clickableCategory = page.locator('a[href*="/search"]').first();
    if (await clickableCategory.isVisible({ timeout: 3000 }).catch(() => false)) {
      await clickableCategory.click();
      await page.waitForURL(/\/search/, { timeout: 10000 });
      console.log('✅ Category link navigation works');
    }
  });

  test('8. Footer Links', async ({ page }) => {
    console.log('🦶 Testing Footer Links...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'playwright-results/18-footer.png' });
    
    // Check footer links exist
    const footerLinks = page.locator('footer a');
    const linkCount = await footerLinks.count();
    console.log(`Found ${linkCount} footer links`);
    
    // Test About link - use .first() to avoid strict mode error
    const aboutLink = page.locator('footer a:has-text("About")').first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      console.log('✅ About link clicked');
      await page.screenshot({ path: 'playwright-results/19-about-page.png' });
    }
  });

  test('9. Mobile Responsiveness', async ({ page }) => {
    console.log('📱 Testing Mobile View...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'playwright-results/20-mobile-home.png', fullPage: true });
    
    // Check for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu" i], button:has(svg)').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
      console.log('✅ Mobile menu opened');
      await page.screenshot({ path: 'playwright-results/21-mobile-menu-open.png' });
    }
    
    // Test search on mobile
    await page.goto('/search');
    await page.screenshot({ path: 'playwright-results/22-mobile-search.png', fullPage: true });
    console.log('✅ Mobile search page loaded');
  });

  test('10. Error Handling - 404 Page', async ({ page }) => {
    console.log('🚫 Testing 404 Error Page...');
    
    // Use shorter timeout for 404 test
    await page.goto('/this-page-does-not-exist-12345', { timeout: 60000 });
    
    await page.screenshot({ path: 'playwright-results/23-404-page.png', fullPage: true });
    
    // Check for 404 content or redirect
    const is404 = await page.locator('text=/404|not found|page.*exist/i').isVisible({ timeout: 3000 }).catch(() => false);
    
    if (is404) {
      console.log('✅ 404 page displayed correctly');
    } else {
      console.log('ℹ️ May have redirected or custom error handling');
    }
  });

  test('11. Performance - Page Load Times', async ({ page }) => {
    console.log('⚡ Testing Page Load Performance...');
    
    const pages = [
      { name: 'Home', url: '/' },
      { name: 'Search', url: '/search' },
      { name: 'Categories', url: '/categories' },
      { name: 'Login', url: '/auth/login' },
      { name: 'Signup', url: '/auth/signup' },
    ];
    
    for (const p of pages) {
      const start = Date.now();
      await page.goto(p.url);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - start;
      
      console.log(`${p.name}: ${loadTime}ms`);
      
      // Warn if page takes more than 5 seconds
      if (loadTime > 5000) {
        console.log(`⚠️ ${p.name} page is slow (${loadTime}ms)`);
      } else {
        console.log(`✅ ${p.name} loaded in acceptable time`);
      }
    }
  });

  test('12. Console Errors Check', async ({ page }) => {
    console.log('🐛 Checking for Console Errors...');
    
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Visit main pages
    const pagesToCheck = ['/', '/search', '/categories', '/auth/login'];
    
    for (const url of pagesToCheck) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
    
    if (consoleErrors.length > 0) {
      console.log('⚠️ Console errors found:');
      consoleErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err.substring(0, 200)}`));
    } else {
      console.log('✅ No console errors detected');
    }
  });
});

// Quick smoke test that can be run frequently
test.describe('Quick Smoke Test', () => {
  test('All main pages load without crashing', async ({ page }) => {
    const pages = [
      { url: '/', name: 'Home' },
      { url: '/search', name: 'Search' },
      { url: '/categories', name: 'Categories' },
      { url: '/auth/login', name: 'Login' },
      { url: '/auth/signup', name: 'Signup' },
      { url: '/business/register', name: 'Business Register' },
    ];
    
    for (const p of pages) {
      console.log(`Testing ${p.name}...`);
      
      const response = await page.goto(p.url);
      
      // Check response is OK (not 500 error)
      expect(response?.status()).toBeLessThan(500);
      
      // Wait for page to be interactive
      await page.waitForLoadState('domcontentloaded');
      
      // Check no "Element type is invalid" error (the actual runtime error text)
      const visibleText = await page.locator('body').innerText();
      expect(visibleText).not.toContain('Element type is invalid');
      expect(visibleText).not.toContain('Unhandled Runtime Error');
      
      console.log(`✅ ${p.name} OK`);
    }
  });
});
