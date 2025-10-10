import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { LeaderboardEntry } from '@/lib/database.types'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get ALL contestants ordered by points (desc) and first_reached_current_points_at (asc)
    // Zero-point contestants will appear at the bottom
    const supabase = createClient();
    const { data: contestants, error } = await supabase
      .from('contestants')
      .select('external_id, current_points, first_reached_current_points_at')
      .order('current_points', { ascending: false })
      .order('first_reached_current_points_at', { ascending: true })

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }

    // Add rank to each contestant
    const leaderboardEntries: LeaderboardEntry[] = contestants?.map((contestant: any, index) => ({
      rank: index + 1,
      external_id: contestant.external_id,
      current_points: contestant.current_points,
      first_reached_current_points_at: contestant.first_reached_current_points_at,
    })) || []

    return NextResponse.json({ data: leaderboardEntries })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
