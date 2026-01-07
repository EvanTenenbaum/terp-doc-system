/**
 * Markdown Guide Generator
 *
 * Generates human-readable Markdown guides from flow recordings with:
 * - Title and purpose
 * - Preconditions
 * - Numbered steps with screenshots
 * - Troubleshooting tips
 * - Last verified timestamp
 */

import fs from 'fs/promises';
import path from 'path';
import { StepEvent, FlowRecording } from '../capture/step-recorder.js';
import { FlowSpec } from '../flows/types.js';
import { Guide, GuideMetadata, Step } from '../types.js';
import config from '../config/index.js';

export interface MarkdownGuideOptions {
  flowSpec: FlowSpec;
  recording: FlowRecording;
  outputDir: string;
}

/**
 * Generate a complete guide (markdown + JSON + meta) from a flow recording
 */
export async function generateMarkdownGuide(options: MarkdownGuideOptions): Promise<{
  markdownPath: string;
  jsonPath: string;
  metaPath: string;
}> {
  const { flowSpec, recording, outputDir } = options;

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Generate markdown content
  const markdown = generateMarkdownContent(flowSpec, recording);
  const markdownPath = path.join(outputDir, 'guide.md');
  await fs.writeFile(markdownPath, markdown, 'utf-8');

  // Generate JSON guide for companion app
  const guide = generateGuideJson(flowSpec, recording);
  const jsonPath = path.join(outputDir, `${flowSpec.id}.json`);
  await fs.writeFile(jsonPath, JSON.stringify(guide, null, 2), 'utf-8');

  // Generate metadata file
  const meta = generateMeta(flowSpec, recording);
  const metaPath = path.join(outputDir, 'meta.json');
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');

  return { markdownPath, jsonPath, metaPath };
}

/**
 * Generate Markdown content for a guide
 */
function generateMarkdownContent(flowSpec: FlowSpec, recording: FlowRecording): string {
  const lines: string[] = [];

  // Title
  lines.push(`# ${flowSpec.title}`);
  lines.push('');

  // Purpose
  lines.push('## Purpose');
  lines.push('');
  lines.push(flowSpec.description);
  lines.push('');

  // Preconditions
  if (flowSpec.preconditions && flowSpec.preconditions.length > 0) {
    lines.push('## Preconditions');
    lines.push('');
    for (const precondition of flowSpec.preconditions) {
      lines.push(`- ${precondition}`);
    }
    lines.push('');
  }

  // Steps
  lines.push('## Steps');
  lines.push('');

  for (const step of recording.steps) {
    lines.push(`### Step ${step.stepIndex}: ${step.targetLabel}`);
    lines.push('');

    // Action description
    const actionDescription = getActionDescription(step);
    lines.push(actionDescription);
    lines.push('');

    // Screenshot
    if (step.screenshotFilename) {
      lines.push(`![Step ${step.stepIndex}](./images/${step.screenshotFilename})`);
      lines.push('');
    }

    // Notes
    if (step.notes) {
      lines.push(`> **Note:** ${step.notes}`);
      lines.push('');
    }
  }

  // Troubleshooting
  lines.push('## Troubleshooting');
  lines.push('');
  lines.push('If you encounter issues:');
  lines.push('');
  lines.push('- **Page not loading**: Check your internet connection and try refreshing the page.');
  lines.push('- **Button not clickable**: Wait for the page to fully load before clicking.');
  lines.push('- **Form not submitting**: Ensure all required fields are filled in correctly.');
  lines.push('- **Unexpected error**: Try logging out and logging back in.');
  lines.push('');

  // Verification info
  lines.push('---');
  lines.push('');
  lines.push(`**Last Verified:** ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`**Module:** ${flowSpec.module}`);
  lines.push('');
  lines.push(`**Role Required:** ${flowSpec.role}`);
  lines.push('');
  if (flowSpec.tags && flowSpec.tags.length > 0) {
    lines.push(`**Tags:** ${flowSpec.tags.join(', ')}`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Get human-readable description for an action
 */
function getActionDescription(step: StepEvent): string {
  switch (step.action) {
    case 'navigate':
      return `Navigate to the page. You should see the ${step.targetLabel}.`;

    case 'click':
      return `Click on **${step.targetLabel}**.`;

    case 'fill':
      return `Enter the value in the **${step.targetLabel}** field.`;

    case 'select':
      return `Select the appropriate option from the **${step.targetLabel}** dropdown.`;

    case 'verify':
    case 'assert':
      return `Verify that **${step.targetLabel}** is visible on the page.`;

    case 'wait':
      return `Wait for **${step.targetLabel}** to complete.`;

    default:
      return step.targetLabel;
  }
}

/**
 * Generate JSON guide for companion app
 */
function generateGuideJson(flowSpec: FlowSpec, recording: FlowRecording): Guide {
  const now = new Date().toISOString();

  const metadata: GuideMetadata = {
    id: flowSpec.id,
    title: flowSpec.title,
    description: flowSpec.description,
    category: flowSpec.module,
    tags: flowSpec.tags || [],
    createdAt: now,
    updatedAt: now,
    version: '1.0.0',
  };

  const steps: Step[] = recording.steps.map((step) => ({
    order: step.stepIndex,
    title: step.targetLabel,
    description: getActionDescription(step),
    screenshot: step.screenshotFilename,
    action: step.action,
    selector: step.selectorUsed,
  }));

  return {
    metadata,
    steps,
  };
}

/**
 * Generate metadata file
 */
function generateMeta(flowSpec: FlowSpec, recording: FlowRecording): Record<string, unknown> {
  return {
    flowId: flowSpec.id,
    title: flowSpec.title,
    module: flowSpec.module,
    role: flowSpec.role,
    tags: flowSpec.tags || [],
    verifiedAt: new Date().toISOString(),
    stepCount: recording.steps.length,
    success: recording.success,
    duration: recording.endTime
      ? new Date(recording.endTime).getTime() - new Date(recording.startTime).getTime()
      : null,
  };
}

/**
 * Copy guide to main output directory for companion app
 */
export async function publishGuide(
  flowId: string,
  sourceDir: string
): Promise<string> {
  const jsonPath = path.join(sourceDir, `${flowId}.json`);
  const destPath = path.join(config.output.dir, `${flowId}.json`);

  // Ensure output directory exists
  await fs.mkdir(config.output.dir, { recursive: true });

  // Copy JSON guide
  await fs.copyFile(jsonPath, destPath);

  // Copy screenshots to a shared location
  const sourceImagesDir = path.join(sourceDir, 'images');
  const destImagesDir = path.join(config.output.dir, 'images', flowId);

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
    // Images directory may not exist if all screenshots failed
  }

  return destPath;
}
