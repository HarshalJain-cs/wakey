import { createClient } from '@supabase/supabase-js';

// Environment variable validation
const requiredEnvVars = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
] as const;

const optionalEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
] as const;

// Validate required environment variables
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.warn(`⚠️  Missing required env var: ${envVar}`);
    }
}

// Export configuration
export const config = {
    // Razorpay
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID || '',
        keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    },

    // Stripe (Coming Soon)
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },

    // Supabase
    supabase: {
        url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        anonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
    },

    // Server
    server: {
        port: parseInt(process.env.PORT || '3001', 10),
        siteUrl: process.env.VITE_SITE_URL || 'http://localhost:8080',
        isDev: process.env.NODE_ENV === 'development',
    },

    // Pricing (INR - amounts in paise for Razorpay)
    // USD equivalents: $2.50/week, $100/year (Pro), $7/week, $150/year (Team)
    pricing: {
        currency: 'INR',
        pro: {
            weekly: {
                amount: 20000, // ₹200/week in paise
                amountDisplay: 200,
                planId: 'pro_weekly',
                name: 'Pro Weekly',
            },
            yearly: {
                amount: 800000, // ₹8000/year in paise (save ₹2400)
                amountDisplay: 8000,
                planId: 'pro_yearly',
                name: 'Pro Yearly',
            },
        },
        team: {
            weekly: {
                amount: 60000, // ₹600/week in paise
                amountDisplay: 600,
                planId: 'team_weekly',
                name: 'Team Weekly',
            },
            yearly: {
                amount: 1200000, // ₹12000/year in paise
                amountDisplay: 12000,
                planId: 'team_yearly',
                name: 'Team Yearly',
            },
        },
    },
};

// Supabase admin client (with service role key for server-side operations)
export const supabaseAdmin = config.supabase.url && config.supabase.serviceRoleKey
    ? createClient(config.supabase.url, config.supabase.serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null;

// Log configuration status
console.log('📦 Config loaded:');
console.log(`   Razorpay: ${config.razorpay.keyId ? '✓' : '✗'}`);
console.log(`   Stripe: ${config.stripe.secretKey ? '✓' : '✗ (Coming Soon)'}`);
console.log(`   Supabase: ${supabaseAdmin ? '✓' : '✗ (Set SUPABASE_SERVICE_ROLE_KEY)'}`);
