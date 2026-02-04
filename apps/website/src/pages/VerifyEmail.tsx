import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Loader2, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { useSound } from '@/components/effects/SoundEffects';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const VerifyEmail = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { playSuccess } = useSound();
  const navigate = useNavigate();
  const location = useLocation();

  const email = (location.state as { email?: string })?.email || 'your email';

  // Check if user is already verified
  const checkVerification = useCallback(async () => {
    try {
      // First refresh the session to get latest user data
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.log('No active session:', error.message);
        return false;
      }

      if (user?.email_confirmed_at) {
        // User is verified!
        playSuccess();
        setIsVerified(true);
        toast.success('Email verified successfully!');

        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking verification:', error);
      return false;
    }
  }, [navigate, playSuccess]);

  useEffect(() => {
    // Quick initial check without showing loading
    checkVerification();
  }, [checkVerification]);

  const handleCheckVerification = async () => {
    setIsVerifying(true);

    try {
      // Refresh the session
      await supabase.auth.refreshSession();
      const verified = await checkVerification();

      if (!verified) {
        toast.info('Email not yet verified. Please check your inbox and click the verification link.');
      }
    } catch (error) {
      toast.error('Failed to check verification status.');
    }

    setIsVerifying(false);
  };

  const handleResendEmail = async () => {
    setIsResending(true);

    try {
      const emailToResend = email !== 'your email' ? email : undefined;

      if (emailToResend) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: emailToResend,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Verification email sent! Check your inbox.');
        }
      } else {
        toast.error('Email address not available. Please sign up again.');
      }
    } catch (err) {
      toast.error('Failed to resend email. Please try again.');
    }

    setIsResending(false);
  };

  // Skip verification and go to dashboard (development only)
  const handleSkipVerification = () => {
    toast.success('Proceeding to dashboard...');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="grain min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center space-x-3 mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(45 93% 58%) 100%)' }}
          >
            <span className="text-2xl font-serif text-white">W</span>
          </div>
          <span className="text-2xl font-serif text-foreground">Wakey</span>
        </Link>

        <div className="premium-card text-center">
          {isVerified ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-4"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-serif mb-2">Email Verified!</h1>
              <p className="text-muted-foreground mb-6">
                Your email has been verified successfully. Redirecting you to the dashboard...
              </p>
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            </motion.div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-primary" />
              </div>

              <h1 className="text-2xl font-serif mb-2">Verify your email</h1>

              <p className="text-muted-foreground mb-6">
                We've sent a verification email to{' '}
                <strong className="text-foreground">{email}</strong>. Please check your inbox and click the link to verify your account.
              </p>

              <div className="space-y-4">
                {/* Check verification status */}
                <button
                  onClick={handleCheckVerification}
                  disabled={isVerifying}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                  {isVerifying ? 'Checking...' : 'I\'ve verified my email'}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {isResending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Mail className="w-5 h-5" />
                  )}
                  Resend verification email
                </button>

                {/* Continue to dashboard anyway */}
                <button
                  onClick={handleSkipVerification}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                  Continue to Dashboard
                </button>

                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={handleResendEmail}
                    className="text-primary hover:underline"
                  >
                    click here to resend
                  </button>
                </p>
              </div>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-border">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
