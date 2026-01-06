import { chromium } from '@playwright/test';
import config, { validateAuthConfig } from '../config/index.js';
import { ensureStorageDirectories, hasAuthState, getAuthStatePath } from '../storage/index.js';
import { listGuides } from '../guidegen/index.js';

/**
 * Main runner for doc-bot
 * 
 * This is the entry point for running documentation generation flows.
 * In development, it provides a REPL-like experience for testing flows.
 */
async function main() {
  console.log('🤖 TERP Doc Bot Runner');
  console.log('='.repeat(40));
  
  // Ensure directories exist
  await ensureStorageDirectories();
  
  // Check configuration
  console.log('\n📋 Configuration:');
  console.log(`  Base URL: ${config.terp.baseUrl}`);
  console.log(`  Output Dir: ${config.output.dir}`);
  console.log(`  CI Mode: ${config.isCI}`);
  
  // Check auth state
  const hasAuth = await hasAuthState();
  console.log(`  Auth State: ${hasAuth ? '✅ Found' : '❌ Not found'}`);
  
  // List existing guides
  const guides = await listGuides();
  console.log(`\n📚 Existing Guides: ${guides.length}`);
  for (const guide of guides) {
    console.log(`  - ${guide.title} (${guide.id})`);
  }
  
  // If running interactively, launch browser
  if (!config.isCI) {
    console.log('\n🚀 Launching browser...');
    
    const browser = await chromium.launch({
      headless: false,
    });
    
    const context = await browser.newContext({
      storageState: hasAuth ? getAuthStatePath() : undefined,
    });
    
    const page = await context.newPage();
    await page.goto(config.terp.baseUrl);
    
    console.log('\n✨ Browser launched. Press Ctrl+C to exit.');
    console.log('   Use Playwright flows to capture documentation.');
    
    // Keep process alive
    await new Promise(() => {});
  } else {
    console.log('\n⏭️  CI mode - skipping interactive browser launch');
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
