/**
 * Type definitions for the Companion UI
 * 
 * These mirror the types from doc-bot for consistency.
 */

/**
 * Metadata for a guide
 */
export interface GuideMetadata {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  version: string;
}

/**
 * A single step in a guide
 */
export interface Step {
  order: number;
  title: string;
  description: string;
  screenshot?: string;
  action?: string;
  selector?: string;
}

/**
 * A complete guide with metadata and steps
 */
export interface Guide {
  metadata: GuideMetadata;
  steps: Step[];
}
