import { Page } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import config from '../config/index.js';

export interface CaptureOptions {
  name: string;
  fullPage?: boolean;
  highlight?: string; // CSS selector to highlight
}

export interface CaptureResult {
  filename: string;
  path: string;
  timestamp: Date;
}

/**
 * Capture a screenshot of the current page state
 */
export async function captureScreenshot(
  page: Page,
  options: CaptureOptions
): Promise<CaptureResult> {
  const { name, fullPage = false, highlight } = options;
  
  // Ensure screenshots directory exists
  await fs.mkdir(config.output.screenshotsDir, { recursive: true });
  
  // Generate filename with timestamp
  const timestamp = new Date();
  const filename = `${name}-${timestamp.getTime()}.png`;
  const filepath = path.join(config.output.screenshotsDir, filename);
  
  // Optionally highlight an element before capture
  if (highlight) {
    await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (el) {
        (el as HTMLElement).style.outline = '3px solid #ff0000';
        (el as HTMLElement).style.outlineOffset = '2px';
      }
    }, highlight);
  }
  
  // Take screenshot
  await page.screenshot({
    path: filepath,
    fullPage,
  });
  
  // Remove highlight if added
  if (highlight) {
    await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (el) {
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.outlineOffset = '';
      }
    }, highlight);
  }
  
  return {
    filename,
    path: filepath,
    timestamp,
  };
}

/**
 * Capture multiple screenshots in sequence
 */
export async function captureSequence(
  page: Page,
  baseName: string,
  steps: Array<{ action: () => Promise<void>; name: string }>
): Promise<CaptureResult[]> {
  const results: CaptureResult[] = [];
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    await step.action();
    
    // Small delay for UI to settle
    await page.waitForTimeout(500);
    
    const result = await captureScreenshot(page, {
      name: `${baseName}-${i + 1}-${step.name}`,
    });
    results.push(result);
  }
  
  return results;
}
