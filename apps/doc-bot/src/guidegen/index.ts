import fs from 'fs/promises';
import path from 'path';
import config from '../config/index.js';
import type { Guide, Step, GuideMetadata } from '../types.js';

export interface GenerateGuideOptions {
  id: string;
  title: string;
  description: string;
  category: string;
  steps: StepInput[];
  tags?: string[];
}

export interface StepInput {
  title: string;
  description: string;
  screenshotPath?: string;
  action?: string;
  selector?: string;
}

/**
 * Generate a guide from captured steps
 */
export async function generateGuide(options: GenerateGuideOptions): Promise<Guide> {
  const { id, title, description, category, steps, tags = [] } = options;
  
  const now = new Date().toISOString();
  
  const metadata: GuideMetadata = {
    id,
    title,
    description,
    category,
    tags,
    createdAt: now,
    updatedAt: now,
    version: '1.0.0',
  };
  
  const guideSteps: Step[] = steps.map((step, index) => ({
    order: index + 1,
    title: step.title,
    description: step.description,
    screenshot: step.screenshotPath ? path.basename(step.screenshotPath) : undefined,
    action: step.action,
    selector: step.selector,
  }));
  
  const guide: Guide = {
    metadata,
    steps: guideSteps,
  };
  
  return guide;
}

/**
 * Save a guide to the output directory
 */
export async function saveGuide(guide: Guide): Promise<string> {
  // Ensure output directory exists
  await fs.mkdir(config.output.dir, { recursive: true });
  
  const filename = `${guide.metadata.id}.json`;
  const filepath = path.join(config.output.dir, filename);
  
  await fs.writeFile(filepath, JSON.stringify(guide, null, 2), 'utf-8');
  
  return filepath;
}

/**
 * Load an existing guide
 */
export async function loadGuide(id: string): Promise<Guide | null> {
  const filepath = path.join(config.output.dir, `${id}.json`);
  
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(content) as Guide;
  } catch {
    return null;
  }
}

/**
 * List all guides in the output directory
 */
export async function listGuides(): Promise<GuideMetadata[]> {
  try {
    const files = await fs.readdir(config.output.dir);
    const guides: GuideMetadata[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filepath = path.join(config.output.dir, file);
        const content = await fs.readFile(filepath, 'utf-8');
        const guide = JSON.parse(content) as Guide;
        guides.push(guide.metadata);
      }
    }
    
    return guides;
  } catch {
    return [];
  }
}
