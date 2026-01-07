#!/usr/bin/env node
/**
 * CLI Command: docs:run
 *
 * Runs documentation flows to generate guides.
 *
 * Usage:
 *   pnpm docs:run                      # Run all flows
 *   pnpm docs:run -- --id auth-login   # Run specific flow
 *   pnpm docs:run -- --tag getting-started  # Run flows by tag
 *   pnpm docs:run -- --module Clients  # Run flows by module
 *   pnpm docs:run -- --continue        # Continue on failure
 *   pnpm docs:run -- --headless        # Run in headless mode
 */

import { runFlows, RunOptions } from '../flows/runner.js';
import { printRegistrySummary, getFlowCount, getAllTags, getAllModules } from '../flows/registry.js';
import config from '../config/index.js';
import fs from 'fs/promises';

function parseArgs(): RunOptions & { help?: boolean; list?: boolean } {
  const args = process.argv.slice(2);
  const options: RunOptions & { help?: boolean; list?: boolean } = {
    flowIds: [],
    continueOnFailure: false,
    headless: config.isCI,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--list':
      case '-l':
        options.list = true;
        break;
      case '--id':
        if (nextArg) {
          options.flowIds!.push(nextArg);
          i++;
        }
        break;
      case '--tag':
        if (nextArg) {
          options.tag = nextArg;
          i++;
        }
        break;
      case '--module':
        if (nextArg) {
          options.module = nextArg;
          i++;
        }
        break;
      case '--continue':
      case '--continue-on-failure':
        options.continueOnFailure = true;
        break;
      case '--headless':
        options.headless = true;
        break;
      case '--headed':
        options.headless = false;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
TERP Doc Bot - Generate Documentation Guides

Usage:
  pnpm docs:run [options]

Options:
  --help, -h       Show this help message
  --list, -l       List all available flows
  --id <flow-id>   Run specific flow(s) by ID (can be repeated)
  --tag <tag>      Run flows with a specific tag
  --module <mod>   Run flows for a specific module
  --continue       Continue running even if a flow fails
  --headless       Run in headless mode (no browser UI)
  --headed         Run with browser UI visible
  --verbose, -v    Show verbose output

Examples:
  pnpm docs:run                           # Run all flows
  pnpm docs:run -- --id auth-login        # Run login flow only
  pnpm docs:run -- --tag getting-started  # Run all getting-started flows
  pnpm docs:run -- --module Orders --continue  # Run all order flows

Available tags: ${getAllTags().join(', ')}

Available modules: ${getAllModules().join(', ')}
`);
}

async function main() {
  const options = parseArgs();

  console.log('📚 TERP Doc Bot - Generate Documentation');
  console.log('═'.repeat(50));
  console.log('');

  if (options.help) {
    printHelp();
    return;
  }

  if (options.list) {
    printRegistrySummary();
    return;
  }

  console.log(`📍 TERP URL: ${config.terp.baseUrl}`);
  console.log(`📂 Output: ${config.output.dir}`);
  console.log(`🔢 Registered flows: ${getFlowCount()}`);
  console.log('');

  // Check for auth state
  try {
    await fs.access(config.storage.authFile);
    console.log('🔐 Auth state: Found');
  } catch {
    console.log('🔐 Auth state: Not found');
    console.log('   ⚠️  Some flows require authentication.');
    console.log('   Run: pnpm docs:auth');
    console.log('');
  }

  // Run flows
  const report = await runFlows({
    flowIds: options.flowIds?.length ? options.flowIds : undefined,
    tag: options.tag,
    module: options.module,
    headless: options.headless,
    continueOnFailure: options.continueOnFailure,
    verbose: options.verbose,
  });

  // Exit with error code if any flows failed
  if (report.failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
