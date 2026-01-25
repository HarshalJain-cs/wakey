// /app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// Lazy initialization of Supabase client
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseAdmin;
}

/**
 * Handles incoming Stripe webhook events.
 */
async function handleStripeEvent(event: Stripe.Event) {
  // Get customer ID based on event type
  let customerId: string | null = null;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;
  } else if (event.type.startsWith('customer.subscription')) {
    const subscription = event.data.object as Stripe.Subscription;
    customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null;
  }

  if (!customerId) {
    console.error(`Stripe Webhook: No customer ID found for event type: ${event.type}`);
    return;
  }

  // Retrieve our user_id from the customers table using stripe_customer_id
  const { data: customerRecord, error: customerError } = await getSupabaseAdmin()
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (customerError || !customerRecord) {
    console.error(`Stripe Webhook: Customer not found in DB for Stripe Customer ID: ${customerId}`);
    return; // Or throw an error to retry webhook
  }

  const userId = (customerRecord as { id: string }).id;

  switch (event.type) {
    case 'checkout.session.completed': {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = checkoutSession.subscription as string;

      // Fetch the subscription object to get details
      const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
      const subscription = subscriptionResponse as unknown as Stripe.Subscription;

      // Get the first item's billing period
      const firstItem = subscription.items.data[0];

      // Create or update subscription in our database
      const subscriptionData = {
        id: subscription.id,
        user_id: userId,
        status: subscription.status,
        provider: 'stripe',
        plan_id: (firstItem?.price?.id || 'default_plan').toString(),
        price_id: (firstItem?.price?.id || 'default_price').toString(),
        quantity: firstItem?.quantity || 1,
        cancel_at_period_end: subscription.cancel_at_period_end,
        created_at: new Date(subscription.created * 1000).toISOString(),
        current_period_start: firstItem?.current_period_start
          ? new Date(firstItem.current_period_start * 1000).toISOString()
          : new Date().toISOString(),
        current_period_end: firstItem?.current_period_end
          ? new Date(firstItem.current_period_end * 1000).toISOString()
          : new Date().toISOString(),
        ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      };
      const { error: upsertError } = await getSupabaseAdmin()
        .from('subscriptions')
        .upsert(subscriptionData as never, { onConflict: 'id' });

      if (upsertError) {
        console.error('Stripe Webhook: Failed to upsert subscription:', upsertError);
      } else {
        console.log(`Stripe Webhook: Subscription ${subscription.id} for user ${userId} upserted successfully.`);
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const updatedSubscription = event.data.object as Stripe.Subscription;
      const firstItemUpdated = updatedSubscription.items.data[0];

      const updateData = {
        status: updatedSubscription.status,
        cancel_at_period_end: updatedSubscription.cancel_at_period_end,
        current_period_start: firstItemUpdated?.current_period_start
          ? new Date(firstItemUpdated.current_period_start * 1000).toISOString()
          : undefined,
        current_period_end: firstItemUpdated?.current_period_end
          ? new Date(firstItemUpdated.current_period_end * 1000).toISOString()
          : undefined,
        ended_at: updatedSubscription.ended_at ? new Date(updatedSubscription.ended_at * 1000).toISOString() : null,
        cancel_at: updatedSubscription.cancel_at ? new Date(updatedSubscription.cancel_at * 1000).toISOString() : null,
        canceled_at: updatedSubscription.canceled_at ? new Date(updatedSubscription.canceled_at * 1000).toISOString() : null,
        trial_start: updatedSubscription.trial_start ? new Date(updatedSubscription.trial_start * 1000).toISOString() : null,
        trial_end: updatedSubscription.trial_end ? new Date(updatedSubscription.trial_end * 1000).toISOString() : null,
      };
      const { error: updateError } = await getSupabaseAdmin()
        .from('subscriptions')
        .update(updateData as never)
        .eq('id', updatedSubscription.id);

      if (updateError) {
        console.error('Stripe Webhook: Failed to update subscription:', updateError);
      } else {
        console.log(`Stripe Webhook: Subscription ${updatedSubscription.id} for user ${userId} updated successfully.`);
      }
      break;
    }

    // Add other event types as needed
    default:
      console.log(`Stripe Webhook: Unhandled event type ${event.type}`);
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No Stripe signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Stripe Webhook Error: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Stripe Webhook Handler Error: ${errorMessage}`);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
