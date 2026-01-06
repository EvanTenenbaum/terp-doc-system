/**
 * Shared utilities for TERP doc system
 * 
 * NOTE: Only add utilities here if they are truly shared between
 * doc-bot and companion. Prefer duplication over premature abstraction.
 */

/**
 * Slugify a string for use as an ID
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format a date as ISO string (for guide metadata)
 */
export function toISOString(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Parse an ISO date string safely
 */
export function parseISOString(dateString: string): Date | null {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}
