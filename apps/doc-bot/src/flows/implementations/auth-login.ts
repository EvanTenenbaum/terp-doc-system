/**
 * Flow: auth-login
 * Login to TERP as the docs-bot user
 */

import { FlowSpec, FlowContext, SEEDED_ENTITIES } from '../types.js';
import { navigateTo, fillWithFallback, clickByRole, waitForNavigation, expectVisible, waitForStableUI } from '../../helpers/actions.js';
import config from '../../config/index.js';

export const spec: FlowSpec = {
  id: 'auth-login',
  title: 'How to Log In to TERP',
  description: 'Step-by-step guide for logging into the TERP application with your credentials.',
  module: 'Authentication',
  role: 'admin',
  tags: ['login', 'authentication', 'getting-started'],
  preconditions: [
    'You have a valid TERP account',
    'You know your email and password',
  ],
  requiresAuth: false,
};

export async function execute(context: FlowContext): Promise<void> {
  const { page, recorder, baseUrl } = context;

  // Step 1: Navigate to login page
  await navigateTo(page, `${baseUrl}/login`, 'TERP Login Page', { recorder });

  // Step 2: Wait for login form to be ready
  await waitForStableUI(page);

  // Step 3: Enter email
  await fillWithFallback(
    page,
    'Email address',
    config.terp.email || SEEDED_ENTITIES.user.email,
    {
      label: 'Email',
      placeholder: 'Email',
      css: 'input[type="email"], input[name="email"]',
    },
    { recorder }
  );

  // Step 4: Enter password
  await fillWithFallback(
    page,
    'Password',
    config.terp.password || 'password',
    {
      label: 'Password',
      placeholder: 'Password',
      css: 'input[type="password"], input[name="password"]',
    },
    { recorder }
  );

  // Step 5: Click Sign In button
  await clickByRole(page, 'button', /sign in|log in|submit/i, { recorder });

  // Step 6: Wait for dashboard/home page
  await waitForNavigation(page, /\/(dashboard|home)?$/, 'Dashboard loaded', {
    recorder,
    timeout: 30000,
  });

  // Step 7: Verify we're logged in (look for user menu or dashboard elements)
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Successfully logged in', {
    notes: 'Dashboard or home page is now visible',
  });
}
