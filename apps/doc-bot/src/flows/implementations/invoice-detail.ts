/**
 * Flow: invoice-detail
 * View details of a specific invoice
 */

import { FlowSpec, FlowContext, SEEDED_ENTITIES } from '../types.js';
import { navigateTo, clickWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'invoice-detail',
  title: 'View Invoice Details',
  description: 'Learn how to view detailed information about a specific invoice.',
  module: 'Invoices',
  role: 'admin',
  tags: ['invoices', 'detail', 'view', 'billing'],
  preconditions: [
    'You are logged into TERP',
    'The invoice exists in the system',
  ],
  requiresAuth: true,
};

export async function execute(context: FlowContext): Promise<void> {
  const { page, recorder, baseUrl } = context;
  const invoice = SEEDED_ENTITIES.invoices[0]; // docs-bot-INV-001

  // Step 1: Navigate to invoices
  await navigateTo(page, `${baseUrl}/invoices`, 'Invoices page', { recorder });

  // Step 2: Wait for list to load
  await waitForStableUI(page);

  // Step 3: Click on invoice row
  await clickWithFallback(
    page,
    `Invoice: ${invoice.invoiceNumber}`,
    {
      text: new RegExp(invoice.invoiceNumber, 'i'),
      css: `tr:has-text("${invoice.invoiceNumber}"), [data-invoice="${invoice.invoiceNumber}"]`,
    },
    { recorder, notes: 'Click on the invoice to view details' }
  );

  // Step 4: Wait for detail page
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Invoice details loaded', {
    notes: 'The invoice detail page shows all billing information and line items',
  });

  // Step 5: Review sections
  await recorder.recordStep(page, 'verify', 'Review invoice information', {
    notes: 'Check client info, line items, subtotal, taxes, and total. View payment status and history.',
  });
}
