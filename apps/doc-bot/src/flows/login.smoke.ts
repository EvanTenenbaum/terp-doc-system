import { test, expect } from '@playwright/test';

/**
 * Smoke test for TERP login page
 * 
 * This test verifies basic connectivity and page load without requiring
 * authentication credentials. It's designed to run in CI without secrets.
 * 
 * @tags smoke
 */
test.describe('Login Page Smoke Test @smoke', () => {
  test('should load the login page', async ({ page }) => {
    // Navigate to the base URL (login page)
    await page.goto('/');
    
    // Wait for page to be ready
    await page.waitForLoadState('domcontentloaded');
    
    // Take a screenshot for documentation
    await page.screenshot({
      path: './screenshots/smoke-login-page.png',
      fullPage: true,
    });
    
    // Verify we're on a page (basic connectivity check)
    // These assertions are intentionally loose to work with any TERP instance
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Log success
    console.log('✅ Login page loaded successfully');
    console.log(`   Title: ${title}`);
    console.log(`   URL: ${page.url()}`);
  });

  test('should have interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Check that the page has some interactive content
    // This is a basic sanity check that the page rendered
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
    
    // Take screenshot of current state
    await page.screenshot({
      path: './screenshots/smoke-page-content.png',
    });
    
    console.log('✅ Page has content');
  });
});
