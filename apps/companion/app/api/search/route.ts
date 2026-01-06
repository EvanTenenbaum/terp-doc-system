import { NextResponse } from 'next/server';
import { searchGuides } from '@/lib/guide-loader';

/**
 * GET /api/search?q=query
 * Search guides by keyword
 * Returns top 3 matches
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }
  
  try {
    const results = await searchGuides(query);
    // Return top 3 matches only
    return NextResponse.json(results.slice(0, 3));
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
