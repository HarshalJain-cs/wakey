import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getAccessToken(userId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data: tokenRecord } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', userId)
    .eq('data_type', 'spotify_tokens')
    .maybeSingle();

  return tokenRecord?.data?.access_token || null;
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { action } = await req.json();

  if (!['play', 'pause', 'next', 'previous'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const accessToken = await getAccessToken(session.user.id);

  if (!accessToken) {
    return NextResponse.json({ error: 'Spotify not connected' }, { status: 400 });
  }

  try {
    let endpoint: string;
    let method: string;

    switch (action) {
      case 'play':
        endpoint = 'https://api.spotify.com/v1/me/player/play';
        method = 'PUT';
        break;
      case 'pause':
        endpoint = 'https://api.spotify.com/v1/me/player/pause';
        method = 'PUT';
        break;
      case 'next':
        endpoint = 'https://api.spotify.com/v1/me/player/next';
        method = 'POST';
        break;
      case 'previous':
        endpoint = 'https://api.spotify.com/v1/me/player/previous';
        method = 'POST';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204 || response.ok) {
      return NextResponse.json({ success: true });
    }

    // Handle specific Spotify errors
    if (response.status === 404) {
      return NextResponse.json({ error: 'No active device found. Open Spotify on a device first.' }, { status: 404 });
    }

    if (response.status === 403) {
      return NextResponse.json({ error: 'Spotify Premium required for playback control' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to control playback' }, { status: response.status });
  } catch (error) {
    console.error('Spotify control error:', error);
    return NextResponse.json({ error: 'Failed to control playback' }, { status: 500 });
  }
}
