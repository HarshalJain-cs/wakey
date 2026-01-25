// wakey/apps/website/app/account/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Subscription {
  plan_id: string;
  provider: 'stripe' | 'razorpay';
  status: string;
  current_period_end: string;
  customer_id: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [_userEmail, setUserEmail] = useState<string | null>(null);

  // Only create client on the client side
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createClient();
  }, []);

  useEffect(() => {
    async function fetchAccountData() {
      if (!supabase) return;
      setLoading(true);
      setError(null);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        router.push('/login'); // Redirect to login if not authenticated
        return;
      }
      setUserEmail(session.user?.email || null);

      // Fetch subscription status
      const res = await fetch('/api/subscription');
      const data = await res.json();

      if (res.ok) {
        setSubscription(data.subscription);
      } else {
        setError(data.error || 'Failed to fetch subscription data.');
      }
      setLoading(false);
    }
    fetchAccountData();
  }, [router, supabase]);

  const handleManageBilling = async () => {
    if (!subscription) return;

    if (subscription.provider === 'stripe') {
      try {
        setLoading(true);
        // This is a simplified approach. In a real app, you'd call an API route
        // to create a Stripe Customer Portal session for the current user.
        // For now, assuming you can directly redirect if you have the session URL.
        // Example: Call your backend to create a portal session:
        const response = await fetch('/api/stripe-customer-portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId: subscription.customer_id, returnUrl: window.location.origin + '/account' }),
        });
        const { url } = await response.json();
        router.push(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to redirect to Stripe Customer Portal.');
      } finally {
        setLoading(false);
      }
    } else if (subscription.provider === 'razorpay') {
      // Razorpay doesn't have a direct "Customer Portal" like Stripe.
      // You'd typically redirect them to a page where they can manage
      // their Razorpay subscriptions, or provide links to Razorpay support.
      // For now, we'll just log this.
      alert('Razorpay billing management not directly integrated. Please contact support.');
      // You might redirect to a custom page or support link
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700 dark:text-gray-300">Loading account data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <p className="text-xl text-red-600 dark:text-red-400">Error: {error}</p>
        <Link href="/pricing" className="mt-4 text-blue-600 hover:underline">Go to Pricing</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Account</h1>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Subscription Details</h2>
          {subscription ? (
            <div>
              <p>
                <strong>Plan:</strong> {subscription.plan_id} ({subscription.provider})
              </p>
              <p>
                <strong>Status:</strong> <span className="capitalize">{subscription.status}</span>
              </p>
              <p>
                <strong>Renews on:</strong>{' '}
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
              <button
                onClick={handleManageBilling}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading}
              >
                Manage Billing
              </button>
            </div>
          ) : (
            <div>
              <p>You currently do not have an active subscription.</p>
              <Link href="/pricing" className="mt-4 text-blue-600 hover:underline">
                Explore Plans
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Billing History</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {/* TODO: Implement fetching and displaying billing history */}
            Billing history will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}
