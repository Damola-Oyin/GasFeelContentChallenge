import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { status } = await request.json();

    if (!['live', 'verification', 'final'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const supabase = createClient();

    const { error } = await supabase
      .from('contest')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', (await supabase.from('contest').select('id').single()).data?.id);

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

