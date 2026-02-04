// Type definitions for the payment API

export interface CreateOrderRequest {
    planId: 'pro_weekly' | 'pro_yearly' | 'enterprise_weekly' | 'enterprise_yearly';
    userId: string;
    email?: string;
}

export interface CreateOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    planName: string;
}

export interface VerifyPaymentRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    userId: string;
    planId: string;
}

export interface PremiumStatusResponse {
    tier: 'free' | 'trial' | 'premium';
    isTrialActive: boolean;
    trialEndsAt: string | null;
    subscription: {
        id: string;
        status: string;
        provider: string;
        planId: string;
        currentPeriodEnd: string | null;
    } | null;
}

export interface RazorpayWebhookPayload {
    event: string;
    payload: {
        subscription?: {
            entity: {
                id: string;
                customer_id: string;
                plan_id: string;
                status: string;
                current_start: number;
                current_end: number;
            };
        };
        payment?: {
            entity: {
                id: string;
                order_id: string;
                status: string;
                amount: number;
            };
        };
    };
}

// Database types (matching Supabase schema)
export interface DbCustomer {
    id: string; // user_id
    stripe_customer_id: string | null;
    razorpay_customer_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbSubscription {
    id: string;
    user_id: string;
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused' | 'unpaid';
    provider: 'stripe' | 'razorpay';
    plan_id: string;
    price_id: string | null;
    quantity: number;
    cancel_at_period_end: boolean;
    created_at: string;
    current_period_start: string | null;
    current_period_end: string | null;
    ended_at: string | null;
    cancel_at: string | null;
    canceled_at: string | null;
    trial_start: string | null;
    trial_end: string | null;
}
