import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function refreshTokenIfNeeded(userId: string, tokenData: {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}) {
  // Check if token expires within 5 minutes
  if (Date.now() < tokenData.expires_at - 5 * 60 * 1000) {
    return tokenData.access_token;
  }

  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenData.refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const newTokens = await response.json();

  // Update stored tokens
  const supabase = getSupabaseAdmin();
  await supabase
    .from('user_data')
    .update({
      data: {
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token || tokenData.refresh_token,
        expires_at: Date.now() + newTokens.expires_in * 1000,
      },
      synced_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('data_type', 'spotify_tokens');

  return newTokens.access_token;
}

export async function GET() {
  const supabase = await createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;

  // Get stored Spotify tokens
  const adminSupabase = getSupabaseAdmin();
  const { data: tokenRecord, error: tokenError } = await adminSupabase
    .from('user_data')
    .select('data')
    .eq('user_id', userId)
    .eq('data_type', 'spotify_tokens')
    .maybeSingle();

  if (tokenError || !tokenRecord?.data?.access_token) {
    return NextResponse.json({ connected: false, track: null });
  }

  try {
    const accessToken = await refreshTokenIfNeeded(userId, tokenRecord.data);

    // Get currently playing track
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204) {
      return NextResponse.json({ connected: true, track: null });
    }

    if (!response.ok) {
      console.error('Spotify API error:', response.status);
      return NextResponse.json({ connected: true, track: null });
    }

    const data = await response.json();

    if (!data.item) {
      return NextResponse.json({ connected: true, track: null });
    }

    const track = {
      id: data.item.id,
      name: data.item.name,
      artist: data.item.artists.map((a: { name: string }) => a.name).join(', '),
      albumArt: data.item.album.images[0]?.url || null,
      durationMs: data.item.duration_ms,
      progressMs: data.progress_ms,
      isPlaying: data.is_playing,
    };

    return NextResponse.json({ connected: true, track });
  } catch (error) {
    console.error('Error fetching Spotify status:', error);
    return NextResponse.json({ connected: true, track: null });
  }
}
