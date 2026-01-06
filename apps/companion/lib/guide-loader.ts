import fs from 'fs/promises';
import path from 'path';
import { Guide, GuideMetadata } from './types';

/**
 * Get the guides directory from environment or default
 */
function getGuidesDir(): string {
  return process.env.GUIDES_DIR || path.join(process.cwd(), 'guides');
}

/**
 * Load all guides from the guides directory
 */
export async function loadAllGuides(): Promise<Guide[]> {
  const guidesDir = getGuidesDir();
  const guides: Guide[] = [];
  
  try {
    const files = await fs.readdir(guidesDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filepath = path.join(guidesDir, file);
        const content = await fs.readFile(filepath, 'utf-8');
        const guide = JSON.parse(content) as Guide;
        guides.push(guide);
      }
    }
  } catch (error) {
    // Directory doesn't exist or is empty - return empty array
    console.warn('Guides directory not found or empty:', guidesDir);
  }
  
  return guides;
}

/**
 * Load a specific guide by ID
 */
export async function loadGuideById(id: string): Promise<Guide | null> {
  const guidesDir = getGuidesDir();
  const filepath = path.join(guidesDir, `${id}.json`);
  
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(content) as Guide;
  } catch {
    return null;
  }
}

/**
 * Search guides by keyword
 * Simple keyword matching on title, description, and tags
 */
export async function searchGuides(query: string): Promise<GuideMetadata[]> {
  const guides = await loadAllGuides();
  const queryLower = query.toLowerCase();
  const terms = queryLower.split(/\s+/).filter(Boolean);
  
  // Score each guide based on keyword matches
  const scored = guides.map((guide) => {
    const { metadata } = guide;
    let score = 0;
    
    // Check title (highest weight)
    if (metadata.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }
    terms.forEach((term) => {
      if (metadata.title.toLowerCase().includes(term)) score += 5;
    });
    
    // Check description
    if (metadata.description.toLowerCase().includes(queryLower)) {
      score += 5;
    }
    terms.forEach((term) => {
      if (metadata.description.toLowerCase().includes(term)) score += 2;
    });
    
    // Check tags
    metadata.tags.forEach((tag) => {
      if (tag.toLowerCase().includes(queryLower)) score += 3;
      terms.forEach((term) => {
        if (tag.toLowerCase().includes(term)) score += 1;
      });
    });
    
    // Check category
    if (metadata.category.toLowerCase().includes(queryLower)) {
      score += 3;
    }
    
    return { metadata, score };
  });
  
  // Filter and sort by score
  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.metadata);
}
