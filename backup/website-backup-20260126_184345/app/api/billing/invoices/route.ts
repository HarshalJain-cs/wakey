import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Lazy initialization of Stripe
let _stripe: Stripe | null = null;

function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-12-15.clover',
    });
  }
  return _stripe;
}

// Get admin Supabase client
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

  // Get customer record to find Stripe customer ID
  const { data: customer, error: customerError } = await getSupabaseAdmin()
    .from('customers')
    .select('stripe_customer_id, razorpay_customer_id')
    .eq('id', userId)
    .maybeSingle();

  if (customerError) {
    console.error('Error fetching customer:', customerError.message);
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }

  if (!customer) {
    return NextResponse.json({ invoices: [] }, { status: 200 });
  }

  const invoices: Array<{
    id: string;
    amount: number;
    currency: string;
    status: 'paid' | 'pending' | 'failed';
    date: string;
    invoiceUrl?: string;
  }> = [];

  // Fetch Stripe invoices
  if (customer.stripe_customer_id) {
    try {
      const stripeInvoices = await getStripe().invoices.list({
        customer: customer.stripe_customer_id,
        limit: 10,
      });

      for (const inv of stripeInvoices.data) {
        invoices.push({
          id: inv.id,
          amount: inv.amount_paid || inv.amount_due || 0,
          currency: inv.currency,
          status: inv.status === 'paid' ? 'paid' : inv.status === 'open' ? 'pending' : 'failed',
          date: new Date(inv.created * 1000).toISOString(),
          invoiceUrl: inv.invoice_pdf || undefined,
        });
      }
    } catch (stripeError) {
      console.error('Error fetching Stripe invoices:', stripeError);
      // Continue without Stripe invoices
    }
  }

  // For Razorpay, we would need to fetch from their API
  // Razorpay doesn't have a direct "invoices" concept like Stripe
  // Instead, we could fetch payments or store invoice data in our DB
  // For now, we'll skip Razorpay invoice fetching

  // Sort invoices by date (newest first)
  invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({ invoices });
}
