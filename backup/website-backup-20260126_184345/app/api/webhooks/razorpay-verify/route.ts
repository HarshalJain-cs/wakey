// wakey/apps/website/app/api/webhooks/razorpay-verify/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';

// Lazy initialization of Razorpay
let _razorpay: InstanceType<typeof Razorpay> | null = null;

function getRazorpay() {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return _razorpay;
}

export async function POST(req: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userId } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !userId) {
      return NextResponse.json({ error: 'Missing required Razorpay payment details or userId.' }, { status: 400 });
    }

    // Verify the payment signature
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed: Invalid signature.' }, { status: 400 });
    }

    // Optionally, fetch payment details from Razorpay to ensure it's captured
    const payment = await getRazorpay().payments.fetch(razorpay_payment_id);
    if (payment.status !== 'captured') {
        // Handle cases where payment is authorized but not captured, if applicable
        // For subscriptions, payment is usually captured automatically
        return NextResponse.json({ error: `Payment not captured. Current status: ${payment.status}` }, { status: 400 });
    }

    // At this point, the payment is verified and captured.
    // We should now ensure the subscription status is correct in our DB.
    // This part might overlap with the Razorpay webhook for 'subscription.activated' or 'subscription.charged'.
    // If the webhook is reliable, this might just be a confirmation.
    // However, if the webhook fails, this is a good fallback to ensure user gets their subscription.

    // Retrieve the subscription from Razorpay using the order ID or payment notes
    // Or, if your initial checkout-session created a Razorpay Subscription directly,
    // you would fetch that subscription here.
    // For simplicity, we'll assume the main webhook handler will update the subscription.
    // This endpoint primarily confirms the *payment* was successful.

    // If you need to update the subscription here (e.g., if webhook was missed):
    // 1. Fetch the corresponding Razorpay subscription from payment.notes or order.notes
    // 2. Update the 'subscriptions' table in Supabase.
    // For now, we'll assume the webhook listener is the primary source of truth for subscription status.

    // For a robust system, you would want to:
    // a. Check if a subscription already exists for this order/user in 'active' state.
    // b. If not, create or update the subscription in Supabase as 'active'.
    // This avoids race conditions if webhook arrives before verification or vice-versa.

    return NextResponse.json({ message: 'Payment verified successfully.' }, { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error verifying Razorpay payment:', errorMessage);
    return NextResponse.json({ error: 'Internal server error during payment verification.' }, { status: 500 });
  }
}
