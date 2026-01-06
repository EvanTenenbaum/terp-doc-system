import { NextResponse } from 'next/server';
import { loadGuideById } from '@/lib/guide-loader';

/**
 * GET /api/guides/[id]
 * Returns a specific guide by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guide = await loadGuideById(params.id);
    
    if (!guide) {
      return NextResponse.json(
        { error: 'Guide not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(guide);
  } catch (error) {
    console.error('Error loading guide:', error);
    return NextResponse.json(
      { error: 'Failed to load guide' },
      { status: 500 }
    );
  }
}
