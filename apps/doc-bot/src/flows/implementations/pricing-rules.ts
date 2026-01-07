/**
 * Flow: pricing-rules
 * View pricing rules and configuration
 */

import { FlowSpec, FlowContext } from '../types.js';
import { navigateTo, clickWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'pricing-rules',
  title: 'View Pricing Rules',
  description: 'Navigate to the pricing section to view and understand pricing rules.',
  module: 'Pricing',
  role: 'admin',
  tags: ['pricing', 'rules', 'configuration', 'discounts'],
  preconditions: [
    'You are logged into TERP',
  ],
  requiresAuth: true,
};

export async function execute(context: FlowContext): Promise<void> {
  const { page, recorder, baseUrl } = context;

  // Step 1: Navigate to home
  await page.goto(baseUrl);
  await waitForStableUI(page);
  await recorder.recordStep(page, 'navigate', 'Start from home page', {});

  // Step 2: Navigate to Settings or Pricing
  await clickWithFallback(
    page,
    'Settings or Pricing menu',
    {
      testId: 'nav-pricing',
      role: { role: 'link', name: /pricing|settings/i },
      text: /pricing|price rules/i,
      css: 'a[href*="pricing"], a[href*="settings"], [data-nav="pricing"]',
    },
    { recorder }
  );

  // Step 3: Wait for pricing page to load
  await waitForStableUI(page);

  // If we need to navigate to a sub-section
  try {
    await clickWithFallback(
      page,
      'Pricing Rules section',
      {
        role: { role: 'link', name: /pricing rules/i },
        text: /pricing rules/i,
        css: '[data-section="pricing-rules"]',
      },
      { recorder, timeout: 3000 }
    );
    await waitForStableUI(page);
  } catch {
    // Already on pricing page
  }

  // Step 4: View pricing rules
  await recorder.recordStep(page, 'verify', 'Pricing rules displayed', {
    notes: 'The pricing rules page shows all active pricing configurations',
  });

  // Step 5: Note pricing features
  await recorder.recordStep(page, 'verify', 'Review pricing structure', {
    notes: 'Pricing rules can include volume discounts, client-specific pricing, and promotional rates',
  });
}
