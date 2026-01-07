/**
 * Flow: vendor-detail
 * View details of a specific vendor
 */

import { FlowSpec, FlowContext, SEEDED_ENTITIES } from '../types.js';
import { navigateTo, clickWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'vendor-detail',
  title: 'View Vendor Details',
  description: 'Learn how to view detailed information about a specific vendor.',
  module: 'Vendors',
  role: 'admin',
  tags: ['vendors', 'detail', 'view', 'suppliers'],
  preconditions: [
    'You are logged into TERP',
    'The vendor exists in the system',
  ],
  requiresAuth: true,
};

export async function execute(context: FlowContext): Promise<void> {
  const { page, recorder, baseUrl } = context;
  const vendor = SEEDED_ENTITIES.vendor;

  // Step 1: Navigate to vendors
  await navigateTo(page, `${baseUrl}/vendors`, 'Vendors page', { recorder });

  // Step 2: Wait for list to load
  await waitForStableUI(page);

  // Step 3: Click on vendor row
  await clickWithFallback(
    page,
    `Vendor: ${vendor.name}`,
    {
      text: new RegExp(vendor.email.replace('@', '\\@'), 'i'),
      css: `tr:has-text("${vendor.email}"), [data-vendor="${vendor.email}"]`,
    },
    { recorder, notes: 'Click on the vendor to view their details' }
  );

  // Step 4: Wait for detail page
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Vendor details loaded', {
    notes: 'The vendor detail page shows contact information, products supplied, and order history',
  });

  // Step 5: Review sections
  await recorder.recordStep(page, 'verify', 'Review vendor information', {
    notes: 'Check contact details, product catalog from this vendor, and past transactions',
  });
}
