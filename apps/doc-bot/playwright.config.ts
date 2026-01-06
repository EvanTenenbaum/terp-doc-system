import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

/**
 * Playwright configuration for TERP Doc Bot
 * 
 * Key settings:
 * - Headed mode by default (for visual debugging during development)
 * - Screenshots enabled on failure
 * - Persistent auth via storageState
 */
export default defineConfig({
  testDir: './src/flows',
  fullyParallel: false, // Run sequentially for consistent state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // Single worker for auth state consistency
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  
  use: {
    // Base URL from environment
    baseURL: process.env.TERP_BASE_URL || 'http://localhost:3000',
    
    // Headed mode by default for development
    headless: process.env.CI === 'true',
    
    // Screenshots configuration
    screenshot: 'on',
    
    // Trace on first retry
    trace: 'on-first-retry',
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // Slow down actions for better screenshots
    actionTimeout: 10000,
  },

  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    
    // Main project with authenticated state
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use storage state from auth setup
        storageState: './storage-state/auth.json',
      },
      dependencies: ['setup'],
    },
    
    // Smoke tests (no auth required)
    {
      name: 'smoke',
      testMatch: /.*\.smoke\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // Output directory for test artifacts
  outputDir: './test-results/',
});
