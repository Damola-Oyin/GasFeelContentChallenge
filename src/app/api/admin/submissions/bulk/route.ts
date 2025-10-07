import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
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
      .select('id, contestant_id, status')
      .in('id', submissionIds);

    if (fetchError || !submissions) {
      console.error('Error fetching submissions:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    // Update all submissions
    const { error: updateError } = await supabase
      .from('ai_submissions')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        points_awarded: points,
        admin_notes: `Bulk ${action === 'approve' ? 'approved' : 'rejected'} by admin`,
        updated_at: new Date().toISOString()
      } as any)
      .in('id', submissionIds);

    if (updateError) {
      console.error('Error updating submissions:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If approved, update contestant points for each approved submission
    if (action === 'approve' && points > 0) {
      const contestantIds = Array.from(new Set(submissions.map((s: any) => s.contestant_id)));
      
      for (const contestantId of contestantIds) {
        const { data: contestant, error: contestantError } = await supabase
          .from('contestants')
          .select('id, current_points')
          .eq('id', contestantId)
          .single();

        if (contestantError || !contestant) {
          console.error('Error fetching contestant:', contestantError);
          continue; // Skip this contestant but continue with others
        }

        const newPoints = (contestant as any).current_points + points;
        const newTimestamp = new Date().toISOString();

        const { error: transactionError } = await supabase.rpc('add_points_transaction', {
          contestant_id_param: (contestant as any).id,
          points_delta: points,
          source_param: 'ai_submission_bulk_approval',
          applied_by_user_id_param: 'admin', // In production, use actual admin user ID
          new_points: newPoints,
          new_timestamp: newTimestamp,
        });

        if (transactionError) {
          console.error('Error in add_points_transaction:', transactionError);
          // Continue with other contestants even if one fails
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

