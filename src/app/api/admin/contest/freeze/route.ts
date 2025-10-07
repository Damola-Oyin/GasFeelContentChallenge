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

    const { freeze } = await request.json();

    if (typeof freeze !== 'boolean') {
      return NextResponse.json({ error: 'Invalid freeze value' }, { status: 400 });
    }

    const supabase = createClient();

    // Get the contest ID first
    const { data: contestData, error: fetchError } = await supabase
      .from('contest')
      .select('id')
      .single();

    if (fetchError || !contestData) {
      console.error('Error fetching contest:', fetchError);
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('contest')
      .update({
        freeze_public_display: freeze,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', (contestData as any).id);

    if (error) {
      console.error('Error updating freeze status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Public display ${freeze ? 'frozen' : 'unfrozen'} successfully`,
      freeze_public_display: freeze
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

