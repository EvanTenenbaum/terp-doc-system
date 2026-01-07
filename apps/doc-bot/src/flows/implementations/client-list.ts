/**
 * Flow: client-list
 * View the list of clients
 */

import { FlowSpec, FlowContext } from '../types.js';
import { navigateTo, clickWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'client-list',
  title: 'View Client List',
  description: 'Navigate to the clients section and view the list of all clients.',
  module: 'Clients',
  role: 'admin',
  tags: ['clients', 'list', 'navigation'],
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

  // Step 2: Click on Clients in navigation
  await clickWithFallback(
    page,
    'Clients menu',
    {
      testId: 'nav-clients',
      role: { role: 'link', name: /clients/i },
      text: /^clients$/i,
      css: 'a[href*="clients"], [data-nav="clients"]',
    },
    { recorder }
  );

  // Step 3: Wait for clients list to load
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Clients list loaded', {
    notes: 'The clients list shows all registered clients',
  });

  // Step 4: Note the list features
  await recorder.recordStep(page, 'verify', 'View client records', {
    notes: 'Each row shows client name, email, and key information. Click a client to see details.',
  });
}
