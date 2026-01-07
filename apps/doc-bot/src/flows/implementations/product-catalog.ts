/**
 * Flow: product-catalog
 * View the product catalog
 */

import { FlowSpec, FlowContext } from '../types.js';
import { navigateTo, clickWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'product-catalog',
  title: 'View Product Catalog',
  description: 'Navigate to the products section and browse the product catalog.',
  module: 'Products',
  role: 'admin',
  tags: ['products', 'catalog', 'list', 'navigation'],
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

  // Step 2: Click on Products in navigation
  await clickWithFallback(
    page,
    'Products menu',
    {
      testId: 'nav-products',
      role: { role: 'link', name: /products/i },
      text: /^products$/i,
      css: 'a[href*="products"], [data-nav="products"]',
    },
    { recorder }
  );

  // Step 3: Wait for product catalog to load
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Product catalog loaded', {
    notes: 'The product catalog displays all available products',
  });

  // Step 4: Note catalog features
  await recorder.recordStep(page, 'verify', 'Browse products', {
    notes: 'Products are listed with SKU, name, category, and current inventory levels. Click a product for details.',
  });
}
