/**
 * Type definitions for doc-bot
 * 
 * These types are used internally by doc-bot and also exported
 * for use by the companion app via the shared package.
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

/**
 * Search result for guide lookup
 */
export interface GuideSearchResult {
  guide: GuideMetadata;
  score: number;
  matchedTerms: string[];
}
