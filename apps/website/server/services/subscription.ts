import { supabaseAdmin, config } from '../config';
import type { DbSubscription } from '../types';

/**
 * Create or update a subscription in the database
 */
export async function upsertSubscription(subscription: Partial<DbSubscription> & { id: string; user_id: string }) {
    if (!supabaseAdmin) {
        console.warn('⚠️ Supabase not configured, skipping database operation');
        return { data: subscription, error: null };
    }

    const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
            ...subscription,
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to upsert subscription:', error);
    }

    return { data, error };
}

/**
 * Get active subscription for a user
 */
export async function getActiveSubscription(userId: string): Promise<DbSubscription | null> {
    if (!supabaseAdmin) {
        console.warn('⚠️ Supabase not configured, returning null');
        return null;
    }

    const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('Failed to get subscription:', error);
    }

    return data;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
    if (!supabaseAdmin) {
        console.warn('⚠️ Supabase not configured, skipping cancel');
        return { data: null, error: null };
    }

    const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
        .select()
        .single();

    return { data, error };
}

/**
 * Determine premium tier from subscription
 */
export function determineTier(subscription: DbSubscription | null): 'free' | 'trial' | 'premium' {
    if (!subscription) return 'free';

    if (subscription.status === 'trialing') {
        return 'trial';
    }

    if (subscription.status === 'active') {
        // Check if current period has ended
        if (subscription.current_period_end) {
            const endDate = new Date(subscription.current_period_end);
            if (endDate > new Date()) {
                return 'premium';
            }
        }
        return 'premium';
    }

    return 'free';
}

/**
 * Create or get Razorpay customer ID for user
 */
export async function getOrCreateCustomerId(userId: string, email?: string): Promise<string | null> {
    if (!supabaseAdmin) {
        console.warn('⚠️ Supabase not configured');
        return null;
    }

    // Check if customer exists
    const { data: customer } = await supabaseAdmin
        .from('customers')
        .select('razorpay_customer_id')
        .eq('user_id', userId)
        .single();

    if (customer?.razorpay_customer_id) {
        return customer.razorpay_customer_id;
    }

    // For now, return null - customer will be created by Razorpay checkout
    return null;
}
