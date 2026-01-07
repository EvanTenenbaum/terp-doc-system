/**
 * Flow Registry - Central registry for all documentation flows
 */

import { FlowSpec, FlowExecutor, FlowRegistryEntry, FlowModule } from './types.js';

// Import all flow implementations
import { spec as authLoginSpec, execute as authLoginExecute } from './implementations/auth-login.js';
import { spec as authLogoutSpec, execute as authLogoutExecute } from './implementations/auth-logout.js';
import { spec as dashboardOverviewSpec, execute as dashboardOverviewExecute } from './implementations/dashboard-overview.js';
import { spec as clientListSpec, execute as clientListExecute } from './implementations/client-list.js';
import { spec as clientSearchSpec, execute as clientSearchExecute } from './implementations/client-search.js';
import { spec as clientDetailSpec, execute as clientDetailExecute } from './implementations/client-detail.js';
import { spec as vendorListSpec, execute as vendorListExecute } from './implementations/vendor-list.js';
import { spec as vendorDetailSpec, execute as vendorDetailExecute } from './implementations/vendor-detail.js';
import { spec as productCatalogSpec, execute as productCatalogExecute } from './implementations/product-catalog.js';
import { spec as productDetailSpec, execute as productDetailExecute } from './implementations/product-detail.js';
import { spec as inventoryListSpec, execute as inventoryListExecute } from './implementations/inventory-list.js';
import { spec as batchDetailSpec, execute as batchDetailExecute } from './implementations/batch-detail.js';
import { spec as orderListSpec, execute as orderListExecute } from './implementations/order-list.js';
import { spec as orderFilterStatusSpec, execute as orderFilterStatusExecute } from './implementations/order-filter-status.js';
import { spec as orderDetailSpec, execute as orderDetailExecute } from './implementations/order-detail.js';
import { spec as orderCreateDraftSpec, execute as orderCreateDraftExecute } from './implementations/order-create-draft.js';
import { spec as invoiceListSpec, execute as invoiceListExecute } from './implementations/invoice-list.js';
import { spec as invoiceFilterOverdueSpec, execute as invoiceFilterOverdueExecute } from './implementations/invoice-filter-overdue.js';
import { spec as invoiceDetailSpec, execute as invoiceDetailExecute } from './implementations/invoice-detail.js';
import { spec as pricingRulesSpec, execute as pricingRulesExecute } from './implementations/pricing-rules.js';
import { spec as settingsBasicSpec, execute as settingsBasicExecute } from './implementations/settings-basic.js';

/**
 * All registered flows
 */
const FLOWS: FlowRegistryEntry[] = [
  // Authentication
  { spec: authLoginSpec, executor: authLoginExecute },
  { spec: authLogoutSpec, executor: authLogoutExecute },

  // Dashboard
  { spec: dashboardOverviewSpec, executor: dashboardOverviewExecute },

  // Clients
  { spec: clientListSpec, executor: clientListExecute },
  { spec: clientSearchSpec, executor: clientSearchExecute },
  { spec: clientDetailSpec, executor: clientDetailExecute },

  // Vendors
  { spec: vendorListSpec, executor: vendorListExecute },
  { spec: vendorDetailSpec, executor: vendorDetailExecute },

  // Products
  { spec: productCatalogSpec, executor: productCatalogExecute },
  { spec: productDetailSpec, executor: productDetailExecute },

  // Inventory
  { spec: inventoryListSpec, executor: inventoryListExecute },
  { spec: batchDetailSpec, executor: batchDetailExecute },

  // Orders
  { spec: orderListSpec, executor: orderListExecute },
  { spec: orderFilterStatusSpec, executor: orderFilterStatusExecute },
  { spec: orderDetailSpec, executor: orderDetailExecute },
  { spec: orderCreateDraftSpec, executor: orderCreateDraftExecute },

  // Invoices
  { spec: invoiceListSpec, executor: invoiceListExecute },
  { spec: invoiceFilterOverdueSpec, executor: invoiceFilterOverdueExecute },
  { spec: invoiceDetailSpec, executor: invoiceDetailExecute },

  // Pricing
  { spec: pricingRulesSpec, executor: pricingRulesExecute },

  // Settings
  { spec: settingsBasicSpec, executor: settingsBasicExecute },
];

/**
 * Get all registered flows
 */
export function getAllFlows(): FlowRegistryEntry[] {
  return FLOWS;
}

/**
 * Get a flow by ID
 */
export function getFlowById(id: string): FlowRegistryEntry | undefined {
  return FLOWS.find((f) => f.spec.id === id);
}

/**
 * Get flows by tag
 */
export function getFlowsByTag(tag: string): FlowRegistryEntry[] {
  return FLOWS.filter((f) => f.spec.tags?.includes(tag));
}

/**
 * Get flows by module
 */
export function getFlowsByModule(module: FlowModule): FlowRegistryEntry[] {
  return FLOWS.filter((f) => f.spec.module === module);
}

/**
 * Get flows that require authentication
 */
export function getAuthenticatedFlows(): FlowRegistryEntry[] {
  return FLOWS.filter((f) => f.spec.requiresAuth);
}

/**
 * Get flows that don't require authentication
 */
export function getUnauthenticatedFlows(): FlowRegistryEntry[] {
  return FLOWS.filter((f) => !f.spec.requiresAuth);
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const flow of FLOWS) {
    for (const tag of flow.spec.tags || []) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
}

/**
 * Get all unique modules
 */
export function getAllModules(): FlowModule[] {
  const modules = new Set<FlowModule>();
  for (const flow of FLOWS) {
    modules.add(flow.spec.module);
  }
  return Array.from(modules);
}

/**
 * Get flow count
 */
export function getFlowCount(): number {
  return FLOWS.length;
}

/**
 * Print registry summary
 */
export function printRegistrySummary(): void {
  console.log(`\n📚 Flow Registry: ${FLOWS.length} flows registered`);
  console.log('');

  const byModule = new Map<FlowModule, FlowRegistryEntry[]>();
  for (const flow of FLOWS) {
    const existing = byModule.get(flow.spec.module) || [];
    existing.push(flow);
    byModule.set(flow.spec.module, existing);
  }

  for (const [module, flows] of byModule) {
    console.log(`  ${module}:`);
    for (const flow of flows) {
      const tags = flow.spec.tags?.length ? ` [${flow.spec.tags.join(', ')}]` : '';
      console.log(`    - ${flow.spec.id}: ${flow.spec.title}${tags}`);
    }
  }
  console.log('');
}
