/**
 * Step Recorder - Captures step-by-step events during flow execution
 *
 * Every meaningful step records:
 * - Screenshot
 * - Event metadata (action, target, selector, url, etc.)
 */

import { Page } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import config from '../config/index.js';

export type ActionType = 'navigate' | 'click' | 'fill' | 'select' | 'assert' | 'wait' | 'verify';

export interface StepEvent {
  stepIndex: number;
  timestamp: string;
  action: ActionType;
  targetLabel: string;
  selectorUsed?: string;
  url: string;
  notes?: string;
  screenshotPath?: string;
  screenshotFilename?: string;
  duration?: number;
  success: boolean;
  error?: string;
}

export interface FlowRecording {
  flowId: string;
  startTime: string;
  endTime?: string;
  steps: StepEvent[];
  success: boolean;
  error?: string;
}

export class StepRecorder {
  private flowId: string;
  private steps: StepEvent[] = [];
  private startTime: Date;
  private outputDir: string;
  private screenshotsDir: string;
  private currentStepIndex: number = 0;

  constructor(flowId: string, outputDir?: string) {
    this.flowId = flowId;
    this.startTime = new Date();
    this.outputDir = outputDir || path.join(config.output.dir, 'guides', flowId);
    this.screenshotsDir = path.join(this.outputDir, 'images');
  }

  /**
   * Initialize directories for this recording
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(this.screenshotsDir, { recursive: true });
  }

  /**
   * Record a step with screenshot
   */
  async recordStep(
    page: Page,
    action: ActionType,
    targetLabel: string,
    options: {
      selector?: string;
      notes?: string;
      highlight?: string;
      skipScreenshot?: boolean;
    } = {}
  ): Promise<StepEvent> {
    const stepStart = Date.now();
    this.currentStepIndex++;

    // Take screenshot unless skipped
    let screenshotPath: string | undefined;
    let screenshotFilename: string | undefined;

    if (!options.skipScreenshot) {
      const result = await this.captureStepScreenshot(
        page,
        this.currentStepIndex,
        action,
        options.highlight
      );
      screenshotPath = result.path;
      screenshotFilename = result.filename;
    }

    const event: StepEvent = {
      stepIndex: this.currentStepIndex,
      timestamp: new Date().toISOString(),
      action,
      targetLabel,
      selectorUsed: options.selector,
      url: page.url(),
      notes: options.notes,
      screenshotPath,
      screenshotFilename,
      duration: Date.now() - stepStart,
      success: true,
    };

    this.steps.push(event);
    return event;
  }

  /**
   * Record a failed step
   */
  async recordFailure(
    page: Page,
    action: ActionType,
    targetLabel: string,
    error: Error,
    options: { selector?: string; notes?: string } = {}
  ): Promise<StepEvent> {
    this.currentStepIndex++;

    // Always capture screenshot on failure
    let screenshotPath: string | undefined;
    let screenshotFilename: string | undefined;

    try {
      const result = await this.captureStepScreenshot(
        page,
        this.currentStepIndex,
        'error',
        undefined
      );
      screenshotPath = result.path;
      screenshotFilename = result.filename;
    } catch {
      // Ignore screenshot failure
    }

    const event: StepEvent = {
      stepIndex: this.currentStepIndex,
      timestamp: new Date().toISOString(),
      action,
      targetLabel,
      selectorUsed: options.selector,
      url: page.url(),
      notes: options.notes,
      screenshotPath,
      screenshotFilename,
      success: false,
      error: error.message,
    };

    this.steps.push(event);
    return event;
  }

  /**
   * Capture screenshot for a step
   */
  private async captureStepScreenshot(
    page: Page,
    stepIndex: number,
    action: string,
    highlight?: string
  ): Promise<{ path: string; filename: string }> {
    const paddedIndex = String(stepIndex).padStart(2, '0');
    const filename = `step-${paddedIndex}-${action}.png`;
    const filepath = path.join(this.screenshotsDir, filename);

    // Add highlight if specified
    if (highlight) {
      try {
        await page.evaluate((selector) => {
          const el = document.querySelector(selector);
          if (el) {
            (el as HTMLElement).style.outline = '3px solid #ff6b6b';
            (el as HTMLElement).style.outlineOffset = '2px';
            (el as HTMLElement).style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.5)';
          }
        }, highlight);
      } catch {
        // Ignore highlight failure
      }
    }

    // Wait for UI to stabilize
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(300);

    // Take screenshot
    await page.screenshot({
      path: filepath,
      fullPage: false,
    });

    // Remove highlight
    if (highlight) {
      try {
        await page.evaluate((selector) => {
          const el = document.querySelector(selector);
          if (el) {
            (el as HTMLElement).style.outline = '';
            (el as HTMLElement).style.outlineOffset = '';
            (el as HTMLElement).style.boxShadow = '';
          }
        }, highlight);
      } catch {
        // Ignore
      }
    }

    return { path: filepath, filename };
  }

  /**
   * Get the recording so far
   */
  getRecording(): FlowRecording {
    return {
      flowId: this.flowId,
      startTime: this.startTime.toISOString(),
      endTime: new Date().toISOString(),
      steps: this.steps,
      success: this.steps.every((s) => s.success),
      error: this.steps.find((s) => !s.success)?.error,
    };
  }

  /**
   * Get all recorded steps
   */
  getSteps(): StepEvent[] {
    return [...this.steps];
  }

  /**
   * Get the output directory
   */
  getOutputDir(): string {
    return this.outputDir;
  }

  /**
   * Get the screenshots directory
   */
  getScreenshotsDir(): string {
    return this.screenshotsDir;
  }

  /**
   * Save recording metadata to JSON
   */
  async saveRecording(): Promise<string> {
    const recording = this.getRecording();
    const filepath = path.join(this.outputDir, 'recording.json');
    await fs.writeFile(filepath, JSON.stringify(recording, null, 2), 'utf-8');
    return filepath;
  }

  /**
   * Check if recording was successful
   */
  isSuccessful(): boolean {
    return this.steps.every((s) => s.success);
  }

  /**
   * Get count of steps
   */
  getStepCount(): number {
    return this.steps.length;
  }
}
