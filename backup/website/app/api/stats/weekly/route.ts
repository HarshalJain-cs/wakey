import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;

  // Get the start of the week (7 days ago)
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  // Fetch this week's stats from user_data table
  const { data, error } = await supabase
    .from('user_data')
    .select('data, synced_at')
    .eq('user_id', userId)
    .eq('data_type', 'daily_stats')
    .gte('synced_at', weekStart.toISOString())
    .order('synced_at', { ascending: true });

  if (error) {
    console.error('Error fetching weekly stats:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Generate array of last 7 days
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyStats = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Find stats for this day
    const dayData = data?.find(d => {
      const syncDate = new Date(d.synced_at).toISOString().split('T')[0];
      return syncDate === dateStr;
    });

    weeklyStats.push({
      day: days[date.getDay()],
      date: dateStr,
      focusTime: dayData?.data?.focusTime || 0,
    });
  }

  return NextResponse.json({ weeklyStats });
}
