#!/usr/bin/env node
/**
 * CLI Command: docs:auth
 *
 * Authenticates with TERP and saves session state for subsequent runs.
 */

import { chromium } from '@playwright/test';
import fs from 'fs/promises';
import config, { validateAuthConfig } from '../config/index.js';
import { ensureStorageDirectories } from '../storage/index.js';
import { waitForStableUI } from '../helpers/actions.js';

async function main() {
  console.log('🔐 TERP Doc Bot - Authentication');
  console.log('═'.repeat(50));
  console.log('');

  // Validate configuration
  try {
    validateAuthConfig();
  } catch (error) {
    console.error('❌ Configuration error:', (error as Error).message);
    process.exit(1);
  }

  console.log(`📍 TERP URL: ${config.terp.baseUrl}`);
  console.log(`👤 User: ${config.terp.email}`);
  console.log('');

  // Ensure storage directories exist
  await ensureStorageDirectories();

  // Check if already authenticated
  try {
    await fs.access(config.storage.authFile);
    console.log('⚠️  Existing auth state found. Re-authenticating...');
    await fs.unlink(config.storage.authFile);
  } catch {
    // No existing auth state
  }

  console.log('🚀 Launching browser...');
  console.log('');

  const browser = await chromium.launch({
    headless: config.isCI,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    console.log('📄 Navigating to login page...');
    await page.goto(`${config.terp.baseUrl}/login`);
    await waitForStableUI(page);

    // Fill email
    console.log('✏️  Entering credentials...');
    const emailInput = page.locator('input[type="email"], input[name="email"], input[id*="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(config.terp.email);

    // Fill password
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill(config.terp.password);

    // Click submit
    console.log('🔑 Submitting login...');
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for navigation away from login page
    await page.waitForURL((url) => !url.pathname.includes('login'), {
      timeout: 30000,
    });

    await waitForStableUI(page);

    // Save storage state
    console.log('💾 Saving session state...');
    await context.storageState({ path: config.storage.authFile });

    console.log('');
    console.log('═'.repeat(50));
    console.log('✅ Authentication successful!');
    console.log('');
    console.log(`   Session saved to: ${config.storage.authFile}`);
    console.log('');
    console.log('   You can now run:');
    console.log('     pnpm docs:run           # Run all documentation flows');
    console.log('     pnpm docs:run -- --id auth-logout  # Run specific flow');
    console.log('');

  } catch (error) {
    const err = error as Error;

    // Take a screenshot on failure
    const screenshotPath = `${config.storage.stateDir}/auth-failure.png`;
    await page.screenshot({ path: screenshotPath });

    console.log('');
    console.log('═'.repeat(50));
    console.error('❌ Authentication failed!');
    console.error('');
    console.error(`   Error: ${err.message}`);
    console.error(`   Screenshot saved: ${screenshotPath}`);
    console.error('');
    console.error('   Troubleshooting:');
    console.error('   1. Check TERP_BASE_URL is correct');
    console.error('   2. Verify email and password are correct');
    console.error('   3. Ensure the TERP server is running');
    console.error('');

    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
