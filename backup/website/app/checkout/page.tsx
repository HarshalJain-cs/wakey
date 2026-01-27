// wakey/apps/website/app/checkout/page.tsx
'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Script from 'next/script'; // For Razorpay SDK
import Link from 'next/link';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayError {
  error: {
    description: string;
  };
}

interface RazorpayInstance {
  on: (event: string, callback: (response: RazorpayError) => void) => void;
  open: () => void;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Only create client on the client side
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createClient();
  }, []);

  useEffect(() => {
    async function getUserSession() {
      if (!supabase) return;
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        router.push('/login'); // Redirect to login if not authenticated
        return;
      }
      setUserEmail(session.user?.email || null);
      setLoading(false);
    }
    getUserSession();
  }, [router, supabase]);

  useEffect(() => {
    if (!plan || !userEmail) return;
    if (loading) return; // Wait for user session to load

    async function initiateCheckout() {
      try {
        setLoading(true);
        setError(null);

        // Simple geolocation for demo purposes - replace with actual IP-based detection
        const userLocation = 'United States'; // Default to US for Stripe, change if needed for Razorpay testing

        const res = await fetch('/api/checkout-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan,
            userId: (await supabase.auth.getUser()).data.user?.id,
            userEmail,
            userLocation, // Pass user location for provider selection
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to initiate checkout.');
          setLoading(false);
          return;
        }

        if (data.provider === 'stripe') {
          // Redirect to Stripe Checkout
          router.push(data.sessionId); // sessionId is actually a redirect URL for Stripe Checkout
        } else if (data.provider === 'razorpay') {
          // Open Razorpay checkout modal
          if (!window.Razorpay) {
            setError('Razorpay SDK not loaded. Please refresh the page.');
            setLoading(false);
            return;
          }

          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Your Razorpay Key ID
            amount: data.amount, // Amount is in smallest currency unit (e.g., paise)
            currency: data.currency,
            name: 'Wakey Premium',
            description: `${plan} Subscription`,
            order_id: data.orderId, // This is the order ID created by your API
            handler: async function (response: RazorpayResponse) {
              // Handle successful payment
              // Verify payment on your server
              const verifyRes = await fetch('/api/webhooks/razorpay-verify', { // A new API route to verify payment
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  userId: (await supabase.auth.getUser()).data.user?.id,
                }),
              });

              if (verifyRes.ok) {
                router.push('/account?status=success');
              } else {
                const verifyData = await verifyRes.json();
                setError(verifyData.error || 'Payment verification failed.');
              }
            },
            prefill: {
              name: (await supabase.auth.getUser()).data.user?.user_metadata?.full_name || '',
              email: userEmail,
            },
            notes: {
              plan,
              userId: (await supabase.auth.getUser()).data.user?.id,
            },
            theme: {
              color: '#3B82F6', // Blue color
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response: RazorpayError) {
            setError(response.error.description || 'Razorpay payment failed.');
            router.push('/checkout?status=failed');
          });
          rzp.open();
        }
      } catch (err) {
        console.error('Checkout error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred during checkout.');
      } finally {
        setLoading(false);
      }
    }

    initiateCheckout();
  }, [plan, userEmail, loading, router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700 dark:text-gray-300">Loading checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600 dark:text-red-400">Error: {error}</p>
        <Link href="/pricing" className="ml-4 text-blue-600 hover:underline">Back to Pricing</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Script
        id="razorpay-checkout-script"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Redirecting to payment gateway...
      </h1>
      <p className="mt-4 text-gray-700 dark:text-gray-300">
        Please do not close this page.
      </p>
    </div>
  );
}

function CheckoutFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl text-gray-700 dark:text-gray-300">Loading checkout...</p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutContent />
    </Suspense>
  );
}
