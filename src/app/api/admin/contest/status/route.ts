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

    const { status } = await request.json();

    if (!['live', 'verification', 'final'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const supabase = createClient();

    // Get contest ID first
    const { data: contests, error: fetchError } = await supabase
      .from('contest')
      .select('id');

    if (fetchError || !contests || contests.length === 0) {
      console.error('Error fetching contest:', fetchError);
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    const contestId = contests[0].id;

    const { error } = await supabase
      .from('contest')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', contestId);

    if (error) {
      console.error('Error updating contest status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Contest status updated to ${status} successfully`,
      status: status
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

