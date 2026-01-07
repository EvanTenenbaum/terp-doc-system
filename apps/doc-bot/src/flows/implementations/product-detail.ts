/**
 * Flow: product-detail
 * View details of a specific product
 */

import { FlowSpec, FlowContext, SEEDED_ENTITIES } from '../types.js';
import { navigateTo, clickWithFallback, waitForStableUI } from '../../helpers/actions.js';

export const spec: FlowSpec = {
  id: 'product-detail',
  title: 'View Product Details',
  description: 'Learn how to view detailed information about a specific product.',
  module: 'Products',
  role: 'admin',
  tags: ['products', 'detail', 'view', 'sku'],
  preconditions: [
    'You are logged into TERP',
    'The product exists in the catalog',
  ],
  requiresAuth: true,
};

export async function execute(context: FlowContext): Promise<void> {
  const { page, recorder, baseUrl } = context;
  const product = SEEDED_ENTITIES.products[0]; // docs-bot-SKU-001

  // Step 1: Navigate to products
  await navigateTo(page, `${baseUrl}/products`, 'Products page', { recorder });

  // Step 2: Wait for list to load
  await waitForStableUI(page);

  // Step 3: Click on product row
  await clickWithFallback(
    page,
    `Product: ${product.sku}`,
    {
      text: new RegExp(product.sku, 'i'),
      css: `tr:has-text("${product.sku}"), [data-sku="${product.sku}"]`,
    },
    { recorder, notes: 'Click on the product to view details' }
  );

  // Step 4: Wait for detail page
  await waitForStableUI(page);
  await recorder.recordStep(page, 'verify', 'Product details loaded', {
    notes: 'The product detail page shows complete product information, inventory, and pricing',
  });

  // Step 5: Review sections
  await recorder.recordStep(page, 'verify', 'Review product information', {
    notes: 'Check specifications, current stock levels, pricing tiers, and related batches',
  });
}
