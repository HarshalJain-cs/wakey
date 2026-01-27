import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch all user data
  const { data: userData, error: userDataError } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId);

  if (userDataError) {
    console.error('Error fetching user data:', userDataError.message);
    return NextResponse.json({ error: userDataError.message }, { status: 500 });
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    console.error('Error fetching profile:', profileError.message);
  }

  // Fetch subscription data
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId);

  if (subscriptionError) {
    console.error('Error fetching subscription:', subscriptionError.message);
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      id: userId,
      email: session.user.email,
    },
    profile: profile || null,
    subscription: subscription || [],
    data: userData || [],
  };

  const jsonString = JSON.stringify(exportData, null, 2);

  return new NextResponse(jsonString, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="wakey-data-${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}
