import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuthToken, checkRole } from '@/lib/auth';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check Admin authentication using JWT
    const authResult = verifyAuthToken(request);
    if (authResult.error || !authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    // Check if user has Admin role
    if (!checkRole(authResult.user.role, 'admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const supabase = createClient();
    
    // Fetch all AI submissions first
    const { data: submissions, error } = await supabase
      .from('ai_submissions')
      .select(`
        id,
        contestant_ID,
        delta,
        server_received_at,
        status,
        decided_by_user_id,
        decided_at
      `)
      .order('server_received_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch contestant information separately for each submission
    const submissionsWithContestants = await Promise.all(
      submissions.map(async (submission: any) => {
        // Handle both cases: contestant_ID could be database ID or external_id
        let contestantQuery = supabase
          .from('contestants')
          .select('external_id, first_name')
          .eq('id', submission.contestant_ID);

        const { data: contestants } = await contestantQuery;
        
        // If no match by ID, try by external_id
        if (!contestants || contestants.length === 0) {
          const { data: contestantsByExternal } = await supabase
            .from('contestants')
            .select('external_id, first_name')
            .eq('external_id', submission.contestant_ID);
          
          return {
            ...submission,
            contestants: contestantsByExternal?.[0] || null
          };
        }

        return {
          ...submission,
          contestants: contestants[0]
        };
      })
    );

    // Transform the data to match our expected format
    const transformedSubmissions = submissionsWithContestants.map((submission: any) => ({
      id: submission.id,
      contestant_id: submission.contestant_ID, // Map from actual DB column name
      delta: submission.delta,
      submitted_at: submission.server_received_at,
      status: submission.status,
      decided_by_user_id: submission.decided_by_user_id,
      decided_at: submission.decided_at,
      contestant: submission.contestants
    }));

    return NextResponse.json(transformedSubmissions);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

