import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile, Subscription, SubscriptionTier, PremiumStatus } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  subscription: Subscription | null;
  premiumStatus: PremiumStatus;
  isLoading: boolean;
  isPremium: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; requiresVerification: boolean; error?: string }>;
  socialLogin: (provider: 'google' | 'github') => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<Profile>) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshSubscription: () => Promise<void>;
}

const defaultPremiumStatus: PremiumStatus = {
  tier: 'free',
  isTrialActive: false,
  trialEndsAt: null,
  subscription: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>(defaultPremiumStatus);
  const [isLoading, setIsLoading] = useState(true);

  const isPremium = premiumStatus.tier === 'premium' || premiumStatus.isTrialActive;

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  }, []);

  // Fetch subscription and determine premium status
  const fetchSubscription = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      setSubscription(data);

      // Determine premium status
      const now = new Date();
      const isTrialing = data.status === 'trialing';
      const trialEnd = data.trial_end ? new Date(data.trial_end) : null;
      const isTrialActive = isTrialing && trialEnd && trialEnd > now;

      let tier: SubscriptionTier = 'free';
      if (data.status === 'active') {
        tier = 'premium';
      } else if (isTrialActive) {
        tier = 'trial';
      }

      setPremiumStatus({
        tier,
        isTrialActive: isTrialActive || false,
        trialEndsAt: data.trial_end,
        subscription: data,
      });
    } else {
      setSubscription(null);
      setPremiumStatus(defaultPremiumStatus);
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    if (user) {
      await fetchSubscription(user.id);
    }
  }, [user, fetchSubscription]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await Promise.all([
            fetchProfile(currentSession.user.id),
            fetchSubscription(currentSession.user.id),
          ]);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await Promise.all([
            fetchProfile(newSession.user.id),
            fetchSubscription(newSession.user.id),
          ]);
        } else {
          setProfile(null);
          setSubscription(null);
          setPremiumStatus(defaultPremiumStatus);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setSubscription(null);
          setPremiumStatus(defaultPremiumStatus);
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, [fetchProfile, fetchSubscription]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check for specific error messages
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Please verify your email before logging in. Check your inbox for the verification link.' };
        }
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid email or password. Please check your credentials and try again.' };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const error = err as AuthError;
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; requiresVerification: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { success: false, requiresVerification: false, error: error.message };
      }

      return { success: true, requiresVerification: true };
    } catch (err) {
      const error = err as AuthError;
      return { success: false, requiresVerification: false, error: error.message || 'Signup failed' };
    }
  };

  const socialLogin = async (provider: 'google' | 'github'): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const error = err as AuthError;
      return { success: false, error: error.message || 'Social login failed' };
    }
  };

  const updateProfile = async (data: Partial<Profile>): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
      return true;
    }

    return false;
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (err) {
      console.error('Logout exception:', err);
    }
    // Always clear local state even if signOut fails
    setUser(null);
    setSession(null);
    setProfile(null);
    setSubscription(null);
    setPremiumStatus(defaultPremiumStatus);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const error = err as AuthError;
      return { success: false, error: error.message || 'Password reset failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        subscription,
        premiumStatus,
        isLoading,
        isPremium,
        login,
        signup,
        socialLogin,
        updateProfile,
        logout,
        resetPassword,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
