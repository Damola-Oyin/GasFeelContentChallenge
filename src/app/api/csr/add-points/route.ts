import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAuthToken, checkRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check CSR/Admin authentication using JWT
    const authResult = verifyAuthToken(request);
    if (authResult.error || !authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    // Check if user has CSR or Admin role
    if (!checkRole(authResult.user.role, 'csr')) {
      return NextResponse.json({ error: 'CSR or Admin access required' }, { status: 403 });
    }

    const { contestant_id } = await request.json();

    // Validate input
    if (!contestant_id) {
      return NextResponse.json({ error: 'Contestant ID is required' }, { status: 400 });
    }

    if (contestant_id.length < 5) {
      return NextResponse.json({ error: 'Invalid contestant ID format' }, { status: 400 });
    }

    const supabase = createClient();

    // Check contest status and dates from database
    const { data: contests, error: contestError } = await supabase
      .from('contest')
      .select('status, start_at, end_at');

    if (contestError) {
      console.error('Error fetching contest:', contestError);
      return NextResponse.json({ error: 'Failed to verify contest status' }, { status: 500 });
    }

    if (!contests || contests.length === 0) {
      console.error('No contest found');
      return NextResponse.json({ error: 'No contest found in database' }, { status: 404 });
    }

    const contest = contests[0];

    const now = new Date();
    const startAt = contest.start_at ? new Date(contest.start_at as any) : null;
    const endAt = contest.end_at ? new Date(contest.end_at as any) : null;

    if (startAt && now < startAt) {
      return NextResponse.json({ error: 'Challenge has not started yet.' }, { status: 400 });
    }

    if (endAt && now > endAt) {
      return NextResponse.json({ error: 'Challenge deadline has passed. Point additions are disabled.' }, { status: 400 });
    }

    if ((contest as any).status !== 'live') {
      return NextResponse.json({ error: 'Contest is not in live mode' }, { status: 400 });
    }

    // Get contestant (case-insensitive search like validation API)
    let { data: contestants, error: contestantError } = await supabase
      .from('contestants')
      .select('id, external_id, current_points, first_reached_current_points_at')
      .eq('external_id', contestant_id);

    // If no exact match, try case-insensitive search
    if ((!contestants || contestants.length === 0) && !contestantError) {
      console.log(`No exact match found for ${contestant_id}, trying case-insensitive search`);
      const result = await supabase
        .from('contestants')
        .select('id, external_id, current_points, first_reached_current_points_at')
        .ilike('external_id', contestant_id);
      
      contestants = result.data;
      contestantError = result.error;
    }

    if (contestantError) {
      console.error('Error fetching contestant:', contestantError);
      return NextResponse.json({ error: 'Failed to fetch contestant' }, { status: 500 });
    }

    if (!contestants || contestants.length === 0) {
      console.error('No contestant found with ID:', contestant_id);
      return NextResponse.json({ error: 'Contestant not found' }, { status: 404 });
    }

    console.log(`Found contestant: ${(contestants[0] as any).external_id} with ${(contestants[0] as any).current_points} points`);

    const contestant = contestants[0];

    // Use the authenticated user's email
    const appliedByUserId = authResult.user.email;

    const newPoints = (contestant as any).current_points + 100;
    const nowTimestamp = now.toISOString();

    console.log(`CSR API: Updating contestant ${contestant_id} (DB ID: ${(contestant as any).id})`);
    console.log(`CSR API: Current points: ${(contestant as any).current_points}, New points: ${newPoints}`);

    // Update contestant points directly
    const { data: updateData, error: updateError } = await supabase
      .from('contestants')
      .update({
        current_points: newPoints,
        first_reached_current_points_at: nowTimestamp,
        updated_at: nowTimestamp
      })
      .eq('id', (contestant as any).id)
      .select();

    if (updateError) {
      console.error('CSR API: Error updating contestant points:', updateError);
      return NextResponse.json({ error: 'Failed to add points' }, { status: 500 });
    }

    console.log('CSR API: Update response:', updateData);
    console.log(`CSR API: Successfully added 100 points to contestant ${contestant_id}. New total: ${newPoints}`);

    return NextResponse.json({
      success: true,
      message: 'Points added successfully',
      contestant: {
        external_id: (contestant as any).external_id,
        previous_points: (contestant as any).current_points,
        new_points: newPoints
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
