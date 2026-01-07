/**
 * Flow: vendor-list
 * View the list of vendors
 */

import { FlowSpec, FlowContext } from '../types.js';
import { navigateTo, clickWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'vendor-list',
  title: 'View Vendor List',
  description: 'Navigate to the vendors section and view all registered vendors.',
  module: 'Vendors',
  role: 'admin',
  tags: ['vendors', 'list', 'navigation', 'suppliers'],
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

  // Step 2: Click on Vendors in navigation
  await clickWithFallback(
    page,
    'Vendors menu',
    {
      testId: 'nav-vendors',
      role: { role: 'link', name: /vendors|suppliers/i },
      text: /^vendors$/i,
      css: 'a[href*="vendors"], [data-nav="vendors"]',
    },
    { recorder }
  );

  // Step 3: Wait for vendors list to load
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Vendors list loaded', {
    notes: 'The vendors list shows all your product suppliers',
  });

  // Step 4: Note vendor information
  await recorder.recordStep(page, 'verify', 'View vendor records', {
    notes: 'Each vendor entry shows company name, contact info, and product categories they supply',
  });
}
