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

    const { submissionId, action, points } = await request.json();

    console.log(`Admin API: Processing ${action} for submission ${submissionId} with ${points} points`);

    if (!submissionId || !action || typeof points !== 'number') {
      console.error('Admin API: Invalid request data:', { submissionId, action, points });
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const supabase = createClient();

    // Get the submission details
    console.log(`Admin API: Fetching submission ${submissionId}`);
    const { data: submissions, error: fetchError } = await supabase
      .from('ai_submissions')
      .select('contestant_ID, status')
      .eq('id', submissionId);

    if (fetchError) {
      console.error('Admin API: Error fetching submission:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
    }

    if (!submissions || submissions.length === 0) {
      console.error('Admin API: No submission found with ID:', submissionId);
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    console.log(`Admin API: Found submission:`, submissions[0]);

    const submission = submissions[0];

    // Check if submission is already in the target state
    const targetStatus = action === 'approve' ? 'approved' : 'rejected';
    if (submission.status === targetStatus) {
      console.log(`Admin API: Submission ${submissionId} is already ${targetStatus}`);
      return NextResponse.json({ 
        message: `Submission is already ${targetStatus}`,
        pointsAwarded: 0
      });
    }

    // Update the submission status
    const updateData: any = {
      status: targetStatus,
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
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating submission:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If approved, update contestant points directly
    if (action === 'approve' && points > 0) {
      console.log(`Admin API: Updating contestant ${(submission as any).contestant_ID} with ${points} points`);
      
      // Handle both cases: contestant_ID could be database ID or external_id
      let { data: contestants, error: contestantError } = await supabase
        .from('contestants')
        .select('id, current_points')
        .eq('id', (submission as any).contestant_ID);

      // If no match by ID, try by external_id
      if ((!contestants || contestants.length === 0) && !contestantError) {
        console.log(`Admin API: No match by ID, trying external_id lookup for ${(submission as any).contestant_ID}`);
        const result = await supabase
          .from('contestants')
          .select('id, current_points')
          .eq('external_id', (submission as any).contestant_ID);
        
        contestants = result.data;
        contestantError = result.error;
      }

      if (contestantError) {
        console.error('Admin API: Error fetching contestant:', contestantError);
        return NextResponse.json({ error: 'Failed to fetch contestant' }, { status: 500 });
      }

      if (!contestants || contestants.length === 0) {
        console.error('Admin API: No contestant found with ID:', (submission as any).contestant_ID);
        return NextResponse.json({ error: 'Contestant not found' }, { status: 404 });
      }

      console.log(`Admin API: Found contestant:`, contestants[0]);

      const contestant = contestants[0];
      const newPoints = (contestant as any).current_points + points;
      const newTimestamp = new Date().toISOString();

      // Direct update approach
      console.log(`Admin API: Updating contestant ${(contestant as any).id} from ${(contestant as any).current_points} to ${newPoints} points`);
      
      const { data: updateResult, error: updateContestantError } = await supabase
        .from('contestants')
        .update({
          current_points: newPoints,
          first_reached_current_points_at: newTimestamp,
          updated_at: newTimestamp
        })
        .eq('id', (contestant as any).id)
        .select();

      if (updateContestantError) {
        console.error('Admin API: Error updating contestant points:', updateContestantError);
        return NextResponse.json({ error: 'Failed to update contestant points' }, { status: 500 });
      }

      console.log(`Admin API: Contestant update result:`, updateResult);

      console.log(`Successfully approved submission ${submissionId} and added ${points} points to contestant ${(contestant as any).id}. New total: ${newPoints}`);
    }

    return NextResponse.json({ 
      message: `Submission ${action}d successfully`,
      pointsAwarded: action === 'approve' ? points : 0
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

