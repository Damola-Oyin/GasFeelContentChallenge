import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { external_id, first_name } = await request.json();

    // Validate input
    if (!external_id || !first_name) {
      return NextResponse.json({ 
        error: 'external_id and first_name are required' 
      }, { status: 400 });
    }

    // Validate external_id format (at least 5 characters)
    if (external_id.length < 5) {
      return NextResponse.json({ 
        error: 'external_id must be at least 5 characters long' 
      }, { status: 400 });
    }

    // Clean and validate input
    const cleanExternalId = external_id.trim().toUpperCase();
    const cleanFirstName = first_name.trim();

    const supabase = createClient();

    // Check if contestant already exists
    const { data: existingContestant } = await supabase
      .from('contestants')
      .select('external_id')
      .eq('external_id', cleanExternalId)
      .single();

    if (existingContestant) {
      return NextResponse.json({ 
        error: `Contestant with ID '${cleanExternalId}' already exists` 
      }, { status: 409 });
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

    if (now > contestEnd) {
      return NextResponse.json({ 
        error: 'Contest registration deadline has passed' 
      }, { status: 400 });
    }

    if ((contest as any).status !== 'live') {
      return NextResponse.json({ 
        error: 'Contest is not in live mode - registration is closed' 
      }, { status: 400 });
    }

    // Create new contestant with 0 points
    const { data: newContestant, error: createError } = await supabase
      .from('contestants')
      .insert({
        external_id: cleanExternalId,
        first_name: cleanFirstName,
        current_points: 0,
        first_reached_current_points_at: now.toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating contestant:', createError);
      return NextResponse.json({ 
        error: 'Failed to create contestant' 
      }, { status: 500 });
    }

    // Create initial audit record showing contestant creation
    const { error: auditError } = await supabase.rpc('add_points_transaction', {
      contestant_id_param: newContestant.id,
      points_delta: 0, // 0 points for creation
      source_param: 'ai_contestant_creation',
      applied_by_user_id_param: 'ai_system',
      new_points: 0,
      new_timestamp: now.toISOString()
    });

    if (auditError) {
      console.error('Error creating audit record:', auditError);
      // Don't fail the creation if audit fails, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Contestant created successfully',
      contestant: {
        id: newContestant.id,
        external_id: newContestant.external_id,
        first_name: newContestant.first_name,
        current_points: newContestant.current_points
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
