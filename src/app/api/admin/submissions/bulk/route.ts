import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuthToken, checkRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

    const { submissionIds, action, points } = await request.json();

    if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
      return NextResponse.json({ error: 'Invalid submission IDs' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (typeof points !== 'number') {
      return NextResponse.json({ error: 'Invalid points value' }, { status: 400 });
    }

    const supabase = createClient();

    // Get all submissions that need to be updated
    const { data: submissions, error: fetchError } = await supabase
      .from('ai_submissions')
      .select('id, contestant_ID, status')
      .in('id', submissionIds);

    if (fetchError || !submissions) {
      console.error('Error fetching submissions:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    // Update all submissions
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      decided_by_user_id: 'admin', // TODO: Use actual admin user ID
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Only update delta if approving with positive points
    if (action === 'approve' && points > 0) {
      updateData.delta = points;
    }

    const { error: updateError } = await supabase
      .from('ai_submissions')
      .update(updateData)
      .in('id', submissionIds);

    if (updateError) {
      console.error('Error updating submissions:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If approved, update contestant points for each approved submission
    if (action === 'approve' && points > 0) {
      const contestantIds = Array.from(new Set(submissions.map((s: any) => s.contestant_ID)));
      
      for (const contestantId of contestantIds) {
        // Handle both cases: contestant_ID could be database ID or external_id
        let { data: contestants, error: contestantError } = await supabase
          .from('contestants')
          .select('id, current_points')
          .eq('id', contestantId);

        // If no match by ID, try by external_id
        if ((!contestants || contestants.length === 0) && !contestantError) {
          const result = await supabase
            .from('contestants')
            .select('id, current_points')
            .eq('external_id', contestantId);
          
          contestants = result.data;
          contestantError = result.error;
        }

        if (contestantError) {
          console.error('Error fetching contestant:', contestantError);
          continue; // Skip this contestant but continue with others
        }

        if (!contestants || contestants.length === 0) {
          console.error('No contestant found with ID:', contestantId);
          continue; // Skip this contestant but continue with others
        }

        const contestant = contestants[0];
        const newPoints = (contestant as any).current_points + points;
        const newTimestamp = new Date().toISOString();

        // Direct update approach
        const { error: updateContestantError } = await supabase
          .from('contestants')
          .update({
            current_points: newPoints,
            first_reached_current_points_at: newTimestamp,
            updated_at: newTimestamp
          })
          .eq('id', (contestant as any).id);

        if (updateContestantError) {
          console.error(`Error updating contestant ${contestantId}:`, updateContestantError);
          // Continue processing other contestants even if one fails
        } else {
          console.log(`Successfully updated contestant ${contestantId} with ${points} points. New total: ${newPoints}`);
        }
      }
    }

    return NextResponse.json({ 
      message: `${submissionIds.length} submissions ${action}d successfully`,
      pointsAwarded: action === 'approve' ? points * submissionIds.length : 0
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

