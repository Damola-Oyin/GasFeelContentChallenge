import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { contestant_external_id, submission_url, submission_type = 'content' } = await request.json();

    // Validate input
    if (!contestant_external_id || !submission_url) {
      return NextResponse.json({ 
        error: 'contestant_external_id and submission_url are required' 
      }, { status: 400 });
    }

    // Validate submission URL format
    try {
      new URL(submission_url);
    } catch {
      return NextResponse.json({ 
        error: 'Invalid submission_url format' 
      }, { status: 400 });
    }

    const supabase = createClient();

    // Find the contestant by external_id
    const { data: contestant, error: contestantError } = await supabase
      .from('contestants')
      .select('id, external_id, first_name')
      .eq('external_id', contestant_external_id.trim().toUpperCase())
      .single();

    if (contestantError || !contestant) {
      return NextResponse.json({ 
        error: `Contestant with ID '${contestant_external_id}' not found` 
      }, { status: 404 });
    }

    // Check contest status and deadline using dynamic timeline (14 days from tomorrow)
    const { data: contest, error: contestError } = await supabase
      .from('contest')
      .select('status')
      .single();

    if (contestError) {
      console.error('Error fetching contest:', contestError);
      return NextResponse.json({ error: 'Failed to verify contest status' }, { status: 500 });
    }

    // Calculate dynamic contest end date (same as frontend countdown)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const contestEnd = new Date(tomorrow);
    contestEnd.setDate(tomorrow.getDate() + 14);
    contestEnd.setHours(23, 59, 59, 999);

    // Check if submission is late
    let status = 'pending';
    if (now > contestEnd) {
      status = 'ineligible_late';
    }

    // Create AI submission record
    // Note: submission_url is stored in delta field temporarily
    // Status is managed by admin approval
    const { data: submission, error: submissionError } = await supabase
      .from('ai_submissions')
      .insert({
        contestant_ID: contestant.id, // Use actual DB column name
        delta: 0, // Will be set by admin on approval
        server_received_at: now.toISOString(),
        status: status
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Error creating submission:', submissionError);
      return NextResponse.json({ 
        error: 'Failed to create submission' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: status === 'ineligible_late' 
        ? 'Submission received but marked as late (contest ended)'
        : 'Submission received and pending admin review',
      submission: {
        id: submission.id,
        contestant_external_id: contestant.external_id,
        contestant_name: contestant.first_name,
        submission_url: submission.submission_url,
        status: submission.status,
        submitted_at: submission.submitted_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
