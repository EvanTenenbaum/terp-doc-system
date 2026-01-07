/**
 * Flow: auth-logout
 * Logout from TERP
 */

import { FlowSpec, FlowContext } from '../types.js';
import { clickWithFallback, waitForNavigation, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'auth-logout',
  title: 'How to Log Out of TERP',
  description: 'Step-by-step guide for safely logging out of the TERP application.',
  module: 'Authentication',
  role: 'admin',
  tags: ['logout', 'authentication', 'security'],
  preconditions: [
    'You are currently logged into TERP',
  ],
  requiresAuth: true,
};

export async function execute(context: FlowContext): Promise<void> {
  const { page, recorder, baseUrl } = context;

  // Step 1: Navigate to home/dashboard first
  await page.goto(baseUrl);
  await waitForStableUI(page);
  await recorder.recordStep(page, 'navigate', 'Navigate to TERP home', {
    notes: 'Starting from the main page',
  });

  // Step 2: Click on user menu/avatar
  await clickWithFallback(
    page,
    'User menu',
    {
      testId: 'user-menu',
      role: { role: 'button', name: /user|account|profile|menu/i },
      css: '[data-testid="user-menu"], .user-menu, .avatar, [aria-label*="user"], [aria-label*="account"]',
    },
    { recorder }
  );

  await waitForStableUI(page);

  // Step 3: Click logout button
  await clickWithFallback(
    page,
    'Logout button',
    {
      testId: 'logout-button',
      role: { role: 'menuitem', name: /log ?out|sign ?out/i },
      text: /log ?out|sign ?out/i,
      css: '[data-testid="logout"], .logout, [href*="logout"]',
    },
    { recorder }
  );

  // Step 4: Wait for redirect to login page
  await waitForNavigation(page, /\/login/, 'Redirected to login page', {
    recorder,
    timeout: 15000,
  });

  // Step 5: Verify logout
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Successfully logged out', {
    notes: 'Login page is now visible',
  });
}
