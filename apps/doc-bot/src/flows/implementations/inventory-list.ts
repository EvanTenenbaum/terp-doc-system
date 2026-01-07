/**
 * Flow: inventory-list
 * View the inventory/batches list
 */

import { FlowSpec, FlowContext } from '../types.js';
import { navigateTo, clickWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'inventory-list',
  title: 'View Inventory',
  description: 'Navigate to the inventory section to view all product batches and stock levels.',
  module: 'Inventory',
  role: 'admin',
  tags: ['inventory', 'batches', 'stock', 'list'],
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

  // Step 2: Click on Inventory in navigation
  await clickWithFallback(
    page,
    'Inventory menu',
    {
      testId: 'nav-inventory',
      role: { role: 'link', name: /inventory|batches|stock/i },
      text: /^inventory$/i,
      css: 'a[href*="inventory"], a[href*="batches"], [data-nav="inventory"]',
    },
    { recorder }
  );

  // Step 3: Wait for inventory list to load
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Inventory list loaded', {
    notes: 'The inventory view shows all product batches and their current stock levels',
  });

  // Step 4: Note inventory features
  await recorder.recordStep(page, 'verify', 'Review stock levels', {
    notes: 'Each batch shows batch number, product, quantity available, and expiration if applicable',
  });
}
