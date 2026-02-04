import { Router, Request, Response } from 'express';
import { createOrder, verifyPaymentSignature } from '../services/razorpay';
import { upsertSubscription } from '../services/subscription';
import { config } from '../config';
import type { CreateOrderResponse, VerifyPaymentRequest } from '../types';

export const checkoutRouter = Router();

// Plan ID to pricing mapping
type PlanId = 'pro_weekly' | 'pro_yearly' | 'team_weekly' | 'team_yearly';

function getPricing(planId: string) {
    const planMap: Record<PlanId, { amount: number; amountDisplay: number; name: string; interval: 'week' | 'year' }> = {
        pro_weekly: { ...config.pricing.pro.weekly, interval: 'week' },
        pro_yearly: { ...config.pricing.pro.yearly, interval: 'year' },
        team_weekly: { ...config.pricing.team.weekly, interval: 'week' },
        team_yearly: { ...config.pricing.team.yearly, interval: 'year' },
    };
    return planMap[planId as PlanId] || planMap.pro_weekly;
}

/**
 * POST /api/create-razorpay-order
 * Creates a Razorpay order for payment
 */
checkoutRouter.post('/create-razorpay-order', async (req: Request, res: Response) => {
    try {
        const { planId, userId, email } = req.body;

        // Validate request
        if (!planId || !userId) {
            res.status(400).json({ error: 'Missing required fields: planId, userId' });
            return;
        }

        // Get pricing for plan
        const pricing = getPricing(planId);

        // Create Razorpay order (amount in paise for INR)
        const order = await createOrder(
            pricing.amount,
            config.pricing.currency, // Use INR from config
            `wky_${userId.slice(-8)}_${Date.now().toString(36)}`, // Max 40 chars
            {
                userId,
                planId,
                email: email || '',
            }
        );

        const response: CreateOrderResponse = {
            orderId: order.id,
            amount: pricing.amount,
            currency: config.pricing.currency,
            keyId: config.razorpay.keyId,
            planName: pricing.name,
        };

        res.json(response);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

/**
 * POST /api/verify-payment
 * Verifies Razorpay payment and activates subscription
 */
checkoutRouter.post('/verify-payment', async (req: Request, res: Response) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId,
            planId,
        } = req.body as VerifyPaymentRequest;

        // Validate request
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
            res.status(400).json({ error: 'Missing required payment verification fields' });
            return;
        }

        // Verify signature
        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            res.status(400).json({ error: 'Invalid payment signature' });
            return;
        }

        // Calculate subscription period based on plan
        const now = new Date();
        const periodEnd = new Date(now);
        if (planId.includes('yearly')) {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
            // Weekly plans
            periodEnd.setDate(periodEnd.getDate() + 7);
        }

        // Create/update subscription in database
        const { error } = await upsertSubscription({
            id: razorpay_payment_id,
            user_id: userId,
            status: 'active',
            provider: 'razorpay',
            plan_id: planId || 'pro_weekly',
            price_id: razorpay_order_id,
            quantity: 1,
            cancel_at_period_end: false,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            created_at: now.toISOString(),
        });

        if (error) {
            console.error('Failed to save subscription:', error);
        }

        res.json({
            success: true,
            message: 'Payment verified successfully',
            subscription: {
                id: razorpay_payment_id,
                status: 'active',
                planId,
                currentPeriodEnd: periodEnd.toISOString(),
            },
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

/**
 * GET /api/pricing
 * Returns available pricing plans
 */
checkoutRouter.get('/pricing', (_req: Request, res: Response) => {
    res.json({
        currency: config.pricing.currency,
        plans: [
            {
                id: 'pro_weekly',
                name: 'Pro Weekly',
                amount: config.pricing.pro.weekly.amount,
                displayPrice: `₹${config.pricing.pro.weekly.amountDisplay}`,
                interval: 'week',
                tier: 'pro',
                features: [
                    'Unlimited AI insights',
                    'Cloud sync across devices',
                    'Priority support',
                    'Advanced analytics',
                ],
            },
            {
                id: 'pro_yearly',
                name: 'Pro Yearly',
                amount: config.pricing.pro.yearly.amount,
                displayPrice: `₹${config.pricing.pro.yearly.amountDisplay}`,
                interval: 'year',
                tier: 'pro',
                savings: 'Save ₹2,400/year',
                features: [
                    'Everything in Pro Weekly',
                    'Best value for individuals',
                    'Early access to new features',
                ],
            },
            {
                id: 'team_weekly',
                name: 'Team Weekly',
                amount: config.pricing.team.weekly.amount,
                displayPrice: `₹${config.pricing.team.weekly.amountDisplay}`,
                interval: 'week',
                tier: 'team',
                features: [
                    'Everything in Pro',
                    'Team collaboration',
                    'Admin dashboard',
                    'API access',
                    'Dedicated support',
                ],
            },
            {
                id: 'team_yearly',
                name: 'Team Yearly',
                amount: config.pricing.team.yearly.amount,
                displayPrice: `₹${config.pricing.team.yearly.amountDisplay}`,
                interval: 'year',
                tier: 'team',
                savings: 'Save ₹19,200/year',
                features: [
                    'Everything in Team Weekly',
                    'Custom integrations',
                    'SLA guarantee',
                    'Onboarding assistance',
                ],
            },
        ],
        stripe: {
            available: false,
            message: 'Coming Soon - For International Payments',
        },
    });
});
