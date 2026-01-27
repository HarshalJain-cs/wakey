'use client';

import { CreditCard, Crown, Calendar, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import WidgetCard from './WidgetCard';
import Link from 'next/link';

interface Subscription {
  plan_id: string;
  provider: 'stripe' | 'razorpay';
  status: string;
  current_period_end: string;
  customer_id: string;
}

interface SubscriptionWidgetProps {
  subscription: Subscription | null;
  onManageBilling: () => void;
  loading?: boolean;
}

export default function SubscriptionWidget({ subscription, onManageBilling, loading }: SubscriptionWidgetProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'text-green-400 bg-green-400/10';
      case 'past_due':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'canceled':
      case 'unpaid':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-dark-400 bg-dark-700';
    }
  };

  const formatPlanName = (planId: string) => {
    if (planId.includes('yearly') || planId.includes('annual')) {
      return 'Pro Yearly';
    }
    if (planId.includes('weekly')) {
      return 'Pro Weekly';
    }
    return planId.charAt(0).toUpperCase() + planId.slice(1).replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <WidgetCard title="Subscription" icon={<Crown className="w-5 h-5" />}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-dark-700 rounded w-1/3" />
          <div className="h-4 bg-dark-700 rounded w-1/2" />
          <div className="h-10 bg-dark-700 rounded" />
        </div>
      </WidgetCard>
    );
  }

  if (!subscription) {
    return (
      <WidgetCard title="Subscription" icon={<Crown className="w-5 h-5" />}>
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-dark-700/50 rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-dark-500" />
          </div>
          <p className="text-dark-400 mb-4">You don&apos;t have an active subscription</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-500 text-white font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Pro
          </Link>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Subscription"
      icon={<Crown className="w-5 h-5" />}
      action={
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(subscription.status)}`}>
          {subscription.status === 'trialing' ? 'Trial' : subscription.status}
        </span>
      }
    >
      <div className="space-y-4">
        {/* Plan Info */}
        <div className="flex items-center justify-between p-4 bg-dark-900/50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-purple-500 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white">{formatPlanName(subscription.plan_id)}</p>
              <p className="text-sm text-dark-400">via {subscription.provider === 'stripe' ? 'Stripe' : 'Razorpay'}</p>
            </div>
          </div>
        </div>

        {/* Renewal Date */}
        <div className="flex items-center gap-3 text-dark-300">
          <Calendar className="w-4 h-4 text-dark-500" />
          <span className="text-sm">
            {subscription.status === 'active' ? 'Renews' : 'Expires'} on{' '}
            <span className="text-white font-medium">
              {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </span>
        </div>

        {/* Warning for non-active status */}
        {subscription.status === 'past_due' && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Your payment is past due. Please update your payment method.</span>
          </div>
        )}

        {/* Manage Billing Button */}
        <button
          onClick={onManageBilling}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white font-medium rounded-xl transition-colors"
        >
          <CreditCard className="w-4 h-4" />
          Manage Billing
          <ExternalLink className="w-3 h-3 text-dark-400" />
        </button>
      </div>
    </WidgetCard>
  );
}
