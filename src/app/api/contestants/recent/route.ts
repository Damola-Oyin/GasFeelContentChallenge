import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = createClient();

    // Get recently created contestants (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: recentContestants, error } = await supabase
      .from('contestants')
      .select('external_id, first_name, current_points, created_at')
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent contestants:', error);
      return NextResponse.json({ error: 'Failed to fetch recent contestants' }, { status: 500 });
    }

    return NextResponse.json({
      recent_contestants: recentContestants || [],
      total_count: recentContestants?.length || 0,
      time_range: 'last_24_hours'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

