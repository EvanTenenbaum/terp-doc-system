/**
 * Flow: order-create-draft
 * Create a new draft order
 */

import { FlowSpec, FlowContext, SEEDED_ENTITIES } from '../types.js';
import { navigateTo, clickWithFallback, clickByRole, fillWithFallback, selectByLabel, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'order-create-draft',
  title: 'Create a Draft Order',
  description: 'Learn how to create a new draft order for a client.',
  module: 'Orders',
  role: 'admin',
  tags: ['orders', 'create', 'draft', 'new'],
  preconditions: [
    'You are logged into TERP',
    'Clients exist in the system',
    'Products exist in the catalog',
  ],
  requiresAuth: true,
  createsRecords: true,
};

export async function execute(context: FlowContext): Promise<void> {
  const { page, recorder, baseUrl } = context;
  const client = SEEDED_ENTITIES.clients[0]; // docs-bot-acme
  const product = SEEDED_ENTITIES.products[0]; // docs-bot-SKU-001

  // Step 1: Navigate to orders
  await navigateTo(page, `${baseUrl}/orders`, 'Orders page', { recorder });

  // Step 2: Wait for page to load
  await waitForStableUI(page);

  // Step 3: Click "New Order" button
  await clickWithFallback(
    page,
    'New Order button',
    {
      testId: 'new-order-button',
      role: { role: 'button', name: /new order|create order|add order/i },
      text: /new order|create order|\+ order/i,
      css: '[data-action="new-order"], .new-order-btn',
    },
    { recorder, notes: 'Click to start creating a new order' }
  );

  // Step 4: Wait for order form
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Order form opened', {
    notes: 'The new order form allows you to select a client and add products',
  });

  // Step 5: Select client
  await clickWithFallback(
    page,
    'Select client',
    {
      testId: 'client-select',
      role: { role: 'combobox', name: /client/i },
      css: 'select[name*="client"], [data-field="client"]',
    },
    { recorder, notes: 'Open the client dropdown' }
  );

  await clickWithFallback(
    page,
    `Client: ${client.name}`,
    {
      text: new RegExp(client.name, 'i'),
      css: `option:has-text("${client.name}")`,
    },
    { recorder, notes: 'Select the client for this order' }
  );

  await waitForStableUI(page);

  // Step 6: Add a product (simplified - actual UI may vary)
  await recorder.recordStep(page, 'click', 'Add product to order', {
    notes: 'Add products by searching or selecting from the catalog',
  });

  // Step 7: Save as draft
  await clickWithFallback(
    page,
    'Save as Draft',
    {
      testId: 'save-draft-button',
      role: { role: 'button', name: /save|draft|create/i },
      text: /save|draft/i,
      css: '[data-action="save-draft"], .save-btn',
    },
    { recorder, notes: 'Save the order as a draft for later' }
  );

  // Step 8: Verify order created
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Draft order created', {
    notes: 'The order has been saved as a draft. You can edit it later before submitting.',
  });
}
