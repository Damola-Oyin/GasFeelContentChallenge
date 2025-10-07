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

    if (!/^GF-[A-Z0-9]{6}$/.test(contestant_id)) {
      return NextResponse.json({ error: 'Invalid contestant ID format' }, { status: 400 });
    }

    const supabase = createClient();

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

    if (now > contestEnd) {
      return NextResponse.json({ error: 'Challenge deadline has passed. Point additions are disabled.' }, { status: 400 });
    }

    if ((contest as any).status !== 'live') {
      return NextResponse.json({ error: 'Contest is not in live mode' }, { status: 400 });
    }

    // Get contestant
    const { data: contestant, error: contestantError } = await supabase
      .from('contestants')
      .select('id, external_id, current_points, first_reached_current_points_at')
      .eq('external_id', contestant_id)
      .single();

    if (contestantError || !contestant) {
      return NextResponse.json({ error: 'Contestant not found' }, { status: 404 });
    }

    // Use the authenticated user's email
    const appliedByUserId = authResult.user.email;

    const newPoints = (contestant as any).current_points + 10;
    const nowTimestamp = now.toISOString();

    // Start a transaction
    const { error: transactionError } = await supabase.rpc('add_points_transaction', {
      contestant_id_param: (contestant as any).id,
      points_delta: 10,
      source_param: 'csr',
      applied_by_user_id_param: appliedByUserId,
      new_points: newPoints,
      new_timestamp: nowTimestamp
    });

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      return NextResponse.json({ error: 'Failed to add points' }, { status: 500 });
    }

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
