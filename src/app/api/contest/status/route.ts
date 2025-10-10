import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Try to get contest data, but handle the case where no rows exist
    const { data: contests, error } = await supabase
      .from('contest')
      .select('id, name, status, start_at, end_at, freeze_public_display, last_published_at');

    if (error) {
      console.error('Error fetching contest:', error);
      return NextResponse.json({ error: `Failed to fetch contest status: ${error.message}` }, { status: 500 });
    }

    // Check if we got any results
    if (!contests || contests.length === 0) {
      console.error('No contest found in database');
      return NextResponse.json({ error: 'No contest found in database. Please check your Supabase setup.' }, { status: 404 });
    }

    // Use the first contest (there should only be one)
    const contest = contests[0];
    
    const nowIso = new Date().toISOString();
    
    const responseBody = {
      ...contest,
      now: nowIso,
      has_passed_deadline: contest.end_at ? new Date(nowIso) > new Date(contest.end_at) : false,
    };

    console.log('Contest API returning:', responseBody);
    return NextResponse.json(responseBody);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
