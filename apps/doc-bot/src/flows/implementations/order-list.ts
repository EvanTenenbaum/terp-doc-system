/**
 * Flow: order-list
 * View the orders list
 */

import { FlowSpec, FlowContext } from '../types.js';
import { navigateTo, clickWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'order-list',
  title: 'View Orders List',
  description: 'Navigate to the orders section to view all orders.',
  module: 'Orders',
  role: 'admin',
  tags: ['orders', 'list', 'navigation', 'sales'],
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

  // Step 2: Click on Orders in navigation
  await clickWithFallback(
    page,
    'Orders menu',
    {
      testId: 'nav-orders',
      role: { role: 'link', name: /orders/i },
      text: /^orders$/i,
      css: 'a[href*="orders"], [data-nav="orders"]',
    },
    { recorder }
  );

  // Step 3: Wait for orders list to load
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Orders list loaded', {
    notes: 'The orders list shows all orders with their status and key details',
  });

  // Step 4: Note order list features
  await recorder.recordStep(page, 'verify', 'Review order records', {
    notes: 'Orders show order number, client, status, date, and total. Click an order for full details.',
  });
}
