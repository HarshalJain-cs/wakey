import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const supabase = await createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch settings from user_data table
  const { data, error } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', userId)
    .eq('data_type', 'settings')
    .maybeSingle();

  if (error) {
    console.error('Error fetching settings:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data?.data || null });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;
  const settings = await req.json();

  // Update display name in user metadata
  if (settings.displayName) {
    const adminSupabase = getSupabaseAdmin();
    await adminSupabase.auth.admin.updateUserById(userId, {
      user_metadata: { display_name: settings.displayName },
    });
  }

  // Save settings to user_data table
  const { error } = await supabase
    .from('user_data')
    .upsert({
      user_id: userId,
      data_type: 'settings',
      data: {
        notifications: settings.notifications,
        preferences: settings.preferences,
      },
      synced_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,data_type',
    });

  if (error) {
    console.error('Error saving settings:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
