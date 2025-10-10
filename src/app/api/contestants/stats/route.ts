import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get total contestant count
    const { count: totalContestants, error: countError } = await supabase
      .from('contestants')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching contestant count:', countError);
      return NextResponse.json({ error: 'Failed to fetch contestant stats' }, { status: 500 });
    }

    // Get contestants with points > 0
    const { count: contestantsWithPoints, error: pointsError } = await supabase
      .from('contestants')
      .select('*', { count: 'exact', head: true })
      .gt('current_points', 0);

    if (pointsError) {
      console.error('Error fetching contestants with points:', pointsError);
      return NextResponse.json({ error: 'Failed to fetch contestant stats' }, { status: 500 });
    }

    // Get contestants created in last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { count: recentContestants, error: recentError } = await supabase
      .from('contestants')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneDayAgo.toISOString());

    if (recentError) {
      console.error('Error fetching recent contestants:', recentError);
      return NextResponse.json({ error: 'Failed to fetch contestant stats' }, { status: 500 });
    }

    return NextResponse.json({
      total_contestants: totalContestants || 0,
      contestants_with_points: contestantsWithPoints || 0,
      contestants_with_zero_points: (totalContestants || 0) - (contestantsWithPoints || 0),
      recent_contestants_24h: recentContestants || 0,
      last_updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

