import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSound } from '@/components/effects/SoundEffects';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import RazorpayCheckout from '@/components/RazorpayCheckout';

interface PlanDetails {
  id: string;
  name: string;
  price: number; // USD display price
  amount: number; // INR paise for Razorpay (USD * 83 * 100)
  billing: string;
  currency: string;
  features: string[];
}

// USD to INR rate - amounts in paise for Razorpay
const USD_TO_INR = 91;

const plans: Record<string, Record<string, PlanDetails>> = {
  pro: {
    weekly: {
      id: 'pro_weekly',
      name: 'Pro Weekly',
      price: 2.5, // $2.5 USD display
      amount: Math.round(2.5 * USD_TO_INR * 100), // ₹207.50 in paise = 20750
      billing: 'week',
      currency: '$',
      features: ['Unlimited projects', 'AI insights', 'Focus mode', 'Priority support', 'Integrations'],
    },
    yearly: {
      id: 'pro_yearly',
      name: 'Pro Yearly',
      price: 100, // $100 USD display
      amount: Math.round(100 * USD_TO_INR * 100), // ₹8300 in paise = 830000
      billing: 'year',
      currency: '$',
      features: ['Unlimited projects', 'AI insights', 'Focus mode', 'Priority support', 'Integrations', 'Save $30/year'],
    },
  },
  team: {
    weekly: {
      id: 'team_weekly',
      name: 'Team Weekly',
      price: 7, // $7 USD display
      amount: Math.round(7 * USD_TO_INR * 100), // ₹581 in paise = 58100
      billing: 'week',
      currency: '$',
      features: ['Everything in Pro', 'Team collaboration', 'Admin dashboard', 'API access', 'Dedicated support'],
    },
    yearly: {
      id: 'team_yearly',
      name: 'Team Yearly',
      price: 150, // $150 USD display
      amount: Math.round(150 * USD_TO_INR * 100), // ₹12450 in paise = 1245000
      billing: 'year',
      currency: '$',
      features: ['Everything in Team Weekly', 'Custom integrations', 'SLA guarantee', 'Onboarding assistance'],
    },
  },
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const { playClick } = useSound();

  const planType = searchParams.get('plan') || 'pro';
  const billingPeriod = searchParams.get('billing') || 'yearly';

  const planDetails = plans[planType]?.[billingPeriod];

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      localStorage.setItem('auth_redirect', `/checkout?plan=${planType}&billing=${billingPeriod}`);
      navigate('/login');
      return;
    }

    // Redirect if already premium
    if (isPremium) {
      toast.info('You already have an active subscription!');
      navigate('/dashboard');
    }
  }, [user, isPremium, navigate, planType, billingPeriod]);

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  if (!planDetails) {
    return (
      <div className="grain min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-4">Invalid Plan</h1>
          <p className="text-muted-foreground mb-6">The selected plan doesn't exist.</p>
          <Link to="/pricing" className="btn-primary">
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grain min-h-screen flex items-center justify-center px-6 py-12">
      <SEO title="Checkout" description="Complete your Wakey Pro subscription" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Link
          to="/pricing"
          onClick={playClick}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to pricing
        </Link>

        <div className="premium-card">
          <h1 className="text-2xl font-serif text-center mb-2">Complete your order</h1>
          <p className="text-muted-foreground text-center mb-8">
            You're subscribing to {planDetails.name}
          </p>

          {/* Order Summary */}
          <div className="border border-border rounded-xl p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium">{planDetails.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Billed {billingPeriod === 'yearly' ? 'annually' : 'weekly'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-serif">{planDetails.currency}{planDetails.price}</p>
                <p className="text-sm text-muted-foreground">/{planDetails.billing}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <ul className="space-y-2">
                {planDetails.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 14-day trial notice */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8">
            <p className="text-sm text-center">
              <span className="font-medium">14-day free trial included!</span>
              <br />
              <span className="text-muted-foreground">
                You won't be charged until the trial ends. Cancel anytime.
              </span>
            </p>
          </div>

          {/* Razorpay Checkout */}
          <RazorpayCheckout
            planId={planDetails.id}
            planName={planDetails.name}
            amount={planDetails.amount}
            displayPrice={planDetails.price}
            displayCurrency={planDetails.currency}
            onSuccess={handleSuccess}
          />

          {/* Signed in as */}
          {user && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Signed in as {user.email}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Checkout;
