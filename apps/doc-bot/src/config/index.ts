import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from repo root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

/**
 * Configuration for doc-bot
 * All values come from environment variables with sensible defaults for development
 */
export const config = {
  // TERP instance configuration
  terp: {
    baseUrl: process.env.TERP_BASE_URL || 'http://localhost:3000',
    email: process.env.TERP_DOCBOT_EMAIL || '',
    password: process.env.TERP_DOCBOT_PASSWORD || '',
  },
  
  // Documentation endpoints
  docs: {
    endpointsSecret: process.env.DEV_DOCS_ENDPOINTS_SECRET || '',
  },
  
  // Output configuration
  output: {
    dir: process.env.DOCS_OUTPUT_DIR || path.resolve(__dirname, '../../guides-output'),
    screenshotsDir: path.resolve(__dirname, '../../screenshots'),
  },
  
  // Storage state for persistent auth
  storage: {
    stateDir: path.resolve(__dirname, '../../storage-state'),
    authFile: path.resolve(__dirname, '../../storage-state/auth.json'),
  },
  
  // Runtime flags
  isCI: process.env.CI === 'true',
  isDev: process.env.NODE_ENV !== 'production',
} as const;

/**
 * Validate required configuration for authenticated operations
 */
export function validateAuthConfig(): void {
  const missing: string[] = [];
  
  if (!config.terp.email) missing.push('TERP_DOCBOT_EMAIL');
  if (!config.terp.password) missing.push('TERP_DOCBOT_PASSWORD');
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Copy .env.example to .env and fill in the values.'
    );
  }
}

export default config;
