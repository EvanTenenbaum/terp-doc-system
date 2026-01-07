/**
 * Flow: order-filter-status
 * Filter orders by status
 */

import { FlowSpec, FlowContext } from '../types.js';
import { navigateTo, clickWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'order-filter-status',
  title: 'Filter Orders by Status',
  description: 'Learn how to filter the orders list to show only orders with a specific status.',
  module: 'Orders',
  role: 'admin',
  tags: ['orders', 'filter', 'status', 'search'],
  preconditions: [
    'You are logged into TERP',
    'Orders exist in the system',
  ],
  requiresAuth: true,
};

export async function execute(context: FlowContext): Promise<void> {
  const { page, recorder, baseUrl } = context;

  // Step 1: Navigate to orders
  await navigateTo(page, `${baseUrl}/orders`, 'Orders page', { recorder });

  // Step 2: Wait for list to load
  await waitForStableUI(page);

  // Step 3: Click on status filter
  await clickWithFallback(
    page,
    'Status filter',
    {
      testId: 'order-status-filter',
      role: { role: 'combobox', name: /status/i },
      text: /status/i,
      css: 'select[name*="status"], [data-filter="status"], .status-filter',
    },
    { recorder, notes: 'Click on the status filter dropdown' }
  );

  // Step 4: Select a status (e.g., "Pending")
  await clickWithFallback(
    page,
    'Pending status option',
    {
      role: { role: 'option', name: /pending/i },
      text: /pending/i,
      css: 'option[value="pending"]',
    },
    { recorder, notes: 'Select "Pending" to filter orders' }
  );

  // Step 5: Wait for filter to apply
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Filtered results displayed', {
    notes: 'The list now shows only orders with "Pending" status',
  });
}
