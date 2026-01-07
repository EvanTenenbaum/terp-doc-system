/**
 * Action Helpers - Wrapper functions for Playwright interactions
 *
 * These helpers provide:
 * - Consistent error handling
 * - Automatic waiting for UI stability
 * - Fallback selector strategies
 * - Integration with StepRecorder
 */

import { Page, Locator, expect } from '@playwright/test';
import { StepRecorder, ActionType } from '../capture/step-recorder.js';

export interface ActionOptions {
  recorder?: StepRecorder;
  timeout?: number;
  notes?: string;
}

/**
 * Wait for UI to become stable (no pending network requests, animations complete)
 */
export async function waitForStableUI(page: Page, options: { timeout?: number } = {}): Promise<void> {
  const timeout = options.timeout || 5000;

  // Wait for network to settle
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {
    // Network idle timeout is ok, continue
  });

  // Wait for any loading indicators to disappear
  const loadingSelectors = [
    '[data-loading="true"]',
    '.loading',
    '.spinner',
    '[aria-busy="true"]',
    '.skeleton',
  ];

  for (const selector of loadingSelectors) {
    const loading = page.locator(selector);
    if ((await loading.count()) > 0) {
      await loading.first().waitFor({ state: 'hidden', timeout: timeout }).catch(() => {
        // Timeout is ok
      });
    }
  }

  // Small delay for any animations
  await page.waitForTimeout(200);
}

/**
 * Click an element by role and accessible name
 */
export async function clickByRole(
  page: Page,
  role: Parameters<Page['getByRole']>[0],
  name: string | RegExp,
  options: ActionOptions & { exact?: boolean } = {}
): Promise<void> {
  const { recorder, timeout = 10000, notes, exact = false } = options;

  await waitForStableUI(page);

  const locator = page.getByRole(role, { name, exact });
  const selector = `role=${role}[name="${name}"]`;

  try {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.click({ timeout });

    if (recorder) {
      await recorder.recordStep(page, 'click', String(name), {
        selector,
        notes,
        highlight: undefined, // Role selectors can't be highlighted easily
      });
    }
  } catch (error) {
    if (recorder) {
      await recorder.recordFailure(page, 'click', String(name), error as Error, { selector, notes });
    }
    throw error;
  }
}

/**
 * Click an element by text content
 */
export async function clickByText(
  page: Page,
  text: string | RegExp,
  options: ActionOptions & { exact?: boolean } = {}
): Promise<void> {
  const { recorder, timeout = 10000, notes, exact = false } = options;

  await waitForStableUI(page);

  const locator = page.getByText(text, { exact });

  try {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.click({ timeout });

    if (recorder) {
      await recorder.recordStep(page, 'click', String(text), {
        selector: `text=${text}`,
        notes,
      });
    }
  } catch (error) {
    if (recorder) {
      await recorder.recordFailure(page, 'click', String(text), error as Error, { notes });
    }
    throw error;
  }
}

/**
 * Click an element by test ID
 */
export async function clickByTestId(
  page: Page,
  testId: string,
  label: string,
  options: ActionOptions = {}
): Promise<void> {
  const { recorder, timeout = 10000, notes } = options;

  await waitForStableUI(page);

  const locator = page.getByTestId(testId);
  const selector = `[data-testid="${testId}"]`;

  try {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.click({ timeout });

    if (recorder) {
      await recorder.recordStep(page, 'click', label, {
        selector,
        notes,
        highlight: selector,
      });
    }
  } catch (error) {
    if (recorder) {
      await recorder.recordFailure(page, 'click', label, error as Error, { selector, notes });
    }
    throw error;
  }
}

/**
 * Click an element with fallback selectors
 */
