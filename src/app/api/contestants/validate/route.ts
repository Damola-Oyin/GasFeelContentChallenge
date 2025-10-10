import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contestantId = searchParams.get('id');

    if (!contestantId) {
      return NextResponse.json({ error: 'Contestant ID is required' }, { status: 400 });
    }

    if (contestantId.length < 5) {
      return NextResponse.json({ error: 'Invalid contestant ID format' }, { status: 400 });
    }

    // Get contestant
    const supabase = createClient();
    console.log(`Validating contestant ID: "${contestantId}"`);
    
    // Try exact match first
    let { data: contestants, error } = await supabase
      .from('contestants')
      .select('external_id, current_points')
      .eq('external_id', contestantId as any);

    // If no exact match, try case-insensitive search
    if ((!contestants || contestants.length === 0) && !error) {
      console.log(`No exact match found, trying case-insensitive search for: "${contestantId}"`);
      const result = await supabase
        .from('contestants')
        .select('external_id, current_points')
        .ilike('external_id', contestantId as any);
      
      contestants = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error fetching contestant:', error);
      return NextResponse.json({ error: 'Failed to validate contestant' }, { status: 500 });
    }

    console.log(`Found ${contestants?.length || 0} contestants with ID: "${contestantId}"`);
    if (contestants && contestants.length > 0) {
      console.log('Contestant data:', contestants[0]);
    }

    if (!contestants || contestants.length === 0) {
      console.log(`No contestant found with ID: ${contestantId}`);
      return NextResponse.json({ error: 'Contestant not found' }, { status: 404 });
    }

    const contestant = contestants[0];
    return NextResponse.json(contestant);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
