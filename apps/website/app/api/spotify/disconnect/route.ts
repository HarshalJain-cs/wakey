import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST() {
  const supabase = await createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;

  // Delete stored Spotify tokens
  const adminSupabase = getSupabaseAdmin();
  const { error: deleteError } = await adminSupabase
    .from('user_data')
    .delete()
    .eq('user_id', userId)
    .eq('data_type', 'spotify_tokens');

  if (deleteError) {
    console.error('Failed to delete Spotify tokens:', deleteError);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
