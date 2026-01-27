import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`
  : 'http://localhost:3001/api/spotify/callback';

const SPOTIFY_SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
].join(' ');

export async function GET() {
  const supabase = await createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!SPOTIFY_CLIENT_ID) {
    return NextResponse.json({ error: 'Spotify not configured' }, { status: 500 });
  }

  // Generate state parameter for CSRF protection
  const state = Buffer.from(JSON.stringify({
    userId: session.user.id,
    timestamp: Date.now(),
  })).toString('base64');

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES,
    state,
    show_dialog: 'true',
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params}`;

  return NextResponse.json({ authUrl });
}
