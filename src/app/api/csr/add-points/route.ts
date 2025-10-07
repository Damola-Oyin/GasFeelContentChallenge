import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Helper function to check if user is CSR or Admin
async function checkCSRAuth(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Not authenticated', status: 401 };
    }

    // Check user profile and role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, is_active')
      .eq('email', user.email! as any)
      .single();

    if (profileError || !profile) {
      return { error: 'User profile not found', status: 403 };
    }

    if (!(profile as any).is_active) {
      return { error: 'Account is inactive', status: 403 };
    }

    if (!['admin', 'csr'].includes((profile as any).role)) {
      return { error: 'CSR or Admin access required', status: 403 };
    }

    return { user, profile };
  } catch (error) {
    return { error: 'Authentication failed', status: 500 };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check CSR/Admin authentication
    const authResult = await checkCSRAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
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

    // Check contest status and deadline
    const { data: contest, error: contestError } = await supabase
      .from('contest')
      .select('end_at, status')
      .single();

    if (contestError) {
      console.error('Error fetching contest:', contestError);
      return NextResponse.json({ error: 'Failed to verify contest status' }, { status: 500 });
    }

    const now = new Date();
    const endAt = new Date((contest as any).end_at);

    if (now > endAt) {
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
    const appliedByUserId = authResult.user.email!;

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
