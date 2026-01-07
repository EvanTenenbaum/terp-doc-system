/**
 * Flow: settings-basic
 * Navigate to and view basic settings
 */

import { FlowSpec, FlowContext } from '../types.js';
import { navigateTo, clickWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'settings-basic',
  title: 'Navigate Settings',
  description: 'Learn how to access and navigate the TERP settings area.',
  module: 'Settings',
  role: 'admin',
  tags: ['settings', 'preferences', 'configuration', 'navigation'],
  preconditions: [
    'You are logged into TERP',
    'You have admin access',
  ],
  requiresAuth: true,
};

export async function execute(context: FlowContext): Promise<void> {
  const { page, recorder, baseUrl } = context;

  // Step 1: Navigate to home
  await page.goto(baseUrl);
  await waitForStableUI(page);
  await recorder.recordStep(page, 'navigate', 'Start from home page', {});

  // Step 2: Click on Settings in navigation or user menu
  await clickWithFallback(
    page,
    'Settings menu',
    {
      testId: 'nav-settings',
      role: { role: 'link', name: /settings/i },
      text: /^settings$/i,
      css: 'a[href*="settings"], [data-nav="settings"], .settings-link',
    },
    { recorder }
  );

  // Step 3: Wait for settings page to load
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Settings page loaded', {
    notes: 'The settings page shows various configuration options for your TERP account',
  });

  // Step 4: Note available sections
  await recorder.recordStep(page, 'verify', 'View settings sections', {
    notes: 'Settings may include profile, company info, notifications, and system preferences',
  });

  // Step 5: Review navigation
  await recorder.recordStep(page, 'verify', 'Navigate settings sections', {
    notes: 'Click on different sections in the sidebar to access specific settings',
  });
}
