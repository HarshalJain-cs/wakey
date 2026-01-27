// /app/api/webhooks/razorpay/route.ts
import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Lazy initialization of Supabase client
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseAdmin;
}

/**
 * Verifies the Razorpay webhook signature.
 */
function verifyRazorpaySignature(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
}

/**
 * Handles incoming Razorpay webhook events.
 */
async function handleRazorpayEvent(event: Record<string, unknown>) {
  const payload = event.payload as Record<string, unknown> | undefined;
  const subscriptionData = (payload?.subscription as Record<string, unknown>)?.entity as Record<string, unknown> | undefined;
  const paymentData = (payload?.payment as Record<string, unknown>)?.entity as Record<string, unknown> | undefined;

  if (!subscriptionData && !paymentData) {
    console.warn('Razorpay Webhook: No relevant subscription or payment data found in payload.');
    return;
  }

  // Determine user_id from customer_id or payment notes if possible
  const customerId = (subscriptionData?.customer_id || paymentData?.customer_id) as string | undefined;

  if (!customerId) {
    console.error('Razorpay Webhook: Could not determine customer ID from event payload.');
    return;
  }

  // Retrieve our user_id from the customers table using razorpay_customer_id
  const { data: customerRecord, error: customerError } = await getSupabaseAdmin()
    .from('customers')
    .select('id')
    .eq('razorpay_customer_id', customerId)
    .single();

  if (customerError || !customerRecord) {
    console.error(`Razorpay Webhook: Customer not found in DB for Razorpay Customer ID: ${customerId}`);
    return;
  }

  const userId = (customerRecord as { id: string }).id;

  switch (event.event) {
    case 'subscription.created':
    case 'subscription.activated':
    case 'subscription.updated':
    case 'subscription.halted':
    case 'subscription.cancelled':
    case 'subscription.paused':
    case 'subscription.resumed': {
      // Map Razorpay status to our generic status
      let status;
      switch (subscriptionData?.status) {
        case 'active':
          status = 'active';
          break;
        case 'pending':
        case 'authenticated':
          status = 'trialing';
          break;
        case 'halted':
          status = 'past_due';
          break;
        case 'cancelled':
          status = 'canceled';
          break;
        case 'paused':
          status = 'paused';
          break;
        default:
          status = 'unknown';
      }

      const subData = {
        id: subscriptionData?.id,
        user_id: userId,
        status: status,
        provider: 'razorpay',
        plan_id: subscriptionData?.plan_id,
        price_id: subscriptionData?.plan_id,
        quantity: 1,
        cancel_at_period_end: subscriptionData?.cancel_by_date ? true : false,
        created_at: subscriptionData?.created_at
          ? new Date((subscriptionData.created_at as number) * 1000).toISOString()
          : new Date().toISOString(),
        current_period_start: subscriptionData?.current_start
          ? new Date((subscriptionData.current_start as number) * 1000).toISOString()
          : new Date().toISOString(),
        current_period_end: subscriptionData?.current_end
          ? new Date((subscriptionData.current_end as number) * 1000).toISOString()
          : new Date().toISOString(),
        ended_at: subscriptionData?.ended_at
          ? new Date((subscriptionData.ended_at as number) * 1000).toISOString()
          : null,
        cancel_at: subscriptionData?.cancel_by_date
          ? new Date((subscriptionData.cancel_by_date as number) * 1000).toISOString()
          : null,
        canceled_at: subscriptionData?.cancelled_at
          ? new Date((subscriptionData.cancelled_at as number) * 1000).toISOString()
          : null,
        trial_start: subscriptionData?.start_at
          ? new Date((subscriptionData.start_at as number) * 1000).toISOString()
          : null,
        trial_end: subscriptionData?.end_at
          ? new Date((subscriptionData.end_at as number) * 1000).toISOString()
          : null,
      };
      const { error: upsertError } = await getSupabaseAdmin()
        .from('subscriptions')
        .upsert(subData as never, { onConflict: 'id' });

      if (upsertError) {
        console.error('Razorpay Webhook: Failed to upsert subscription:', upsertError);
      } else {
        console.log(`Razorpay Webhook: Subscription ${subscriptionData?.id} for user ${userId} upserted successfully.`);
      }
      break;
    }

    case 'payment.authorized':
    case 'invoice.paid':
      console.log(`Razorpay Webhook: Payment ${paymentData?.id} authorized/paid for customer ${paymentData?.customer_id}.`);
      break;

    default:
      console.log(`Razorpay Webhook: Unhandled event type ${event.event}`);
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No Razorpay signature header' }, { status: 400 });
  }

  // Verify signature
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  if (!verifyRazorpaySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid Razorpay signature' }, { status: 400 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Razorpay Webhook Error: Could not parse event body: ${errorMessage}`);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    await handleRazorpayEvent(event);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Razorpay Webhook Handler Error: ${errorMessage}`);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
