import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ContestantSearchResult, LeaderboardEntry } from '@/lib/database.types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contestantId = searchParams.get('id')

    if (!contestantId) {
      return NextResponse.json({ error: 'Contestant ID is required' }, { status: 400 })
    }

    // Validate format (GF-XXXXXX)
    if (contestantId.length < 5) {
      return NextResponse.json({ error: 'Invalid contestant ID format' }, { status: 400 })
    }

    // First, get all contestants ordered by rank to calculate the search result's rank
    const supabase = createClient();
    const { data: allContestants, error: allError } = await supabase
      .from('contestants')
      .select('external_id, current_points, first_reached_current_points_at')
      .order('current_points', { ascending: false })
      .order('first_reached_current_points_at', { ascending: true })

    if (allError) {
      console.error('Error fetching all contestants:', allError)
      return NextResponse.json({ error: 'Failed to fetch contestants' }, { status: 500 })
    }

    // Find the specific contestant
    const contestantIndex = allContestants?.findIndex((c: any) => c.external_id === contestantId)
    
    if (contestantIndex === -1 || contestantIndex === undefined) {
      return NextResponse.json({ error: 'Contestant not found' }, { status: 404 })
    }

    const contestant = (allContestants as any)[contestantIndex]
    const rank = contestantIndex + 1
    const isInTop100 = rank <= 100

    let neighbors: LeaderboardEntry[] | undefined

    if (!isInTop100) {
      // Get ±10 neighbors around the contestant's rank
      const startIndex = Math.max(0, contestantIndex - 10)
      const endIndex = Math.min(allContestants.length, contestantIndex + 11)
      
      neighbors = (allContestants as any).slice(startIndex, endIndex).map((c: any, index: number) => ({
        rank: startIndex + index + 1,
        external_id: c.external_id,
        current_points: c.current_points,
        first_reached_current_points_at: c.first_reached_current_points_at,
      }))
    }

    const result: ContestantSearchResult = {
      external_id: (contestant as any).external_id,
      rank,
      current_points: (contestant as any).current_points,
      is_in_top_100: isInTop100,
      neighbors
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
