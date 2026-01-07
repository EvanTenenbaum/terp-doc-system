/**
 * Flow Runner - Executes documentation flows and generates guides
 *
 * Features:
 * - Runs flows with authentication support
 * - Captures screenshots and step events
 * - Generates Markdown guides
 * - Implements failure safety (doesn't overwrite good guides)
 */

import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import config from '../config/index.js';
import { StepRecorder } from '../capture/step-recorder.js';
import { generateMarkdownGuide, publishGuide } from '../guidegen/markdown.js';
import { FlowSpec, FlowResult, FlowContext, FlowRegistryEntry } from './types.js';
import { getFlowById, getAllFlows, getFlowsByTag, getFlowsByModule } from './registry.js';

export interface RunOptions {
  /** Flow IDs to run (if empty, runs all) */
  flowIds?: string[];

  /** Filter by tag */
  tag?: string;

  /** Filter by module */
  module?: string;

  /** Run in headless mode */
  headless?: boolean;

  /** Continue on failure (don't stop at first error) */
  continueOnFailure?: boolean;

  /** Verbose output */
  verbose?: boolean;
}

export interface RunReport {
  totalFlows: number;
  successful: number;
  failed: number;
  skipped: number;
  results: FlowResult[];
  startTime: string;
  endTime: string;
  duration: number;
}

/**
 * Run documentation flows
 */
export async function runFlows(options: RunOptions = {}): Promise<RunReport> {
  const startTime = new Date();
  const results: FlowResult[] = [];

  // Determine which flows to run
  let flows = getFlowsToRun(options);

  if (flows.length === 0) {
    console.log('⚠️  No flows matched the selection criteria');
    return {
      totalFlows: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      results: [],
      startTime: startTime.toISOString(),
      endTime: new Date().toISOString(),
      duration: 0,
    };
  }

  console.log(`\n🚀 Running ${flows.length} documentation flow(s)\n`);

  // Launch browser
  const browser = await chromium.launch({
    headless: options.headless ?? config.isCI,
  });

  try {
    // Check for existing auth state
    const hasAuth = await checkAuthState();

    for (const flow of flows) {
      console.log(`\n📝 ${flow.spec.id}: ${flow.spec.title}`);

      // Skip if requires auth but no auth state
      if (flow.spec.requiresAuth && !hasAuth) {
        console.log('   ⏭️  Skipped (requires authentication)');
        results.push({
          flowId: flow.spec.id,
          success: false,
          error: 'Requires authentication - run docs:auth first',
          stepsCompleted: 0,
          duration: 0,
        });
        continue;
      }

      try {
        const result = await runSingleFlow(browser, flow, options);
        results.push(result);

        if (result.success) {
          console.log(`   ✅ Success (${result.stepsCompleted} steps, ${result.duration}ms)`);
          if (result.guidePath) {
            console.log(`   📄 Guide: ${result.guidePath}`);
          }
        } else {
          console.log(`   ❌ Failed: ${result.error}`);
          if (!options.continueOnFailure) {
            console.log('   ⛔ Stopping (use --continue-on-failure to continue)');
            break;
          }
        }
      } catch (error) {
        const err = error as Error;
        console.log(`   ❌ Error: ${err.message}`);
        results.push({
          flowId: flow.spec.id,
          success: false,
          error: err.message,
          stepsCompleted: 0,
          duration: 0,
        });

        if (!options.continueOnFailure) {
          break;
        }
      }
    }
  } finally {
    await browser.close();
  }

  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();

  const report: RunReport = {
    totalFlows: flows.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success && r.error !== 'Requires authentication - run docs:auth first').length,
    skipped: results.filter((r) => r.error === 'Requires authentication - run docs:auth first').length,
    results,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration,
  };

  // Print summary
  printRunSummary(report);

  return report;
}

/**
 * Get flows based on run options
 */
function getFlowsToRun(options: RunOptions): FlowRegistryEntry[] {
  if (options.flowIds && options.flowIds.length > 0) {
    const flows: FlowRegistryEntry[] = [];
    for (const id of options.flowIds) {
      const flow = getFlowById(id);
      if (flow) {
        flows.push(flow);
      } else {
        console.warn(`⚠️  Unknown flow ID: ${id}`);
      }
    }
    return flows;
  }

  if (options.tag) {
    return getFlowsByTag(options.tag);
  }

  if (options.module) {
    return getFlowsByModule(options.module as any);
  }

  return getAllFlows();
}

/**
 * Check if auth state exists and is valid
 */
