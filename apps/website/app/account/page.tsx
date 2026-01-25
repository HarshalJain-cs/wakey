'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { User, LogOut, Mail } from 'lucide-react';
import {
  SubscriptionWidget,
  TodayStatsWidget,
  FocusTrendsWidget,
  QuickActionsWidget,
  BillingHistoryWidget,
  StreakWidget,
} from '@/components/widgets';

interface Subscription {
  plan_id: string;
  provider: 'stripe' | 'razorpay';
  status: string;
  current_period_end: string;
  customer_id: string;
}

interface UserProfile {
  email: string | null;
  displayName: string | null;
}

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

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
        router.push('/login');
        return;
      }

      setUser({
        email: session.user?.email || null,
        displayName: session.user?.user_metadata?.display_name || session.user?.email?.split('@')[0] || null,
      });

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
        const response = await fetch('/api/stripe-customer-portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: subscription.customer_id,
            returnUrl: window.location.origin + '/account',
          }),
        });
        const { url } = await response.json();
        router.push(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to redirect to Stripe Customer Portal.');
      } finally {
        setLoading(false);
      }
    } else if (subscription.provider === 'razorpay') {
      alert('Razorpay billing management not directly integrated. Please contact support.');
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/');
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
          <p className="text-dark-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col bg-dark-900 px-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <p className="text-xl text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-500 text-white font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            Go to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">
              {greeting()}, {user?.displayName || 'there'}! 👋
            </h1>
            <p className="text-dark-400 mt-1">
              Welcome to your Wakey dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-2 bg-dark-800/50 backdrop-blur-xl rounded-full border border-dark-700/50">
              <div className="p-2 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-full">
                <User className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-dark-500" />
                <span className="text-sm text-dark-300">{user?.email}</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 px-4 py-2 bg-dark-800/50 hover:bg-dark-700/50 backdrop-blur-xl rounded-full border border-dark-700/50 text-dark-300 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">{loggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </motion.div>

        {/* Widget Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Row 1 */}
          <div className="md:col-span-1">
            <SubscriptionWidget
              subscription={subscription}
              onManageBilling={handleManageBilling}
              loading={loading}
            />
          </div>

          <div className="md:col-span-1">
            <TodayStatsWidget />
          </div>

          <div className="md:col-span-1">
            <StreakWidget />
          </div>

          {/* Row 2 - Focus Trends spans 2 columns */}
          <div className="md:col-span-2">
            <FocusTrendsWidget />
          </div>

          <div className="md:col-span-1">
            <QuickActionsWidget />
          </div>

          {/* Row 3 - Billing History spans 2 columns, empty space or future widget */}
          <div className="md:col-span-2">
            <BillingHistoryWidget />
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-dark-500 text-sm"
        >
          <p>
            Data syncs automatically from your Wakey desktop app.{' '}
            <a href="/docs/sync" className="text-teal-400 hover:text-teal-300 transition-colors">
              Learn more about sync
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
