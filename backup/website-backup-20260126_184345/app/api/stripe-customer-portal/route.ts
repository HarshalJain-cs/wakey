// wakey/apps/website/app/api/stripe-customer-portal/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

// Lazy initialization
let _stripe: Stripe | null = null;
let _supabaseAdmin: ReturnType<typeof createAdminClient> | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-12-15.clover',
    });
  }
  return _stripe;
}

function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseAdmin;
}

export async function POST(req: Request) {
  try {
    const { returnUrl } = await req.json(); // returnUrl from client

    // Authenticate user
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userId = session.user.id;

    // Retrieve stripe_customer_id from our Supabase 'customers' table
    const { data: customerRecord, error: customerError } = await getSupabaseAdmin()
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (customerError || !customerRecord) {
      console.error('Stripe Customer Portal: Could not find Stripe Customer ID for user', userId, customerError);
      return NextResponse.json({ error: 'Stripe customer ID not found.' }, { status: 400 });
    }

    const stripeCustomerId = (customerRecord as { stripe_customer_id: string }).stripe_customer_id;

    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'Stripe customer ID not found.' }, { status: 400 });
    }

    // Create a Stripe Customer Portal session
    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating Stripe Customer Portal session:', errorMessage);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
