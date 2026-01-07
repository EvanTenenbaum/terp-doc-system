/**
 * Flow: invoice-filter-overdue
 * Filter invoices to show overdue invoices
 */

import { FlowSpec, FlowContext } from '../types.js';
import { navigateTo, clickWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'invoice-filter-overdue',
  title: 'View Overdue Invoices',
  description: 'Learn how to filter the invoices list to show only overdue invoices.',
  module: 'Invoices',
  role: 'admin',
  tags: ['invoices', 'filter', 'overdue', 'billing'],
  preconditions: [
    'You are logged into TERP',
    'Invoices exist in the system',
  ],
  requiresAuth: true,
};

export async function execute(context: FlowContext): Promise<void> {
  const { page, recorder, baseUrl } = context;

  // Step 1: Navigate to invoices
  await navigateTo(page, `${baseUrl}/invoices`, 'Invoices page', { recorder });

  // Step 2: Wait for list to load
  await waitForStableUI(page);

  // Step 3: Click on status filter
  await clickWithFallback(
    page,
    'Status filter',
    {
      testId: 'invoice-status-filter',
      role: { role: 'combobox', name: /status/i },
      text: /status/i,
      css: 'select[name*="status"], [data-filter="status"], .status-filter',
    },
    { recorder, notes: 'Click on the status filter dropdown' }
  );

  // Step 4: Select "Overdue" status
  await clickWithFallback(
    page,
    'Overdue status option',
    {
      role: { role: 'option', name: /overdue/i },
      text: /overdue/i,
      css: 'option[value="overdue"]',
    },
    { recorder, notes: 'Select "Overdue" to filter invoices' }
  );

  // Step 5: Wait for filter to apply
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Overdue invoices displayed', {
    notes: 'The list now shows only overdue invoices that require attention',
  });
}
