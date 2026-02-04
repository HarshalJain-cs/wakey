import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // If user is already set in AuthContext, redirect immediately
  useEffect(() => {
    if (user) {
      console.log('AuthCallback: User found in AuthContext, redirecting...');
      const redirectTo = localStorage.getItem('auth_redirect') || '/dashboard';
      localStorage.removeItem('auth_redirect');
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('AuthCallback: Starting callback handler');

        // Check for error in URL params
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
          console.log('AuthCallback: Error in params:', errorParam);
          setError(errorDescription || errorParam);
          return;
        }

        // Handle email verification (token_hash and type params from Supabase email links)
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (tokenHash && type) {
          console.log('AuthCallback: Verifying OTP with token_hash');
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change',
          });

          if (verifyError) {
            console.log('AuthCallback: OTP verify error:', verifyError.message);
            setError(verifyError.message);
            return;
          }

          // Wait for auth state to update then redirect
          console.log('AuthCallback: OTP verified, waiting for auth state...');
          return; // The useEffect with user dependency will handle redirect
        }

        // Check for PKCE code flow (OAuth)
        const code = searchParams.get('code');

        if (code) {
          console.log('AuthCallback: Exchanging code for session');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.log('AuthCallback: Code exchange error:', exchangeError.message);
            setError(exchangeError.message);
            return;
          }

          if (data.session) {
            console.log('AuthCallback: Code exchange successful, waiting for auth state...');
            return; // The useEffect with user dependency will handle redirect
          }
        }

        // For implicit OAuth flow (tokens in hash) - Supabase auto-detects these
        // Just wait for the auth state to update
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');

        if (accessToken) {
          console.log('AuthCallback: Hash tokens detected, waiting for auth state...');
          return; // The useEffect with user dependency will handle redirect
        }

        // Check if session exists (Supabase may have auto-set it)
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          console.log('AuthCallback: Session found, waiting for auth state...');
          return; // The useEffect with user dependency will handle redirect
        }

        // Wait a moment and check again
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { data: { session: retrySession } } = await supabase.auth.getSession();

        if (retrySession) {
          console.log('AuthCallback: Session found on retry, waiting for auth state...');
          return; // The useEffect with user dependency will handle redirect
        }

        // Still no session - show error
        console.log('AuthCallback: No session after retry');
        setError('Authentication failed. Please try logging in again.');

      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An unexpected error occurred during authentication.');
      }
    };

    // Don't run if user is already set
    if (!user) {
      const timer = setTimeout(handleCallback, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams, user]);

  if (error) {
    return (
      <div className="grain min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-serif mb-4">Authentication Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grain min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-6" />
        <h1 className="text-2xl font-serif mb-2">Completing sign in...</h1>
        <p className="text-muted-foreground">Please wait while we authenticate your account.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
