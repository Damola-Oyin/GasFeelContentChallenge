import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Fetch all AI submissions with contestant information
    const { data: submissions, error } = await supabase
      .from('ai_submissions')
      .select(`
        id,
        contestant_id,
        submission_url,
        submitted_at,
        status,
        points_awarded,
        admin_notes,
        contestants!inner (
          external_id,
          first_name
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data to match our expected format
    const transformedSubmissions = submissions.map((submission: any) => ({
      id: submission.id,
      contestant_id: submission.contestant_id,
      submission_url: submission.submission_url,
      submitted_at: submission.submitted_at,
      status: submission.status,
      points_awarded: submission.points_awarded,
      admin_notes: submission.admin_notes,
      contestant: submission.contestants
    }));

    return NextResponse.json(transformedSubmissions);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

