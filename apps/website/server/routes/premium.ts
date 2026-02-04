import { Router, Request, Response } from 'express';
import { getActiveSubscription, determineTier } from '../services/subscription';
import { supabaseAdmin } from '../config';
import type { PremiumStatusResponse } from '../types';

export const premiumRouter = Router();

/**
 * GET /api/premium-status
 * Get premium subscription status for authenticated user
 */
premiumRouter.get('/premium-status', async (req: Request, res: Response) => {
    try {
        // Get user ID from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Missing or invalid authorization header' });
            return;
        }

        const token = authHeader.substring(7);

        // Verify JWT with Supabase
        if (!supabaseAdmin) {
            // Return mock data if Supabase is not configured
            console.warn('⚠️ Supabase not configured, returning mock free tier');
            const mockResponse: PremiumStatusResponse = {
                tier: 'free',
                isTrialActive: false,
                trialEndsAt: null,
                subscription: null,
            };
            res.json(mockResponse);
            return;
        }

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }

        // Get active subscription
        const subscription = await getActiveSubscription(user.id);
        const tier = determineTier(subscription);

        // Check trial status
        const isTrialActive = subscription?.status === 'trialing';
        const trialEndsAt = subscription?.trial_end || null;

        const response: PremiumStatusResponse = {
            tier,
            isTrialActive,
            trialEndsAt,
            subscription: subscription ? {
                id: subscription.id,
                status: subscription.status,
                provider: subscription.provider,
                planId: subscription.plan_id,
                currentPeriodEnd: subscription.current_period_end,
            } : null,
        };

        res.json(response);
    } catch (error) {
        console.error('Premium status error:', error);
        res.status(500).json({ error: 'Failed to get premium status' });
    }
});

/**
 * GET /api/premium-status/:userId
 * Get premium status for a specific user (for internal use/desktop app)
 */
premiumRouter.get('/premium-status/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // TODO: Add API key authentication for server-to-server calls

        const subscription = await getActiveSubscription(userId);
        const tier = determineTier(subscription);

        const response: PremiumStatusResponse = {
            tier,
            isTrialActive: subscription?.status === 'trialing',
            trialEndsAt: subscription?.trial_end || null,
            subscription: subscription ? {
                id: subscription.id,
                status: subscription.status,
                provider: subscription.provider,
                planId: subscription.plan_id,
                currentPeriodEnd: subscription.current_period_end,
            } : null,
        };

        res.json(response);
    } catch (error) {
        console.error('Premium status error:', error);
        res.status(500).json({ error: 'Failed to get premium status' });
    }
});
