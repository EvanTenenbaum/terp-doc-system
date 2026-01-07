/**
 * Flow: client-detail
 * View details of a specific client
 */

import { FlowSpec, FlowContext, SEEDED_ENTITIES } from '../types.js';
import { navigateTo, clickWithFallback, clickByText, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'client-detail',
  title: 'View Client Details',
  description: 'Learn how to view detailed information about a specific client.',
  module: 'Clients',
  role: 'admin',
  tags: ['clients', 'detail', 'view'],
  preconditions: [
    'You are logged into TERP',
    'The client exists in the system',
  ],
  requiresAuth: true,
};

export async function execute(context: FlowContext): Promise<void> {
  const { page, recorder, baseUrl } = context;
  const client = SEEDED_ENTITIES.clients[0]; // docs-bot-acme

  // Step 1: Navigate to clients
  await navigateTo(page, `${baseUrl}/clients`, 'Clients page', { recorder });

  // Step 2: Wait for list to load
  await waitForStableUI(page);

  // Step 3: Click on client row/name
  await clickWithFallback(
    page,
    `Client: ${client.name}`,
    {
      text: new RegExp(client.email.replace('@', '\\@'), 'i'),
      css: `tr:has-text("${client.email}"), [data-client="${client.email}"]`,
    },
    { recorder, notes: 'Click on the client row to view details' }
  );

  // Step 4: Wait for detail page to load
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Client details loaded', {
    notes: 'The client detail page shows complete information including contact details, orders, and history',
  });

  // Step 5: Note key sections
  await recorder.recordStep(page, 'verify', 'Review client information', {
    notes: 'Review contact information, order history, and any notes about this client',
  });
}
