/**
 * Flow: invoice-list
 * View the invoices list
 */

import { FlowSpec, FlowContext } from '../types.js';
import { navigateTo, clickWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'invoice-list',
  title: 'View Invoices List',
  description: 'Navigate to the invoices section to view all invoices.',
  module: 'Invoices',
  role: 'admin',
  tags: ['invoices', 'list', 'navigation', 'billing'],
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

  // Step 2: Click on Invoices in navigation
  await clickWithFallback(
    page,
    'Invoices menu',
    {
      testId: 'nav-invoices',
      role: { role: 'link', name: /invoices/i },
      text: /^invoices$/i,
      css: 'a[href*="invoices"], [data-nav="invoices"]',
    },
    { recorder }
  );

  // Step 3: Wait for invoices list to load
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Invoices list loaded', {
    notes: 'The invoices list shows all invoices with their status and amounts',
  });

  // Step 4: Note invoice list features
  await recorder.recordStep(page, 'verify', 'Review invoice records', {
    notes: 'Invoices show number, client, status, due date, and total amount. Click for details.',
  });
}
