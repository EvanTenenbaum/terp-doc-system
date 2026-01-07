/**
 * Flow: client-search
 * Search for a specific client
 */

import { FlowSpec, FlowContext, SEEDED_ENTITIES } from '../types.js';
import { navigateTo, clickWithFallback, fillWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'client-search',
  title: 'Search for Clients',
  description: 'Learn how to search for clients by name or email in TERP.',
  module: 'Clients',
  role: 'admin',
  tags: ['clients', 'search', 'find'],
  preconditions: [
    'You are logged into TERP',
    'Clients exist in the system',
  ],
  requiresAuth: true,
};

export async function execute(context: FlowContext): Promise<void> {
  const { page, recorder, baseUrl } = context;
  const searchTerm = 'docs-bot-acme';

  // Step 1: Navigate to clients
  await navigateTo(page, `${baseUrl}/clients`, 'Clients page', { recorder });

  // Step 2: Wait for page to load
  await waitForStableUI(page);

  // Step 3: Find and click search/filter
  await fillWithFallback(
    page,
    'Search clients',
    searchTerm,
    {
      placeholder: 'Search',
      testId: 'client-search',
      css: 'input[type="search"], input[placeholder*="search" i], .search-input',
    },
    { recorder, notes: `Searching for "${searchTerm}"` }
  );

  // Step 4: Wait for results to filter
  await waitForStableUI(page);
  await page.waitForTimeout(500); // Extra wait for filter

  // Step 5: Verify results
  await recorder.recordStep(page, 'verify', 'Search results displayed', {
    notes: `Results are filtered to show clients matching "${searchTerm}"`,
  });
}
