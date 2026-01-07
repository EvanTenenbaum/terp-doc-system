/**
 * Flow: order-detail
 * View details of a specific order
 */

import { FlowSpec, FlowContext, SEEDED_ENTITIES } from '../types.js';
import { navigateTo, clickWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'order-detail',
  title: 'View Order Details',
  description: 'Learn how to view detailed information about a specific order.',
  module: 'Orders',
  role: 'admin',
  tags: ['orders', 'detail', 'view', 'sales'],
  preconditions: [
    'You are logged into TERP',
    'The order exists in the system',
  ],
  requiresAuth: true,
};

export async function execute(context: FlowContext): Promise<void> {
  const { page, recorder, baseUrl } = context;
  const order = SEEDED_ENTITIES.orders[0]; // docs-bot-ORD-001

  // Step 1: Navigate to orders
  await navigateTo(page, `${baseUrl}/orders`, 'Orders page', { recorder });

  // Step 2: Wait for list to load
  await waitForStableUI(page);

  // Step 3: Click on order row
  await clickWithFallback(
    page,
    `Order: ${order.orderNumber}`,
    {
      text: new RegExp(order.orderNumber, 'i'),
      css: `tr:has-text("${order.orderNumber}"), [data-order="${order.orderNumber}"]`,
    },
    { recorder, notes: 'Click on the order to view details' }
  );

  // Step 4: Wait for detail page
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Order details loaded', {
    notes: 'The order detail page shows all order information including line items and status',
  });

  // Step 5: Review sections
  await recorder.recordStep(page, 'verify', 'Review order information', {
    notes: 'Check client info, ordered products, quantities, pricing, and order status history',
  });
}
