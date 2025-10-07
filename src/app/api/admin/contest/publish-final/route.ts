import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = createClient();

    // Publish final results: set status to 'final' and unfreeze display
    const { error } = await supabase
      .from('contest')
      .update({
        status: 'final',
        freeze_public_display: false,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', ((await supabase.from('contest').select('id').single()).data as any)?.id);

    if (error) {
      console.error('Error publishing final results:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Final results published successfully',
      status: 'final',
      freeze_public_display: false
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

