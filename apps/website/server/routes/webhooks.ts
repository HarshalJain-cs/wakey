import { Router, Request, Response } from 'express';
import { verifyWebhookSignature } from '../services/razorpay';
import { upsertSubscription, cancelSubscription } from '../services/subscription';
import { config } from '../config';
import type { RazorpayWebhookPayload } from '../types';

export const webhooksRouter = Router();

/**
 * POST /api/webhooks/razorpay
 * Handle Razorpay webhook events
 */
webhooksRouter.post('/webhooks/razorpay', async (req: Request, res: Response) => {
    try {
        const signature = req.headers['x-razorpay-signature'] as string;
        const body = req.body.toString();

        // Verify webhook signature (if webhook secret is configured)
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (webhookSecret && signature) {
            const isValid = verifyWebhookSignature(body, signature, webhookSecret);
            if (!isValid) {
                console.error('Invalid Razorpay webhook signature');
                res.status(400).json({ error: 'Invalid signature' });
                return;
            }
        }

        const payload = JSON.parse(body) as RazorpayWebhookPayload;
        const event = payload.event;

        console.log(`📥 Razorpay webhook: ${event}`);

        switch (event) {
            case 'subscription.activated':
            case 'subscription.charged': {
                const sub = payload.payload.subscription?.entity;
                if (sub) {
                    await upsertSubscription({
                        id: sub.id,
                        user_id: sub.customer_id, // Note: need to map to actual user_id
                        status: 'active',
                        provider: 'razorpay',
                        plan_id: sub.plan_id,
                        current_period_start: new Date(sub.current_start * 1000).toISOString(),
                        current_period_end: new Date(sub.current_end * 1000).toISOString(),
                    });
                }
                break;
            }

            case 'subscription.cancelled':
            case 'subscription.halted': {
                const sub = payload.payload.subscription?.entity;
                if (sub) {
                    await cancelSubscription(sub.id);
                }
                break;
            }

            case 'payment.captured': {
                const payment = payload.payload.payment?.entity;
                if (payment) {
                    console.log(`✅ Payment captured: ${payment.id}`);
                    // Payment is already handled in /verify-payment endpoint
                }
                break;
            }

            case 'payment.failed': {
                const payment = payload.payload.payment?.entity;
                if (payment) {
                    console.log(`❌ Payment failed: ${payment.id}`);
                    // Could notify user or update subscription status
                }
                break;
            }

            default:
                console.log(`Unhandled webhook event: ${event}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events (Coming Soon)
 */
webhooksRouter.post('/webhooks/stripe', async (req: Request, res: Response) => {
    // Stripe integration coming soon
    console.log('📥 Stripe webhook received (not implemented yet)');
    res.json({
        received: true,
        message: 'Stripe integration coming soon'
    });
});
