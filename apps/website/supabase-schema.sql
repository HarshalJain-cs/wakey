-- ===========================================
-- WAKEY SUBSCRIPTION DATABASE SCHEMA (FIXED)
-- ===========================================
-- Run this ENTIRE SQL in Supabase SQL Editor
-- This version handles existing tables properly

-- ===========================================
-- STEP 1: DROP EXISTING OBJECTS (Clean slate)
-- ===========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.has_active_subscription(UUID) CASCADE;

DROP TABLE IF EXISTS public.payment_history CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ===========================================
-- STEP 2: CREATE PROFILES TABLE
-- ===========================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ===========================================
-- STEP 3: CREATE SUBSCRIPTIONS TABLE
-- ===========================================
CREATE TABLE public.subscriptions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
    provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe')),
    plan_id TEXT NOT NULL,
    price_id TEXT,
    quantity INTEGER DEFAULT 1,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert subscriptions"
    ON public.subscriptions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can update subscriptions"
    ON public.subscriptions FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ===========================================
-- STEP 4: CREATE CUSTOMERS TABLE
-- ===========================================
CREATE TABLE public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
    stripe_customer_id TEXT UNIQUE,
    razorpay_customer_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_user_id ON public.customers(user_id);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customer record"
    ON public.customers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert customers"
    ON public.customers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can update customers"
    ON public.customers FOR UPDATE
    USING (true);

-- ===========================================
-- STEP 5: CREATE PAYMENT HISTORY TABLE
-- ===========================================
CREATE TABLE public.payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    subscription_id TEXT REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe')),
    payment_id TEXT NOT NULL UNIQUE,
    order_id TEXT,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
    payment_method TEXT,
    receipt_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX idx_payment_history_status ON public.payment_history(status);

ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment history"
    ON public.payment_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert payment history"
    ON public.payment_history FOR INSERT
    WITH CHECK (true);

-- ===========================================
-- STEP 6: CREATE FUNCTIONS & TRIGGERS
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- STEP 7: HELPER FUNCTION
-- ===========================================
CREATE OR REPLACE FUNCTION public.has_active_subscription(check_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE user_id = check_user_id
        AND status IN ('active', 'trialing')
        AND (current_period_end IS NULL OR current_period_end > NOW())
    );
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- STEP 8: SET PERMISSIONS
-- ===========================================
REVOKE ALL ON public.subscriptions FROM anon, authenticated;
REVOKE ALL ON public.customers FROM anon, authenticated;
REVOKE ALL ON public.payment_history FROM anon, authenticated;

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.customers TO authenticated;
GRANT SELECT ON public.payment_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- ===========================================
-- DONE! Copy this entire SQL and run it.
-- ===========================================
