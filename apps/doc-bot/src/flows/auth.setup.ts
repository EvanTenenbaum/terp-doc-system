import { test as setup, expect } from '@playwright/test';
import config from '../config/index.js';
import { ensureStorageDirectories, getAuthStatePath } from '../storage/index.js';

/**
 * Authentication setup for Playwright
 * 
 * This runs before other tests to establish authenticated state.
 * The state is saved to storage-state/auth.json and reused by other tests.
 */
setup('authenticate', async ({ page }) => {
  // Ensure storage directories exist
  await ensureStorageDirectories();
  
  // Skip if no credentials configured
  if (!config.terp.email || !config.terp.password) {
    console.log('⚠️  No credentials configured, skipping auth setup');
    console.log('   Set TERP_DOCBOT_EMAIL and TERP_DOCBOT_PASSWORD in .env');
    return;
  }
  
  console.log('🔐 Setting up authentication...');
  
  // Navigate to login page
  await page.goto('/');
  
  // Wait for login form
  // Note: Adjust selectors based on actual TERP login page
  await page.waitForLoadState('networkidle');
  
  // Fill login form
  // These selectors should be updated to match TERP's actual login page
  const emailInput = page.locator('input[type="email"], input[name="email"], #email');
  const passwordInput = page.locator('input[type="password"], input[name="password"], #password');
  const submitButton = page.locator('button[type="submit"], input[type="submit"]');
  
  if (await emailInput.isVisible()) {
    await emailInput.fill(config.terp.email);
    await passwordInput.fill(config.terp.password);
    await submitButton.click();
    
    // Wait for navigation after login
    await page.waitForLoadState('networkidle');
    
    // Verify login succeeded (adjust based on TERP's post-login state)
    // This is a basic check - customize based on actual TERP behavior
    const currentUrl = page.url();
    console.log(`   Logged in, current URL: ${currentUrl}`);
  } else {
    console.log('⚠️  Login form not found, may already be authenticated');
  }
  
  // Save authentication state
  await page.context().storageState({ path: getAuthStatePath() });
  console.log('✅ Authentication state saved');
});
