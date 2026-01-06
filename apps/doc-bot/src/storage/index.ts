import fs from 'fs/promises';
import path from 'path';
import config from '../config/index.js';

/**
 * Ensure storage directories exist
 */
export async function ensureStorageDirectories(): Promise<void> {
  await fs.mkdir(config.storage.stateDir, { recursive: true });
  await fs.mkdir(config.output.dir, { recursive: true });
  await fs.mkdir(config.output.screenshotsDir, { recursive: true });
}

/**
 * Check if auth state exists
 */
export async function hasAuthState(): Promise<boolean> {
  try {
    await fs.access(config.storage.authFile);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear auth state (for re-authentication)
 */
export async function clearAuthState(): Promise<void> {
  try {
    await fs.unlink(config.storage.authFile);
  } catch {
    // File doesn't exist, that's fine
  }
}

/**
 * Get the path to the auth state file
 */
export function getAuthStatePath(): string {
  return config.storage.authFile;
}
