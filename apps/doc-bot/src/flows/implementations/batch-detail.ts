/**
 * Flow: batch-detail
 * View details of a specific batch
 */

import { FlowSpec, FlowContext, SEEDED_ENTITIES } from '../types.js';
import { navigateTo, clickWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'batch-detail',
  title: 'View Batch Details',
  description: 'Learn how to view detailed information about a specific inventory batch.',
  module: 'Inventory',
  role: 'admin',
  tags: ['inventory', 'batches', 'detail', 'stock'],
  preconditions: [
    'You are logged into TERP',
    'The batch exists in inventory',
  ],
  requiresAuth: true,
};

export async function execute(context: FlowContext): Promise<void> {
  const { page, recorder, baseUrl } = context;
  const batch = SEEDED_ENTITIES.batches[0]; // docs-bot-BATCH-001

  // Step 1: Navigate to inventory
  await navigateTo(page, `${baseUrl}/inventory`, 'Inventory page', { recorder });

  // Step 2: Wait for list to load
  await waitForStableUI(page);

  // Step 3: Click on batch row
  await clickWithFallback(
    page,
    `Batch: ${batch.batchNumber}`,
    {
      text: new RegExp(batch.batchNumber, 'i'),
      css: `tr:has-text("${batch.batchNumber}"), [data-batch="${batch.batchNumber}"]`,
    },
    { recorder, notes: 'Click on the batch to view details' }
  );

  // Step 4: Wait for detail page
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Batch details loaded', {
    notes: 'The batch detail page shows quantity, product info, expiration, and transaction history',
  });

  // Step 5: Review sections
  await recorder.recordStep(page, 'verify', 'Review batch information', {
    notes: 'Check current quantity, receive date, expiration, and any quality notes',
  });
}