export async function clickWithFallback(
  page: Page,
  label: string,
  selectors: {
    testId?: string;
    role?: { role: Parameters<Page['getByRole']>[0]; name: string | RegExp };
    text?: string | RegExp;
    css?: string;
  },
  options: ActionOptions = {}
): Promise<void> {
  const { recorder, timeout = 10000, notes } = options;

  await waitForStableUI(page);

  let locator: Locator | null = null;
  let selectorUsed = '';

  // Try each selector in order of preference
  if (selectors.testId) {
    locator = page.getByTestId(selectors.testId);
    selectorUsed = `[data-testid="${selectors.testId}"]`;
    if ((await locator.count()) === 0) locator = null;
  }

  if (!locator && selectors.role) {
    locator = page.getByRole(selectors.role.role, { name: selectors.role.name });
    selectorUsed = `role=${selectors.role.role}[name="${selectors.role.name}"]`;
    if ((await locator.count()) === 0) locator = null;
  }

  if (!locator && selectors.text) {
    locator = page.getByText(selectors.text);
    selectorUsed = `text=${selectors.text}`;
    if ((await locator.count()) === 0) locator = null;
  }

  if (!locator && selectors.css) {
    locator = page.locator(selectors.css);
    selectorUsed = selectors.css;
    if ((await locator.count()) === 0) locator = null;
  }

  if (!locator) {
    const error = new Error(`No matching element found for: ${label}`);
    if (recorder) {
      await recorder.recordFailure(page, 'click', label, error, { notes });
    }
    throw error;
  }

  try {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.click({ timeout });

    if (recorder) {
      await recorder.recordStep(page, 'click', label, {
        selector: selectorUsed,
        notes,
        highlight: selectors.css || (selectors.testId ? `[data-testid="${selectors.testId}"]` : undefined),
      });
    }
  } catch (error) {
    if (recorder) {
      await recorder.recordFailure(page, 'click', label, error as Error, { selector: selectorUsed, notes });
    }
    throw error;
  }
}

/**
 * Fill a form field by label
 */
export async function fillByLabel(
  page: Page,
  label: string,
  value: string,
  options: ActionOptions = {}
): Promise<void> {
  const { recorder, timeout = 10000, notes } = options;

  await waitForStableUI(page);

  const locator = page.getByLabel(label);

  try {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.fill(value, { timeout });

    if (recorder) {
      // Mask password values in recording
      const displayValue = label.toLowerCase().includes('password') ? '********' : value;
      await recorder.recordStep(page, 'fill', `${label}: ${displayValue}`, {
        selector: `label=${label}`,
        notes,
      });
    }
  } catch (error) {
    if (recorder) {
      await recorder.recordFailure(page, 'fill', label, error as Error, { notes });
    }
    throw error;
  }
}

/**
 * Fill a form field by placeholder
 */
export async function fillByPlaceholder(
  page: Page,
  placeholder: string,
  value: string,
  label: string,
  options: ActionOptions = {}
): Promise<void> {
  const { recorder, timeout = 10000, notes } = options;

  await waitForStableUI(page);

  const locator = page.getByPlaceholder(placeholder);

  try {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.fill(value, { timeout });

    if (recorder) {
      const displayValue = label.toLowerCase().includes('password') ? '********' : value;
      await recorder.recordStep(page, 'fill', `${label}: ${displayValue}`, {
        selector: `placeholder=${placeholder}`,
        notes,
      });
    }
  } catch (error) {
    if (recorder) {
      await recorder.recordFailure(page, 'fill', label, error as Error, { notes });
    }
    throw error;
  }
}

/**
 * Fill a form field with fallback selectors
 */
export async function fillWithFallback(
  page: Page,
  label: string,
  value: string,
  selectors: {
    label?: string;
    placeholder?: string;
    testId?: string;
    css?: string;
  },
  options: ActionOptions = {}
): Promise<void> {
  const { recorder, timeout = 10000, notes } = options;

  await waitForStableUI(page);

  let locator: Locator | null = null;
  let selectorUsed = '';

  if (selectors.label) {
    locator = page.getByLabel(selectors.label);
    selectorUsed = `label=${selectors.label}`;
    if ((await locator.count()) === 0) locator = null;
  }

  if (!locator && selectors.placeholder) {
    locator = page.getByPlaceholder(selectors.placeholder);
    selectorUsed = `placeholder=${selectors.placeholder}`;
    if ((await locator.count()) === 0) locator = null;
  }

  if (!locator && selectors.testId) {
    locator = page.getByTestId(selectors.testId);
    selectorUsed = `[data-testid="${selectors.testId}"]`;
    if ((await locator.count()) === 0) locator = null;
  }

  if (!locator && selectors.css) {
    locator = page.locator(selectors.css);
    selectorUsed = selectors.css;
    if ((await locator.count()) === 0) locator = null;
  }

  if (!locator) {
    const error = new Error(`No matching input found for: ${label}`);
    if (recorder) {
      await recorder.recordFailure(page, 'fill', label, error, { notes });
    }
    throw error;
  }

  try {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.fill(value, { timeout });

    if (recorder) {
      const displayValue = label.toLowerCase().includes('password') ? '********' : value;
      await recorder.recordStep(page, 'fill', `${label}: ${displayValue}`, {
        selector: selectorUsed,
        notes,
      });
    }
  } catch (error) {
    if (recorder) {
      await recorder.recordFailure(page, 'fill', label, error as Error, { selector: selectorUsed, notes });
    }
    throw error;
  }
}

