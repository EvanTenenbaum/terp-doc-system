/**
 * Flow: dashboard-overview
 * Navigate and explore the main dashboard
 */

import { FlowSpec, FlowContext } from '../types.js';
import { navigateTo, waitForStableUI, expectVisible } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'dashboard-overview',
  title: 'Dashboard Overview',
  description: 'Learn about the main TERP dashboard and its key features.',
  module: 'Dashboard',
  role: 'admin',
  tags: ['dashboard', 'overview', 'navigation', 'getting-started'],
  preconditions: [
    'You are logged into TERP',
  ],
  requiresAuth: true,
};

export async function execute(context: FlowContext): Promise<void> {
  const { page, recorder, baseUrl } = context;

  // Step 1: Navigate to dashboard
  await navigateTo(page, `${baseUrl}/dashboard`, 'Main Dashboard', { recorder });

  // Step 2: Wait for dashboard to load
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Dashboard loaded', {
    notes: 'The main dashboard displays key metrics and recent activity',
  });

  // Step 3: Highlight key sections (metrics area)
  await recorder.recordStep(page, 'verify', 'View key metrics', {
    notes: 'The top section shows important business metrics at a glance',
  });

  // Step 4: Note the navigation sidebar
  await recorder.recordStep(page, 'verify', 'Navigation sidebar', {
    notes: 'Use the sidebar on the left to navigate to different sections of TERP',
  });

  // Step 5: Recent activity section
  await recorder.recordStep(page, 'verify', 'Recent activity', {
    notes: 'The activity section shows your most recent actions and updates',
  });
}
