import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function DELETE() {
  const supabase = await createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;
  const adminSupabase = getSupabaseAdmin();

  try {
    // Delete user data
    await adminSupabase
      .from('user_data')
      .delete()
      .eq('user_id', userId);

    // Delete profile
    await adminSupabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    // Delete subscriptions
    await adminSupabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);

    // Delete customer record
    await adminSupabase
      .from('customers')
      .delete()
      .eq('id', userId);

    // Finally, delete the auth user
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError.message);
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error during account deletion:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
