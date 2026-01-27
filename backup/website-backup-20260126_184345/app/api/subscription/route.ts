// /app/api/subscription/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_req: Request) {
  const supabase = await createClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const userId = session.user.id;

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing']) // Fetch active or trialing subscriptions
    .order('current_period_end', { ascending: false }) // Get the most recent one
    .maybeSingle(); // Use maybeSingle to get one or null

  if (subscriptionError) {
    console.error('Error fetching subscription:', subscriptionError.message);
    return NextResponse.json({ error: subscriptionError.message }, { status: 500 });
  }

  if (!subscription) {
    return NextResponse.json({ subscription: null }, { status: 200 });
  }

  return NextResponse.json({ subscription });
}
