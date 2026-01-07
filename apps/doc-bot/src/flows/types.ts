/**
 * Flow Types - Definitions for documentation flows
 */

import { Page, BrowserContext } from '@playwright/test';
import { StepRecorder } from '../capture/step-recorder.js';

/**
 * Flow specification (from YAML or inline definition)
 */
export interface FlowSpec {
  /** Unique flow identifier */
  id: string;

  /** Human-readable title */
  title: string;

  /** Brief description of what this flow documents */
  description: string;

  /** TERP module this flow belongs to */
  module: FlowModule;

  /** Required user role */
  role: UserRole;

  /** Searchable tags */
  tags?: string[];

  /** Prerequisites that must be met before running */
  preconditions?: string[];

  /** Whether this flow requires authentication */
  requiresAuth: boolean;

  /** Whether this flow creates new records (affects cleanup) */
  createsRecords?: boolean;

  /** Path to the TypeScript implementation */
  implementation?: string;
}

/**
 * TERP modules for categorization
 */
export type FlowModule =
  | 'Authentication'
  | 'Dashboard'
  | 'Clients'
  | 'Vendors'
  | 'Products'
  | 'Inventory'
  | 'Orders'
  | 'Invoices'
  | 'Pricing'
  | 'Settings'
  | 'Help';

/**
 * User roles
 */
export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

/**
 * Context passed to flow implementations
 */
export interface FlowContext {
  /** Playwright page */
  page: Page;

  /** Browser context */
  context: BrowserContext;

  /** Step recorder for capturing actions */
  recorder: StepRecorder;

  /** Flow specification */
  spec: FlowSpec;

  /** Base URL for TERP */
  baseUrl: string;
}

/**
 * Flow execution function signature
 */
export type FlowExecutor = (context: FlowContext) => Promise<void>;

/**
 * Flow result after execution
 */
export interface FlowResult {
  /** Flow ID */
  flowId: string;

  /** Whether the flow succeeded */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** Number of steps completed */
  stepsCompleted: number;

  /** Total duration in milliseconds */
  duration: number;

  /** Path to generated guide (if successful) */
  guidePath?: string;

  /** Path to failure artifacts (if failed) */
  failurePath?: string;
}

/**
 * Flow registry entry
 */
export interface FlowRegistryEntry {
  spec: FlowSpec;
  executor: FlowExecutor;
}

/**
 * Seeded entity identifiers for use in flows
 */
export const SEEDED_ENTITIES = {
  user: {
    email: 'docs-bot@terp.local',
    openId: 'docs-bot-user-001',
  },
  clients: [
    { email: 'docs-bot-acme@example.com', name: 'Acme Corp' },
    { email: 'docs-bot-greenvalley@example.com', name: 'Green Valley' },
    { email: 'docs-bot-mountainhigh@example.com', name: 'Mountain High' },
    { email: 'docs-bot-sunset@example.com', name: 'Sunset Dispensary' },
  ],
  vendor: {
    email: 'docs-bot-rockymtn@example.com',
    name: 'Rocky Mountain Supplies',
  },
  products: [
    { sku: 'docs-bot-SKU-001', name: 'Test Product 1' },
    { sku: 'docs-bot-SKU-002', name: 'Test Product 2' },
    { sku: 'docs-bot-SKU-003', name: 'Test Product 3' },
    { sku: 'docs-bot-SKU-004', name: 'Test Product 4' },
    { sku: 'docs-bot-SKU-005', name: 'Test Product 5' },
  ],
  batches: [
    { batchNumber: 'docs-bot-BATCH-001' },
    { batchNumber: 'docs-bot-BATCH-002' },
    { batchNumber: 'docs-bot-BATCH-003' },
    { batchNumber: 'docs-bot-BATCH-004' },
    { batchNumber: 'docs-bot-BATCH-005' },
  ],
  orders: [
    { orderNumber: 'docs-bot-ORD-001', status: 'draft' },
    { orderNumber: 'docs-bot-ORD-002', status: 'pending' },
    { orderNumber: 'docs-bot-ORD-003', status: 'confirmed' },
    { orderNumber: 'docs-bot-ORD-004', status: 'shipped' },
    { orderNumber: 'docs-bot-ORD-005', status: 'delivered' },
  ],
  invoices: [
    { invoiceNumber: 'docs-bot-INV-001', status: 'draft' },
    { invoiceNumber: 'docs-bot-INV-002', status: 'sent' },
    { invoiceNumber: 'docs-bot-INV-003', status: 'overdue' },
  ],
} as const;
