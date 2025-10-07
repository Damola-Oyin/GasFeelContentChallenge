import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const { data: contestant, error } = await supabase
      .from('contestants')
      .select('external_id, current_points')
      .eq('external_id', contestantId as any)
      .single();

    if (error || !contestant) {
      return NextResponse.json({ error: 'Contestant not found' }, { status: 404 });
    }

    return NextResponse.json(contestant);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
