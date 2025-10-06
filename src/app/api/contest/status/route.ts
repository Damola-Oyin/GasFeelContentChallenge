import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: contest, error } = await supabase
      .from('contest')
      .select('id, name, start_at, end_at, status, freeze_public_display, rules_url')
      .single();

    if (error) {
      console.error('Error fetching contest:', error);
      return NextResponse.json({ error: 'Failed to fetch contest status' }, { status: 500 });
    }

    return NextResponse.json(contest);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