/**
 * Select an option from a dropdown by label
 */
export async function selectByLabel(
  page: Page,
  fieldLabel: string,
  optionLabel: string,
  options: ActionOptions = {}
): Promise<void> {
  const { recorder, timeout = 10000, notes } = options;

  await waitForStableUI(page);

  const locator = page.getByLabel(fieldLabel);

  try {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.selectOption({ label: optionLabel }, { timeout });

    if (recorder) {
      await recorder.recordStep(page, 'select', `${fieldLabel}: ${optionLabel}`, {
        selector: `label=${fieldLabel}`,
        notes,
      });
    }
  } catch (error) {
    if (recorder) {
      await recorder.recordFailure(page, 'select', fieldLabel, error as Error, { notes });
    }
    throw error;
  }
}

/**
 * Assert that text is visible on the page
 */
export async function expectVisible(
  page: Page,
  text: string | RegExp,
  options: ActionOptions = {}
): Promise<void> {
  const { recorder, timeout = 10000, notes } = options;

  try {
    await expect(page.getByText(text)).toBeVisible({ timeout });

    if (recorder) {
      await recorder.recordStep(page, 'verify', `Visible: ${String(text)}`, {
        notes,
      });
    }
  } catch (error) {
    if (recorder) {
      await recorder.recordFailure(page, 'verify', `Visible: ${String(text)}`, error as Error, { notes });
    }
    throw error;
  }
}

/**
 * Assert that an element with test ID is visible
 */
export async function expectTestIdVisible(
  page: Page,
  testId: string,
  label: string,
  options: ActionOptions = {}
): Promise<void> {
  const { recorder, timeout = 10000, notes } = options;
  const selector = `[data-testid="${testId}"]`;

  try {
    await expect(page.getByTestId(testId)).toBeVisible({ timeout });

    if (recorder) {
      await recorder.recordStep(page, 'verify', label, {
        selector,
        notes,
        highlight: selector,
      });
    }
  } catch (error) {
    if (recorder) {
      await recorder.recordFailure(page, 'verify', label, error as Error, { selector, notes });
    }
    throw error;
  }
}

/**
 * Navigate to a URL
 */
export async function navigateTo(
  page: Page,
  url: string,
  label: string,
  options: ActionOptions = {}
): Promise<void> {
  const { recorder, notes } = options;

  try {
    await page.goto(url);
    await waitForStableUI(page);

    if (recorder) {
      await recorder.recordStep(page, 'navigate', label, {
        notes: notes || `URL: ${url}`,
      });
    }
  } catch (error) {
    if (recorder) {
      await recorder.recordFailure(page, 'navigate', label, error as Error, { notes });
    }
    throw error;
  }
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(
  page: Page,
  urlPattern: string | RegExp,
  label: string,
  options: ActionOptions = {}
): Promise<void> {
  const { recorder, timeout = 30000, notes } = options;

  try {
    await page.waitForURL(urlPattern, { timeout });
    await waitForStableUI(page);

    if (recorder) {
      await recorder.recordStep(page, 'wait', label, {
        notes: notes || `Waited for URL: ${urlPattern}`,
      });
    }
  } catch (error) {
    if (recorder) {
      await recorder.recordFailure(page, 'wait', label, error as Error, { notes });
    }
    throw error;
  }
}
