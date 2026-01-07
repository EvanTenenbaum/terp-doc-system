/**
 * tRPC Client for TERP Dev Docs Endpoints
 *
 * Handles communication with the TERP server's devDocs router for:
 * - Seeding test data
 * - Resetting test data
 * - Verifying test data state
 */

import config from '../config/index.js';

export interface SeedResult {
  success: boolean;
  message: string;
  counts: EntityCounts;
}

export interface VerifyResult {
  ok: boolean;
  counts: EntityCounts;
  errors?: string[];
}

export interface InfoResult {
  enabled: boolean;
  environment: string;
  entities: string[];
}

export interface EntityCounts {
  users: number;
  clients: number;
  vendors: number;
  products: number;
  batches: number;
  orders: number;
  invoices: number;
  pricingRules: number;
}

// Expected counts after seeding
export const EXPECTED_COUNTS: EntityCounts = {
  users: 1,
  clients: 4,
  vendors: 1,
  products: 5,
  batches: 5,
  orders: 5,
  invoices: 3,
  pricingRules: 3,
};

export class TRPCClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly responseBody?: unknown
  ) {
    super(message);
    this.name = 'TRPCClientError';
  }
}

/**
 * Get headers for tRPC requests
 */
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.docs.endpointsSecret) {
    headers['X-Docs-Secret'] = config.docs.endpointsSecret;
  }

  return headers;
}

/**
 * Make a tRPC request
 */
async function trpcRequest<T>(
  method: 'GET' | 'POST',
  procedure: string,
  body?: unknown
): Promise<T> {
  const url = `${config.terp.baseUrl}/trpc/${procedure}`;

  const options: RequestInit = {
    method,
    headers: getHeaders(),
  };

  if (body !== undefined && method === 'POST') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }

    throw new TRPCClientError(
      `tRPC request failed: ${procedure} (${response.status})`,
      response.status,
      errorBody
    );
  }

  const result = await response.json();

  // tRPC wraps results in { result: { data: ... } }
  if (result?.result?.data) {
    return result.result.data as T;
  }

  return result as T;
}

/**
 * Seed the docs-bot test data
 */
export async function seed(): Promise<SeedResult> {
  return trpcRequest<SeedResult>('POST', 'devDocs.seed', {});
}

/**
 * Reset (delete) all docs-bot test data
 */
export async function reset(): Promise<SeedResult> {
  return trpcRequest<SeedResult>('POST', 'devDocs.reset', {});
}

/**
 * Reset and seed in one operation (preferred)
 */
export async function resetAndSeed(): Promise<SeedResult> {
  return trpcRequest<SeedResult>('POST', 'devDocs.resetAndSeed', {});
}

/**
 * Verify that test data exists and is correct
 */
export async function verify(): Promise<VerifyResult> {
  return trpcRequest<VerifyResult>('GET', 'devDocs.verify');
}

/**
 * Get info about the dev docs endpoints
 */
export async function info(): Promise<InfoResult> {
  return trpcRequest<InfoResult>('GET', 'devDocs.info');
}

/**
 * Assert that counts match expected values
 */
export function assertCounts(actual: EntityCounts, expected: EntityCounts = EXPECTED_COUNTS): void {
  const mismatches: string[] = [];

  for (const key of Object.keys(expected) as (keyof EntityCounts)[]) {
    if (actual[key] !== expected[key]) {
      mismatches.push(`${key}: expected ${expected[key]}, got ${actual[key]}`);
    }
  }

  if (mismatches.length > 0) {
    throw new Error(`Entity count mismatch:\n  ${mismatches.join('\n  ')}`);
  }
}

/**
 * Full seed workflow: resetAndSeed + verify + assert counts
 */
export async function seedAndVerify(): Promise<VerifyResult> {
  console.log('🔄 Resetting and seeding docs-bot data...');

  const seedResult = await resetAndSeed();

  if (!seedResult.success) {
    throw new Error(`Seed failed: ${seedResult.message}`);
  }

  console.log(`✅ Seed complete: ${seedResult.message}`);

  console.log('🔍 Verifying seeded data...');

  const verifyResult = await verify();

  if (!verifyResult.ok) {
    throw new Error(`Verify failed: ${verifyResult.errors?.join(', ') || 'Unknown error'}`);
  }

  assertCounts(verifyResult.counts);

  console.log('✅ Verification passed:');
  console.log(`   Users: ${verifyResult.counts.users}`);
  console.log(`   Clients: ${verifyResult.counts.clients}`);
  console.log(`   Vendors: ${verifyResult.counts.vendors}`);
  console.log(`   Products: ${verifyResult.counts.products}`);
  console.log(`   Batches: ${verifyResult.counts.batches}`);
  console.log(`   Orders: ${verifyResult.counts.orders}`);
  console.log(`   Invoices: ${verifyResult.counts.invoices}`);
  console.log(`   Pricing Rules: ${verifyResult.counts.pricingRules}`);

  return verifyResult;
}