async function checkAuthState(): Promise<boolean> {
  try {
    await fs.access(config.storage.authFile);
    return true;
  } catch {
    return false;
  }
}

/**
 * Run a single flow
 */
async function runSingleFlow(
  browser: Browser,
  flow: FlowRegistryEntry,
  options: RunOptions
): Promise<FlowResult> {
  const startTime = Date.now();

  // Create browser context with auth if needed
  let context: BrowserContext;
  if (flow.spec.requiresAuth) {
    context = await browser.newContext({
      storageState: config.storage.authFile,
    });
  } else {
    context = await browser.newContext();
  }

  const page = await context.newPage();

  // Create output directory for this flow
  const flowOutputDir = path.join(config.output.dir, 'guides', flow.spec.id);
  const recorder = new StepRecorder(flow.spec.id, flowOutputDir);
  await recorder.initialize();

  // Create flow context
  const flowContext: FlowContext = {
    page,
    context,
    recorder,
    spec: flow.spec,
    baseUrl: config.terp.baseUrl,
  };

  try {
    // Execute the flow
    await flow.executor(flowContext);

    // Get recording
    const recording = recorder.getRecording();

    if (!recorder.isSuccessful()) {
      throw new Error(recording.error || 'Flow execution failed');
    }

    // Generate guide
    const { jsonPath } = await generateMarkdownGuide({
      flowSpec: flow.spec,
      recording,
      outputDir: flowOutputDir,
    });

    // Publish guide (copy to main output directory)
    const publishedPath = await publishGuide(flow.spec.id, flowOutputDir);

    const duration = Date.now() - startTime;

    return {
      flowId: flow.spec.id,
      success: true,
      stepsCompleted: recorder.getStepCount(),
      duration,
      guidePath: publishedPath,
    };
  } catch (error) {
    const err = error as Error;
    const duration = Date.now() - startTime;

    // Save failure artifacts
    const failurePath = await saveFailureArtifacts(flow.spec.id, recorder, err);

    return {
      flowId: flow.spec.id,
      success: false,
      error: err.message,
      stepsCompleted: recorder.getStepCount(),
      duration,
      failurePath,
    };
  } finally {
    await page.close();
    await context.close();
  }
}

/**
 * Save failure artifacts without overwriting good guides
 */
async function saveFailureArtifacts(
  flowId: string,
  recorder: StepRecorder,
  error: Error
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const failureDir = path.join(config.output.dir, 'failures', timestamp, flowId);

  await fs.mkdir(failureDir, { recursive: true });

  // Save recording
  const recording = recorder.getRecording();
  recording.error = error.message;
  await fs.writeFile(
    path.join(failureDir, 'recording.json'),
    JSON.stringify(recording, null, 2),
    'utf-8'
  );

  // Save error log
  await fs.writeFile(
    path.join(failureDir, 'error.log'),
    `Error: ${error.message}\n\nStack:\n${error.stack || 'No stack trace'}`,
    'utf-8'
  );

  // Copy screenshots from recorder output dir if they exist
  const sourceImagesDir = recorder.getScreenshotsDir();
  const destImagesDir = path.join(failureDir, 'images');

  try {
    await fs.mkdir(destImagesDir, { recursive: true });
    const files = await fs.readdir(sourceImagesDir);
    for (const file of files) {
      await fs.copyFile(
        path.join(sourceImagesDir, file),
        path.join(destImagesDir, file)
      );
    }
  } catch {
    // Ignore if no images
  }

  return failureDir;
}

/**
 * Print run summary
 */
function printRunSummary(report: RunReport): void {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RUN SUMMARY');
  console.log('═'.repeat(60));
  console.log(`   Total: ${report.totalFlows}`);
  console.log(`   ✅ Successful: ${report.successful}`);
  console.log(`   ❌ Failed: ${report.failed}`);
  console.log(`   ⏭️  Skipped: ${report.skipped}`);
  console.log(`   ⏱️  Duration: ${(report.duration / 1000).toFixed(1)}s`);
  console.log('═'.repeat(60));

  if (report.failed > 0) {
    console.log('\n❌ Failed Flows:');
    for (const result of report.results.filter((r) => !r.success && r.failurePath)) {
      console.log(`   - ${result.flowId}: ${result.error}`);
      console.log(`     Artifacts: ${result.failurePath}`);
    }
  }

  if (report.successful > 0) {
    console.log('\n✅ Generated Guides:');
    for (const result of report.results.filter((r) => r.success && r.guidePath)) {
      console.log(`   - ${result.flowId}: ${result.guidePath}`);
    }
  }

  console.log('');
}
