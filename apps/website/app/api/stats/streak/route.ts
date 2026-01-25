import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch streak data from user_data table
  const { data, error } = await supabase
    .from('user_data')
    .select('data, synced_at')
    .eq('user_id', userId)
    .eq('data_type', 'streak_data')
    .order('synced_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching streak data:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    // No streak data - calculate from daily stats
    const { data: statsData, error: statsError } = await supabase
      .from('user_data')
      .select('synced_at')
      .eq('user_id', userId)
      .eq('data_type', 'daily_stats')
      .order('synced_at', { ascending: false });

    if (statsError) {
      console.error('Error fetching stats for streak:', statsError.message);
      return NextResponse.json({ streak: null }, { status: 200 });
    }

    // Calculate streak from daily stats
    if (!statsData || statsData.length === 0) {
      return NextResponse.json({ streak: null }, { status: 200 });
    }

    // Get unique dates
    const activeDates = [...new Set(
      statsData.map(s => new Date(s.synced_at).toISOString().split('T')[0])
    )].sort().reverse();

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if today or yesterday is in the list (streak is still active)
    if (activeDates.includes(today) || activeDates.includes(yesterday)) {
      for (let i = 0; i < activeDates.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedStr = expectedDate.toISOString().split('T')[0];

        if (activeDates.includes(expectedStr)) {
          currentStreak++;
        } else if (i === 0 && !activeDates.includes(today)) {
          // Today not active, but yesterday might be - check from yesterday
          continue;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    const sortedDates = [...activeDates].sort();

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / 86400000);

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // Get last 7 days for activity dots
    const streakDays = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (activeDates.includes(dateStr)) {
        streakDays.push(dateStr);
      }
    }

    return NextResponse.json({
      streak: {
        currentStreak,
        longestStreak,
        lastActiveDate: activeDates[0] || null,
        streakDays,
      },
    });
  }

  // Return synced streak data
  return NextResponse.json({
    streak: {
      currentStreak: data.data?.currentStreak || 0,
      longestStreak: data.data?.longestStreak || 0,
      lastActiveDate: data.data?.lastActiveDate || null,
      streakDays: data.data?.streakDays || [],
    },
  });
}
