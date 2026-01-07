#!/usr/bin/env node
/**
 * CLI Command: docs:report
 *
 * Generates a report of documentation status and any broken flows.
 */

import fs from 'fs/promises';
import path from 'path';
import config from '../config/index.js';
import { getAllFlows, getAllModules, getAllTags } from '../flows/registry.js';
import { Guide } from '../types.js';

interface FlowStatus {
  flowId: string;
  title: string;
  module: string;
  hasGuide: boolean;
  lastVerified?: string;
  stepCount?: number;
  hasFailed?: boolean;
  lastFailure?: string;
}

async function loadGuides(): Promise<Map<string, Guide>> {
  const guides = new Map<string, Guide>();

  try {
    const files = await fs.readdir(config.output.dir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = await fs.readFile(path.join(config.output.dir, file), 'utf-8');
          const guide = JSON.parse(content) as Guide;
          guides.set(guide.metadata.id, guide);
        } catch {
          // Skip invalid files
        }
      }
    }
  } catch {
    // Output directory may not exist
  }

  return guides;
}

async function loadFailures(): Promise<Map<string, { timestamp: string; error: string }>> {
  const failures = new Map<string, { timestamp: string; error: string }>();

  try {
    const failuresDir = path.join(config.output.dir, 'failures');
    const timestamps = await fs.readdir(failuresDir);

    for (const timestamp of timestamps) {
      const timestampDir = path.join(failuresDir, timestamp);
      const stat = await fs.stat(timestampDir);
      if (!stat.isDirectory()) continue;

      const flowDirs = await fs.readdir(timestampDir);
      for (const flowId of flowDirs) {
        // Get the most recent failure for each flow
        const existing = failures.get(flowId);
        if (!existing || timestamp > existing.timestamp) {
          try {
            const errorLog = await fs.readFile(
              path.join(timestampDir, flowId, 'error.log'),
              'utf-8'
            );
            const errorMatch = errorLog.match(/Error: (.+)/);
            failures.set(flowId, {
              timestamp,
              error: errorMatch ? errorMatch[1] : 'Unknown error',
            });
          } catch {
            failures.set(flowId, { timestamp, error: 'Unknown error' });
          }
        }
      }
    }
  } catch {
    // No failures directory
  }

  return failures;
}

async function main() {
  console.log('📊 TERP Doc Bot - Documentation Report');
  console.log('═'.repeat(60));
  console.log('');

  // Load existing data
  const guides = await loadGuides();
  const failures = await loadFailures();
  const flows = getAllFlows();

  // Build status for each flow
  const statuses: FlowStatus[] = [];

  for (const flow of flows) {
    const guide = guides.get(flow.spec.id);
    const failure = failures.get(flow.spec.id);

    statuses.push({
      flowId: flow.spec.id,
      title: flow.spec.title,
      module: flow.spec.module,
      hasGuide: !!guide,
      lastVerified: guide?.metadata.updatedAt,
      stepCount: guide?.steps.length,
      hasFailed: !!failure,
      lastFailure: failure?.timestamp,
    });
  }

  // Summary stats
  const totalFlows = statuses.length;
  const guidesGenerated = statuses.filter((s) => s.hasGuide).length;
  const flowsWithFailures = statuses.filter((s) => s.hasFailed && !s.hasGuide).length;
  const pendingFlows = statuses.filter((s) => !s.hasGuide && !s.hasFailed).length;

  console.log('📈 SUMMARY');
  console.log('─'.repeat(60));
  console.log(`   Total flows registered: ${totalFlows}`);
  console.log(`   ✅ Guides generated:    ${guidesGenerated}`);
  console.log(`   ❌ Failed (no guide):   ${flowsWithFailures}`);
  console.log(`   ⏳ Pending:             ${pendingFlows}`);
  console.log('');

  // Coverage percentage
  const coverage = ((guidesGenerated / totalFlows) * 100).toFixed(1);
  console.log(`   📊 Documentation coverage: ${coverage}%`);
  console.log('');

  // Group by module
  console.log('📦 BY MODULE');
  console.log('─'.repeat(60));

  for (const module of getAllModules()) {
    const moduleFlows = statuses.filter((s) => s.module === module);
    const moduleGuides = moduleFlows.filter((s) => s.hasGuide).length;
    const status = moduleGuides === moduleFlows.length ? '✅' : moduleGuides > 0 ? '🔶' : '⏳';
    console.log(`   ${status} ${module}: ${moduleGuides}/${moduleFlows.length} guides`);
  }
  console.log('');

  // List generated guides
  if (guidesGenerated > 0) {
    console.log('✅ GENERATED GUIDES');
    console.log('─'.repeat(60));

    for (const status of statuses.filter((s) => s.hasGuide)) {
      const date = status.lastVerified
        ? new Date(status.lastVerified).toLocaleDateString()
        : 'Unknown';
      console.log(`   ${status.flowId}`);
      console.log(`      Title: ${status.title}`);
      console.log(`      Steps: ${status.stepCount}`);
      console.log(`      Last verified: ${date}`);
      console.log('');
    }
  }

  // List failures
  if (flowsWithFailures > 0) {
    console.log('❌ BROKEN FLOWS (need attention)');
    console.log('─'.repeat(60));

    for (const status of statuses.filter((s) => s.hasFailed && !s.hasGuide)) {
      const failure = failures.get(status.flowId);
      console.log(`   ${status.flowId}`);
      console.log(`      Title: ${status.title}`);
      console.log(`      Error: ${failure?.error || 'Unknown'}`);
      console.log(`      Last attempt: ${failure?.timestamp || 'Unknown'}`);
      console.log('');
    }

    console.log('   To retry failed flows:');
    console.log('     pnpm docs:run -- --id <flow-id>');
    console.log('');
  }

  // List pending
  if (pendingFlows > 0) {
    console.log('⏳ PENDING (not yet run)');
    console.log('─'.repeat(60));

    for (const status of statuses.filter((s) => !s.hasGuide && !s.hasFailed)) {
      console.log(`   - ${status.flowId}: ${status.title}`);
    }
    console.log('');

    console.log('   To generate all pending guides:');
    console.log('     pnpm docs:run');
    console.log('');
  }

  // Configuration info
  console.log('⚙️  CONFIGURATION');
  console.log('─'.repeat(60));
  console.log(`   TERP URL:    ${config.terp.baseUrl}`);
  console.log(`   Output dir:  ${config.output.dir}`);
  console.log(`   Auth file:   ${config.storage.authFile}`);
  console.log('');

  // Check auth state
  try {
    await fs.access(config.storage.authFile);
    const stat = await fs.stat(config.storage.authFile);
    console.log(`   Auth state:  ✅ Found (modified ${stat.mtime.toLocaleString()})`);
  } catch {
    console.log('   Auth state:  ⚠️  Not found (run: pnpm docs:auth)');
  }
  console.log('');

  console.log('═'.repeat(60));
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
