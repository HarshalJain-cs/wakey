// /app/api/checkout-sessions/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// Lazy initialization of clients
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;
let _stripe: Stripe | null = null;
let _razorpay: InstanceType<typeof Razorpay> | null = null;

function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseAdmin;
}

function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-12-15.clover',
    });
  }
  return _stripe;
}

function getRazorpay() {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return _razorpay;
}

/**
 * Determines which payment provider to use based on user location.
 * For simplicity, this example uses a hardcoded check for 'India'.
 * In a real application, you might use a geolocation API.
 */
function determinePaymentProvider(userLocation: string): 'stripe' | 'razorpay' {
  // TODO: Implement more sophisticated geolocation logic
  if (userLocation && userLocation.toLowerCase() === 'india') {
    return 'razorpay';
  }
  return 'stripe';
}

/**
 * Gets or creates a customer record in both our Supabase 'customers' table
 * and the chosen payment provider's system.
 */
async function getOrCreateCustomer(
  userId: string,
  email: string, // Assuming email is available from user auth
  provider: 'stripe' | 'razorpay'
): Promise<{ customerId: string; providerCustomerId: string }> {
  // 1. Check our Supabase 'customers' table
  const { data: existingCustomer, error: fetchError } = await getSupabaseAdmin()
    .from('customers')
    .select('id, stripe_customer_id, razorpay_customer_id')
    .eq('id', userId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to fetch customer from DB: ${fetchError.message}`);
  }

  if (existingCustomer) {
    const customer = existingCustomer as { id: string; stripe_customer_id: string | null; razorpay_customer_id: string | null };
    if (provider === 'stripe' && customer.stripe_customer_id) {
      return { customerId: customer.id, providerCustomerId: customer.stripe_customer_id };
    }
    if (provider === 'razorpay' && customer.razorpay_customer_id) {
      return { customerId: customer.id, providerCustomerId: customer.razorpay_customer_id };
    }
  }

  // 2. Create customer in payment provider
  let providerCustomerId: string;
  if (provider === 'stripe') {
    const stripeCustomer = await getStripe().customers.create({ email, metadata: { userId } });
    providerCustomerId = stripeCustomer.id;
  } else { // razorpay
    const razorpayCustomer = await getRazorpay().customers.create({ email, name: userId, fail_existing: 0 });
    providerCustomerId = razorpayCustomer.id;
  }

  // 3. Update or Insert into Supabase 'customers' table
  const existingData = existingCustomer as { stripe_customer_id?: string | null; razorpay_customer_id?: string | null } | null;
  const customerData = {
    id: userId,
    stripe_customer_id: provider === 'stripe' ? providerCustomerId : existingData?.stripe_customer_id || null,
    razorpay_customer_id: provider === 'razorpay' ? providerCustomerId : existingData?.razorpay_customer_id || null,
  };
  const { error: upsertError } = await getSupabaseAdmin()
    .from('customers')
    .upsert(customerData as never, { onConflict: 'id' });

  if (upsertError) {
    throw new Error(`Failed to upsert customer in DB: ${upsertError.message}`);
  }

  return { customerId: userId, providerCustomerId };
}

/**
 * Creates a Stripe checkout session.
 */
async function createStripeCheckoutSession(
  providerCustomerId: string,
  plan: string, // Expecting 'weekly_plan' or 'yearly_plan'
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string }> {
  // TODO: Map 'plan' to actual Stripe Price IDs
  let priceId: string;
  if (plan === 'weekly_plan') {
    priceId = 'PRICE_ID_FOR_WEEKLY_PLAN_STRIPE'; // Replace with actual Stripe Price ID
  } else if (plan === 'yearly_plan') {
    priceId = 'PRICE_ID_FOR_YEARLY_PLAN_STRIPE'; // Replace with actual Stripe Price ID
  } else {
    throw new Error('Invalid plan specified for Stripe.');
  }

  const session = await getStripe().checkout.sessions.create({
    customer: providerCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return { sessionId: session.id! };
}

/**
 * Creates a Razorpay checkout session (order).
 */
async function createRazorpayCheckoutSession(
  providerCustomerId: string,
  plan: string, // Expecting 'weekly_plan' or 'yearly_plan'
  userId: string,
  _successUrl: string,
  _cancelUrl: string // Razorpay typically uses a callback URL rather than a cancel_url in order creation
): Promise<{ orderId: string; amount: number; currency: string; planId: string }> {
  // TODO: Map 'plan' to actual Razorpay Plan IDs and amounts
  let razorpayPlanId: string;
  let amount: number; // in smallest currency unit (e.g., paise for INR)
  let currency: string;

  if (plan === 'weekly_plan') {
    razorpayPlanId = 'PLAN_ID_FOR_WEEKLY_PLAN_RAZORPAY'; // Replace with actual Razorpay Plan ID
    amount = 250; // Example: 2.50 INR * 100 paise
    currency = 'INR';
  } else if (plan === 'yearly_plan') {
    razorpayPlanId = 'PLAN_ID_FOR_YEARLY_PLAN_RAZORPAY'; // Replace with actual Razorpay Plan ID
    amount = 10000; // Example: 100.00 INR * 100 paise
    currency = 'INR';
  } else {
    throw new Error('Invalid plan specified for Razorpay.');
  }
  
  // Create an order in Razorpay (this will be associated with the customer in the frontend)
  const order = await getRazorpay().orders.create({
    amount: amount,
    currency: currency,
    receipt: `receipt_${userId}_${Date.now()}`,
    payment_capture: true, // Auto capture payment
    notes: {
      userId: userId,
      plan: plan,
      customer_id: providerCustomerId,
    }
  });

  // Razorpay subscriptions often require creating a subscription after an order
  // For simplicity here, we're returning order details. The frontend will use this
  // to open the Razorpay checkout and potentially create the subscription.
  // A more robust implementation would create the subscription here directly.
  return { orderId: order.id, amount: Number(order.amount), currency: order.currency, planId: razorpayPlanId };
}


export async function POST(req: Request) {
  try {
    const { plan, userId, userLocation, userEmail } = await req.json();

    if (!plan || !userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required parameters: plan, userId, userEmail' }, { status: 400 });
    }

    const successUrl = `${req.headers.get('origin')}/account?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${req.headers.get('origin')}/pricing`;

    const provider = determinePaymentProvider(userLocation);

    const { customerId, providerCustomerId } = await getOrCreateCustomer(userId, userEmail, provider);

    if (provider === 'stripe') {
      const { sessionId } = await createStripeCheckoutSession(
        providerCustomerId,
        plan,
        successUrl,
        cancelUrl
      );
      return NextResponse.json({ provider: 'stripe', sessionId });
    } else { // razorpay
      const { orderId, amount, currency, planId } = await createRazorpayCheckoutSession(
        providerCustomerId,
        plan,
        userId,
        successUrl, // success_url not directly used in Razorpay order creation, but good to pass
        cancelUrl
      );
      // For Razorpay, we return order details, which the frontend uses to open the Razorpay checkout modal
      // and potentially trigger subscription creation after successful payment.
      return NextResponse.json({ provider: 'razorpay', orderId, amount, currency, planId, customerId: providerCustomerId });
    }
  } catch (error: any) {
    console.error('Error creating checkout session:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

