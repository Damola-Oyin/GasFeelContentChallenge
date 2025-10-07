import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: contest, error } = await supabase
      .from('contest')
      .select('id, name, status, freeze_public_display, rules_url')
      .single();

    if (error) {
      console.error('Error fetching contest:', error);
      return NextResponse.json({ error: 'Failed to fetch contest status' }, { status: 500 });
    }

    // Calculate dynamic contest dates (14 days from tomorrow)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const contestEnd = new Date(tomorrow);
    contestEnd.setDate(tomorrow.getDate() + 14);
    contestEnd.setHours(23, 59, 59, 999);

    // Add dynamic dates to contest object
    const contestWithDynamicDates = {
      ...contest,
      start_at: tomorrow.toISOString(),
      end_at: contestEnd.toISOString(),
    };

    return NextResponse.json(contestWithDynamicDates);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
