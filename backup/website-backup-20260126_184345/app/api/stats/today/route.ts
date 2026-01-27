import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's stats from user_data table
  const { data, error } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', userId)
    .eq('data_type', 'daily_stats')
    .gte('synced_at', `${today}T00:00:00`)
    .order('synced_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching today stats:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ stats: null }, { status: 200 });
  }

  // Extract stats from the JSONB data
  const stats = {
    focusTime: data.data?.focusTime || 0,
    sessions: data.data?.sessions || 0,
    distractions: data.data?.distractions || 0,
    focusScore: data.data?.focusScore || 0,
  };

  return NextResponse.json({ stats });
}
