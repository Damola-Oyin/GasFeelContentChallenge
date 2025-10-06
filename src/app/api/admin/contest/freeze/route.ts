import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { freeze } = await request.json();

    if (typeof freeze !== 'boolean') {
      return NextResponse.json({ error: 'Invalid freeze value' }, { status: 400 });
    }

    const supabase = createClient();

    const { error } = await supabase
      .from('contest')
      .update({
        freeze_public_display: freeze,
        updated_at: new Date().toISOString()
      })
      .eq('id', (await supabase.from('contest').select('id').single()).data?.id);

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

