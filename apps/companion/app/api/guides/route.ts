import { NextResponse } from 'next/server';
import { loadAllGuides } from '@/lib/guide-loader';

/**
 * GET /api/guides
 * Returns a list of all available guide metadata
 */
export async function GET() {
  try {
    const guides = await loadAllGuides();
    const metadata = guides.map((g) => g.metadata);
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error loading guides:', error);
    return NextResponse.json(
      { error: 'Failed to load guides' },
      { status: 500 }
    );
  }
}
