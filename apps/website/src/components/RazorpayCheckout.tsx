import { useState } from 'react';
import { Loader2, CreditCard, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RazorpayCheckoutProps {
  planId: string;
  planName: string;
  amount: number; // in paise for INR (Razorpay)
  displayPrice?: number; // USD display price
  displayCurrency?: string; // Display currency symbol
  onSuccess?: () => void;
  onCancel?: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function RazorpayCheckout({
  planId,
  planName,
  amount,
  displayPrice,
  displayCurrency = '$',
  onSuccess,
  onCancel,
}: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, refreshSubscription } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    setIsLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Determine API URL - use env var, or fallback to production URL
      const getApiUrl = () => {
        // Check for environment variable first
        if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
          return import.meta.env.VITE_API_URL;
        }
        // In production (not localhost), use the production API URL
        if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
          // Use your Railway backend URL here
          return 'https://wakeyfinalnew-production.up.railway.app';
        }
        // Fallback to localhost for development
        return 'http://localhost:3001';
      };

      const apiUrl = getApiUrl();
      console.log('Using API URL:', apiUrl);

      // Create order via our backend
      const orderResponse = await fetch(`${apiUrl}/api/create-razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userId: user.id,
          email: user.email,
        }),
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('Order creation failed:', orderResponse.status, errorText);
        throw new Error(`Failed to create order: ${orderResponse.status}`);
      }

      const orderData = await orderResponse.json();

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Wakey',
        description: planName,
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${apiUrl}/api/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
                planId,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              toast.success('Payment successful! Welcome to Wakey Pro!');
              await refreshSubscription();
              onSuccess?.();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: profile?.display_name || '',
          email: user.email || '',
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            onCancel?.();
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Display USD price on button
  const buttonDisplay = displayPrice ? `${displayCurrency}${displayPrice}` : `₹${(amount / 100).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-4">
      <button
        onClick={handleCheckout}
        disabled={isLoading || !user}
        className="w-full btn-primary flex items-center justify-center gap-3 py-4 text-lg disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay {buttonDisplay}
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>Secure payment via Razorpay</span>
      </div>

      {!user && (
        <p className="text-center text-sm text-muted-foreground">
          Please sign in to continue with payment
        </p>
      )}
    </div>
  );
}
