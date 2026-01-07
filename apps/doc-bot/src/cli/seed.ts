#!/usr/bin/env node
/**
 * CLI Command: docs:seed
 *
 * Resets and seeds the docs-bot test data via tRPC endpoints.
 */

import config from '../config/index.js';
import { seedAndVerify, info, TRPCClientError, EXPECTED_COUNTS } from '../trpc/client.js';

async function main() {
  console.log('🌱 TERP Doc Bot - Seed Database');
  console.log('═'.repeat(50));
  console.log('');

  // Check configuration
  if (!config.docs.endpointsSecret) {
    console.warn('⚠️  Warning: DEV_DOCS_ENDPOINTS_SECRET is not set');
    console.warn('   Seed operations may fail if the server requires authentication.');
    console.warn('');
  }

  console.log(`📍 TERP URL: ${config.terp.baseUrl}`);
  console.log('');

  // Check if dev docs endpoints are enabled
  console.log('🔍 Checking endpoint availability...');
  try {
    const infoResult = await info();
    console.log(`   ✅ Dev docs endpoints: ${infoResult.enabled ? 'enabled' : 'disabled'}`);
    console.log(`   Environment: ${infoResult.environment}`);
    console.log('');

    if (!infoResult.enabled) {
      console.error('❌ Dev docs endpoints are disabled on this server.');
      console.error('   Set DEV_DOCS_ENDPOINTS_ENABLED=true on the TERP server.');
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof TRPCClientError) {
      if (error.statusCode === 404) {
        console.error('❌ Dev docs endpoints not found.');
        console.error('   The TERP server may not have the devDocs router installed.');
        process.exit(1);
      }
      if (error.statusCode === 401 || error.statusCode === 403) {
        console.error('❌ Authentication failed.');
        console.error('   Check that DEV_DOCS_ENDPOINTS_SECRET matches the server configuration.');
        process.exit(1);
      }
    }
    // For other errors, continue and let seedAndVerify handle it
    console.log('   ⚠️  Could not check endpoint status, continuing...');
    console.log('');
  }

  // Show expected counts
  console.log('📊 Expected entity counts after seed:');
  console.log(`   Users: ${EXPECTED_COUNTS.users}`);
  console.log(`   Clients: ${EXPECTED_COUNTS.clients}`);
  console.log(`   Vendors: ${EXPECTED_COUNTS.vendors}`);
  console.log(`   Products: ${EXPECTED_COUNTS.products}`);
  console.log(`   Batches: ${EXPECTED_COUNTS.batches}`);
  console.log(`   Orders: ${EXPECTED_COUNTS.orders}`);
  console.log(`   Invoices: ${EXPECTED_COUNTS.invoices}`);
  console.log(`   Pricing Rules: ${EXPECTED_COUNTS.pricingRules}`);
  console.log('');

  // Run seed and verify
  try {
    await seedAndVerify();

    console.log('');
    console.log('═'.repeat(50));
    console.log('✅ Seed complete!');
    console.log('');
    console.log('   The docs-bot test data has been created.');
    console.log('   All entities use the "docs-bot-" prefix.');
    console.log('');
    console.log('   You can now run:');
    console.log('     pnpm docs:auth    # Authenticate');
    console.log('     pnpm docs:run     # Generate documentation');
    console.log('');

  } catch (error) {
    const err = error as Error;

    console.log('');
    console.log('═'.repeat(50));
    console.error('❌ Seed failed!');
    console.error('');
    console.error(`   Error: ${err.message}`);
    console.error('');

    if (error instanceof TRPCClientError) {
      console.error('   Response:', JSON.stringify(error.responseBody, null, 2));
      console.error('');
    }

    console.error('   Troubleshooting:');
    console.error('   1. Check TERP_BASE_URL is correct');
    console.error('   2. Verify DEV_DOCS_ENDPOINTS_SECRET matches server config');
    console.error('   3. Ensure DEV_DOCS_ENDPOINTS_ENABLED=true on server');
    console.error('   4. Check server logs for detailed errors');
    console.error('');

    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
