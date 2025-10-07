import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { submissionId, action, points } = await request.json();

    if (!submissionId || !action || typeof points !== 'number') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const supabase = createClient();

    // Get the submission details
    const { data: submission, error: fetchError } = await supabase
      .from('ai_submissions')
      .select('contestant_id, status')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      console.error('Error fetching submission:', fetchError);
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Update the submission status
    const { error: updateError } = await supabase
      .from('ai_submissions')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        points_awarded: points,
        admin_notes: `Status changed to ${action === 'approve' ? 'approved' : 'rejected'} by admin`,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating submission:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If approved, update contestant points using the stored procedure
    if (action === 'approve' && points > 0) {
      const { data: contestant, error: contestantError } = await supabase
        .from('contestants')
        .select('id, current_points')
        .eq('id', (submission as any).contestant_id)
        .single();

      if (contestantError || !contestant) {
        console.error('Error fetching contestant:', contestantError);
        return NextResponse.json({ error: 'Failed to fetch contestant' }, { status: 500 });
      }

      const newPoints = (contestant as any).current_points + points;
      const newTimestamp = new Date().toISOString();

      const { error: transactionError } = await supabase.rpc('add_points_transaction', {
        contestant_id_param: (contestant as any).id,
        points_delta: points,
        source_param: 'ai_submission_approval',
        applied_by_user_id_param: 'admin', // In production, use actual admin user ID
        new_points: newPoints,
        new_timestamp: newTimestamp,
      });

      if (transactionError) {
        console.error('Error in add_points_transaction:', transactionError);
        return NextResponse.json({ error: transactionError.message }, { status: 500 });
      }
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

