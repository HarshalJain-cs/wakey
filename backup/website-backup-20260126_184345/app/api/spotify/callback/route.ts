import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`
  : 'http://localhost:3001/api/spotify/callback';

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  if (error) {
    return NextResponse.redirect(`${baseUrl}/account?spotify_error=${error}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/account?spotify_error=missing_params`);
  }

  // Decode and validate state
  let stateData: { userId: string; timestamp: number };
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    // Check if state is not older than 10 minutes
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      return NextResponse.redirect(`${baseUrl}/account?spotify_error=expired_state`);
    }
  } catch {
    return NextResponse.redirect(`${baseUrl}/account?spotify_error=invalid_state`);
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return NextResponse.redirect(`${baseUrl}/account?spotify_error=not_configured`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Spotify token exchange failed:', errorText);
      return NextResponse.redirect(`${baseUrl}/account?spotify_error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json();

    // Store tokens in user_data table
    const supabase = getSupabaseAdmin();
    const { error: upsertError } = await supabase
      .from('user_data')
      .upsert({
        user_id: stateData.userId,
        data_type: 'spotify_tokens',
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Date.now() + tokens.expires_in * 1000,
          scope: tokens.scope,
        },
        synced_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,data_type',
      });

    if (upsertError) {
      console.error('Failed to store Spotify tokens:', upsertError);
      return NextResponse.redirect(`${baseUrl}/account?spotify_error=storage_failed`);
    }

    return NextResponse.redirect(`${baseUrl}/account?spotify_connected=true`);
  } catch (err) {
    console.error('Spotify callback error:', err);
    return NextResponse.redirect(`${baseUrl}/account?spotify_error=unknown`);
  }
}
